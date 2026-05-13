import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ScreenTimeConfigDTO, ScreenTimeRequest } from '../../core/services/models/screentime.model';

@Injectable({
  providedIn: 'root'
})
export class ScreenTimeService {
  private apiUrlRequest = 'http://localhost:8082/api/screentime/request';
  private apiUrlConfig = 'http://localhost:8082/api/screentime/config';

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

  requestScreenTime(minorId: number, minutes: number): Observable<ScreenTimeRequest> {
    return this.http.post<ScreenTimeRequest>(`${this.apiUrlRequest}/minor/${minorId}?minutes=${minutes}`, {}, { headers: this.getHeaders() });
  }

  approveRequest(requestId: number, monitorId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrlRequest}/${requestId}/approve?monitorId=${monitorId}`, {}, { headers: this.getHeaders() });
  }

  getConfig(minorId: number): Observable<ScreenTimeConfigDTO> {
    return this.http.get<ScreenTimeConfigDTO>(`${this.apiUrlConfig}/minor/${minorId}`, { headers: this.getHeaders() });
  }

  updateConfig(minorId: number, config: ScreenTimeConfigDTO): Observable<ScreenTimeConfigDTO> {
    return this.http.put<ScreenTimeConfigDTO>(`${this.apiUrlConfig}/minor/${minorId}`, config, { headers: this.getHeaders() });
  }
}