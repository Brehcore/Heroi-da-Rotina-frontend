import { Component, inject, OnInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ScreenTimeService } from '../../pages/screentime/screentime.service';
import { ScreenTimeResponseDTO } from '../../core/services/models/screentime.model';
import { FamilySelectionService } from '../../pages/family-selection/family-selection.service';
import { NotificationWebSocketService } from '../../core/services/notification-websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private screenTimeService = inject(ScreenTimeService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private familySelectionService = inject(FamilySelectionService);
  private notificationWebSocketService = inject(NotificationWebSocketService);
  private cdr = inject(ChangeDetectorRef);

  showProfileMenu = false;
  showCreateFamilyForm = false;
  userProfilePictureUrl: string | null = null;
  familyNameInput = '';
  loading = false;

  userRole = 'MINOR';
  pendingScreenTimeRequests: ScreenTimeResponseDTO[] = [];
  showNotifications = false;
  isProcessingNotif = false;
  private wsSubscription?: Subscription;

  ngOnInit(): void {
    // Load user profile picture if needed
    if (isPlatformBrowser(this.platformId)) {
      this.userRole = sessionStorage.getItem('role') || localStorage.getItem('role') || 'MINOR';
      if (this.userRole === 'MONITOR') {
        this.fetchInitialRequests();
        this.setupWebSocket();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.notificationWebSocketService.disconnect();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotifications = false;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

   openConfigs(): void {
    this.showProfileMenu = false;
    this.router.navigate(['/configs']);
  }

  logout(): void {
    this.showProfileMenu = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleCreateFamilyForm(): void {
    this.showCreateFamilyForm = !this.showCreateFamilyForm;
  }

  closeCreateFamilyForm(): void {
    this.showCreateFamilyForm = false;
    this.familyNameInput = '';
  }

  onCreateFamily(): void {
    this.createFamily();
  }

  private createFamily(): void {
    if (!this.familyNameInput.trim()) {
      return;
    }

    this.loading = true;

    this.familySelectionService.createFamily({ familyName: this.familyNameInput }).subscribe({
      next: (response) => {
        console.log('Família criada com sucesso:', response);
        this.loading = false;
        this.familyNameInput = '';
        this.showCreateFamilyForm = false;
        this.selectFamily(response.id);
      },
      error: (err) => {
        console.error('Erro ao criar família:', err);
        this.loading = false;
      }
    });
  }

  private selectFamily(id: number): void {
    try {
      sessionStorage.setItem('selectedFamilyId', String(id));
    } catch (e) {
      localStorage.setItem('selectedFamilyId', String(id));
    }
    this.router.navigate(['/home'], { queryParams: { family: id } });
  }

  getUserName(): string {
    return 'Monitor';
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.showProfileMenu = false;
  }

  fetchInitialRequests(): void {
    const familyId = Number(sessionStorage.getItem('selectedFamilyId') || localStorage.getItem('selectedFamilyId') || localStorage.getItem('familyId'));
    if (!familyId) return;

    this.screenTimeService.getPendingRequests(familyId).subscribe({
      next: (requests) => {
        this.pendingScreenTimeRequests = requests.map(req => {
          return {
            ...req,
            requestTime: req.requestTime ? new Date(req.requestTime) : new Date()
          };
        });
      }
    });
  }

  setupWebSocket(): void {
    const familyIdStr = sessionStorage.getItem('selectedFamilyId') || localStorage.getItem('selectedFamilyId') || localStorage.getItem('familyId');
    if (!familyIdStr) return;

    const familyId = Number(familyIdStr);
    this.notificationWebSocketService.connect(familyId);

    this.wsSubscription = this.notificationWebSocketService.getNotifications().subscribe(notification => {
      
      // 1. Garante que a data está no formato correto
      notification.requestTime = notification.requestTime ? new Date(notification.requestTime) : new Date();

      // 2. A MÁGICA DA RESILIÊNCIA: Lê o status do jeito que vier do Java
      const statusReal = notification.screenStatus || (notification as any).status;

      // 3. O IF PRINCIPAL (Toma a decisão baseada no statusReal)
      if (statusReal === 'PENDING') {
        
        // Toca o som porque é um pedido novo
        if (isPlatformBrowser(this.platformId)) {
          const audio = new Audio('https://assets.mixkit.com/sfx/preview/mixkit-software-interface-back-2575.mp3'); 
          audio.play().catch(e => console.warn("Interação necessária para tocar som", e));
        }

        // Verifica se já não existe na lista (evita duplicatas se o websocket piscar)
        const isDuplicate = this.pendingScreenTimeRequests.some(r => r.requestId === notification.requestId);
        
        if (!isDuplicate) {
          // Faz o push para a lista do sininho
          this.pendingScreenTimeRequests = [notification, ...this.pendingScreenTimeRequests];
        }

      } else if (statusReal === 'APPROVED' || statusReal === 'REJECTED') {
        
        // Alguém clicou no e-mail ou em outro aparelho: Tira da lista do sininho!
        this.pendingScreenTimeRequests = this.pendingScreenTimeRequests.filter(r => r.requestId !== notification.requestId);
        
      }

      // 4. Força a tela a se desenhar de novo (atualiza o número vermelho e a lista HTML)
      this.cdr.detectChanges(); 
    });
  }

  getElapsedTime(req: any): string {
    if (!req.requestTime) return 'Agora';
    const diff = Math.floor((new Date().getTime() - req.requestTime.getTime()) / 60000);
    if (diff <= 0) return 'Agora';
    if (diff === 1) return 'Há 1 min';
    return `Há ${diff} min`;
  }

  approveScreenTime(requestId: number): void {
    this.isProcessingNotif = true;
    const monitorId = Number(sessionStorage.getItem('userId') || localStorage.getItem('userId'));
    
    this.screenTimeService.approveRequest(requestId, monitorId).subscribe({
      next: () => {
        this.pendingScreenTimeRequests = this.pendingScreenTimeRequests.filter(r => r.requestId !== requestId);
        this.isProcessingNotif = false;
      },
      error: () => this.isProcessingNotif = false
    });
  }

  rejectScreenTime(requestId: number): void {
    this.isProcessingNotif = true;
    const monitorId = Number(sessionStorage.getItem('userId') || localStorage.getItem('userId'));
    
    this.screenTimeService.rejectRequest(requestId, monitorId).subscribe({
      next: () => {
        this.pendingScreenTimeRequests = this.pendingScreenTimeRequests.filter(r => r.requestId !== requestId);
        this.isProcessingNotif = false;
      },
      error: () => this.isProcessingNotif = false
    });
  }
}
