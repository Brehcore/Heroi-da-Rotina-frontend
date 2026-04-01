import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MemberDTO } from '../../core/services/models/auth.models';
import { Router, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './home.html',
	styleUrls: ['./home.scss']
})
export class Home implements OnInit {
	private authService = inject(AuthService);
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	private platformId = inject(PLATFORM_ID);

	members: MemberDTO[] = [];
	loading = false;
	familyId: string | null = null;
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
			next: (res) => { this.members = res || []; this.loading = false; },
			error: (err) => { console.error('Erro ao buscar membros:', err); this.loading = false; }
		});
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
