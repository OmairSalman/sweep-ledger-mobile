import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../services/auth-store';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const pageKey = route.data['page'] as string;
  if(authStore.can(pageKey, 'read')) return true;
  return router.createUrlTree(['/tabs/sweeps']);
};