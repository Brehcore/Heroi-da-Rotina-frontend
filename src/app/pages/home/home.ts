import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';

export interface TaskDTO {
	id: number;
	title: string;
	description: string;
	rewardTask: number;
	status: string;
	minorId: number;
	minorName: string;
	creationDate: string;
}

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, Navbar],
	templateUrl: './home.html',
	styleUrls: ['./home.scss']
})
export class Home implements OnInit {
	private authService = inject(AuthService);
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	private platformId = inject(PLATFORM_ID);
	private http = inject(HttpClient);

	private readonly API_BASE = 'http://localhost:8082';

	pendingTasks: TaskDTO[] = [];
	loading = false;
	familyId: string | null = null;
	error: string | null = null;

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

		this.fetchTasksForApproval();
	}

	fetchTasksForApproval(): void {
		if (!this.familyId) return;

		this.loading = true;
		const token = this.authService.getToken();
		const httpHeaders = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
		const options = httpHeaders ? { headers: httpHeaders } : {};

		this.http.get<TaskDTO[]>(
			`${this.API_BASE}/api/tasks/family/${this.familyId}/approve`,
			options
		).subscribe({
			next: (data) => {
				this.pendingTasks = data || [];
				this.loading = false;
			},
			error: (err) => {
				console.error('Erro ao buscar tarefas pendentes:', err);
				this.error = 'Não foi possível carregar as tarefas';
				this.loading = false;
			}
		});
	}

	approveTask(taskId: number): void {
		const token = this.authService.getToken();
		const httpHeaders = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
		const options = httpHeaders ? { headers: httpHeaders } : {};

		this.loading = true;

		this.http.patch<any>(
			`${this.API_BASE}/api/tasks/${taskId}/approve`,
			{},
			options
		).subscribe({
			next: () => {
				console.log('Tarefa aprovada com sucesso');
				this.fetchTasksForApproval(); // Recarrega a lista para remover a aprovada
			},
			error: (err) => {
				console.error('Erro ao aprovar tarefa:', err);
				this.loading = false;
			}
		});
	}

	changeFamilyNavigation() {
		this.router.navigate(['/profile']);
	}
}
