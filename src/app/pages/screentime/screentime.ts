import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/services/auth.service';
import { ScreenTimeService } from './screentime.service';
import { ScreenTimeConfigDTO, ScreenTimeRequest } from '../../core/services/models/screentime.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-screentime',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './screentime.html',
  styleUrls: ['./screentime.scss']
})
export class ScreenTime implements OnInit {
  
  authService = inject(AuthService);
  private screenTimeService = inject(ScreenTimeService);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  private readonly API_BASE = 'http://localhost:8082';

  userRole: string = 'MONITOR';
  userId: number = 0;
  familyId: number = 0;

  minors: any[] = [];
  selectedMinorId: number = 0;
  
  config: ScreenTimeConfigDTO | null = null;
  
  // Formulários
  requestToApproveId: number = 0;
  pendingRequests: ScreenTimeRequest[] = [];
  
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.userRole = this.authService.getUserRole() || sessionStorage.getItem('role') || localStorage.getItem('role') || 'MONITOR';
    this.userId = Number(sessionStorage.getItem('userId') || localStorage.getItem('userId')) || 0;
    this.familyId = Number(sessionStorage.getItem('selectedFamilyId') || sessionStorage.getItem('selectedFamilyid') || localStorage.getItem('selectedFamilyId') || localStorage.getItem('familyId')) || 0;

    if (this.userRole === 'MONITOR') {
      this.loadMinors();
    } else {
      this.selectedMinorId = this.userId;
      this.loadConfig();
    }
  }

  loadMinors() {
    let token = this.authService.getToken();
    if (!token && typeof window !== 'undefined' && window.sessionStorage) {
      token = sessionStorage.getItem('token') || localStorage.getItem('token');
    }
    
    const options = token ? { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) } : {};

    this.http.get<any[]>(`${this.API_BASE}/api/families/me`, options).subscribe({
      next: (families) => {
        if (families && families.length > 0) {
          const family = families.find((f: any) => f.id === this.familyId) || families[0];
          if (family && family.members) {
            this.minors = family.members.filter((m: any) => m.role === 'MINOR');
            if (this.minors.length > 0) {
              this.selectedMinorId = this.minors[0].id;
              this.loadConfig();
            }
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => { 
        console.error('Erro ao carregar família:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onMinorChange() {
    this.loadConfig();
  }

  loadConfig() {
    if (!this.selectedMinorId) return;
    this.loading = true;
    this.error = null;
    
    // Renderização Progressiva: Inicia com limites zerados para o formulário aparecer imediatamente, mesmo se o banco de dados ainda não tiver configurações salvas.
    this.config = { minutesPerToken: 30, mondayLimit: 0, tuesdayLimit: 0, wednesdayLimit: 0, thursdayLimit: 0, fridayLimit: 0, saturdayLimit: 0, sundayLimit: 0 };

    this.screenTimeService.getConfig(this.selectedMinorId).subscribe({
      next: (data) => { 
        if (data) this.config = data; 
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: (err) => { 
        console.error(err); 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  saveConfig() {
    if (!this.config || !this.selectedMinorId) return;
    this.loading = true;
    this.error = null; this.successMsg = null;
    
    this.screenTimeService.updateConfig(this.selectedMinorId, this.config).subscribe({
      next: (data) => { 
        this.config = data; 
        this.successMsg = 'Configurações salvas!'; 
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
        this.loading = false; 
      },
      error: () => { 
        this.error = 'Erro ao salvar configuração (Requer perfil ADMIN/MONITOR).'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  approveTime() {
    if (!this.requestToApproveId) return;
    this.loading = true;
    this.error = null; this.successMsg = null;

    this.screenTimeService.approveRequest(this.requestToApproveId, this.userId).subscribe({
      next: () => { 
        this.successMsg = 'Solicitação aprovada e fichas debitadas!'; 
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
        this.requestToApproveId = 0; 
        this.loading = false; 
      },
      error: () => { 
        this.error = 'Erro ao aprovar solicitação.'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }
}