import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput name="email" ngModel required email [(ngModel)]="email">
              <mat-error>Valid email is required</mat-error>
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" name="password" ngModel required minlength="6" [(ngModel)]="password">
              <mat-error>Min 6 characters</mat-error>
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              [disabled]="loginForm.invalid || loading"
              class="full-width">
              <mat-spinner *ngIf="loading" diameter="20" class="spinner"></mat-spinner>
              <span *ngIf="!loading">Login</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 10px;
    }

    .error-message {
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.35);
      color: #fca5a5;
      padding: 10px 14px;
      border-radius: 10px;
      margin-bottom: 16px;
      font-size: 0.9rem;
      animation: fadeInErr 0.2s ease-out;
    }

    @keyframes fadeInErr {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .spinner {
      display: inline-block;
      margin-right: 8px;
    }

    button {
      position: relative;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    button:not(:disabled):active {
      transform: scale(0.97);
      filter: brightness(0.9);
      transition-duration: 0.08s;
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);
  
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  onSubmit(form: any) {
    if (form.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = '';
      
      this.authService.login({
        email: this.email,
        password: this.password
      }).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.snackBar.open('Login successful!', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.router.navigate(['/events']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}