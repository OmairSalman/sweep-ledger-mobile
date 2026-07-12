import { HttpInterceptorFn } from '@angular/common/http';
import { TokenStorage } from '../services/token-storage';
import { inject } from '@angular/core';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorage).getAccessToken();
  if(token)
  {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
