import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Navbar } from '../../shared/navbar/navbar';

export interface WalletDTO {
  id: number;
  minorId: number;
  minorName: string;
  tokensBalance: number;
  moneyBalance: number;
}

export interface TaskDTO {
  id: number;
  title: string;
  description: string;
  rewardTask: number;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED';
  minorId: number;
  minorName: string;
  creationDate: string;
  completedDate?: string;
}

@Component({
  selector: 'app-minor-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './minor-portal.html',
  styleUrls: ['./minor-portal.scss']
})
export class MinorPortal implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  private readonly API_BASE = 'http://localhost:8082';

  minorId: string | null = null;
  minorName: string | null = null;
  userRole: string | null = null;
  wallet: WalletDTO | null = null;
  tasks: TaskDTO[] = [];
  pendingTasks: TaskDTO[] = [];
  completedTasks: TaskDTO[] = [];
  loading = false;
  error: string | null = null;
  private loadingWallet = false;
  private loadingTasks = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Ativar loading
    this.loading = true;

    // Verificar se é realmente um MINOR
    this.userRole = this.authService.getUserRole();
    if (this.userRole !== 'MINOR') {
      this.router.navigate(['/login']);
      return;
    }

    // Tentar obter minorId dos query params
    this.minorId = this.route.snapshot.queryParamMap.get('minorId');
    this.minorName = this.route.snapshot.queryParamMap.get('minorName');

    // Se não tiver nos query params, buscar via endpoint de família
    if (!this.minorId) {
      console.log('MinorId não encontrado nos query params, buscando via endpoint de família...');
      this.fetchFamilyAndExtractMinorData();
    } else {
      this.fetchWalletData();
      this.fetchTasks();
    }
  }

  fetchFamilyAndExtractMinorData(): void {
    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    // Buscar famílias do usuário autenticado
    this.http.get<any[]>(
      `${this.API_BASE}/api/families/me`,
      options
    ).subscribe({
      next: (families: any[]) => {
        if (families && families.length > 0) {
          const family = families[0];
          
          // Procurar o menor na lista de membros
          if (family.members && family.members.length > 0) {
            const currentUser = family.members.find((m: any) => m.role === 'MINOR');
            if (currentUser) {
              this.minorId = String(currentUser.id);
              this.minorName = currentUser.name;
              console.log('Menor encontrado:', this.minorId, this.minorName);
              
              // Carregar wallet e tarefas em paralelo
              this.loadWalletAndTasks();
              return;
            }
          }
        }
        
        // Se não encontrou, mostrar erro
        this.error = 'Não foi possível identificar seu perfil de menor';
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar família:', err);
        this.error = 'Erro ao carregar dados do menor';
        this.loading = false;
      }
    });
  }

  loadWalletAndTasks(): void {
    // Carregar wallet e tarefas em paralelo
    this.fetchWalletData();
    this.fetchTasks();
  }

  fetchWalletData(): void {
    if (!this.minorId) return;

    this.loadingWallet = true;
    this.loading = true;
    this.error = null;

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
        this.wallet = data;
        this.loadingWallet = false;
        this.updateLoadingState();
      },
      error: (err) => {
        console.error('Erro ao buscar carteira:', err);
        this.error = 'Erro ao carregar carteira';
        this.loadingWallet = false;
        this.updateLoadingState();
      }
    });
  }

  fetchTasks(): void {
    if (!this.minorId) return;

    this.loadingTasks = true;
    this.loading = true;

    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.get<TaskDTO[]>(
      `${this.API_BASE}/api/tasks/minor/${this.minorId}`,
      options
    ).subscribe({
      next: (data) => {
        this.tasks = data || [];
        this.separateTasks();
        this.loadingTasks = false;
        this.updateLoadingState();
      },
      error: (err) => {
        console.error('Erro ao buscar tarefas:', err);
        this.loadingTasks = false;
        this.updateLoadingState();
      }
    });
  }

  private updateLoadingState(): void {
    this.loading = this.loadingWallet || this.loadingTasks;
  }

  separateTasks(): void {
    this.pendingTasks = this.tasks.filter(t => t.status === 'PENDING' || t.status === 'APPROVED');
    this.completedTasks = this.tasks.filter(t => t.status === 'COMPLETED');
  }

  completeTask(taskId: number): void {
    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    this.loadingTasks = true;
    this.loading = true;
    this.error = null;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.patch<any>(
      `${this.API_BASE}/api/tasks/${taskId}/conclude`,
      {},
      options
    ).subscribe({
      next: () => {
        console.log('Tarefa marcada como concluída');
        this.fetchTasks();
      },
      error: (err) => {
        console.error('Erro ao concluir tarefa:', err);
        this.error = 'Erro ao concluir tarefa';
        this.loadingTasks = false;
        this.updateLoadingState();
      }
    });
  }

  getTaskStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return '#ffc107';
      case 'APPROVED':
        return '#4caf50';
      case 'COMPLETED':
        return '#2196f3';
      default:
        return '#999';
    }
  }

  getTaskStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'APPROVED':
        return 'Aprovado';
      case 'COMPLETED':
        return 'Concluído';
      default:
        return status;
    }
  }

  getUserName(): string {
    return 'Menor';
  }
}
