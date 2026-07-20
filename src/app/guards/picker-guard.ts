import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../services/auth-store';
import { firstValueFrom } from 'rxjs';

export const pickerGuard: CanActivateFn = async (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthReady())
  {
    await firstValueFrom(authStore.checkAuth());
  }

  return authStore.currentUser() ? true : router.createUrlTree(['/login']);
};