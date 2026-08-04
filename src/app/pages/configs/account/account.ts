import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService, UserResponseDTO, ChangePasswordDTO } from './account.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.html',
  styleUrls: ['./account.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeModal()',
  },
})
export class Account implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(AccountService);
   private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  /** Controla qual view do account será exibida baseado na rota atual. */
  readonly activeView = signal<'profile' | 'password' | 'email' | 'delete' | null>(null);

  user: UserResponseDTO | null = null;
  loading = true;
  error: string | null = null;

    // --- Lógica para Alteração de Senha ---
  changePasswordForm!: FormGroup;
  changePasswordLoading = signal(false);
  changePasswordError = signal<string | null>(null);
  changePasswordSuccess = signal<string | null>(null);

  constructor() {
    this.buildChangePasswordForm();
  }

  // --- Fim da Lógica de Alteração de Senha ---


  ngOnInit(): void {
    const currentPath = this.route.snapshot.routeConfig?.path ?? '';
    
    // Verifica a rota e seta a view correspondente
    if (currentPath.includes('profile')) {
      this.activeView.set('profile');
      this.fetchUserProfile();
    } else if (currentPath.includes('password')) {
      this.loading = false; // Não há necessidade de carregar dados do usuário para alterar a senha
      this.activeView.set('password');
    } else if (currentPath.includes('email')) {
      this.activeView.set('email');
    } else if (currentPath.includes('delete')) {
      this.activeView.set('delete');
    }
  }

  fetchUserProfile(): void {
    this.profileService.getUserProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erro ao buscar perfil:', err);
        this.error = 'Não foi possível carregar os dados do perfil.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private buildChangePasswordForm(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]], // Recomenda-se no mínimo 8 caracteres
      confirmNewPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmNewPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      form.get('confirmNewPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onChangePasswordSubmit(): void {
    if (this.changePasswordForm.invalid || this.changePasswordLoading()) {
      return;
    }

    this.changePasswordLoading.set(true);
    this.changePasswordError.set(null);
    this.changePasswordSuccess.set(null);

    const { oldPassword, newPassword } = this.changePasswordForm.value;
    const payload: ChangePasswordDTO = { oldPassword, newPassword };

    this.profileService.changePassword(payload)
      .pipe(
        finalize(() => {
          this.changePasswordLoading.set(false);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.changePasswordSuccess.set('Senha alterada com sucesso!');
          this.changePasswordForm.reset();
        },
        error: (err) => {
          this.changePasswordError.set(err.error?.message || 'Erro ao alterar a senha. Verifique a senha antiga.');
        }
      });
  }

  /** Fecha o modal retornando para a tela principal de configurações. */
  closeModal(): void {
    this.router.navigate(['/configs']);
  }
}