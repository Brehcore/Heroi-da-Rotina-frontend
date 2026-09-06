import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinorPortalService, TaskResponseDTO } from '../../minor-portal.service';

@Component({
  selector: 'app-minor-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minor-tasks.html',
  styleUrls: ['./minor-tasks.scss']
})
export class MinorTasks implements OnInit {
  private minorPortalService = inject(MinorPortalService);

  tasks: TaskResponseDTO[] = [];
  filteredTasks: TaskResponseDTO[] = [];
  selectedFilter: 'ALL' | 'PENDING' | 'COMPLETED' | 'APPROVED' = 'ALL';

  loading = false;
  actionLoadingId: number | null = null;
  error: string | null = null;
  successMsg: string | null = null;

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const minorId = Number(sessionStorage.getItem('userId') || localStorage.getItem('userId'));
    if (!minorId) return;

    this.loading = true;
    this.error = null;

    this.minorPortalService.listAllTasksForMinor(minorId).subscribe({
      next: (data) => {
        this.tasks = data;
        this.applyFilter(this.selectedFilter);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tarefas:', err);
        this.error = 'Não foi possível carregar as tarefas.';
        this.loading = false;
      }
    });
  }

  applyFilter(filter: 'ALL' | 'PENDING' | 'COMPLETED' | 'APPROVED'): void {
    this.selectedFilter = filter;

    switch (filter) {
      case 'PENDING':
        this.filteredTasks = this.tasks.filter(t => t.status === 'PENDING');
        break;
      case 'COMPLETED':
        this.filteredTasks = this.tasks.filter(t => t.status === 'COMPLETED');
        break;
      case 'APPROVED':
        this.filteredTasks = this.tasks.filter(t => t.status === 'APPROVED');
        break;
      default:
        this.filteredTasks = [...this.tasks];
    }
  }

  onConcludeTask(task: TaskResponseDTO): void {
    if (!task.id) return;
    this.actionLoadingId = task.id;
    this.error = null;

    this.minorPortalService.completeTask(task.id).subscribe({
      next: () => {
        this.successMsg = `Tarefa "${task.title}" marcada como concluída!`;
        this.actionLoadingId = null;
        this.loadTasks();
        setTimeout(() => this.successMsg = null, 4000);
      },
      error: (err) => {
        console.error('Erro ao concluir tarefa:', err);
        this.error = 'Erro ao concluir tarefa. Tente novamente.';
        this.actionLoadingId = null;
      }
    });
  }
}