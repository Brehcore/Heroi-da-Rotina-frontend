import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface AvatarSelectionData {
  name: string;
  email: string;
  password: string;
  profilePictureUrl: string;
  role: 'MONITOR' | 'MINOR';
}

export interface AvatarStyle {
  label: string;
  value: string;
}

@Component({
  selector: 'app-avatar-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './avatar-selector.html',
  styleUrls: ['./avatar-selector.scss']
})
export class AvatarSelectorComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() initialRole: 'MONITOR' | 'MINOR' = 'MINOR';
  @Output() avatarSelected = new EventEmitter<AvatarSelectionData>();

  form!: FormGroup;
  avatarUrl: string = '';
  isLoading = false;

  readonly avatarStyles: AvatarStyle[] = [
    { label: '🤖 Robôs', value: 'bottts' },
    { label: '😊 Emojis Divertidos', value: 'fun-emoji' },
    { label: '🗡️ Aventureiros', value: 'adventurer' },
    { label: '✨ Minimalista', value: 'notionists' }
  ];

  private readonly DICEBEAR_API = 'https://api.dicebear.com/8.x';
  private readonly DEFAULT_SEED = 'Heroi';

  ngOnInit(): void {
    this.initializeForm();
    this.setupAvatarGeneration();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      style: ['bottts', Validators.required]
    });
  }

  private setupAvatarGeneration(): void {
    // Observar mudanças no nome e estilo para atualizar o avatar
    this.form.get('name')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.updateAvatarUrl());

    this.form.get('style')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.updateAvatarUrl());

    // Gerar avatar inicial
    this.updateAvatarUrl();
  }

  private updateAvatarUrl(): void {
    const nameValue = this.form.get('name')?.value || '';
    const styleValue = this.form.get('style')?.value || 'bottts';
    
    const seed = nameValue.trim() || this.DEFAULT_SEED;
    const sanitizedSeed = seed.replace(/\s+/g, '-');
    
    this.avatarUrl = `${this.DICEBEAR_API}/${styleValue}/svg?seed=${sanitizedSeed}`;
  }

  onSave(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.isLoading = true;

    const { name, email, password, style } = this.form.value;
    const seed = (name?.trim() || this.DEFAULT_SEED).replace(/\s+/g, '-');
    const profilePictureUrl = `${this.DICEBEAR_API}/${style}/svg?seed=${seed}`;

    const result: AvatarSelectionData = {
      name: name.trim(),
      email: email.trim(),
      password,
      profilePictureUrl,
      role: this.initialRole
    };

    // Simular delay de processamento
    setTimeout(() => {
      this.isLoading = false;
      this.avatarSelected.emit(result);
    }, 300);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }

    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} deve ter no mínimo ${minLength} caracteres`;
    }

    if (control.errors['email']) {
      return 'Email inválido';
    }

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      email: 'Email',
      password: 'Senha',
      style: 'Estilo'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
