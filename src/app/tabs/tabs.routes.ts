import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
    {
        path: '',
        component: TabsPage,
        children: [
            {
                path: 'sweeps',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./sweeps-list/sweeps-list.page').then(m => m.SweepsListPage)
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./sweep-detail/sweep-detail.page').then(m => m.SweepDetailPage)
                    },
                    {
                        path: ':id/scan',
                        loadComponent: () => import('./sweep-scan/sweep-scan.page').then(m => m.SweepScanPage)
                    }
                ]
            },
            {
                path: 'profile',
                loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage)
            },
            {
                path: '',
                redirectTo: 'sweeps',
                pathMatch: 'full'
            }
        ]
    }
]