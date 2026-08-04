import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

//Mudar para o models depois e alterar os métodos pra chamar o DTO
export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  familyId: number;
  familyName: string;
  profilePictureUrl: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_BASE = environment.apiUrl;

  getUserProfile(): Observable<UserResponseDTO> {
    const token = this.authService.getToken();
    const options = token ? { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) } : {};
    
    return this.http.get<UserResponseDTO>(`${this.API_BASE}/api/users/me`, options);
  }

  changePassword(data: ChangePasswordDTO): Observable<void> {
    const token = this.authService.getToken();
    const options = token ? { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) } : {};

    return this.http.post<void>(`${this.API_BASE}/auth/change-password`, data, options);
  }
}

