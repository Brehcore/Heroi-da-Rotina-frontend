import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { UserLoginDTO } from '../../core/services/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
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

  loading = false;
  error: string | null = null;

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      this.authService.login( this.loginForm.value as UserLoginDTO ).subscribe({
        next: () => {
          this.loading = false;
          const role = this.authService.getUserRole();
          
          console.log('Login bem-sucedido! Role retornada pelo backend:', role);
          
          if (role === 'MONITOR' || role === 'ROLE_MONITOR') {
            this.router.navigate(['/family-selection']);
          } else if (role === 'MINOR' || role === 'MENOR' || role === 'ROLE_MINOR') {
            this.router.navigate(['/minor-portal']);
          } else {
            this.router.navigate(['/minor-portal']); // Tenta ir pro portal do menor como fallback
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Erro ao realizar login:', err);
          this.error = 'Email ou senha inválidos!';
        }
      });
    }
  }
}
