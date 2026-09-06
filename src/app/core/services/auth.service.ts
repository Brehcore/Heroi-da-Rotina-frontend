import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Observable, tap } from 'rxjs';
import { Router } from "@angular/router";
import { 
  UserLoginDTO, 
  LoginResponseDTO, 
  FamilyResponseDTO, 
  UserResponseDTO, 
  UserRegisterDTO, 
  ForgotPasswordDTO, 
  ResetPasswordDTO 
} from "./models/auth.models";
import { environment } from "../../../../src/environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  private readonly API_BASE = environment.apiUrl;
  private userRole: string | null = null;

  login(data: UserLoginDTO): Observable<LoginResponseDTO> {
    // withCredentials garante que o Cookie Set-Cookie da resposta seja aceito
    return this.http.post<LoginResponseDTO>(`${this.API_BASE}/auth/login`, data, { withCredentials: true }).pipe(
      tap(response => {
        if (isPlatformBrowser(this.platformId)) {
          // Apenas metadados não sensíveis de UI são salvos; o JWT fica exclusivamente no cookie HttpOnly
          localStorage.setItem('userId', String(response.id));
          localStorage.setItem('role', response.role);
          localStorage.setItem('name', response.name);
          this.userRole = response.role;
        }
      })
    );
  }

  register(data: UserRegisterDTO): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(`${this.API_BASE}/auth/register`, data);
  }

  forgotPassword(data: ForgotPasswordDTO): Observable<void> {
    return this.http.post<void>(`${this.API_BASE}/auth/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordDTO): Observable<void> {
    return this.http.post<void>(`${this.API_BASE}/auth/reset-password`, data);
  }

  getCurrentUserId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      const id = localStorage.getItem('userId') || sessionStorage.getItem('userId');
      return id ? Number(id) : null;
    }
    return null;
  }

  getUserRole(): string | null {
    if (this.userRole) return this.userRole;
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('role') || sessionStorage.getItem('role');
    }
    return null;
  }

  getMyFamilies(): Observable<FamilyResponseDTO[]> {
    return this.http.get<FamilyResponseDTO[]>(`${this.API_BASE}/api/families/me`);
  }

  getFamilyMembers(familyId: string | number): Observable<UserResponseDTO[]> {
    return this.http.get<UserResponseDTO[]>(`${this.API_BASE}/api/families/family/${familyId}`);
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      // Checa se o usuário completou login pelo identificador de perfil
      return !!(localStorage.getItem('userId') || sessionStorage.getItem('userId'));
    }
    return false;
  }

  logout(): void {
    // Avisa o backend para destruir o cookie e limpa os dados locais
    this.http.post(`${this.API_BASE}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearSessionAndRedirect(),
      error: () => this.clearSessionAndRedirect()
    });
  }

  private clearSessionAndRedirect(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      sessionStorage.clear();
      this.userRole = null;
    }
    this.router.navigate(['/login']);
  }
}