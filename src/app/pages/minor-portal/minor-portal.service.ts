import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Schemas } from '../../core/types/api.types';
import { environment } from '../../../environments/environment';

export type TaskResponseDTO = Schemas['TaskResponseDTO'];

@Injectable({
  providedIn: 'root'
})
export class MinorPortalService {
  private http = inject(HttpClient);
  private readonly tasksApiUrl = `${environment.apiUrl}/api/tasks`;

  listAllTasksForMinor(minorId: number): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(`${this.tasksApiUrl}/minor/${minorId}`);
  }

  listPendingTasksForMinor(minorId: number): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(`${this.tasksApiUrl}/minor/${minorId}/pending`);
  }

  completeTask(taskId: number): Observable<void> {
    return this.http.patch<void>(`${this.tasksApiUrl}/${taskId}/conclude`, {});
  }
}