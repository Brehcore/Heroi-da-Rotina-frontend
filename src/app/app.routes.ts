import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Profile } from './pages/profile/profile';
import { Members } from './pages/members/members';
import { Minor } from './pages/minor/minor';
import { MinorPortal } from './pages/minor-portal/minor-portal';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'profile', component: Profile },
    { path: 'home', component: Home },
    { path: 'members', component: Members },
    { path: 'minor', component: Minor },
    { path: 'minor-portal', component: MinorPortal },
    { path:'', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
