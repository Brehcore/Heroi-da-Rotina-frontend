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
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  private readonly API_BASE = 'http://localhost:8082';

  families: FamilyDTO[] = [];
  loading = false;
  showCreateFamilyForm = false;
  familyNameInput = '';

  ngOnInit(): void {
    console.log('Profile ngOnInit iniciado');
    this.loading = true;
    this.authService.getMyFamilies().subscribe({
      next: (res) => {
        console.log('Famílias carregadas:', res);
        this.families = res || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar famílias:', err);
        this.loading = false;
      }
    });
  }

  selectFamily(id: number | string) {
    const familyId = String(id);
    try {
      // Armazenar em sessionStorage para reduzir persistência além da sessão
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
        // Selecionar automaticamente a família criada e redirecionar
        this.selectFamily(response.id);
      },
      error: (err) => {
        console.error('Erro ao criar família:', err);
        this.loading = false;
      }
    });
  }
}
