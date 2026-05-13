import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { ScreenTimeService } from '../../pages/screentime/screentime.service';
import { ScreenTimeResponseDTO } from '../../core/services/models/screentime.model';

export interface CreateFamilyDTO {
  familyName: string;
}

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
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly API_BASE = 'http://localhost:8082';

  showProfileMenu = false;
  showCreateFamilyForm = false;
  userProfilePictureUrl: string | null = null;
  familyNameInput = '';
  loading = false;

  userRole = 'MINOR';
  pendingScreenTimeRequests: ScreenTimeResponseDTO[] = [];
  showNotifications = false;
  isProcessingNotif = false;
  private pollingInterval: any;

  ngOnInit(): void {
    // Load user profile picture if needed
    if (isPlatformBrowser(this.platformId)) {
      this.userRole = sessionStorage.getItem('role') || localStorage.getItem('role') || 'MINOR';
      if (this.userRole === 'MONITOR') {
        this.startNotificationPolling();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotifications = false;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  openProfile(): void {
    this.showProfileMenu = false;
    this.router.navigate(['/profile']);
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

    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const createFamilyDTO: CreateFamilyDTO = { familyName: this.familyNameInput };
    this.loading = true;
    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.post<{ id: number; familyName: string }>(
      `${this.API_BASE}/api/families`,
      createFamilyDTO,
      options
    ).subscribe({
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

  startNotificationPolling(): void {
    this.fetchPendingRequests();
    this.pollingInterval = setInterval(() => {
      this.fetchPendingRequests();
    }, 10000); 
  }

  fetchPendingRequests(): void {
    const familyId = Number(sessionStorage.getItem('selectedFamilyId') || localStorage.getItem('selectedFamilyId') || localStorage.getItem('familyId'));
    if (!familyId) return;

    this.screenTimeService.getPendingRequests(familyId).subscribe({
      next: (requests) => {
        const currentCount = this.pendingScreenTimeRequests.length;
        const newCount = requests.length;

        if (newCount > currentCount && isPlatformBrowser(this.platformId)) {
          const audio = new Audio('https://assets.mixkit.com/sfx/preview/mixkit-software-interface-back-2575.mp3'); 
          audio.play().catch(e => console.warn("Interação necessária para tocar som", e));
        }

        this.pendingScreenTimeRequests = requests.map(req => {
          const existing = this.pendingScreenTimeRequests.find(r => r.requestId === req.requestId);
          return {
            ...req,
            requestTime: existing?.requestTime || new Date()
          };
        });
      }
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
