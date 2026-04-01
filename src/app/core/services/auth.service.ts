import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import {Observable, tap } from 'rxjs';
import { UserLoginDTO, LoginResponseDTO, FamilyDTO, MemberDTO } from "./models/auth.models";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private readonly API = 'http://localhost:8082/auth/login';
    private readonly API_BASE = 'http://localhost:8082';
    private userRole: string | null = null;

    login(data: UserLoginDTO): Observable<LoginResponseDTO> {
        return this.http.post<LoginResponseDTO>(this.API, data).pipe(
            tap(response => {
                if (response.token && isPlatformBrowser(this.platformId)) {
                    localStorage.setItem('token', response.token);
                    this.userRole = response.role;
                }
            })
        );
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('token');
        }
        return null;
    }

    getUserRole(): string | null {
        return this.userRole;
    }

    getMyFamilies(): Observable<FamilyDTO[]> {
        const token = this.getToken();
        const url = `${this.API_BASE}/api/families/me`;
        if (token) {
            const headers = { Authorization: `Bearer ${token}` } as Record<string, string>;
            return this.http.get<FamilyDTO[]>(url, { headers });
        }
        return this.http.get<FamilyDTO[]>(url);
    }

    getFamilyMembers(familyId: string | number): Observable<MemberDTO[]> {
        const id = String(familyId);
        const url = `${this.API_BASE}/api/families/family/${id}`;
        const token = this.getToken();
        if (token) {
            const headers = { Authorization: `Bearer ${token}` } as Record<string, string>;
            return this.http.get<MemberDTO[]>(url, { headers });
        }
        return this.http.get<MemberDTO[]>(url);
    }

isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
        return !!localStorage.getItem('token');
        }
    return false;
}

logout() {
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('token');
        }
    }
}