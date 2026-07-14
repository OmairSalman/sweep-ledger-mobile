import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage),
    canActivate: [guestGuard]
  },
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin-panel/admin-panel.page').then( m => m.AdminPanelPage)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users-list/users-list.page').then(m => m.UsersListPage)
      },
    ]
  },
  {
    path: 'create-user',
    loadComponent: () => import('./pages/create-user/create-user.page').then( m => m.CreateUserPage)
  },
  {
    path: 'notification-form',
    loadComponent: () => import('./pages/notification-form/notification-form.page').then( m => m.NotificationFormPage)
  }
];
