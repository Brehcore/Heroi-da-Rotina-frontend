import { HttpClient, HttpHeaders } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Observable, tap, of } from 'rxjs';
import { UserLoginDTO, LoginResponseDTO, FamilyResponseDTO, UserResponseDTO, UserRegisterDTO, ForgotPasswordDTO, ResetPasswordDTO } from "./models/auth.models";
import { environment } from "../../../../src/environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private readonly API_BASE = environment.apiUrl;
    private readonly API = `${this.API_BASE}/auth/login`;
    private userRole: string | null = null;

    login(data: UserLoginDTO): Observable<LoginResponseDTO> {
        return this.http.post<LoginResponseDTO>(this.API, data).pipe(
            tap(response => {
                if (response.token && isPlatformBrowser(this.platformId)) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('userId', String(response.id));
                    localStorage.setItem('role', response.role);
                    localStorage.setItem('name', response.name);
                    this.userRole = response.role;
                }
            })
        );
    }

    register(data: UserRegisterDTO): Observable<UserResponseDTO> {
        const url = `${this.API_BASE}/auth/register`;
        return this.http.post<UserResponseDTO>(url, data);
    }

    forgotPassword(data: ForgotPasswordDTO): Observable<void> {
        const url = `${this.API_BASE}/auth/forgot-password`;
        return this.http.post<void>(url, data);
    }

    resetPassword(data: ResetPasswordDTO): Observable<void> {
        const url = `${this.API_BASE}/auth/reset-password`;
        return this.http.post<void>(url, data);
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return sessionStorage.getItem('token') || localStorage.getItem('token');
        }
        return null;
    }

    getUserRole(): string | null {
        if (this.userRole) return this.userRole;
        if (isPlatformBrowser(this.platformId)) {
            return sessionStorage.getItem('role') || localStorage.getItem('role');
        }
        return null;
    }

    getMyFamilies(): Observable<FamilyResponseDTO[]> {
        const token = this.getToken();
        const url = `${this.API_BASE}/api/families/me`;
        if (token) {
            const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
            return this.http.get<FamilyResponseDTO[]>(url, { headers });
        }
        return of([]); // Retorna um array vazio se não houver token
    }

    getFamilyMembers(familyId: string | number): Observable<UserResponseDTO[]> {
        const id = String(familyId);
        const url = `${this.API_BASE}/api/families/family/${id}`;
        const token = this.getToken();
        if (token) {
            const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
            return this.http.get<UserResponseDTO[]>(url, { headers });
        }
        return of([]); // Retorna um array vazio se não houver token
    }

isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
        return !!(sessionStorage.getItem('token') || localStorage.getItem('token'));
        }
    return false;
}

logout() {
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('name');
        }
    }
}