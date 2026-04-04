import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FamilyDTO } from '../../core/services/models/auth.models';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  families: FamilyDTO[] = [];
  loading = false;

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
}
