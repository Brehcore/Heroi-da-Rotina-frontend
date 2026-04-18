import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { UserLoginDTO, ForgotPasswordDTO, ResetPasswordDTO, UserRegisterDTO } from '../../core/services/models/auth.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
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

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  resetPasswordForm = this.fb.group({
    token: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  showForgotPassword = false;
  showResetPassword = false;
  showRegister = false;
  loadingForgotPassword = false;
  loadingResetPassword = false;
  loadingRegister = false;
  messageSuccess = '';
  messageError = '';

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

  toggleRegister() {
    this.showRegister = !this.showRegister;
    this.messageSuccess = '';
    this.messageError = '';
    if (this.showRegister) {
      // Ao abrir registro, reseta o formulário de login
      this.loginForm.reset();
    } else {
      // Ao fechar registro, reseta o formulário de registro
      this.registerForm.reset();
    }
  }

  onRegister() {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.messageError = 'As senhas não conferem.';
      return;
    }

    if (this.registerForm.valid) {
      this.loadingRegister = true;
      this.messageSuccess = '';
      this.messageError = '';

      const dto: UserRegisterDTO = {
        name: this.registerForm.get('name')?.value || '',
        email: this.registerForm.get('email')?.value || '',
        password: password || ''
      };

      this.authService.register(dto).subscribe({
        next: () => {
          this.loadingRegister = false;
          this.messageSuccess = 'Conta criada com sucesso!';
          this.registerForm.reset();
          // Após 2 segundos, retorna ao login
          setTimeout(() => {
            this.showRegister = false;
            this.messageSuccess = '';
          }, 2000);
        },
        error: (err) => {
          this.loadingRegister = false;
          this.messageError = err?.error?.message || 'Erro ao criar conta. Tente novamente.';
        }
      });
    }
  }

  toggleForgotPassword() {
    this.showForgotPassword = !this.showForgotPassword;
    this.messageSuccess = '';
    this.messageError = '';
    this.forgotPasswordForm.reset();
  }

  onForgotPassword() {
    if (this.forgotPasswordForm.valid) {
      this.loadingForgotPassword = true;
      this.messageSuccess = '';
      this.messageError = '';

      const dto: ForgotPasswordDTO = {
        email: this.forgotPasswordForm.get('email')?.value || ''
      };

      this.authService.forgotPassword(dto).subscribe({
        next: () => {
          this.loadingForgotPassword = false;
          this.messageSuccess = 'E-mail enviado com sucesso! Verifique sua caixa de entrada.';
          this.showForgotPassword = false;
          this.showResetPassword = true;
          this.forgotPasswordForm.reset();
        },
        error: (err) => {
          this.loadingForgotPassword = false;
          this.messageError = err?.error?.message || 'Erro ao solicitar reset de senha. Tente novamente.';
        }
      });
    }
  }

  onResetPassword() {
    const newPassword = this.resetPasswordForm.get('newPassword')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      this.messageError = 'As senhas não conferem.';
      return;
    }

    if (this.resetPasswordForm.valid) {
      this.loadingResetPassword = true;
      this.messageSuccess = '';
      this.messageError = '';

      const dto: ResetPasswordDTO = {
        token: this.resetPasswordForm.get('token')?.value || '',
        newPassword: newPassword || ''
      };

      this.authService.resetPassword(dto).subscribe({
        next: () => {
          this.loadingResetPassword = false;
          this.messageSuccess = 'Senha alterada com sucesso! Você já pode fazer login.';
          this.resetPasswordForm.reset();
          this.showResetPassword = false;
          setTimeout(() => {
            this.messageSuccess = '';
          }, 3000);
        },
        error: (err) => {
          this.loadingResetPassword = false;
          this.messageError = err?.error?.message || 'Erro ao alterar senha. Token pode ter expirado.';
        }
      });
    }
  }

  cancelReset() {
    this.showResetPassword = false;
    this.resetPasswordForm.reset();
    this.messageSuccess = '';
    this.messageError = '';
  }
}
