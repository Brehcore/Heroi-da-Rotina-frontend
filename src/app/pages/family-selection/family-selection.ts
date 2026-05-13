import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { FamilyResponseDTO } from '../../core/services/models/auth.models';

export interface FamilyCreateDTO {
  familyName: string;
  profilePictureUrl?: string;
}

@Component({
  selector: 'app-family-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './family-selection.html',
  styleUrls: ['./family-selection.scss']
})
export class FamilySelection implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly API_BASE = 'http://localhost:8082';
  private readonly DICEBEAR_BASE = 'https://api.dicebear.com/8.x/fun-emoji/svg';

  families: FamilyResponseDTO[] = [];
  loading = false;
  showCreateFamilyForm = false;
  familyNameInput = '';

  ngOnInit(): void {
    console.log('FamilySelection ngOnInit iniciado');

    if (!isPlatformBrowser(this.platformId)) {
      return; // Impede a execução durante o SSR (Server-Side Rendering)
    }

    this.loading = true;
    this.authService.getMyFamilies().subscribe({
      next: (res) => {
        console.log('Famílias carregadas:', res);
        console.log('Avatars do DB:', res?.map(f => ({ familyName: f.familyName, profilePictureUrl: f.profilePictureUrl })));
        this.families = (res || []).map(family => {
          let avatar = family.profilePictureUrl;
          if (!avatar || avatar === 'null' || avatar.trim() === '') {
            avatar = this.generateFamilyAvatar(family.familyName);
          }
          return {
            ...family,
            profilePictureUrl: avatar.replace(/ /g, '-') // Previne erro de quebra por espaços vindos do banco
          };
        });
        console.log('Famílias após processamento:', this.families);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar famílias:', err);
        this.loading = false;
      }
    });
  }

  generateFamilyAvatar(familyName: string): string {
    const seed = encodeURIComponent((familyName || 'family').trim().replace(/\s+/g, '-'));
    return `${this.DICEBEAR_BASE}?seed=${seed}`;
  }

  selectFamily(id: number | string) {
    const familyId = String(id);
    try {
      sessionStorage.setItem('selectedFamilyId', familyId);
    } catch (e) {
      console.warn('Não foi possível salvar sessionStorage, fallback para localStorage', e);
      localStorage.setItem('selectedFamilyId', familyId);
    }
    this.router.navigate(['/home'], { queryParams: { family: familyId } });
  }

  toggleCreateFamilyForm(): void {
    this.showCreateFamilyForm = !this.showCreateFamilyForm;
    if (!this.showCreateFamilyForm) {
      this.familyNameInput = '';
    }
  }

  createFamily(): void {
    if (!this.familyNameInput.trim()) {
      return;
    }

    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const profilePictureUrl = this.generateFamilyAvatar(this.familyNameInput);
    const familyCreateDTO: FamilyCreateDTO = { 
      familyName: this.familyNameInput,
      profilePictureUrl: profilePictureUrl
    };

    this.loading = true;
    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.post<{ id: number; familyName: string }>(
      `${this.API_BASE}/api/families`,
      familyCreateDTO,
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
}
