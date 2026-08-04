import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ConfigSubItem {
  id: string;
  label: string;
  route: string;
}

export interface ConfigMenu {
  id: string;
  label: string;
  description: string;
  icon: string;
  iconClass: string;
  subItems: ConfigSubItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigsService {
  getMenus(): Observable<ConfigMenu[]> {
    return of([
      {
        id: 'conta',
        label: 'Conta',
        description: 'Gerencie seu perfil, senha, e-mail e exclusão da conta.',
        icon: 'person',
        iconClass: 'icon-yellow',
        subItems: [
          { id: 'perfil', label: 'Perfil do usuário', route: 'account/profile' },
          { id: 'senha', label: 'Alterar senha', route: 'account/password' },
          { id: 'email', label: 'Alterar e-mail', route: 'account/email' },
          { id: 'exclusao', label: 'Exclusão da conta', route: 'account/delete' }
        ]
      },
      {
        id: 'seguranca',
        label: 'Segurança',
        description: 'Ative a autenticação em dois fatores e veja suas sessões ativas.',
        icon: 'security',
        iconClass: 'icon-blue', // Você pode criar classes css para cores diferentes dos ícones
        subItems: [
          { id: '2fa', label: 'Autenticação em dois fatores (2FA)', route: 'security/2fa' },
          { id: 'sessoes', label: 'Sessões ativas', route: 'security/sessions' }
        ]
      },
      {
        id: 'notificacoes',
        label: 'Notificações',
        description: 'Configure como e quando você recebe notificações.',
        icon: 'notifications',
        iconClass: 'icon-yellow',
        subItems: [
          { id: 'notif_email', label: 'E-mail', route: 'notifications/email' },
          { id: 'notif_push', label: 'Push', route: 'notifications/push' },
          { id: 'notif_wpp', label: 'WhatsApp', route: 'notifications/whatsapp' },
          { id: 'notif_internos', label: 'Alertas internos', route: 'notifications/alerts' },
          { id: 'notif_freq', label: 'Frequência dos avisos', route: 'notifications/frequency' }
        ]
      },
      {
        id: 'integracoes',
        label: 'Integrações',
        description: 'Gerencie suas contas e métodos de pagamento.',
        icon: 'power',
        iconClass: 'icon-blue',
        subItems: [
          { id: 'pagamentos', label: 'Contas e Pagamentos', route: 'integrations/payments' }
        ]
      },
      {
        id: 'aparencia',
        label: 'Aparência',
        description: 'Personalize o tema e as cores do sistema.',
        icon: 'palette',
        iconClass: 'icon-blue',
        subItems: [
          { id: 'tema', label: 'Tema', route: 'appearance/theme' },
          { id: 'cores', label: 'Cores', route: 'appearance/colors' }
        ]
      },
      {
        id: 'ajuda',
        label: 'Ajuda',
        description: 'Encontre documentação, tire dúvidas e saiba mais sobre o sistema.',
        icon: 'help_outline',
        iconClass: 'icon-blue',
        subItems: [
          { id: 'doc', label: 'Documentação', route: 'help/docs' },
          { id: 'faq', label: 'FAQ', route: 'help/faq' },
          { id: 'chamado', label: 'Abrir chamado', route: 'help/ticket' }
        ]
      }
    ]);
  }
}