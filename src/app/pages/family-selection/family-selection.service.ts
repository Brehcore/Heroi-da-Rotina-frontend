import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { FamilyResponseDTO } from '../../core/services/models/auth.models';

export interface FamilyCreateDTO {
  familyName: string;
  profilePictureUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FamilySelectionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API_BASE = environment.apiUrl;

  getMyFamilies(): Observable<FamilyResponseDTO[]> {
    return this.http.get<FamilyResponseDTO[]>(`${this.API_BASE}/api/families/me`);
  }

  createFamily(familyDTO: FamilyCreateDTO): Observable<{ id: number; familyName: string }> {
    return this.http.post<{ id: number; familyName: string }>(`${this.API_BASE}/api/families`, familyDTO);
  }
}