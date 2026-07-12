import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStore } from '../services/auth-store';
import { authGuard } from './auth-guard';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const authResult = await (authGuard(route, state) as Promise<boolean | UrlTree> | boolean | UrlTree);

  if(authResult !== true) return authResult;

  return authStore.currentUser()?.role === 'Admin' ? true : router.createUrlTree(['/home']);
};
