import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/services/auth.service';
import { WalletService } from './wallet.service';
import { WalletResponseDTO, InterestFrequency, InterestConfigDTO } from '../../core/services/models/wallet.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.scss']
})
export class Wallet implements OnInit {
  authService = inject(AuthService);
  private walletService = inject(WalletService);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  private readonly API_BASE = 'http://localhost:8082';

  userRole: string = 'MONITOR';
  familyId: number = 0;

  minors: any[] = [];
  selectedMinorId: number = 0;
  wallet: WalletResponseDTO | null = { 
    id: 0, minorId: 0, minorName: '', tokensBalance: 0, moneyBalance: 0, 
    tokenQuotation: 0, interestRate: 0, interestEnabled: false, interestFrequency: InterestFrequency.WEEKLY 
  };
  
  // Variáveis de Formulários
  depositAmount: number = 0;
  depositMotive: string = '';
  
  newQuotation: number = 0;
  
  interestRate: number = 0;
  interestEnabled: boolean = false;
  interestFrequency: InterestFrequency = InterestFrequency.WEEKLY;

  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.userRole = this.authService.getUserRole() || sessionStorage.getItem('role') || localStorage.getItem('role') || 'MONITOR';
    this.familyId = Number(sessionStorage.getItem('selectedFamilyId') || localStorage.getItem('selectedFamilyId') || localStorage.getItem('familyId')) || 0;

    if (this.userRole === 'MONITOR') {
      this.loadMinors();
    }
  }

  loadMinors() {
    let token = this.authService.getToken();
    if (!token && typeof window !== 'undefined' && window.sessionStorage) {
      token = sessionStorage.getItem('token') || localStorage.getItem('token');
    }
    const options = token ? { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) } : {};

    this.http.get<any[]>(`${this.API_BASE}/api/families/me`, options).subscribe({
      next: (families) => {
        if (families && families.length > 0) {
          const family = families.find((f: any) => f.id === this.familyId) || families[0];
          if (family && family.members) {
            this.minors = family.members.filter((m: any) => m.role === 'MINOR');
            if (this.minors.length > 0) {
              this.selectedMinorId = this.minors[0].id;
              this.loadWallet();
            }
          }
        }
      },
      error: (err) => { 
        console.error('Erro ao carregar família:', err);
      }
    });
  }

  onMinorChange() {
    this.loadWallet();
  }

  loadWallet() {
    if (!this.selectedMinorId) return;
    this.loading = true;
    this.error = null;
    
    // Zera os valores apenas ao trocar de menor no dropdown para evitar que a tela pisque
    if (!this.wallet || this.wallet.minorId !== this.selectedMinorId) {
      this.wallet = { 
        id: 0, minorId: this.selectedMinorId, minorName: '', tokensBalance: 0, moneyBalance: 0, 
        tokenQuotation: 0, interestRate: 0, interestEnabled: false, interestFrequency: InterestFrequency.WEEKLY 
      };
    }
    
    this.walletService.getWallet(this.selectedMinorId).subscribe({
      next: (data) => { 
        if (data) {
          console.log('Dados da Carteira recebidos do Banco:', data);
          this.wallet = data;
          
          // Mapeamento seguro para aceitar nomes de campos no plural ou singular vindos do backend
          const money = (data as any).moneyBalances ?? (data as any).moneyBalance ?? 0;
          const tokens = (data as any).tokenBalances ?? (data as any).tokensBalance ?? (data as any).tokenBalance ?? 0;
          const quotation = (data as any).tokenQuotation ?? (data as any).tokenQuotations ?? 0;

          // Força a conversão para número para evitar o crash de tela do '.toFixed(2)' no HTML
          this.wallet.moneyBalance = Number(money) || 0;
          this.wallet.tokensBalance = Number(tokens) || 0;
          this.wallet.tokenQuotation = Number(quotation) || 0;
          
          this.newQuotation = this.wallet.tokenQuotation;
          this.interestRate = Number(data.interestRate) || 0;
          this.interestEnabled = data.interestEnabled;
          this.interestFrequency = data.interestFrequency || InterestFrequency.WEEKLY;
        }
        this.loading = false; 
        this.cdr.detectChanges(); // Força a tela a exibir os novos saldos na mesma hora
      },
      error: (err) => { 
        console.error(err); 
        this.error = 'Erro ao carregar a carteira do menor.'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  depositTokens() {
    if (!this.selectedMinorId || !this.depositAmount || !this.depositMotive) return;
    this.loading = true; this.error = null; this.successMsg = null;

    this.walletService.depositTokens(this.selectedMinorId, this.depositAmount, this.depositMotive).subscribe({
      next: () => { 
        this.successMsg = 'Fichas depositadas com sucesso!'; 
        this.cdr.detectChanges();
        this.depositAmount = 0; 
        this.depositMotive = ''; 
        this.loadWallet(); 
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: () => { 
        this.error = 'Erro ao depositar fichas.'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  updateQuotation() {
    if (!this.selectedMinorId || this.newQuotation < 0) return;
    this.loading = true; this.error = null; this.successMsg = null;

    this.walletService.updateQuotation(this.selectedMinorId, this.newQuotation).subscribe({
      next: () => { 
        this.successMsg = 'Cotação atualizada!'; 
        this.cdr.detectChanges();
        this.loadWallet(); 
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: () => { 
        this.error = 'Erro ao atualizar cotação.'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  updateInterest() {
    if (!this.selectedMinorId) return;
    this.loading = true; this.error = null; this.successMsg = null;

    const config: InterestConfigDTO = {
      rate: this.interestRate,
      enabled: this.interestEnabled,
      frequency: this.interestFrequency
    };

    this.walletService.updateInterestConfig(this.selectedMinorId, config).subscribe({
      next: () => { 
        this.successMsg = 'Configuração de juros salva!'; 
        this.cdr.detectChanges();
        this.loadWallet(); 
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: () => { 
        this.error = 'Erro ao atualizar juros.'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  convertTokens() {
    if (!this.selectedMinorId || !this.wallet || this.wallet.tokensBalance <= 0) {
      this.error = 'Saldo de fichas insuficiente para conversão.';
      return;
    }
    
    if (!confirm('Deseja converter todas as fichas deste menor em dinheiro?')) return;
    
    this.loading = true; this.error = null; this.successMsg = null;

    this.walletService.convertTokensToMoney(this.selectedMinorId).subscribe({
      next: () => { 
        this.successMsg = 'Fichas convertidas com sucesso!'; 
        this.cdr.detectChanges();
        this.loadWallet(); 
        setTimeout(() => {
          this.successMsg = null;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: () => { 
        this.error = 'Erro ao converter fichas.'; 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  getFrequencyText(freq: string | undefined): string {
    if (!freq) return 'Semanal';
    switch (freq.toUpperCase()) {
      case 'DAILY': return 'Diário';
      case 'WEEKLY': return 'Semanal';
      case 'MONTHLY': return 'Mensal';
      default: return 'Semanal';
    }
  }
}