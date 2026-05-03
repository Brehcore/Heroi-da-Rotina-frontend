import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

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
export class Navbar implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_BASE = 'http://localhost:8082';

  showProfileMenu = false;
  showCreateFamilyForm = false;
  userProfilePictureUrl: string | null = null;
  familyNameInput = '';
  loading = false;

  ngOnInit(): void {
    // Load user profile picture if needed
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
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
}
