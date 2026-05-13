import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { TaskCreateDTO, TaskResponseDTO } from '../../core/services/models/task.model';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from './task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.scss']
})
export class Tasks implements OnInit {

  authService = inject(AuthService);
  private taskService = inject(TaskService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  private readonly API_BASE = 'http://localhost:8082';
  private readonly DICEBEAR_BASE = 'https://api.dicebear.com/8.x/avataaars/svg';
  
  tasks: TaskResponseDTO[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;
  minors: any[] = [];
  
  // Modal
  showCreateForm = false;
  newTask: TaskCreateDTO = {
    title: '',
    description: '',
    tokenReward: 10,
    minorId: 0,
    monitorCreatorId: 0
  };

  userRole: string = 'MONITOR';
  userId: number = 0;
  familyId: number = 0;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.userRole = this.authService.getUserRole() || sessionStorage.getItem('role') || localStorage.getItem('role') || 'MONITOR';
    this.userId = Number(sessionStorage.getItem('userId') || localStorage.getItem('userId')) || 0;
    this.familyId = Number(sessionStorage.getItem('selectedFamilyId') || sessionStorage.getItem('selectedFamilyid') || localStorage.getItem('selectedFamilyId') || localStorage.getItem('familyId')) || 0;

    this.loadTasks();

    if (this.userRole === 'MONITOR') {
      this.loadMinors();
    }
  }

  loadMinors() {
    let token = this.authService.getToken();
    if (!token && typeof window !== 'undefined' && window.sessionStorage) {
      token = sessionStorage.getItem('token') || localStorage.getItem('token');
    }

    const httpHeaders = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.get<any[]>(`${this.API_BASE}/api/families/me`, options).subscribe({
      next: (families) => {
        if (families && families.length > 0) {
          const family = families.find((f: any) => f.id === this.familyId) || families[0];
          if (family && family.members) {
            this.minors = family.members.filter((m: any) => m.role === 'MINOR');
          }
        }
      },
      error: (err) => console.error('Erro ao carregar menores da família:', err)
    });
  }

  loadTasks() {
    this.loading = true;
    this.error = null;

    if (this.userRole === 'MONITOR') {
      if (!this.familyId) {
        this.error = 'ID da família não encontrado';
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }
      this.taskService.getTasksToApprove(this.familyId).subscribe({
        next: (data) => { this.tasks = data || []; this.loading = false; this.cdr.detectChanges(); },
        error: (err) => { console.error('Erro ao carregar tarefas para aprovação:', err); this.error = 'Erro ao carregar tarefas para aprovação.'; this.loading = false; this.cdr.detectChanges(); }
      });
    } else {
      if (!this.userId) {
        this.error = 'ID do usuário não encontrado';
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }
      this.taskService.getMinorTasks(this.userId).subscribe({
        next: (data) => { this.tasks = data || []; this.loading = false; this.cdr.detectChanges(); },
        error: (err) => { console.error('Erro ao carregar tarefas:', err); this.error = 'Erro ao carregar tarefas.'; this.loading = false; this.cdr.detectChanges(); }
      });
    }
  }

  toggleCreateForm() {
    this.showCreateForm = true;
    this.newTask = {
      title: '', description: '', tokenReward: 10, minorId: this.minors.length > 0 ? this.minors[0].id : 0, monitorCreatorId: this.userId
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
  }

  createTask() {
    this.loading = true;
    this.error = null;
    this.successMsg = null;

    console.log('ENVIANDO PARA O JAVA:', this.newTask);

    this.taskService.createTask(this.newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.closeCreateForm();
        this.loading = false;
        this.successMsg = 'Tarefa criada com sucesso!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => { console.error('Erro ao criar tarefa:', err); this.error = 'Erro ao criar tarefa.'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  concludeTask(id: number) {
    this.loading = true;
    this.error = null;
    this.successMsg = null;

    this.taskService.concludeTask(id).subscribe({
      next: () => {
        this.successMsg = 'Tarefa concluída com sucesso!';
        this.loadTasks();
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => { console.error('Erro ao concluir tarefa:', err); this.error = 'Erro ao concluir tarefa.'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  approveTask(id: number) {
    this.loading = true;
    this.error = null;
    this.successMsg = null;

    this.taskService.approveTask(id).subscribe({
      next: () => {
        this.successMsg = 'Tarefa aprovada com sucesso!';
        this.loadTasks();
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => { console.error('Erro ao aprovar tarefa:', err); this.error = 'Erro ao aprovar tarefa.'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  rejectTask(id: number) {
    const reason = prompt('Qual o motivo da reprovação da tarefa?');
    
    // Cancela a ação se o usuário clicar em Cancelar ou deixar em branco
    if (!reason || reason.trim() === '') return; 

    this.loading = true;
    this.error = null;
    this.successMsg = null;

    this.taskService.rejectTask(id, reason).subscribe({
      next: () => {
        this.successMsg = 'Tarefa rejeitada com sucesso!';
        this.loadTasks();
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => { console.error('Erro ao rejeitar tarefa:', err); this.error = 'Erro ao rejeitar tarefa.'; this.loading = false; this.cdr.detectChanges(); }
    });
  }
}