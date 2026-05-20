import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ScreenTimeConfigDTO, ScreenTimeRequest, ScreenTimeRequestDTO, ScreenTimeResponseDTO } from '../../core/services/models/screentime.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScreenTimeService {

  private apiUrlRequest = `${environment.apiUrl}/api/screentime/request`;
  private apiUrlConfig = `${environment.apiUrl}/api/screentime/config`;

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

  requestScreenTime(requestDTO: ScreenTimeRequestDTO): Observable<ScreenTimeResponseDTO> {
    return this.http.post<ScreenTimeResponseDTO>(`${this.apiUrlRequest}/time`, requestDTO, { headers: this.getHeaders() });
  }

  approveRequest(requestId: number, monitorId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrlRequest}/${requestId}/approve?monitorId=${monitorId}`, {}, { headers: this.getHeaders() });
  }

  rejectRequest(requestId: number, monitorId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrlRequest}/${requestId}/reject?monitorId=${monitorId}`, {}, { headers: this.getHeaders() });
  }

  getPendingRequests(familyId: number): Observable<ScreenTimeResponseDTO[]> {
    return this.http.get<ScreenTimeResponseDTO[]>(`${this.apiUrlRequest}/family/${familyId}/pending?t=${new Date().getTime()}`, { headers: this.getHeaders() });
  }

  getConfig(minorId: number): Observable<ScreenTimeConfigDTO> {
    return this.http.get<ScreenTimeConfigDTO>(`${this.apiUrlConfig}/minor/${minorId}`, { headers: this.getHeaders() });
  }

  updateConfig(minorId: number, config: ScreenTimeConfigDTO): Observable<ScreenTimeConfigDTO> {
    return this.http.put<ScreenTimeConfigDTO>(`${this.apiUrlConfig}/minor/${minorId}`, config, { headers: this.getHeaders() });
  }
}