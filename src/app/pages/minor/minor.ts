import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Navbar } from '../../shared/navbar/navbar';
import { WalletResponseDTO } from '../../core/services/models/wallet.model';
import { TaskCreateDTO, TaskResponseDTO } from '../../core/services/models/task.model';
import { TaskService } from '../tasks/task.service';
import { WalletService } from '../wallet/wallet.service';
import { extractErrorMessage } from '../tasks/error-handler.util';

@Component({
  selector: 'app-minor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './minor.html',
  styleUrls: ['./minor.scss']
})
export class Minor implements OnInit {
  authService = inject(AuthService);
  private taskService = inject(TaskService);
  private walletService = inject(WalletService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  minorId: string | null = null;
  minorName: string | null = null;
  wallet: WalletResponseDTO | null = null;
  tasks: TaskResponseDTO[] = [];
  pendingTasks: TaskResponseDTO[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

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

    this.walletService.getWallet(Number(this.minorId)).subscribe({
      next: (data) => {
        this.wallet = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar carteira:', err);
        this.error = 'Erro ao carregar carteira do menor';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchTasks(): void {
    if (!this.minorId) return;

    this.taskService.getMinorTasks(Number(this.minorId)).subscribe({
      next: (data) => {
        this.tasks = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar tarefas:', err);
        this.cdr.detectChanges();
      }
    });
  }

  fetchPendingTasks(): void {
    if (!this.minorId) return;

    this.taskService.getMinorPendingTasks(Number(this.minorId)).subscribe({
      next: (data) => {
        this.pendingTasks = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar tarefas pendentes:', err);
        this.cdr.detectChanges();
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

    const createTaskDTO: TaskCreateDTO = {
      title: this.newTask.title,
      description: this.newTask.description,
      tokenReward: this.newTask.tokenReward,
      minorId: parseInt(this.minorId, 10),
      monitorCreatorId: Number(sessionStorage.getItem('userId') || localStorage.getItem('userId')) || 0
    };

    this.loading = true;
    this.error = null;
    this.successMsg = null;

    this.taskService.createTask(createTaskDTO).subscribe({
      next: (response) => {
        console.log('Tarefa criada com sucesso:', response);
        this.loading = false;
        this.tasks.push(response);
        this.closeCreateTaskForm();
        this.fetchPendingTasks();
        this.successMsg = 'Tarefa criada com sucesso!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao criar tarefa:', err);
        this.error = 'Erro ao criar tarefa';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approveTask(taskId: number): void {
    this.loading = true;
    this.error = null;
    this.successMsg = null;

    this.taskService.approveTask(taskId).subscribe({
      next: () => {
        console.log('Tarefa aprovada com sucesso');
        this.loading = false;
        this.fetchTasks();
        this.fetchPendingTasks();
        this.fetchWalletData();
        this.successMsg = 'Tarefa aprovada com sucesso!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao aprovar tarefa:', err);
        
        this.error = extractErrorMessage(err, 'Erro ao aprovar tarefa. Tente novamente.');
        this.loading = false;
        this.cdr.detectChanges();
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
    if (!status) return '';
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'PENDENTE':
        return 'pending';
      case 'APPROVED':
      case 'APROVADA':
        return 'approved';
      case 'COMPLETED':
      case 'CONCLUIDA':
        return 'completed';
      case 'REJECTED':
      case 'REJEITADA':
        return 'rejected';
      default:
        return '';
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
        return 'Aprovada';
      case 'COMPLETED':
      case 'CONCLUIDA':
        return 'Concluída';
      case 'REJECTED':
      case 'REJEITADA':
        return 'Rejeitada';
      default:
        return status;
    }
  }

  getUserName(): string {
    return 'Monitor';
  }
}
