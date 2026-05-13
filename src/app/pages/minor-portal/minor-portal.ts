import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../tasks/task.service';
import { TaskResponseDTO } from '../../core/services/models/task.model';
import { ScreenTimeService } from '../screentime/screentime.service';
import { ScreenTimeConfigDTO } from '../../core/services/models/screentime.model';

export interface WalletDTO {
  id: number;
  minorId: number;
  minorName: string;
  tokensBalance: number;
  moneyBalance: number;
}

@Component({
  selector: 'app-minor-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './minor-portal.html',
  styleUrls: ['./minor-portal.scss']
})
export class MinorPortal implements OnInit {
  authService = inject(AuthService);
  private taskService = inject(TaskService);
  private screenTimeService = inject(ScreenTimeService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  private readonly API_BASE = 'http://localhost:8082';

  minorId: string | null = null;
  minorName: string | null = null;
  minorProfileUrl: string | null = null;
  userRole: string | null = null;
  wallet: WalletDTO | null = { id: 0, minorId: 0, minorName: '', tokensBalance: 0, moneyBalance: 0 };
  tasks: TaskResponseDTO[] = [];
  pendingTasks: TaskResponseDTO[] = [];
  completedTasks: TaskResponseDTO[] = [];
  tasksLoading = true;
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  // Screen Time
  screenTimeConfig: ScreenTimeConfigDTO | null = { minutesPerToken: 0, mondayLimit: 0, tuesdayLimit: 0, wednesdayLimit: 0, thursdayLimit: 0, fridayLimit: 0, saturdayLimit: 0, sundayLimit: 0 };
  requestMinutes: number = 30;
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
    }

    this.fetchUserData();
  }

  fetchUserData(): void {
    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.get<any>(
      `${this.API_BASE}/api/users/me`,
      options
    ).subscribe({
      next: (user: any) => {
        if (user && user.id) {
          const isFirstLoad = !this.minorId;
          this.minorId = String(user.id);
          this.minorName = user.name;
          this.minorProfileUrl = user.profilePictureUrl;
          
          if (isFirstLoad) this.loadWalletAndTasks();
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

  loadWalletAndTasks(): void {
    // Carregar wallet, tarefas e limites de tela
    this.fetchWalletData();
    this.fetchTasks();
    this.fetchScreenTimeConfig();
  }

  fetchWalletData(): void {
    if (!this.minorId) return;

    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.get<WalletDTO>(
      `${this.API_BASE}/api/wallets/minor/${this.minorId}`,
      options
    ).subscribe({
      next: (data) => {
        if (data) {
          this.wallet = data;
          this.wallet.moneyBalance = Number(this.wallet.moneyBalance) || 0;
          this.wallet.tokensBalance = Number(this.wallet.tokensBalance) || 0;
        }
      },
      error: (err) => {
        console.error('Erro ao buscar carteira:', err);
      }
    });
  }

  fetchTasks(): void {
    if (!this.minorId) return;

    this.tasksLoading = true;
    this.taskService.getMinorTasks(Number(this.minorId))
      .subscribe({
      next: (data) => {
        // Garante que é um array para evitar crash no .filter()
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
    if (!this.minorId || !this.requestMinutes) return;
    
    this.requestingTime = true;
    this.error = null;
    this.successMsg = null;

    this.screenTimeService.requestScreenTime(Number(this.minorId), this.requestMinutes).subscribe({
      next: () => {
        this.successMsg = 'Tempo de tela solicitado com sucesso!';
        this.requestingTime = false;
        setTimeout(() => this.successMsg = null, 5000); // Esconde a mensagem após 5 segundos
      },
      error: () => { this.error = 'Erro ao solicitar tempo de tela. Verifique suas fichas e os limites diários!'; this.requestingTime = false; window.scrollTo(0,0); }
    });
  }

  separateTasks(): void {
    // Prevenção extra caso o backend não devolva um array
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
        setTimeout(() => this.successMsg = null, 4000);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao concluir tarefa:', err);
        this.error = 'Erro ao concluir tarefa. Tente novamente.';
        this.loading = false;
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
}
