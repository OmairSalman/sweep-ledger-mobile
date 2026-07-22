import { inject, Injectable, signal } from '@angular/core';
import { Api } from './api';
import { Observable, tap, catchError, of, switchMap, from, throwError, forkJoin, map } from 'rxjs';
import { User } from 'src/models/user';
import { TokenStorage } from './token-storage';
import { Push } from './push';
import { Device } from '@capacitor/device';
import { PagePermissions, Role, SelectRoleResponse } from 'src/models/role';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private api = inject(Api);
  private tokenStorage = inject(TokenStorage);
  private push = inject(Push)

  currentUser = signal<User | null>(null);
  authError = signal<string>('');
  authChecked = signal<boolean>(false);
  biometricDeclined = signal<boolean>(false);
  permissions = signal<PagePermissions[]>([]);
  activeRole = signal<Role | null>(null);
  availableRoles = signal<Role[]>([]);

  checkAuth(): Observable<User | null>
  {
    return this.api.get<User>('/auth/me').pipe(
      switchMap((user) =>
      {
        this.currentUser.set(user);
        return from(Device.getId()).pipe(
          switchMap((deviceId) => this.establishRoleSession(deviceId.identifier)),
          map(() => user)
        );
      }),
      tap(() =>
      {
        this.authChecked.set(true);
      }),
      catchError((err) =>
      {
        this.currentUser.set(null);
        this.permissions.set([]);
        this.authChecked.set(true);
        if (err?.error && typeof err.error === 'string') this.authError.set(err.error);
        if (err?.code === 'NO_ROLES')
        {
          this.activeRole.set(null);
          this.availableRoles.set([]);
          return from(this.tokenStorage.clear()).pipe(map(() => null));
        }
        return of(null);
      })
    );
  }

  isAuthReady = (): boolean => {return this.authChecked()};

  login(username: string, password: string): Observable<EstablishmentResult>
  {
    this.authError.set('');
    return from (Device.getId()).pipe(
      switchMap((deviceId) =>
      {
        return this.api.post<{ user: User, accessToken: string, refreshToken: string }>('/auth/login', { username, password, deviceId: deviceId.identifier }).pipe(
        tap((response) =>
        {
          this.tokenStorage.setAccessToken(response.accessToken);
          this.currentUser.set(response.user);
        }),
        switchMap((response) => from(this.tokenStorage.setRefreshToken(response.refreshToken))),
        switchMap(() => this.establishRoleSession(deviceId.identifier)),
        tap((outcome) =>
        {
          if (outcome === 'established')
          {
            this.biometricDeclined.set(false);
          }
        })
        )
      }),
      catchError((err) =>
      {
        this.currentUser.set(null);
        this.activeRole.set(null);
        this.availableRoles.set([]);
        this.permissions.set([]);
        if (err?.error && typeof err.error === 'string')
        {
          this.authError.set(err.error);
        }
        return from(this.tokenStorage.clear()).pipe(
          switchMap(() => throwError(() => err))
        );
      }),
    )
  }

  logout(): Observable<void>
  {
    return from(Device.getId()).pipe(
      switchMap((deviceId) => {
        return this.api.post<void>('/auth/logout', { deviceId: deviceId.identifier }).pipe(
              catchError(() => of(undefined)),
              switchMap(() => this.forceLogout())
            );
      })
    )
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void>
  {
    this.authError.set('');
    return from(Device.getId()).pipe(
      switchMap((deviceId) => {
        return this.api.put<{ accessToken: string, refreshToken: string }>('/auth/change-password', { currentPassword, newPassword, deviceId: deviceId.identifier }).pipe(
          tap((response) =>
          {
            this.tokenStorage.setAccessToken(response.accessToken);
          }),
          switchMap((response) => from(this.tokenStorage.setRefreshToken(response.refreshToken)))
        )
      })
    )
  }

  refreshTokens(): Observable<void>
  {
    return from(this.tokenStorage.getRefreshToken()).pipe(
      switchMap((refreshToken) =>
      {
        if (!refreshToken)
        {
          return throwError(() => new Error('No refresh token'));
        }
        return this.api.post<{ accessToken: string, refreshToken: string, role: Role | null }>('/auth/refresh', { refreshToken })
      }),
      tap((response) =>
      {
        this.tokenStorage.setAccessToken(response.accessToken);
        this.activeRole.set(response.role);
      }),
      switchMap((response) => from(this.tokenStorage.setRefreshToken(response.refreshToken)))
    )
  }

  forceLogout(): Observable<void>
  {
    this.currentUser.set(null);
    this.activeRole.set(null);
    this.permissions.set([]);
    this.biometricDeclined.set(false);
    this.authError.set('');
    return from(this.tokenStorage.clear());
  }

  getMyRoles(): Observable<Role[]>
  {
    return this.api.get<Role[]>('/auth/my-roles').pipe(
      tap((roles) => this.availableRoles.set(roles))
    );
  }

  selectRole(roleId: number, deviceId: string): Observable<SelectRoleResponse>
  {
    return this.api.post<SelectRoleResponse>('/auth/select-role', { roleId, deviceId });
  }

  private establishRoleSession(deviceId: string): Observable<EstablishmentResult>
  {
    const sticky = this.activeRole();
    if(sticky != null)
    {
      return this.applyRole(sticky, deviceId).pipe(
        catchError((err) =>
        {
          if (err?.status === 403 || err?.status === 404)
          {
            this.activeRole.set(null);
            this.permissions.set([]);
            return this.discoverAndSelectRole(deviceId);
          }
          return throwError(() => err);
        })
      );
    }

    return this.discoverAndSelectRole(deviceId);
  }

  private discoverAndSelectRole(deviceId: string): Observable<EstablishmentResult>
  {
    return this.getMyRoles().pipe(
      switchMap((roles) =>
      {
        if (roles.length === 0)
        {
          return throwError(() => ({ code: 'NO_ROLES', error: 'No role assigned to your account; contact an administrator' }));
        }
        this.availableRoles.set(roles);
        if (roles.length > 1)
        {
          return of<EstablishmentResult>('selection-needed');
        }
        return this.applyRole(roles[0], deviceId);
      })
    );
  }

  private applyRole(role: Role, deviceId: string): Observable<EstablishmentResult>
  {
    return this.selectRole(role.id, deviceId).pipe(
      tap((response) =>
      {
        this.tokenStorage.setAccessToken(response.accessToken);
        this.activeRole.set(role);
        this.permissions.set(response.permissions);
        this.push.registerPush();
      }),
      map(() => 'established')
    )
  }

  selectAndApplyRole(role: Role): Observable<EstablishmentResult>
  {
    return from(Device.getId()).pipe(
      switchMap((deviceId) => this.applyRole(role, deviceId.identifier))
    );
  }

  reestablishSession(): Observable<EstablishmentResult>
  {
    return from(Device.getId()).pipe(
      switchMap((deviceId) => this.establishRoleSession(deviceId.identifier))
    );
  }

  refreshActivePermissions(): Observable<void>
  {
    return this.api.get<PagePermissions[]>(`/auth/role/${this.activeRole()!.id}/permissions`).pipe(
      tap((permissions) => this.permissions.set(permissions)),
      map(() => {})
    )
  }

  can(pageKey: string, operation: 'read' | 'write' | 'update' | 'delete' | 'print'): boolean
  {
    const page = this.permissions().find(p => p.pageKey === pageKey);
    if(!page) return false;
    switch (operation)
    {
      case 'read': return page.isRead;
      case 'write': return page.isWrite;
      case 'update': return page.isUpdate;
      case 'delete': return page.isDelete;
      case 'print': return page.isPrint;
    }
  }

  ensureRolesLoaded(): void
  {
    if (this.availableRoles().length > 0) return;
    this.getMyRoles().subscribe({
      next: (roles) => this.availableRoles.set(roles),
      error: () => {}
    });
  }
}

export type EstablishmentResult = 'established' | 'selection-needed';