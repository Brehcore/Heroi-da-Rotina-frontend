import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Profile } from './pages/profile/profile';
import { Members } from './pages/members/members';
import { FamilySelection } from './pages/family-selection/family-selection';
import { Minor } from './pages/minor/minor';
import { Register } from './pages/register/register';
import { Tasks } from './pages/tasks/tasks';
import { Wallet } from './pages/wallet/wallet';
import { ScreenTime } from './pages/screentime/screentime';
import { MinorPortal } from './pages/minor-portal/minor-portal';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'profile', component: Profile },
    { path: 'register', component: Register },
    { path: 'home', component: Home },
    { path: 'members', component: Members },
    { path: 'tasks', component: Tasks },
    { path: 'wallet', component: Wallet },
    { path: 'screentime', component: ScreenTime },
    { path: 'family-selection', component: FamilySelection },
    { path: 'minor', component: Minor },
    { path: 'minor-portal', component: MinorPortal },
    { path:'', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
