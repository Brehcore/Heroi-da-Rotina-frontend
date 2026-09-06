import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  // Se a requisição for para a nossa API, anexa as credenciais (Cookie HttpOnly)
  const authReq = isApiUrl
    ? req.clone({ withCredentials: true })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se a sessão expirou ou não está autorizada, desloga e manda pro login
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        localStorage.clear();
        sessionStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};