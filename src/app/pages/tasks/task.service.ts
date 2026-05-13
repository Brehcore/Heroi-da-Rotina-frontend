import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskCreateDTO, TaskResponseDTO } from '../../core/services/models/task.model';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8082/api/tasks';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Recupera o token via AuthService e monta o cabeçalho de autorização
  private getHeaders(): HttpHeaders {
    let token = this.authService.getToken();
    if (!token && typeof window !== 'undefined' && window.sessionStorage) {
      token = sessionStorage.getItem('token') || localStorage.getItem('token');
    }
    
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  createTask(task: TaskCreateDTO): Observable<TaskResponseDTO> {
    return this.http.post<TaskResponseDTO>(this.apiUrl, task, { headers: this.getHeaders() });
  }

  getTasksToApprove(familyId: number): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(`${this.apiUrl}/family/${familyId}/approve?t=${new Date().getTime()}`, { headers: this.getHeaders() });
  }

  getMinorTasks(minorId: number): Observable<TaskResponseDTO[]> {
    // Adicionado ?t=timestamp para evitar que o navegador faça cache da requisição e trave a tela
    return this.http.get<TaskResponseDTO[]>(`${this.apiUrl}/minor/${minorId}?t=${new Date().getTime()}`, { headers: this.getHeaders() });
  }

  getMinorPendingTasks(minorId: number): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(`${this.apiUrl}/minor/${minorId}/pending?t=${new Date().getTime()}`, { headers: this.getHeaders() });
  }

  approveTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/approve`, {}, { headers: this.getHeaders(), responseType: 'text' as 'json' });
  }

  concludeTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/conclude`, {}, { headers: this.getHeaders(), responseType: 'text' as 'json' });
  }

  rejectTask(id: number, reason: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reject`, { reason }, { headers: this.getHeaders(), responseType: 'text' as 'json' });
  }
}