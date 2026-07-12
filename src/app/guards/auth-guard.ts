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
    return authStore.currentUser() ? true : router.createUrlTree(['/login']);
  }

  return coldBootCheck(authStore, router, tokenStorage, biometrics);
};

async function coldBootCheck(authStore: AuthStore, router: Router, tokenStorage: TokenStorage, biometrics: Biometrics,): Promise<boolean | UrlTree>
{
  const refreshToken = await tokenStorage.getRefreshToken();
  if(!refreshToken)
  {
    const user = await firstValueFrom(authStore.checkAuth());
    return user ? true : router.createUrlTree(['/login']);
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

  const user = await firstValueFrom(authStore.checkAuth());
  return user ? true : router.createUrlTree(['/login']);
}