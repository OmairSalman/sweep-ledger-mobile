import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStore } from '../services/auth-store';
import { firstValueFrom } from 'rxjs';
import { TokenStorage } from '../services/token-storage';
import { Biometrics } from '../services/biometrics';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const tokenStorage = inject(TokenStorage);
  const biometrics = inject(Biometrics);

  if(authStore.biometricDeclined()) return router.createUrlTree(['/login']);

  if(authStore.isAuthReady())
  {
    return resolveDestination(authStore, router);
  }

  return coldBootCheck(authStore, router, tokenStorage, biometrics);
};

async function coldBootCheck(authStore: AuthStore, router: Router, tokenStorage: TokenStorage, biometrics: Biometrics,): Promise<boolean | UrlTree>
{
  const refreshToken = await tokenStorage.getRefreshToken();
  if(!refreshToken)
  {
    await firstValueFrom(authStore.checkAuth());
    return resolveDestination(authStore, router);
  }

  const available = await biometrics.isAvailable();

  if(available)
  {
    try
    {
      await biometrics.authenticate();
    }
    catch
    {
      authStore.biometricDeclined.set(true);
      return router.createUrlTree(['/login']);
    }
  }

  await firstValueFrom(authStore.checkAuth());
  return resolveDestination(authStore, router);
}

function resolveDestination(authStore: AuthStore, router: Router): true | UrlTree
{
  if (!authStore.currentUser()) return router.createUrlTree(['/login']);

  if (authStore.activeRole() === null && authStore.availableRoles().length >= 1)
  {
    return router.createUrlTree(['/select-role']);
  }

  return true;
}