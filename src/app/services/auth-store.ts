import { inject, Injectable, signal } from '@angular/core';
import { Api } from './api';
import { Observable, tap, catchError, of, switchMap, from, throwError, forkJoin } from 'rxjs';
import { User } from 'src/models/user';
import { TokenStorage } from './token-storage';
import { Push } from './push';
import { Device } from '@capacitor/device';

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

  checkAuth(): Observable<User | null>
  {
    return this.api.get<User>('/auth/me').pipe(
      tap((user) =>
      {
        this.currentUser.set(user);
        this.authChecked.set(true);
        this.push.registerPush();
      }),
      catchError(() =>
        {
          this.currentUser.set(null);
          this.authChecked.set(true);
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
          this.biometricDeclined.set(false);
          this.push.registerPush();
        }),
        switchMap((response) => from(this.tokenStorage.setRefreshToken(response.refreshToken)))
        )
      })
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
    return this.api.put<{ accessToken: string, refreshToken: string }>('/auth/change-password', { currentPassword, newPassword }).pipe(
      tap((response) =>
      {
        this.tokenStorage.setAccessToken(response.accessToken);
      }),
      switchMap((response) => from(this.tokenStorage.setRefreshToken(response.refreshToken)))
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
        return this.api.post<{ accessToken: string, refreshToken: string }>('/auth/refresh', { refreshToken })
      }),
      tap((response) =>
      {
        this.tokenStorage.setAccessToken(response.accessToken);
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
}