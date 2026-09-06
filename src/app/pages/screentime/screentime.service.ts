import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScreenTimeConfigDTO, ScreenTimeResponseDTO } from '../../core/services/models/screentime.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScreenTimeService {
  private http = inject(HttpClient);

  private readonly apiUrlRequest = `${environment.apiUrl}/api/screentime/request`;
  private readonly apiUrlConfig = `${environment.apiUrl}/api/screentime/config`;

  exchangeTokens(requestDTO: { minorId: number; tokens: number }): Observable<ScreenTimeResponseDTO> {
    return this.http.post<ScreenTimeResponseDTO>(`${this.apiUrlRequest}/exchange-tokens`, requestDTO);
  }

  approveRequest(requestId: number, monitorId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrlRequest}/${requestId}/approve?monitorId=${monitorId}`, {});
  }

  rejectRequest(requestId: number, monitorId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrlRequest}/${requestId}/reject?monitorId=${monitorId}`, {});
  }

  getPendingRequests(familyId: number): Observable<ScreenTimeResponseDTO[]> {
    return this.http.get<ScreenTimeResponseDTO[]>(`${this.apiUrlRequest}/family/${familyId}/pending?t=${new Date().getTime()}`);
  }

  getConfig(minorId: number): Observable<ScreenTimeConfigDTO> {
    return this.http.get<ScreenTimeConfigDTO>(`${this.apiUrlConfig}/minor/${minorId}`);
  }

  updateConfig(minorId: number, config: ScreenTimeConfigDTO): Observable<ScreenTimeConfigDTO> {
    return this.http.put<ScreenTimeConfigDTO>(`${this.apiUrlConfig}/minor/${minorId}`, config);
  }
}