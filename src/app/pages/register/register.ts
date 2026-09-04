import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRegisterDTO } from '../../core/services/models/auth.models';
import { PublicNavbar } from '../../shared/public-navbar/public-navbar';

export const emailMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const email = control.get('email');
  const confirmEmail = control.get('confirmEmail');
  return email && confirmEmail && email.value !== confirmEmail.value ? { emailMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PublicNavbar],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = true;
  loading = false;
  error: string | null = null;

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    confirmEmail: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  }, { validators: emailMatchValidator });

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.registerForm.hasError('emailMismatch')) {
      this.error = 'Os e-mails informados não conferem.';
      return;
    }

    if (this.registerForm.valid) {
      this.loading = true;
      this.error = null;

      const { name, email, password } = this.registerForm.value;
      const registerData: UserRegisterDTO = { name, email, password } as UserRegisterDTO;

      this.authService.register(registerData).subscribe({
        next: () => {
          this.loading = false;
          alert('Conta criada com sucesso! Faça o login para continuar.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Erro ao registrar:', err);
          this.error = 'Não foi possível criar a conta. Verifique os dados ou se o e-mail já existe.';
          this.loading = false;
        }
      });
    }
  }
}