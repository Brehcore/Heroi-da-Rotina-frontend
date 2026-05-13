import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { WalletResponseDTO, TransactionDTO, InterestConfigDTO } from '../../core/services/models/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost:8082/api/wallets';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    let token = this.authService.getToken();
    if (!token && typeof window !== 'undefined' && window.sessionStorage) {
      token = sessionStorage.getItem('token') || localStorage.getItem('token');
    }
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getWallet(minorId: number): Observable<WalletResponseDTO> {
    return this.http.get<WalletResponseDTO>(`${this.apiUrl}/minor/${minorId}?t=${new Date().getTime()}`, { headers: this.getHeaders() });
  }

  depositTokens(minorId: number, amount: number, motive: string): Observable<void> {
    const params = new HttpParams().set('amount', amount.toString()).set('motive', motive);
    return this.http.post<void>(`${this.apiUrl}/minor/${minorId}/deposit-tokens`, {}, { headers: this.getHeaders(), params, responseType: 'text' as 'json' });
  }

  updateQuotation(minorId: number, value: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/minor/${minorId}/quotation?value=${value}`, {}, { headers: this.getHeaders(), responseType: 'text' as 'json' });
  }

  convertTokensToMoney(minorId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/minor/${minorId}/convert`, {}, { headers: this.getHeaders(), responseType: 'text' as 'json' });
  }

  updateInterestConfig(minorId: number, config: InterestConfigDTO): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/minor/${minorId}/interest-config`, config, { headers: this.getHeaders(), responseType: 'text' as 'json' });
  }
}