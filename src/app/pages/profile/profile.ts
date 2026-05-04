import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Navbar } from '../../shared/navbar/navbar';


export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  familyId: number;
  familyName: string;
  profilePictureUrl: string;
}


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private readonly API_BASE = 'http://localhost:8082';


  user: UserResponseDTO | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loading = true;

    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

      const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.get<UserResponseDTO>(`${this.API_BASE}/api/users/me`, options).subscribe({
      next: (res) => {
        this.user = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar perfil:', err);
        this.error = 'Não foi possível carregar os dados do perfil.';
        this.loading = false;
      }
    });
  }
}
