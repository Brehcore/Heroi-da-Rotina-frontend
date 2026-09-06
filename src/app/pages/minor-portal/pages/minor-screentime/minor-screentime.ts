import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScreenTimeService } from '../../../screentime/screentime.service';
import { Schemas } from '../../../../core/types/api.types';

export type ScreenTimeResponseDTO = Schemas['ScreenTimeResponseDTO'];

@Component({
  selector: 'app-minor-screentime',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './minor-screentime.html',
  styleUrls: ['./minor-screentime.scss']
})
export class MinorScreenTime implements OnInit {
  private screenTimeService = inject(ScreenTimeService);

  minorId: number | null = null;
  tokensToExchange: number = 5;

  submitting = false;
  successResult: ScreenTimeResponseDTO | null = null;
  errorMessage: string | null = null;

  // Opções rápidas de fichas para facilitar a seleção
  quickTokenOptions: number[] = [2, 5, 10, 20];

  ngOnInit(): void {
    const rawId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    this.minorId = rawId ? Number(rawId) : null;
  }

  selectQuickOption(amount: number): void {
    this.tokensToExchange = amount;
    this.clearAlerts();
  }

  onExchangeTokens(): void {
    if (!this.minorId) {
      this.errorMessage = 'Identificador do menor não encontrado na sessão.';
      return;
    }

    if (!this.tokensToExchange || this.tokensToExchange <= 0) {
      this.errorMessage = 'Informe uma quantidade válida de fichas (mínimo 1).';
      return;
    }

    this.submitting = true;
    this.clearAlerts();

    const payload = {
      minorId: this.minorId,
      tokens: this.tokensToExchange
    };

    this.screenTimeService.exchangeTokens(payload).subscribe({
      next: (response) => {
        this.successResult = response;
        this.submitting = false;
      },
      error: (err) => {
        this.submitting = false;
        if (err.error && typeof err.error.message === 'string') {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Não foi possível solicitar o tempo de tela. Verifique o saldo de fichas ou limite diário.';
        }
      }
    });
  }

  private clearAlerts(): void {
    this.errorMessage = null;
    this.successResult = null;
  }
}