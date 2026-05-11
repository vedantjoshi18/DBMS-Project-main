import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, AuthUser, MessageResponse } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly authRequestOptions = { withCredentials: true };

  private readonly loggedIn = new BehaviorSubject<boolean>(false);
  private readonly currentUser = new BehaviorSubject<AuthUser | null>(null);

  isLoggedIn$ = this.loggedIn.asObservable();
  currentUser$ = this.currentUser.asObservable();

  private readonly showLoginModal = new BehaviorSubject<boolean>(false);
  loginModalOpen$ = this.showLoginModal.asObservable();

  constructor() {
    const token = localStorage.getItem('token');
    const user = this.getStoredUser();

    if (token && user) {
      this.loggedIn.next(true);
      this.currentUser.next(user);
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData, this.authRequestOptions).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          this.setAuthData(response.data);
        }
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, this.authRequestOptions).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          this.setAuthData(response.data);
        }
      })
    );
  }

  requestPasswordReset(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/forgot-password`, { email }, this.authRequestOptions);
  }

  resetPassword(token: string, password: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password`, { token, password }, this.authRequestOptions);
  }

  refreshSession(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}, this.authRequestOptions).pipe(
      tap(response => this.applyAuthResponse(response))
    );
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`, this.authRequestOptions).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUser.next(response.data);
        }
      })
    );
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, this.authRequestOptions).subscribe({
      error: () => undefined
    });

    this.clearSession();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token') && this.loggedIn.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser.value || this.getStoredUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  applyAuthResponse(response: AuthResponse | null) {
    if (response?.success && response.data?.token) {
      this.setAuthData(response.data);
      return;
    }

    this.clearSession();
  }

  clearSession() {
    this.loggedIn.next(false);
    this.currentUser.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  }

  private getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      this.clearSession();
      return null;
    }
  }

  private setAuthData(data: AuthUser) {
    const { token, ...user } = data;

    if (!token) {
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    this.loggedIn.next(true);
    this.currentUser.next(user);
  }

  openLoginModal() {
    this.showLoginModal.next(true);
  }
}