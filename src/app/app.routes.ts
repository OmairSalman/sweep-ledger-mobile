import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { adminGuard } from './guards/admin-guard';
import { permissionGuard } from './guards/permission-guard';
import { unsavedChangesGuard } from './guards/unsaved-changes-guard';
import { pickerGuard } from './guards/picker-guard';

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
        loadComponent: () => import('./pages/admin/admin-panel/admin-panel.page').then( m => m.AdminPanelPage),
        canActivate: [permissionGuard],
        data: { page: 'admin' }
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users-list/users-list.page').then(m => m.UsersListPage),
        canActivate: [permissionGuard],
        data: { page: 'users' }
      },
      {
        path: 'pages',
        loadComponent: () => import('./pages/admin/pages-list/pages-list.page').then( m => m.PagesListPage),
        canActivate: [permissionGuard],
        data: { page: 'admin' }
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/admin/roles-list/roles-list.page').then( m => m.RolesListPage),
        canActivate: [permissionGuard],
        data: { page: 'admin' }
      },
      {
        path: 'role/:id',
        loadComponent: () => import('./pages/admin/role-detail/role-detail.page').then( m => m.RoleDetailPage),
        canActivate: [permissionGuard],
        canDeactivate: [unsavedChangesGuard],
        data: { page: 'admin' }
      }
    ]
  },
  {
    path: 'select-role',
    loadComponent: () => import('./pages/role-select/role-select.page').then( m => m.RoleSelectPage),
    canActivate: [pickerGuard]
  }
];