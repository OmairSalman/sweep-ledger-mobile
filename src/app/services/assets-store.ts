import { inject, Injectable, signal } from '@angular/core';
import { Api } from './api';
import { AddAssetResponse, Asset } from 'src/models/asset';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssetsStore {
  private api = inject(Api);

  assets = signal<Asset[]>([]);

  loadAssets(sweepId: number): Observable<void>
  {
    this.assets.set([]);
    return this.api.get<Asset[]>(`/sweeps/${sweepId}/assets`).pipe(
      tap((assets) => this.assets.set(assets)),
      map(() => {})
    )
  }

  addAsset(sweepId: number, barcodeValue: string): Observable<AddAssetResponse>
  {
    return this.api.post<AddAssetResponse>(`/sweeps/${sweepId}/assets`, { barcodeValue }).pipe(
      tap((response) => {
        if(!response.wasAlreadyPresent)
        {
          this.assets.update(assets => [response.asset, ...assets])
        }
      })
    )
  }

  deleteAsset(sweepId: number, assetId: number): Observable<void>
  {
    return this.api.delete<void>(`/sweeps/${sweepId}/assets/${assetId}`).pipe(
      tap(() => this.assets.update(assets => assets.filter(a => a.id !== assetId)))
    );
  }
}