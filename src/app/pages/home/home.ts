import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { MemberDTO } from '../../core/services/models/auth.models';
import { Router, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

export interface TaskApprovalDTO {
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
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: './home.html',
	styleUrls: ['./home.scss']
})
export class Home implements OnInit {
	private authService = inject(AuthService);
	private http = inject(HttpClient);
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	private platformId = inject(PLATFORM_ID);

	private readonly API_BASE = 'http://localhost:8082';

	members: MemberDTO[] = [];
	tasksToApprove: TaskApprovalDTO[] = [];
	loading = false;
	familyId: string | null = null;
	familyName: string | null = null;
	showProfileMenu = false;

	ngOnInit(): void {
		// prioriza query param, depois sessionStorage
		this.familyId = this.route.snapshot.queryParamMap.get('family') || null;

		if (!this.familyId && isPlatformBrowser(this.platformId)) {
			this.familyId = sessionStorage.getItem('selectedFamilyId') || localStorage.getItem('selectedFamilyId');
		}

		if (!this.familyId) {
			// redireciona para seleção de família
			this.router.navigate(['/profile']);
			return;
		}

		if (!isPlatformBrowser(this.platformId)) {
			// não executar requisições durante server-side prerender
			return;
		}

		this.loading = true;
		this.authService.getFamilyMembers(this.familyId).subscribe({
			next: (res) => { 
				this.members = res || []; 
				// Extrai o nome da família do primeiro membro
				if (this.members.length > 0) {
					this.familyName = this.members[0].familyName;
				}
				this.loading = false; 
			},
			error: (err) => { console.error('Erro ao buscar membros:', err); this.loading = false; }
		});

		this.fetchTasksForApproval();
	}

	fetchTasksForApproval(): void {
		if (!this.familyId) {
			console.warn('fetchTasksForApproval: familyId não definido');
			return;
		}

		const token = this.authService.getToken();
		const headers = token
			? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
			: undefined;

		const options = headers ? { headers } : {};

		console.log('Buscando tarefas para aprovação da família:', this.familyId);

		this.http.get<TaskApprovalDTO[]>(
			`${this.API_BASE}/api/tasks/family/${this.familyId}/approve`,
			options
		).subscribe({
			next: (res) => {
				console.log('Tarefas para aprovação recebidas:', res);
				this.tasksToApprove = res || [];
			},
			error: (err) => {
				console.error('Erro ao buscar tarefas para aprovação:', err);
				this.tasksToApprove = [];
			}
		});
	}

	approveTask(taskId: number): void {
		const token = this.authService.getToken();
		const headers = token
			? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
			: undefined;

		const options = headers ? { headers } : {};

		this.http.patch<any>(
			`${this.API_BASE}/api/tasks/${taskId}/approve`,
			{},
			options
		).subscribe({
			next: () => {
				this.tasksToApprove = this.tasksToApprove.filter(task => task.id !== taskId);
			},
			error: (err) => {
				console.error('Erro ao aprovar tarefa:', err);
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

	toggleProfileMenu() {
		this.showProfileMenu = !this.showProfileMenu;
	}

	closeProfileMenu() {
		this.showProfileMenu = false;
	}

	openProfile() {
		this.closeProfileMenu();
		this.router.navigate(['/profile']);
	}

	logout() {
		this.authService.logout();
		this.closeProfileMenu();
		this.router.navigate(['/login']);
	}

	changeFamilyNavigation() {
		this.router.navigate(['/profile']);
	}
}
