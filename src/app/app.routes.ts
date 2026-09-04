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
import { Principal } from './pages/principal/principal';
import { Configs } from './pages/configs/configs'; 
import { Account } from './pages/configs/account/account';

export const routes: Routes = [
  // Rota raiz carregando a landing page
  { path: '', component: Principal, pathMatch: 'full' },

  // Rotas públicas de autenticação
  { path: 'login', component: Login },
  { path: 'redefinir-senha', component: Login },
  { path: 'register', component: Register },

  // Rotas internas / autenticadas
  { path: 'home', component: Home },
  { path: 'members', component: Members },
  { path: 'tasks', component: Tasks },
  { path: 'wallet', component: Wallet },
  { path: 'screentime', component: ScreenTime },
  { path: 'family-selection', component: FamilySelection },
  { path: 'minor', component: Minor },
  { path: 'minor-portal', component: MinorPortal },

  // Configurações
  { 
    path: 'configs', 
    component: Configs,
    children: [
      { path: 'account/profile', component: Account },
      { path: 'account/password', component: Account },
      { path: 'account/email', component: Account },
      { path: 'account/delete', component: Account },
    ]
  },

  // Fallback para rotas inexistentes redirecionar para a landing page
  { path: '**', redirectTo: '' }
];