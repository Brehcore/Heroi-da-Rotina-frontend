import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schemas } from '../../../../core/types/api.types';
import { environment } from '../../../../../environments/environment';

export type MinorDashboardResponseDTO = Schemas['MinorDashboardResponseDTO'];
export type TaskSummaryDTO = Schemas['TaskSummaryDTO'];
export type WalletSummaryDTO = Schemas['WalletSummaryDTO'];
export type ScreenTimeSummaryDTO = Schemas['ScreenTimeSummaryDTO'];
export type GamificationSummaryDTO = Schemas['GamificationSummaryDTO'];

@Injectable({
  providedIn: 'root'
})
export class MinorDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/minor-portal/dashboard`;

  getDashboard(minorId: number): Observable<MinorDashboardResponseDTO> {
    return this.http.get<MinorDashboardResponseDTO>(`${this.apiUrl}/${minorId}`);
  }
}