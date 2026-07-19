import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../services/auth-store';
import { TokenRefresh } from '../services/token-refresh';
import { TokenStorage } from '../services/token-storage';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenRefresh = inject(TokenRefresh);
  const tokenStorage = inject(TokenStorage);
  const authStore = inject(AuthStore);
  const REFRESH_FAILED = 'refresh failed';

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if(
        error.status !== 401 ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/login'))
        return throwError(() => error);
      
      if(!tokenRefresh.isRefreshing)
      {
        tokenRefresh.isRefreshing = true;
        tokenRefresh.refreshSubject.next(null);

        return authStore.refreshTokens().pipe(
          switchMap(() =>
          {
            const newToken = tokenStorage.getAccessToken();
            tokenRefresh.isRefreshing = false;
            tokenRefresh.refreshSubject.next(newToken);
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
          }),
          catchError((err) => {
            tokenRefresh.isRefreshing = false;
            tokenRefresh.refreshSubject.next(REFRESH_FAILED);
            return authStore.forceLogout().pipe(
              switchMap(() => throwError(() => err)),
              catchError(() => throwError(() => err))
            )
          })
        )
      }
      else
      {
        return tokenRefresh.refreshSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap((token) => token === REFRESH_FAILED ? throwError(() => new Error('Session expired'))
          : next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
        )
      }
    })
  )
};