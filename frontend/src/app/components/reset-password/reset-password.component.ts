import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="reset-shell">
      <div class="reset-card">
        <a routerLink="/" class="reset-logo"><span>EVENT</span><span class="accent">HUB</span></a>
        <span class="reset-eyebrow">Password recovery</span>
        <h1 class="reset-title">Choose a new password</h1>
        <p class="reset-sub" *ngIf="state === 'form'">Enter a new password for your account. This link is time-limited for security.</p>
        <p class="reset-sub" *ngIf="state === 'invalid'">This reset link is missing or invalid. Request a new password reset link from the login modal.</p>
        <p class="reset-sub" *ngIf="state === 'success'">Your password has been updated successfully. You can now sign in with your new password.</p>

        <form *ngIf="state === 'form'" class="reset-form" (ngSubmit)="onSubmit()">
          <div class="field-wrap">
            <input type="password" [(ngModel)]="password" name="password" required minlength="6" placeholder=" " id="rp-password" autocomplete="new-password">
            <label for="rp-password">New password</label>
          </div>
          <div class="field-wrap">
            <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required minlength="6" placeholder=" " id="rp-confirm" autocomplete="new-password">
            <label for="rp-confirm">Confirm new password</label>
          </div>

          <div class="inline-error" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="inline-success" *ngIf="successMessage">{{ successMessage }}</div>

          <button type="submit" class="btn-filled reset-btn" [disabled]="loading">
            {{ loading ? 'Updating password…' : 'Update password' }}
          </button>
        </form>

        <div class="reset-actions">
          <a routerLink="/events" class="btn-ghost" *ngIf="state === 'success'">Go to events</a>
          <a routerLink="/" class="btn-ghost" *ngIf="state !== 'success'">Back home</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: radial-gradient(circle at top, rgba(200,55,45,.12), transparent 30%), var(--bg-void);
      color: var(--text-primary);
    }
    .reset-shell {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 48px 20px;
    }
    .reset-card {
      width: min(520px, 100%);
      padding: 36px;
      border-radius: 28px;
      border: 1px solid rgba(245,240,235,.08);
      background: linear-gradient(180deg, rgba(24,24,24,.92), rgba(10,10,10,.96));
      box-shadow: 0 24px 80px rgba(0,0,0,.4);
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .reset-logo {
      text-decoration: none;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      letter-spacing: 0.04em;
      color: var(--text-primary);
      display: inline-flex;
      align-items: baseline;
      gap: 0;
    }
    .accent { color: var(--accent); }
    .reset-eyebrow {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(245,240,235,.36);
    }
    .reset-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(2.4rem, 6vw, 4rem);
      line-height: .95;
      margin: 0;
    }
    .reset-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: .92rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0;
    }
    .reset-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 6px;
    }
    .field-wrap {
      position: relative;
      border: 1px solid rgba(245,240,235,.09);
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(245,240,235,.055), rgba(245,240,235,.018));
      box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 12px 28px rgba(0,0,0,.14);
      transition: border-color .22s ease, box-shadow .22s ease, transform .22s ease;
    }
    .field-wrap:focus-within {
      border-color: rgba(200,55,45,.55);
      box-shadow: 0 0 0 4px rgba(200,55,45,.12), inset 0 1px 0 rgba(255,255,255,.04), 0 16px 36px rgba(0,0,0,.22);
      transform: translateY(-1px);
    }
    .field-wrap input {
      width: 100%;
      background: transparent;
      border: none;
      padding: 28px 18px 12px;
      color: #f5f0eb;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      outline: none;
      border-radius: 18px;
      box-sizing: border-box;
    }
    .field-wrap label {
      position: absolute;
      left: 18px;
      top: 18px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8rem;
      color: rgba(245,240,235,.38);
      pointer-events: none;
      transition: transform .2s ease, font-size .2s ease, color .2s ease, letter-spacing .2s ease;
    }
    .field-wrap input:focus + label,
    .field-wrap input:not(:placeholder-shown) + label {
      transform: translateY(-11px);
      font-size: 0.64rem;
      color: rgba(245,240,235,.55);
      letter-spacing: 0.16em;
    }
    .inline-error {
      color: #ffb3b3;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
    }
    .inline-success {
      color: #9fe0a8;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
    }
    .reset-btn {
      width: 100%;
      justify-content: center;
      margin-top: 6px;
    }
    .reset-actions {
      display: flex;
      justify-content: flex-start;
      margin-top: 6px;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  state: 'form' | 'success' | 'invalid' = 'form';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.state = 'invalid';
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.token) {
      this.state = 'invalid';
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.authService.resetPassword(this.token, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = response.message;
        this.state = 'success';
        this.password = '';
        this.confirmPassword = '';
        setTimeout(() => this.router.navigate(['/events']), 2200);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Could not reset password. Please request a new link.';
      }
    });
  }
}