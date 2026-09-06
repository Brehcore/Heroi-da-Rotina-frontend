import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private readonly API_BASE = environment.apiUrl;

  getUserProfile(): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.API_BASE}/api/users/me`);
  }
}