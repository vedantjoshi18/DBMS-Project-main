import { HttpBackend, HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/booking.model';
import { environment } from '../../environments/environment';

let refreshRequest$: Observable<AuthResponse> | null = null;

const isAuthEndpoint = (url: string) => ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/verify-email']
  .some((path) => url.includes(path));

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const httpBackend = inject(HttpBackend);
  const rawHttp = new HttpClient(httpBackend);
  const token = authService.getToken();

  req = req.clone({ withCredentials: true });

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthEndpoint(req.url)) {
        if (error.status === 401 && req.url.includes('/auth/refresh')) {
          authService.clearSession();
          router.navigate(['/login']);
        }

        return throwError(() => error);
      }

      refreshRequest$ ??= rawHttp.post<AuthResponse>(
          `${environment.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        ).pipe(
          finalize(() => {
            refreshRequest$ = null;
          }),
          shareReplay(1)
        );

      return refreshRequest$.pipe(
        switchMap((response) => {
          authService.applyAuthResponse(response);

          const refreshedToken = response.data?.token;
          const retryRequest = refreshedToken
            ? req.clone({
                setHeaders: {
                  Authorization: `Bearer ${refreshedToken}`
                },
                withCredentials: true
              })
            : req.clone({ withCredentials: true });

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          authService.clearSession();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
