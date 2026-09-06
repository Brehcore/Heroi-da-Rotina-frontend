import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { NotificationWebSocketService } from '../../core/services/notification-websocket.service';
import { MinorPortalService } from './minor-portal.service';
import { MinorHeader } from './components/minor-header/minor-header';
import { MinorSidebar } from './components/minor-sidebar/minor-sidebar';

@Component({
  selector: 'app-minor-portal',
  standalone: true,
  imports: [CommonModule, RouterModule, MinorHeader, MinorSidebar],
  templateUrl: './minor-portal.html',
  styleUrls: ['./minor-portal.scss']
})
export class MinorPortal implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private minorPortalService = inject(MinorPortalService);
  private notificationWebSocketService = inject(NotificationWebSocketService);

  private wsSubscription?: Subscription;

  minorId: string | null = null;
  minorName: string | null = null;
  minorProfileUrl: string | null = null;
  dashboardData: any = null;

  isRefreshing = false;
  error: string | null = null;
  successMsg: string | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const role = this.authService.getUserRole();
    if (role === 'MONITOR' || role === 'ROLE_MONITOR' || !role) {
      this.router.navigate(['/login']);
      return;
    }

    this.minorId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    this.minorName = sessionStorage.getItem('name') || localStorage.getItem('name');

    if (this.minorId) {
/*       this.loadDashboard();
 */      this.setupWebSocket();
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.notificationWebSocketService.disconnect();
  }

  /* loadDashboard(): void {
    if (!this.minorId) return;

    this.minorPortalService.getDashboardData(Number(this.minorId)).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.minorName = data.profile.name;
        this.minorProfileUrl = data.profile.profilePictureUrl || null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar dados do painel:', err);
        this.error = 'Erro ao carregar dados do dashboard.';
      }
    });
  } */

  setupWebSocket(): void {
    if (!this.minorId) return;

    this.notificationWebSocketService.connectForMinor(Number(this.minorId));
    this.wsSubscription = this.notificationWebSocketService.getNotifications().subscribe((notification) => {
      const statusReal = notification.screenStatus || (notification as any).status;

      /* if (statusReal === 'APPROVED') {
        this.successMsg = `Oba! Seu tempo de tela de ${notification.requestedMinutes} min foi APROVADO! 🎉`;
        this.loadDashboard();
      } else if (statusReal === 'REJECTED') {
        this.error = `Poxa... Seu pedido de ${notification.requestedMinutes} min foi REJEITADO. 😔`;
      } */

      this.cdr.detectChanges();
      setTimeout(() => {
        this.successMsg = null;
        this.error = null;
        this.cdr.detectChanges();
      }, 5000);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}