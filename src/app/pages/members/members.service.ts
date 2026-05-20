import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserResponseDTO } from '../../core/services/models/auth.models';
import { environment } from '../../../environments/environment';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role: string;
  familyId: number;
  profilePictureUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_BASE = environment.apiUrl;

  createUser(userDTO: CreateUserDTO): Observable<UserResponseDTO> {
    const token = this.authService.getToken();
    const options = token ? { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) } : {};
    
    return this.http.post<UserResponseDTO>(`${this.API_BASE}/api/users`, userDTO, options);
  }
}