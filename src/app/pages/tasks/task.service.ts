import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskCreateDTO, TaskResponseDTO } from '../../core/services/models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/tasks`;

  createTask(task: TaskCreateDTO): Observable<TaskResponseDTO> {
    return this.http.post<TaskResponseDTO>(this.apiUrl, task);
  }

  getFamilyTasks(familyId: number, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/family/${familyId}?page=${page}&size=${size}&t=${new Date().getTime()}`);
  }

  getTasksToApprove(familyId: number): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(`${this.apiUrl}/family/${familyId}/approve?t=${new Date().getTime()}`);
  }

  getMinorTasks(minorId: number): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(`${this.apiUrl}/minor/${minorId}?t=${new Date().getTime()}`);
  }

  getMinorPendingTasks(minorId: number): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(`${this.apiUrl}/minor/${minorId}/pending?t=${new Date().getTime()}`);
  }

  approveTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/approve`, {}, { responseType: 'text' as 'json' });
  }

  concludeTask(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/conclude`, {}, { responseType: 'text' as 'json' });
  }

  rejectTask(id: number, reason: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reject`, { reason }, { responseType: 'text' as 'json' });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' as 'json' });
  }
}