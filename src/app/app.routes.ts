import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'profile', component: Profile },
    { path: 'home', component: Home },
    { path:'', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
