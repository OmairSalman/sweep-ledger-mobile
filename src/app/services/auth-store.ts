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
        this.push.registerPush();
      }),
      catchError((err) =>
      {
        this.currentUser.set(null);
        this.activeRole.set(null);
        this.permissions.set([]);
        this.authChecked.set(true);
        if (err?.error && typeof err.error === 'string')
        {
          this.authError.set(err.error);
        }
        return of(null);
      })
    );
  }

  isAuthReady = (): boolean => {return this.authChecked()};

  login(username: string, password: string): Observable<void>
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
        tap(() =>
        {
          this.biometricDeclined.set(false);
          this.push.registerPush();
        }),
        map(() => {})
        )
      }),
      catchError((err) =>
      {
        this.tokenStorage.clear();
        this.currentUser.set(null);
        this.activeRole.set(null);
        this.permissions.set([]);
        if (err?.error && typeof err.error === 'string')
        {
          this.authError.set(err.error);
        }
        return throwError(() => err);
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
        return this.api.post<{ accessToken: string, refreshToken: string, role: Role }>('/auth/refresh', { refreshToken })
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
    this.biometricDeclined.set(false);
    return from(this.tokenStorage.clear());
  }

  getMyRoles(): Observable<Role[]>
  {
    return this.api.get<Role[]>('/auth/my-roles');
  }

  selectRole(roleId: number, deviceId: string): Observable<SelectRoleResponse>
  {
    return this.api.post<SelectRoleResponse>('/auth/select-role', { roleId, deviceId });
  }

  private establishRoleSession(deviceId: string): Observable<void>
  {
    if(this.activeRole() != null)
    {
      return this.selectRole(this.activeRole()!.id, deviceId).pipe(
        tap((response) =>
        {
          this.tokenStorage.setAccessToken(response.accessToken);
          this.permissions.set(response.permissions);
        }),
        map(() => {}),
        catchError(() =>
        {
          this.activeRole.set(null);
          return this.discoverAndSelectRole(deviceId);
        })
      );
    }

    return this.discoverAndSelectRole(deviceId);
  }

  private discoverAndSelectRole(deviceId: string): Observable<void>
  {
    return this.getMyRoles().pipe(
      switchMap((roles) =>
      {
        if (roles.length === 0)
        {
          return throwError(() => ({ error: 'No role assigned to your account — contact an administrator' }));
        }
        this.activeRole.set(roles[0]);
        return this.selectRole(roles[0].id, deviceId);
      }),
      tap((selectRoleResponse) =>
      {
        this.tokenStorage.setAccessToken(selectRoleResponse.accessToken);
        this.permissions.set(selectRoleResponse.permissions);
      }),
      map(() => {})
    );
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
}