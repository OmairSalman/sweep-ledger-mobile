import { inject, Injectable, signal } from '@angular/core';
import { Api } from './api';
import { PagePermissionEntry, Role, RolePagePermissions } from 'src/models/role';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolesStore {
  private api = inject(Api);
  roles = signal<Role[]>([]);

  loadRoles(): Observable<void>
  {
    return this.api.get<Role[]>('/roles').pipe(
      tap((roles) => this.roles.set(roles)),
      map(() => {})
    )
  }

  addRole(name: string): Observable<Role>
  {
    return this.api.post<Role>('/roles', { name }).pipe(
      tap((role) => this.roles.update(roles => [role, ...roles]
        .sort((a, b) => a.name.localeCompare(b.name))
      ))
    )
  }

  updateRole(roleId: number, name: string): Observable<Role>
  {
    return this.api.put<Role>(`/roles/${roleId}`, { name }).pipe(
      tap((role) => this.roles.update(roles =>
        roles.map(r => r.id === roleId ? role : r)
        .sort((a, b) => a.name.localeCompare(b.name))
      ))
    )
  }

  deleteRole(roleId: number): Observable<void>
  {
    return this.api.delete<void>(`/roles/${roleId}`).pipe(
      tap(() => this.roles.update(roles => roles.filter(r => r.id !== roleId)))
    )
  }

  loadRolePermissions(roleId: number): Observable<RolePagePermissions[]>
  {
    return this.api.get<RolePagePermissions[]>(`/roles/${roleId}/permissions`)
  }

  saveRolePermissions(roleId: number, permissions: PagePermissionEntry[]): Observable<RolePagePermissions[]>
  {
    return this.api.put<RolePagePermissions[]>(`/roles/${roleId}/permissions`, { permissions });
  }
}