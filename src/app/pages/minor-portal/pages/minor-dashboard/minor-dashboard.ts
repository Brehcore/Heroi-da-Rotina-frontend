import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MinorDashboardResponseDTO, MinorDashboardService } from '../../../minor-portal/pages/minor-dashboard/minor-dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-minor-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './minor-dashboard.html',
    styleUrls: ['./minor-dashboard.scss']
})
export class MinorDashboard implements OnInit {
    private readonly dashboardService = inject(MinorDashboardService);
    private readonly authService = inject(AuthService);

    readonly dashboard = signal<MinorDashboardResponseDTO | null>(null);
    readonly isLoading = signal<boolean>(true);
    readonly errorMessage = signal<string | null>(null);

    // Computa a porcentagem de XP para a barra de nível
    readonly xpPercentage = computed(() => {
        const gamification = this.dashboard()?.gamification;
        if (!gamification || !gamification.targetXp || gamification.targetXp === 0) return 0;
        const progress = ((gamification.currentXp ?? 0) / gamification.targetXp) * 100;
        return Math.min(100, Math.max(0, Math.round(progress)));
    });

    // Computa a porcentagem de tempo de tela gasto hoje
    readonly screenTimePercentage = computed(() => {
        const screen = this.dashboard()?.screenTime;
        if (!screen || !screen.dailyLimitMinutes || screen.dailyLimitMinutes === 0) return 0;
        const progress = ((screen.usedMinutesToday ?? 0) / screen.dailyLimitMinutes) * 100;
        return Math.min(100, Math.max(0, Math.round(progress)));
    });

    ngOnInit(): void {
        this.fetchDashboard();
    }

    fetchDashboard(): void {
        const minorId = this.authService.getCurrentUserId();

        // Guarda de tipo: se for null, encerra antes de chamar o service
        if (!minorId) {
            this.errorMessage.set('Sessão expirada ou usuário não identificado.');
            this.isLoading.set(false);
            return;
        }

        // A partir daqui, o TypeScript sabe com 100% de certeza que minorId é 'number'
        this.isLoading.set(true);
        this.errorMessage.set(null);

        this.dashboardService.getDashboard(minorId).subscribe({
            next: (data) => {
                this.dashboard.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar dashboard do menor', err);
                this.errorMessage.set('Não foi possível carregar as informações do seu painel.');
                this.isLoading.set(false);
            }
        });
    }

    formatMinutes(minutes?: number): string {
        if (minutes === undefined || minutes === null) return '0m';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    }
}