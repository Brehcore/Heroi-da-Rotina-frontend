import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WalletResponseDTO, InterestConfigDTO } from '../../core/services/models/wallet.model';
import { environment } from '../../../environments/environment';

export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface TransactionDTO {
  id: number;
  type: 'CREDIT' | 'DEBIT';
  motive: string;
  formattedValue: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/wallets`;

  getWallet(minorId: number): Observable<WalletResponseDTO> {
    return this.http.get<WalletResponseDTO>(`${this.apiUrl}/minor/${minorId}?t=${new Date().getTime()}`);
  }

  getTransactions(
    minorId: number, 
    page: number = 0, 
    size: number = 10, 
    sort: string = 'id,desc'
  ): Observable<PageResponse<TransactionDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PageResponse<TransactionDTO>>(`${this.apiUrl}/minor/${minorId}/transactions`, { params });
  }

  depositTokens(minorId: number, amount: number, motive: string): Observable<void> {
    const params = new HttpParams().set('amount', amount.toString()).set('motive', motive);
    return this.http.post<void>(`${this.apiUrl}/minor/${minorId}/deposit-tokens`, {}, { params, responseType: 'text' as 'json' });
  }

  deductTokens(minorId: number, amount: number, motive: string): Observable<void> {
    const payload = { amount, motive };
    return this.http.post<void>(`${this.apiUrl}/minor/${minorId}/deduct-tokens`, payload);
  }

  updateQuotation(minorId: number, value: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/minor/${minorId}/quotation?value=${value}`, {}, { responseType: 'text' as 'json' });
  }

  convertTokensToMoney(minorId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/minor/${minorId}/convert`, {}, { responseType: 'text' as 'json' });
  }

  updateInterestConfig(minorId: number, config: InterestConfigDTO): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/minor/${minorId}/interest-config`, config, { responseType: 'text' as 'json' });
  }
}