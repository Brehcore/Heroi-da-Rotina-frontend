import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { UserLoginDTO, ForgotPasswordDTO, ResetPasswordDTO } from '../../core/services/models/auth.models';
import { CommonModule } from '@angular/common';
import { PublicNavbar } from '../../shared/public-navbar/public-navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, PublicNavbar],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Alternador do input de senha (olhinho)
  hidePassword = true;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  error: string | null = null;
  loginError: string | null = null;

  // Controle do Modal de "Esqueci a Senha"
  showForgotPasswordModal = false;
  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  forgotPasswordLoading = false;
  forgotPasswordError: string | null = null;
  forgotPasswordSuccess: string | null = null;

  // Controle do Modal de "Resetar a Senha"
  showResetPasswordModal = false;
  resetPasswordToken: string | null = null;
  resetPasswordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });
  resetPasswordLoading = false;
  resetPasswordError: string | null = null;
  resetPasswordSuccess: string | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const token = params.get('token');
      if (token) {
        this.resetPasswordToken = token;
        this.showResetPasswordModal = true;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  private passwordMatchValidator(form: any) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ mismatch: true });
      } else {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.loginError = null;

      this.authService.login(this.loginForm.value as UserLoginDTO).subscribe({
        next: () => {
          this.loading = false;
          const role = this.authService.getUserRole();

          console.log('Login bem-sucedido! Role retornada pelo backend:', role);

          if (role === 'MONITOR' || role === 'ROLE_MONITOR') {
            this.router.navigate(['/family-selection']);
          } else if (role === 'MINOR' || role === 'MENOR' || role === 'ROLE_MINOR') {
            this.router.navigate(['/minor-portal']);
          } else {
            this.router.navigate(['/minor-portal']);
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Erro ao realizar login:', err);
          this.loginError = 'Email ou senha inválidos!';
        }
      });
    }
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.forgotPasswordLoading = true;
      this.forgotPasswordError = null;
      this.forgotPasswordSuccess = null;

      this.authService.forgotPassword(this.forgotPasswordForm.value as ForgotPasswordDTO).subscribe({
        next: () => {
          this.forgotPasswordLoading = false;
          this.forgotPasswordSuccess = 'E-mail de recuperação enviado! Verifique sua caixa de entrada.';
          this.forgotPasswordForm.reset();
        },
        error: (err) => {
          this.forgotPasswordLoading = false;
          console.error('Erro ao solicitar recuperação de senha:', err);
          this.forgotPasswordError = 'Ocorreu um erro. Tente novamente.';
        }
      });
    }
  }

  onResetPasswordSubmit(): void {
    if (this.resetPasswordForm.valid && this.resetPasswordToken) {
      this.resetPasswordLoading = true;
      this.resetPasswordError = null;
      this.resetPasswordSuccess = null;

      const data: ResetPasswordDTO = {
        token: this.resetPasswordToken,
        newPassword: this.resetPasswordForm.value.newPassword!
      };

      this.authService.resetPassword(data).subscribe({
        next: () => {
          this.resetPasswordLoading = false;
          this.resetPasswordSuccess = 'Senha alterada com sucesso! Você já pode fazer o login.';
          this.resetPasswordForm.reset();
          setTimeout(() => this.showResetPasswordModal = false, 3000);
        },
        error: (err) => {
          this.resetPasswordLoading = false;
          this.resetPasswordError = 'Token inválido ou expirado. Por favor, solicite a recuperação novamente.';
          console.error('Erro ao resetar a senha:', err);
        }
      });
    }
  }
}