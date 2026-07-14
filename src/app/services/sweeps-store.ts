import { inject, Injectable, signal } from '@angular/core';
import { Api } from './api';
import { Sweep } from 'src/models/sweep';
import { App } from '@capacitor/app';
import { map, Observable, tap } from 'rxjs';
import { TokenStorage } from './token-storage';

@Injectable({
  providedIn: 'root',
})
export class SweepsStore {
  private api = inject(Api);
  private tokenStorage = inject(TokenStorage);

  sweeps = signal<Sweep[]>([]);

  constructor(){
    App.addListener('appStateChange', (state) =>{
      if(state.isActive && this.tokenStorage.getAccessToken())
      {
        this.loadSweeps().subscribe()
      }
    })
  }

  loadSweeps(): Observable<void>
  {
    return this.api.get<Sweep[]>('/sweeps').pipe(
      tap((sweeps) =>
      {
        this.sweeps.set(sweeps);
      }),
      map(() => {})
    )
  }

  loadSweep(sweepId: number): Observable<Sweep>
  {
    return this.api.get<Sweep>(`/sweeps/${sweepId}`);
  }

  saveSweep(roomCode: string, responsiblePersonName: string): Observable<Sweep>
  {
    return this.api.post<Sweep>('/sweeps', { roomCode, responsiblePersonName }).pipe(
      tap((sweep) => this.sweeps.update(sweeps => [sweep, ...sweeps]))
    )
  }

  deleteSweep(sweepId: number): Observable<void>
  {
    return this.api.delete<void>(`/sweeps/${sweepId}`).pipe(
      tap(() => this.sweeps.update(sweeps => sweeps.filter(sweep => sweep.id !== sweepId)))
    )
  }
}