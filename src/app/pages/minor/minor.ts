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

export interface CreateTaskDTO {
  title: string;
  description: string;
  tokenReward: number;
  minorId: number;
  monitorCreatorId: number;
}

@Component({
  selector: 'app-minor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './minor.html',
  styleUrls: ['./minor.scss']
})
export class Minor implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  private readonly API_BASE = 'http://localhost:8082';

  minorId: string | null = null;
  minorName: string | null = null;
  wallet: WalletDTO | null = null;
  tasks: TaskDTO[] = [];
  pendingTasks: TaskDTO[] = [];
  loading = false;
  error: string | null = null;

  // Form states
  showCreateTaskForm = false;
  newTask = {
    title: '',
    description: '',
    tokenReward: 0
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.minorId = this.route.snapshot.queryParamMap.get('minorId');
    this.minorName = this.route.snapshot.queryParamMap.get('minorName');

    if (!this.minorId || this.minorId === 'null' || this.minorId === '') {
      this.error = 'ID do menor não identificado';
      this.router.navigate(['/members']);
      return;
    }

    this.fetchWalletData();
    this.fetchTasks();
    this.fetchPendingTasks();
  }

  fetchWalletData(): void {
    if (!this.minorId) return;

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
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar carteira:', err);
        this.error = 'Erro ao carregar carteira do menor';
        this.loading = false;
      }
    });
  }

  fetchTasks(): void {
    if (!this.minorId) return;

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
      },
      error: (err) => {
        console.error('Erro ao buscar tarefas:', err);
      }
    });
  }

  fetchPendingTasks(): void {
    if (!this.minorId) return;

    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.get<TaskDTO[]>(
      `${this.API_BASE}/api/tasks/minor/${this.minorId}/pending`,
      options
    ).subscribe({
      next: (data) => {
        this.pendingTasks = data || [];
      },
      error: (err) => {
        console.error('Erro ao buscar tarefas pendentes:', err);
      }
    });
  }

  createTask(): void {
    if (!this.newTask.title.trim() || !this.newTask.description.trim()) {
      this.error = 'Título e descrição são obrigatórios';
      return;
    }

    if (!this.minorId) {
      this.error = 'ID do menor não identificado';
      return;
    }

    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const createTaskDTO: CreateTaskDTO = {
      title: this.newTask.title,
      description: this.newTask.description,
      tokenReward: this.newTask.tokenReward,
      minorId: parseInt(this.minorId, 10),
      monitorCreatorId: 0 // Will be filled by backend
    };

    this.loading = true;
    this.error = null;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.post<TaskDTO>(
      `${this.API_BASE}/api/tasks`,
      createTaskDTO,
      options
    ).subscribe({
      next: (response) => {
        console.log('Tarefa criada com sucesso:', response);
        this.loading = false;
        this.tasks.push(response);
        this.closeCreateTaskForm();
        this.fetchPendingTasks();
      },
      error: (err) => {
        console.error('Erro ao criar tarefa:', err);
        this.error = 'Erro ao criar tarefa';
        this.loading = false;
      }
    });
  }

  approveTask(taskId: number): void {
    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    this.loading = true;
    this.error = null;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.patch<any>(
      `${this.API_BASE}/api/tasks/${taskId}/approve`,
      {},
      options
    ).subscribe({
      next: (response) => {
        console.log('Tarefa aprovada com sucesso');
        this.loading = false;
        this.fetchTasks();
        this.fetchPendingTasks();
        this.fetchWalletData();
      },
      error: (err) => {
        console.error('Erro ao aprovar tarefa:', err);
        this.error = 'Erro ao aprovar tarefa';
        this.loading = false;
      }
    });
  }

  toggleCreateTaskForm(): void {
    this.showCreateTaskForm = !this.showCreateTaskForm;
  }

  closeCreateTaskForm(): void {
    this.showCreateTaskForm = false;
    this.newTask = {
      title: '',
      description: '',
      tokenReward: 0
    };
  }

  goBack(): void {
    this.router.navigate(['/members']);
  }

  getTaskStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'APPROVED':
        return 'approved';
      case 'COMPLETED':
        return 'completed';
      default:
        return '';
    }
  }

  getTaskStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'APPROVED':
        return 'Aprovada';
      case 'COMPLETED':
        return 'Concluída';
      default:
        return status;
    }
  }

  getUserName(): string {
    return 'Monitor';
  }
}
