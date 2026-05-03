import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Profile } from './pages/profile/profile';
import { Members } from './pages/members/members';
import { FamilySelection } from './pages/family-selection/family-selection';
import { Minor } from './pages/minor/minor';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'profile', component: Profile },
    { path: 'home', component: Home },
    { path: 'members', component: Members },
    { path: 'family-selection', component: FamilySelection },
    { path: 'minor', component: Minor },
    { path:'', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
