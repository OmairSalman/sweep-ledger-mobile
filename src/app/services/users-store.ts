import { inject, Injectable, signal } from '@angular/core';
import { Api } from './api';
import { User } from 'src/models/user';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersStore {
  private api = inject(Api);
  
  users = signal<User[]>([]);

  loadUsers(): Observable<void>
  {
    return this.api.get<User[]>('/users').pipe(
      tap((response) => this.users.set(response)),
      map(() => {})
    )
  }

  createUser(name: string, username: string, password: string): Observable<User>
  {
    return this.api.post<User>('/users', { name, username, password }).pipe(
      tap(() => this.loadUsers().subscribe())
    )
  }

  promoteUser(userId: number): Observable<User>
  {
    return this.api.post<User>(`/users/${userId}/promote`, {}).pipe(
      tap((updated) => this.users.update(users =>
        users.map(u => u.id === updated.id ? updated : u)
      ))
    );
  }
}