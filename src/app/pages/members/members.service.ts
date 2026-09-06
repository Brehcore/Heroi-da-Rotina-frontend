import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private readonly API_BASE = environment.apiUrl;

  getFamilyMembers(familyId: string | number): Observable<UserResponseDTO[]> {
    return this.http.get<UserResponseDTO[]>(`${this.API_BASE}/api/families/family/${familyId}`);
  }

  createUser(userDTO: CreateUserDTO): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(`${this.API_BASE}/api/users`, userDTO);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/api/users/${userId}`);
  }
}