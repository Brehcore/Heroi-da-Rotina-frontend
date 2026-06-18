import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../tasks/task.service';
import { TaskResponseDTO } from '../../core/services/models/task.model';
import { ScreenTimeService } from '../screentime/screentime.service';
import { ScreenTimeConfigDTO } from '../../core/services/models/screentime.model';
import { WalletService } from '../wallet/wallet.service';
import { WalletResponseDTO, InterestFrequency } from '../../core/services/models/wallet.model';
import { ProfileService } from '../profile/profile.service';
import { NotificationWebSocketService } from '../../core/services/notification-websocket.service';
import { Subscription } from 'rxjs'; // 1. <-- Import do Subscription adicionado

@Component({
  selector: 'app-minor-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './minor-portal.html',
  styleUrls: ['./minor-portal.scss']
})
export class MinorPortal implements OnInit, OnDestroy { // 2. <-- OnDestroy adicionado aqui
  authService = inject(AuthService);
  private taskService = inject(TaskService);
  private screenTimeService = inject(ScreenTimeService);
  private walletService = inject(WalletService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private profileService = inject(ProfileService);
  private notificationWebSocketService = inject(NotificationWebSocketService);
  
  private wsSubscription?: Subscription;

  minorId: string | null = null;
  minorName: string | null = null;
  minorProfileUrl: string | null = null;
  userRole: string | null = null;
  wallet: WalletResponseDTO | null = { 
    id: 0, minorId: 0, minorName: '', tokensBalance: 0, moneyBalance: 0, 
    tokenQuotation: 0, interestRate: 0, interestEnabled: false, interestFrequency: InterestFrequency.WEEKLY 
  };
  tasks: TaskResponseDTO[] = [];
  pendingTasks: TaskResponseDTO[] = [];
  completedTasks: TaskResponseDTO[] = [];
  tasksLoading = true;
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;
  
  // Pull-to-refresh (Arrastar para atualizar)
  touchStartY = 0;
  touchEndY = 0;
  isRefreshing = false;

  // Screen Time
  screenTimeConfig: ScreenTimeConfigDTO | null = { minutesPerToken: 0, mondayLimit: 0, tuesdayLimit: 0, wednesdayLimit: 0, thursdayLimit: 0, fridayLimit: 0, saturdayLimit: 0, sundayLimit: 0 };
  requestTokens: number = 1;
  requestingTime = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Verificar a Role (aceitando variações de idioma e prefixo do Spring)
    this.userRole = this.authService.getUserRole();
    console.log('Acessando Portal do Menor. Role atual:', this.userRole);
    
    if (this.userRole === 'MONITOR' || this.userRole === 'ROLE_MONITOR' || !this.userRole) {
      this.router.navigate(['/login']);
      return;
    }

    // Dispara a interface instantaneamente buscando o ID salvo no login (sem esperar a rede)
    this.minorId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    this.minorName = sessionStorage.getItem('name') || localStorage.getItem('name');
    
    if (this.minorId) {
      this.loadWalletAndTasks();
      this.setupWebSocket(); // 3. <-- Gatilho do WebSocket chamado aqui!
    }

    this.fetchUserData();
  }

  // 4. <-- Método ngOnDestroy criado para limpar a conexão quando sair da tela
  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.notificationWebSocketService.disconnect(); 
  }

  // 5. <-- Método que escuta as mensagens do servidor
  setupWebSocket(): void {
    if (!this.minorId) return;

    // Conecta no canal exclusivo do menor
    this.notificationWebSocketService.connectForMinor(Number(this.minorId));

    this.wsSubscription = this.notificationWebSocketService.getNotifications().subscribe(notification => {
      
      // Toca um sonzinho legal de notificação
      if (isPlatformBrowser(this.platformId)) {
        const audio = new Audio('https://assets.mixkit.com/sfx/preview/mixkit-software-interface-back-2575.mp3'); 
        audio.play().catch(e => console.warn("Interação necessária para tocar som", e));
      }

      // Removemos o 'APROVADA' e o 'REJEITADA' porque o seu Enum já garante o formato em inglês
      if (notification.status === 'APPROVED') {
        this.successMsg = `Oba! Seu tempo de tela de ${notification.requestedMinutes} min foi APROVADO! 🎉`;
        this.fetchWalletData(); // <-- Atualiza as fichas na mesma hora!
        
      } else if (notification.status === 'REJECTED') {
        this.error = `Poxa... Seu pedido de ${notification.requestedMinutes} min foi REJEITADO. 😔`;
      }

      this.cdr.detectChanges(); // Força o Angular a desenhar os balões de mensagem na tela

      // Apaga a mensagem da tela depois de 5 segundos
      setTimeout(() => {
        this.successMsg = null;
        this.error = null;
        this.cdr.detectChanges();
      }, 5000);
      
    });
  }

  fetchUserData(): void {
    this.profileService.getUserProfile().subscribe({
      next: (user) => {
        if (user && user.id) {
          const isFirstLoad = !this.minorId;
          this.minorId = String(user.id);
          this.minorName = user.name;
          this.minorProfileUrl = user.profilePictureUrl;
          
          if (isFirstLoad) {
            this.loadWalletAndTasks();
            this.setupWebSocket(); // Adicionado aqui também caso o minorId não existisse no SessionStorage
          }
        } else {
          this.error = 'Perfil inválido ou não encontrado.';
        }
      },
      error: (err) => {
        console.error('Erro ao buscar usuário logado:', err);
        this.error = 'Erro ao carregar os dados do seu perfil';
      }
    });
  }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (window.scrollY === 0) {
      this.touchStartY = event.touches[0].clientY;
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.touchStartY > 0 && window.scrollY === 0) {
      this.touchEndY = event.touches[0].clientY;
    }
  }

  @HostListener('window:touchend')
  onTouchEnd() {
    if (this.touchStartY > 0 && this.touchEndY > this.touchStartY + 100) {
      this.refreshData();
    }
    this.touchStartY = 0;
    this.touchEndY = 0;
  }

  refreshData(): void {
    this.isRefreshing = true;
    this.loadWalletAndTasks();
    setTimeout(() => {
      this.isRefreshing = false;
      this.cdr.detectChanges();
    }, 1200); // Tempo mínimo para exibir o feedback de "Atualizando"
  }

  loadWalletAndTasks(): void {
    this.fetchWalletData();
    this.fetchTasks();
    this.fetchScreenTimeConfig();
  }

  fetchWalletData(): void {
    if (!this.minorId) return;

    this.walletService.getWallet(Number(this.minorId)).subscribe({
      next: (data) => {
        if (data) {
          const money = (data as any).moneyBalances ?? (data as any).moneyBalance ?? 0;
          const tokens = (data as any).tokenBalances ?? (data as any).tokensBalance ?? (data as any).tokenBalance ?? 0;
          const quotation = (data as any).tokenQuotation ?? (data as any).tokenQuotations ?? 0;

          this.wallet = {
            ...data,
            moneyBalance: Number(money) || 0,
            tokensBalance: Number(tokens) || 0,
            tokenQuotation: Number(quotation) || 0,
            interestRate: Number(data.interestRate) || 0,
            interestEnabled: Boolean(data.interestEnabled),
            interestFrequency: data.interestFrequency || InterestFrequency.WEEKLY
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Erro ao buscar carteira:', err);
        this.cdr.detectChanges();
      }
    });
  }

  fetchTasks(): void {
    if (!this.minorId) return;

    this.tasksLoading = true;
    this.taskService.getMinorTasks(Number(this.minorId))
      .subscribe({
      next: (data) => {
        this.tasks = Array.isArray(data) ? data : (data && (data as any).content ? (data as any).content : []);
        this.separateTasks();
        this.tasksLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar tarefas:', err);
        this.tasksLoading = false;
      }
    });
  }

  fetchScreenTimeConfig(): void {
    if (!this.minorId) return;

    this.screenTimeService.getConfig(Number(this.minorId))
      .subscribe({
      next: (data) => {
        if (data) this.screenTimeConfig = data;
      },
      error: (err) => {
        console.error('Erro ao buscar configurações de tempo de tela:', err);
      }
    });
  }

  requestScreenTime(): void {
    if (!this.minorId || !this.requestTokens) return;
    
    this.requestingTime = true;
    this.error = null;
    this.successMsg = null;

    const requestDTO = {
      minorId: Number(this.minorId),
      tokens: this.requestTokens
    };

    this.screenTimeService.exchangeTokens(requestDTO).subscribe({
      next: () => {
        this.successMsg = 'Tempo de tela solicitado com sucesso!';
        this.requestingTime = false;
        this.cdr.detectChanges(); 
        
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges(); 
        }, 2000);
      },
      error: () => { this.error = 'Erro ao solicitar tempo de tela. Verifique suas fichas e os limites diários!'; this.requestingTime = false; window.scrollTo(0,0); this.cdr.detectChanges(); }
    });
  }

  separateTasks(): void {
    if (!this.tasks || !Array.isArray(this.tasks)) {
      this.pendingTasks = [];
      this.completedTasks = [];
      return;
    }
    this.pendingTasks = this.tasks.filter(t => t.status === 'PENDING' || t.status === 'PENDENTE' || t.status === 'APPROVED' || t.status === 'APROVADA');
    this.completedTasks = this.tasks.filter(t => t.status === 'COMPLETED' || t.status === 'CONCLUIDA');
  }

  completeTask(taskId: number): void {
    this.error = null;
    this.loading = true;

    this.taskService.concludeTask(taskId)
      .subscribe({
      next: () => {
        this.successMsg = 'Tarefa concluída! Aguardando aprovação.';
        this.fetchTasks();
        this.loading = false;
        this.cdr.detectChanges(); 
        
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges(); 
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao concluir tarefa:', err);
        this.error = 'Erro ao concluir tarefa. Tente novamente.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTaskStatusColor(status: string): string {
    if (!status) return '#999';
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'PENDENTE':
        return '#ffc107';
      case 'APPROVED':
      case 'APROVADA':
        return '#4caf50';
      case 'COMPLETED':
      case 'CONCLUIDA':
        return '#2196f3';
      default:
        return '#999';
    }
  }

  getTaskStatusText(status: string): string {
    if (!status) return 'Desconhecido';
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'PENDENTE':
        return 'Pendente';
      case 'APPROVED':
      case 'APROVADA':
        return 'Aprovado';
      case 'COMPLETED':
      case 'CONCLUIDA':
        return 'Concluído';
      default:
        return status;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserName(): string {
    return 'Menor';
  }

  getFrequencyText(freq: string | undefined): string {
    if (!freq) return 'Semanal';
    switch (freq.toUpperCase()) {
      case 'DAILY': return 'Diário';
      case 'WEEKLY': return 'Semanal';
      case 'MONTHLY': return 'Mensal';
      default: return 'Semanal';
    }
  }
}