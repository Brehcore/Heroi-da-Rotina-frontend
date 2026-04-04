import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserLoginDTO } from '../../core/services/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      
      this.authService.login( this.loginForm.value as UserLoginDTO ).subscribe({
        next: () => {
          const role = this.authService.getUserRole();
          console.log('Login realizado com role:', role);
          
          if (role === 'MONITOR') {
            this.router.navigate(['/profile']);
          } else if (role === 'MINOR') {
            // Redirecionar direto para minor-portal
            // O componente lidará com buscar os dados via endpoint existente
            this.router.navigate(['/minor-portal']);
          } else {
            console.warn('Role desconhecida:', role);
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.error('Erro ao realizar login:', err);
          alert('Email ou senha inválidos!');
        }
      });
    }
  }
}
