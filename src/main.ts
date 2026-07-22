import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authTokenInterceptor } from './app/interceptors/auth-token-interceptor';
import { refreshInterceptor } from './app/interceptors/refresh-interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Focus manager: moves focus to the incoming page on navigation, so the
    // outgoing page is never aria-hidden while still holding focus (Chrome's
    // "Blocked aria-hidden" warning on routerLink items).
    provideIonicAngular({ focusManagerPriority: ['content'] }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authTokenInterceptor, refreshInterceptor])
    )
  ],
});
