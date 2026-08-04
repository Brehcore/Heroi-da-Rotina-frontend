import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Members } from './pages/members/members';
import { FamilySelection } from './pages/family-selection/family-selection';
import { Minor } from './pages/minor/minor';
import { Register } from './pages/register/register';
import { Tasks } from './pages/tasks/tasks';
import { Wallet } from './pages/wallet/wallet';
import { ScreenTime } from './pages/screentime/screentime';
import { Login } from './pages/login/login';
import { MinorPortal } from './pages/minor-portal/minor-portal';

// Importe o componente principal de configurações
import { Configs } from './pages/configs/configs'; 
// Importe o account
import { Account } from './pages/configs/account/account';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'redefinir-senha', component: Login },
    { path: 'register', component: Register },
    { path: 'home', component: Home },
    { path: 'members', component: Members },
    { path: 'tasks', component: Tasks },
    { path: 'wallet', component: Wallet },
    { path: 'screentime', component: ScreenTime },
    { path: 'family-selection', component: FamilySelection },
    { path: 'minor', component: Minor },
    { path: 'minor-portal', component: MinorPortal },
    
    // Rota pai de configurações
    { 
        path: 'configs', 
        component: Configs,
        // Rotas filhas que serão renderizadas no <router-outlet> do configs.html
        children: [
            { path: 'account/profile', component: Account },
            { path: 'account/password', component: Account },
            { path: 'account/email', component: Account },
            { path: 'account/delete', component: Account },
            
            // Futuramente, será adicionadas as rotas para Segurança, Notificações, etc. aqui
            // Exemplo: { path: 'security/2fa', component: SecurityComponent }
        ]
    },

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];