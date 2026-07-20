import { inject, Injectable, signal } from '@angular/core';
import { Api } from './api';
import { User } from 'src/models/user';
import { map, Observable, tap } from 'rxjs';
import { Role } from 'src/models/role';

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

  getUserRoles(userId: number): Observable<Role[]>
  {
    return this.api.get<Role[]>(`/users/${userId}/roles`);
  }

  assignRole(userId: number, roleId: number): Observable<Role[]>
  {
    return this.api.post<Role[]>(`/users/${userId}/roles`, { roleId });
  }

  revokeRole(userId: number, roleId: number): Observable<Role[]>
  {
    return this.api.delete<Role[]>(`/users/${userId}/roles/${roleId}`);
  }
}