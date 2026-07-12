import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStore } from '../services/auth-store';

export const guestGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if(authStore.biometricDeclined()) return true;

  if(authStore.isAuthReady())
  {
    if(authStore.currentUser())
    {
      router.navigate(['/home']);
      return false;
    }
    else
    {
      return true;
    }
  }

  return authStore.checkAuth().pipe(
    map((user) => 
    {
      if(user)
      {
        router.navigate(['/home']);
        return false;
      }
      else
      {
        return true;
      }
    })
  );
};
