import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  familyId: number;
  familyName: string;
  profilePictureUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_BASE = environment.apiUrl;

  getUserProfile(): Observable<UserResponseDTO> {
    const token = this.authService.getToken();
    const options = token ? { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) } : {};
    
    return this.http.get<UserResponseDTO>(`${this.API_BASE}/api/users/me`, options);
  }
}