import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'explore',
    loadComponent: () => import('./components/explore/explore.component').then((m) => m.ExploreComponent)
  },
  {
    path: 'clubs',
    loadComponent: () => import('./components/organizer-list/organizer-list.component').then((m) => m.OrganizerListComponent),
    data: { type: 'club' }
  },
  {
    path: 'clubs/:slug',
    loadComponent: () => import('./components/organizer-detail/organizer-detail.component').then((m) => m.OrganizerDetailComponent)
  },
  {
    path: 'departments',
    loadComponent: () => import('./components/organizer-list/organizer-list.component').then((m) => m.OrganizerListComponent),
    data: { type: 'department' }
  },
  {
    path: 'departments/:slug',
    loadComponent: () => import('./components/organizer-detail/organizer-detail.component').then((m) => m.OrganizerDetailComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./components/event-list/event-list.component').then((m) => m.EventListComponent)
  },
  {
    path: 'event/:id',
    loadComponent: () => import('./components/event-detail/event-detail.component').then((m) => m.EventDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent)
  },
  {
    path: 'book/:id',
    loadComponent: () => import('./components/booking-form/booking-form.component').then((m) => m.BookingFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];