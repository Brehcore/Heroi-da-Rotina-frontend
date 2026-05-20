import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { ProfileService, UserResponseDTO } from './profile.service';



@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  private router = inject(Router);
  private profileService = inject(ProfileService);


  user: UserResponseDTO | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loading = true;

    this.profileService.getUserProfile().subscribe({
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
