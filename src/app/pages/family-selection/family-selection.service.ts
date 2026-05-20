import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

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

  createFamily(familyDTO: FamilyCreateDTO): Observable<{ id: number; familyName: string }> {
    const token = this.authService.getToken();
    const options = token ? { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) } : {};
    
    return this.http.post<{ id: number; familyName: string }>(`${this.API_BASE}/api/families`, familyDTO, options);
  }
}