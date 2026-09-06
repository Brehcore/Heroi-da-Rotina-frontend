import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

//Mudar para o schema OpenAPI
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
  private readonly API_BASE = environment.apiUrl;

  getUserProfile(): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.API_BASE}/api/users/me`);
  }

  changePassword(data: ChangePasswordDTO): Observable<void> {
    return this.http.post<void>(`${this.API_BASE}/auth/change-password`, data);
  }
}

