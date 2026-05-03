import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { FamilyDTO } from '../../core/services/models/auth.models';

export interface CreateFamilyDTO {
  familyName: string;
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

  private readonly API_BASE = 'http://localhost:8082';
  private readonly DICEBEAR_BASE = 'https://api.dicebear.com/8.x/avataaars/svg';

  families: FamilyDTO[] = [];
  loading = false;
  showCreateFamilyForm = false;
  familyNameInput = '';

  ngOnInit(): void {
    console.log('FamilySelection ngOnInit iniciado');
    this.loading = true;
    this.authService.getMyFamilies().subscribe({
      next: (res) => {
        console.log('Famílias carregadas:', res);
        console.log('Avatars do DB:', res?.map(f => ({ name: f.name, avatarUrl: f.avatarUrl })));
        this.families = (res || []).map(family => ({
          ...family,
          avatarUrl: family.avatarUrl || this.generateFamilyAvatar(family.name)
        }));
        console.log('Famílias após processamento:', this.families);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar famílias:', err);
        this.loading = false;
      }
    });
  }

  private generateFamilyAvatar(familyName: string): string {
    const seed = encodeURIComponent(familyName || 'family');
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
}
