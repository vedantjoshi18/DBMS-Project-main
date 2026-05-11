import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  template: `
    <!-- Main Navbar Bar -->
    <nav class="navbar" [class.scrolled]="isScrolled" [class.nav-hidden]="!isNavVisible">
      <div class="nav-container">
        <a routerLink="/" class="logo">
          <span class="logo-event">EVENT</span><span class="logo-hub">HUB</span>
        </a>
        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact:true }" class="nav-link">Home</a></li>
          <li><a routerLink="/clubs" routerLinkActive="active" class="nav-link">Clubs</a></li>
          <li><a routerLink="/departments" routerLinkActive="active" class="nav-link">Departments</a></li>
          <li><a routerLink="/events" routerLinkActive="active" class="nav-link">Events</a></li>
          <li><a (click)="handleProfileClick()" [class.active]="router.url === '/profile'" class="nav-link">Profile</a></li>
        </ul>
        <div class="nav-right">
          <button class="btn-sign-in" *ngIf="!isLoggedIn" (click)="toggleLogin()">Sign In</button>
          <button class="btn-sign-in" *ngIf="isLoggedIn" (click)="logout()">Log Out</button>
          <button class="hamburger" (click)="toggleMobileMenu()" [class.open]="showMobileMenu" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Admin FAB -->
    <button class="admin-floating-btn" *ngIf="isAdmin" routerLink="/admin" title="Admin Dashboard">
      <mat-icon>admin_panel_settings</mat-icon>
    </button>

    <!-- Mobile Full-Screen Overlay -->
    <div class="mobile-overlay" [class.open]="showMobileMenu" (click)="toggleMobileMenu()">
      <div class="mobile-panel" (click)="$event.stopPropagation()">
        <button class="mobile-close" (click)="toggleMobileMenu()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="mobile-logo">
          <span class="logo-event">EVENT</span><span class="logo-hub">HUB</span>
        </div>
        <nav class="mobile-nav">
          <a routerLink="/" class="mobile-link" (click)="toggleMobileMenu()">Home</a>
          <a routerLink="/clubs" class="mobile-link" (click)="toggleMobileMenu()">Clubs</a>
          <a routerLink="/departments" class="mobile-link" (click)="toggleMobileMenu()">Departments</a>
          <a routerLink="/events" class="mobile-link" (click)="toggleMobileMenu()">Events</a>
          <a (click)="handleProfileClick(); toggleMobileMenu()" class="mobile-link">Profile</a>
        </nav>
        <div class="mobile-footer">
          <button class="btn-filled" *ngIf="!isLoggedIn" (click)="toggleLogin(); toggleMobileMenu()">Sign In</button>
          <button class="btn-ghost" *ngIf="isLoggedIn" (click)="logout(); toggleMobileMenu()">Log Out</button>
          <a *ngIf="isAdmin" routerLink="/admin" class="btn-ghost" (click)="toggleMobileMenu()">Admin</a>
        </div>
      </div>
    </div>

    <!-- Auth Modal — two-panel full-screen -->
    <div class="auth-modal" *ngIf="showLogin" (click)="toggleLogin()">
      <div class="auth-shell" (click)="$event.stopPropagation()">

        <div class="auth-brand">
          <div class="brand-inner">
            <div class="brand-logo">
              <span class="logo-event">EVENT</span><span class="logo-hub">HUB</span>
            </div>
            <p class="brand-tagline">Where campus<br>life comes together.</p>
            <span class="brand-note">College Event Platform · Est. 2024</span>
          </div>
        </div>

        <div class="auth-form-panel">
          <button class="auth-close" (click)="toggleLogin()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div class="auth-tabs">
            <button class="auth-tab" [class.active]="authMode === 'login'" (click)="switchTab('login')">Login</button>
            <button class="auth-tab" [class.active]="authMode === 'register'" (click)="switchTab('register')">Sign Up</button>
            <button class="auth-tab auth-tab-inline" *ngIf="authMode === 'forgot'" [class.active]="true">Reset</button>
          </div>

          <h2 class="auth-heading">{{ getAuthHeading() }}</h2>
          <p class="auth-sub">{{ getAuthSubheading() }}</p>

          <!-- Login Form -->
          <form *ngIf="authMode === 'login'" #loginForm="ngForm" (ngSubmit)="onLogin(loginForm)" class="auth-form">
            <div class="field-wrap">
              <input type="email" name="email" ngModel required placeholder=" " id="lf-email" autocomplete="email">
              <label for="lf-email">Email</label>
            </div>
            <div class="field-wrap">
              <input type="password" name="password" ngModel required minlength="6" placeholder=" " id="lf-pw" autocomplete="current-password">
              <label for="lf-pw">Password</label>
            </div>
            <div class="captcha-row">
              <div class="captcha-box">
                <span class="captcha-code">{{captchaCode}}</span>
                <button type="button" class="captcha-refresh" (click)="generateCaptcha()">↻</button>
              </div>
              <div class="field-wrap">
                <input type="text" name="captcha" [(ngModel)]="captchaInput" required placeholder=" " id="lf-cap">
                <label for="lf-cap">Enter code</label>
              </div>
            </div>
            <div class="inline-error" *ngIf="loginError">{{ loginError }}</div>
            <button type="button" class="auth-link" (click)="switchTab('forgot')">Forgot password?</button>
            <button type="submit" class="btn-filled btn-full-auth" [disabled]="loginLoading">
              <span class="btn-spinner" *ngIf="loginLoading"></span>
              {{ loginLoading ? 'Logging in…' : 'Login' }}
            </button>
          </form>

          <form *ngIf="authMode === 'forgot'" #forgotForm="ngForm" (ngSubmit)="onForgotPassword(forgotForm)" class="auth-form">
            <div class="field-wrap">
              <input type="email" name="email" ngModel required placeholder=" " id="fp-email" autocomplete="email">
              <label for="fp-email">Email</label>
            </div>
            <div class="inline-error" *ngIf="forgotPasswordError">{{ forgotPasswordError }}</div>
            <div class="inline-success" *ngIf="forgotPasswordSuccess">{{ forgotPasswordSuccess }}</div>
            <button type="submit" class="btn-filled btn-full-auth" [disabled]="forgotPasswordLoading">
              <span class="btn-spinner" *ngIf="forgotPasswordLoading"></span>
              {{ forgotPasswordLoading ? 'Sending reset link…' : 'Send reset link' }}
            </button>
            <button type="button" class="auth-link auth-link-center" (click)="switchTab('login')">Back to login</button>
          </form>

          <!-- Signup Form -->
          <form *ngIf="authMode === 'register'" #signupForm="ngForm" (ngSubmit)="onRegister(signupForm)" class="auth-form">
            <div class="field-wrap">
              <input type="text" name="name" ngModel required placeholder=" " id="sf-name" autocomplete="name">
              <label for="sf-name">Full Name</label>
            </div>
            <div class="field-wrap">
              <input type="email" name="email" ngModel required placeholder=" " id="sf-email" autocomplete="email">
              <label for="sf-email">Email</label>
            </div>
            <div class="field-wrap">
              <input type="tel" name="phone" ngModel placeholder=" " id="sf-phone">
              <label for="sf-phone">Phone (optional)</label>
            </div>
            <div class="field-wrap">
              <input type="password" name="password" ngModel required minlength="6" placeholder=" " id="sf-pw" autocomplete="new-password">
              <label for="sf-pw">Password</label>
            </div>
            <div class="captcha-row">
              <div class="captcha-box">
                <span class="captcha-code">{{captchaCode}}</span>
                <button type="button" class="captcha-refresh" (click)="generateCaptcha()">↻</button>
              </div>
              <div class="field-wrap">
                <input type="text" name="captcha" [(ngModel)]="captchaInput" required placeholder=" " id="sf-cap">
                <label for="sf-cap">Enter code</label>
              </div>
            </div>
            <div class="inline-error" *ngIf="registerError">{{ registerError }}</div>
            <div class="inline-success" *ngIf="registerSuccess">{{ registerSuccess }}</div>
            <button type="submit" class="btn-filled btn-full-auth" [disabled]="registerLoading">
              <span class="btn-spinner" *ngIf="registerLoading"></span>
              {{ registerLoading ? 'Creating account…' : 'Create Account' }}
            </button>
          </form>

        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── NAVBAR ─────────────────────────────── */
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      padding: 22px 0;
      background-color: transparent;
      border-bottom: 1px solid transparent;
      backdrop-filter: blur(0px);
      -webkit-backdrop-filter: blur(0px);
      box-shadow: none;
      transition: background-color 0.45s ease, border-color 0.45s ease,
                  padding 0.35s ease, backdrop-filter 0.45s ease,
                  -webkit-backdrop-filter 0.45s ease, box-shadow 0.45s ease,
                  transform 0.35s cubic-bezier(0.16,1,0.3,1);
    }
    .navbar.scrolled {
      background-color: rgba(8,8,8,.92);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1px solid rgba(245,240,235,.07);
      box-shadow: 0 1px 40px rgba(0,0,0,.45);
      padding: 14px 0;
    }
    .navbar.nav-hidden { transform: translateY(-110%); }

    .nav-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Logo */
    .logo { text-decoration: none; display: flex; align-items: baseline; gap: 0; }
    .logo-event {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      letter-spacing: 0.04em;
      color: #f5f0eb;
    }
    .logo-hub {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      letter-spacing: 0.04em;
      color: #c8372d;
    }

    /* Nav links */
    .nav-links {
      display: flex;
      list-style: none;
      gap: 36px;
      margin: 0; padding: 0;
    }
    .nav-link {
      text-decoration: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: rgba(245,240,235,.55);
      cursor: pointer;
      transition: color 0.2s ease;
      position: relative;
      padding-top: 16px;
    }
    .nav-link::before {
      content: '·';
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      font-size: 1.2rem;
      line-height: 1;
      color: #c8372d;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .nav-link:hover, .nav-link.active { color: #f5f0eb; }
    .nav-link.active::before { opacity: 1; }

    /* Right side */
    .nav-right { display: flex; align-items: center; gap: 16px; }
    .btn-sign-in {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: transparent;
      color: rgba(245,240,235,.7);
      border: 1px solid rgba(245,240,235,.25);
      border-radius: 999px;
      padding: 8px 22px;
      cursor: pointer;
      transition: border-color 0.2s ease, color 0.2s ease;
    }
    .btn-sign-in:hover { border-color: rgba(245,240,235,.7); color: #f5f0eb; }

    /* Hamburger */
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
    }
    .hamburger span {
      display: block;
      width: 22px;
      height: 1.5px;
      background: #f5f0eb;
      transition: all 0.3s ease;
      transform-origin: center;
    }
    .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

    /* ── MOBILE OVERLAY ─────────────────────── */
    .mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 1200;
      background: rgba(0,0,0,.5);
      backdrop-filter: blur(4px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.35s ease;
    }
    .mobile-overlay.open { opacity: 1; pointer-events: all; }

    .mobile-panel {
      position: absolute;
      top: 0; right: 0;
      width: min(380px, 85vw);
      height: 100%;
      background: #0f0f0f;
      border-left: 1px solid rgba(245,240,235,.06);
      display: flex;
      flex-direction: column;
      padding: 32px 28px;
      transform: translateX(100%);
      transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
    }
    .mobile-overlay.open .mobile-panel { transform: translateX(0); }

    .mobile-close {
      align-self: flex-end;
      background: none;
      border: none;
      color: rgba(245,240,235,.5);
      cursor: pointer;
      padding: 4px;
      margin-bottom: 32px;
      transition: color 0.2s;
    }
    .mobile-close:hover { color: #f5f0eb; }

    .mobile-logo { margin-bottom: 48px; }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .mobile-link {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.8rem;
      letter-spacing: 0.04em;
      color: rgba(245,240,235,.35);
      text-decoration: none;
      cursor: pointer;
      line-height: 1.1;
      transition: color 0.2s ease;
    }
    .mobile-link:hover { color: #f5f0eb; }

    .mobile-footer {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 32px;
      border-top: 1px solid rgba(245,240,235,.06);
    }
    .btn-filled {
      background: #c8372d;
      color: #fff;
      padding: 13px 28px;
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.15s, transform 0.15s;
    }
    .btn-filled:hover { background: #e8572d; transform: translateY(-1px); }
    .btn-ghost {
      background: transparent;
      color: #f5f0eb;
      padding: 12px 28px;
      border: 1px solid rgba(245,240,235,.22);
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: border-color 0.15s;
    }
    .btn-ghost:hover { border-color: #f5f0eb; }

    /* ── AUTH MODAL ─────────────────────────── */
    .auth-modal {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,.92);
      backdrop-filter: blur(8px);
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

    .auth-shell {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: min(900px, 94vw);
      max-height: 90vh;
      border-radius: 20px;
      overflow: hidden;
      animation: scaleIn 0.4s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes scaleIn { from { transform: scale(0.94); opacity:0; } to { transform: scale(1); opacity:1; } }

    .auth-brand {
      background: #0f0f0f;
      border-right: 1px solid rgba(245,240,235,.06);
      display: flex;
      align-items: flex-end;
      padding: 48px;
    }
    .brand-inner { display: flex; flex-direction: column; gap: 20px; }
    .brand-logo { display: flex; align-items: baseline; }
    .brand-tagline {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.2rem;
      font-weight: 300;
      line-height: 1.15;
      color: #f5f0eb;
    }
    .brand-note {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.68rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(245,240,235,.3);
    }

    .auth-form-panel {
      background: #181818;
      padding: 40px 40px 40px;
      overflow-y: auto;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .auth-form-panel::-webkit-scrollbar { width: 4px; }
    .auth-form-panel::-webkit-scrollbar-thumb { background: rgba(245,240,235,.1); border-radius: 2px; }

    .auth-close {
      align-self: flex-end;
      background: none;
      border: none;
      color: rgba(245,240,235,.35);
      cursor: pointer;
      padding: 4px;
      margin-bottom: 24px;
      transition: color 0.2s;
    }
    .auth-close:hover { color: #f5f0eb; }

    /* Tab nav — underline style */
    .auth-tabs {
      display: flex;
      gap: 28px;
      margin-bottom: 28px;
      border-bottom: 1px solid rgba(245,240,235,.08);
      padding-bottom: 0;
    }
    .auth-tab {
      background: none;
      border: none;
      color: rgba(245,240,235,.35);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      padding: 0 0 12px;
      position: relative;
      transition: color 0.2s;
    }
    .auth-tab::after {
      content: '';
      position: absolute;
      bottom: -1px; left: 0; right: 0;
      height: 2px;
      background: #c8372d;
      transform: scaleX(0);
      transition: transform 0.25s ease;
    }
    .auth-tab.active { color: #f5f0eb; }
    .auth-tab.active::after { transform: scaleX(1); }

    .auth-heading {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2rem;
      letter-spacing: 0.04em;
      color: #f5f0eb;
      margin-bottom: 6px;
    }
    .auth-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      color: rgba(245,240,235,.4);
      margin-bottom: 24px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* Floating label fields */
    .field-wrap {
      position: relative;
      border: 1px solid rgba(245,240,235,.09);
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(245,240,235,.055), rgba(245,240,235,.018));
      box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 12px 28px rgba(0,0,0,.14);
      transition: border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
    }
    .field-wrap input {
      width: 100%;
      background: transparent;
      border: none;
      padding: 28px 18px 12px;
      color: #f5f0eb;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      transition: color 0.2s ease;
      outline: none;
      border-radius: 18px;
      box-sizing: border-box;
    }
    .field-wrap input:-webkit-autofill,
    .field-wrap input:-webkit-autofill:hover,
    .field-wrap input:-webkit-autofill:focus {
      -webkit-text-fill-color: #f5f0eb;
      -webkit-box-shadow: 0 0 0 1000px #1a1a1a inset;
      transition: background-color 9999s ease-in-out 0s;
      caret-color: #f5f0eb;
      border-radius: 18px;
    }
    .field-wrap:focus-within {
      border-color: rgba(200,55,45,.55);
      background: linear-gradient(180deg, rgba(200,55,45,.11), rgba(245,240,235,.03));
      box-shadow: 0 0 0 4px rgba(200,55,45,.12), inset 0 1px 0 rgba(255,255,255,.04), 0 16px 36px rgba(0,0,0,.22);
      transform: translateY(-1px);
    }
    .field-wrap input:focus + label,
    .field-wrap input:not(:placeholder-shown) + label {
      transform: translateY(-11px);
      font-size: 0.64rem;
      color: rgba(245,240,235,.55);
      letter-spacing: 0.16em;
    }
    .field-wrap label {
      position: absolute;
      left: 18px;
      top: 18px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8rem;
      color: rgba(245,240,235,.38);
      pointer-events: none;
      transition: transform 0.2s ease, font-size 0.2s ease, color 0.2s ease, letter-spacing 0.2s ease;
    }

    /* Captcha */
    .captcha-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: end;
    }
    .captcha-box {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid rgba(245,240,235,.1);
      border-radius: 18px;
      padding: 16px 18px;
      min-height: 62px;
      background: linear-gradient(180deg, rgba(245,240,235,.055), rgba(245,240,235,.018));
      box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 12px 28px rgba(0,0,0,.14);
    }
    .captcha-code {
      font-family: 'Courier New', monospace;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 6px;
      color: #f5f0eb;
      user-select: none;
      text-decoration: line-through;
      text-decoration-color: rgba(200,55,45,.4);
      flex: 1;
    }
    .captcha-refresh {
      background: none;
      border: none;
      color: rgba(245,240,235,.4);
      font-size: 1.1rem;
      cursor: pointer;
      padding: 2px;
      transition: color 0.2s, transform 0.3s;
    }
    .captcha-refresh:hover { color: #f5f0eb; transform: rotate(180deg); }

    /* Submit */
    .btn-full-auth {
      width: 100%;
      justify-content: center;
      margin-top: 4px;
    }
    .btn-spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .inline-error {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8rem;
      color: #ff8080;
    }
    .inline-success {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8rem;
      color: #7ecb7e;
    }
    .auth-link {
      align-self: flex-start;
      background: none;
      border: none;
      color: rgba(245,240,235,.56);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      padding: 0;
    }
    .auth-link:hover { color: #f5f0eb; }
    .auth-link-center { align-self: center; }

    /* ── ADMIN FAB ───────────────────────────── */
    .admin-floating-btn {
      position: fixed;
      bottom: 28px; right: 28px;
      z-index: 900;
      width: 46px; height: 46px;
      border-radius: 50%;
      background: #c8372d;
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(200,55,45,.4);
      transition: background 0.15s, transform 0.15s;
    }
    .admin-floating-btn:hover { background: #e8572d; transform: scale(1.08); }
    .admin-floating-btn mat-icon { font-size: 22px; width: 22px; height: 22px; }

    /* ── RESPONSIVE ─────────────────────────── */
    @media (max-width: 900px) {
      .nav-links { display: none; }
      .btn-sign-in { display: none; }
      .hamburger { display: flex; }
    }
    @media (max-width: 640px) {
      .auth-shell { grid-template-columns: 1fr; }
      .auth-brand { display: none; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  isLoggedIn = false;
  isScrolled = false;
  isNavVisible = true;
  lastScrollY = 0;
  showMobileMenu = false;
  isAdmin = false;

  showLogin = false;
  authMode: 'login' | 'register' | 'forgot' = 'login';
  captchaCode = '';
  captchaInput = '';

  loginLoading = false;
  registerLoading = false;
  forgotPasswordLoading = false;
  loginError = '';
  registerError = '';
  registerSuccess = '';
  forgotPasswordError = '';
  forgotPasswordSuccess = '';

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.scrollY;
    this.isScrolled = currentScrollY > 80;
    if (currentScrollY < 10) {
      this.isNavVisible = true;
    } else if (currentScrollY > this.lastScrollY && currentScrollY > 120) {
      this.isNavVisible = false;
    } else if (currentScrollY < this.lastScrollY) {
      this.isNavVisible = true;
    }
    this.lastScrollY = currentScrollY;
  }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      this.checkAdminStatus();
    });
    this.authService.currentUser$.subscribe(() => {
      this.checkAdminStatus();
    });
    this.authService.loginModalOpen$.subscribe(shouldOpen => {
      if (shouldOpen) {
        this.showLogin = true;
        this.generateCaptcha();
        this.captchaInput = '';
      }
    });
    this.generateCaptcha();
  }

  toggleLogin() {
    this.showLogin = !this.showLogin;
    if (this.showLogin) {
      this.authMode = 'login';
      this.generateCaptcha();
      this.captchaInput = '';
    }
    this.clearAuthMessages();
  }

  switchTab(mode: 'login' | 'register' | 'forgot') {
    this.authMode = mode;
    this.clearAuthMessages();
    this.captchaInput = '';
    if (mode !== 'forgot') {
      this.generateCaptcha();
    }
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  checkAdminStatus() {
    this.isAdmin = this.authService.isAdmin();
  }

  generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    this.captchaCode = '';
    for (let i = 0; i < 6; i++) {
      this.captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  clearAuthMessages() {
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';
  }

  getAuthHeading() {
    if (this.authMode === 'register') {
      return 'Create account';
    }

    if (this.authMode === 'forgot') {
      return 'Reset password';
    }

    return 'Welcome back';
  }

  getAuthSubheading() {
    if (this.authMode === 'register') {
      return 'Join to explore campus events.';
    }

    if (this.authMode === 'forgot') {
      return 'Enter your email and we will send you a secure reset link.';
    }

    return 'Enter your credentials to continue.';
  }

  onLogin(form: any) {
    const email = form.value.email;
    const password = form.value.password;
    this.loginError = '';
    if (!email || !password || !this.captchaInput) {
      this.loginError = 'Please fill in all fields.';
      return;
    }
    if (this.captchaInput.toLowerCase() !== this.captchaCode.toLowerCase()) {
      this.loginError = 'Incorrect captcha. Please try again.';
      this.generateCaptcha();
      this.captchaInput = '';
      return;
    }
    this.loginLoading = true;
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loginLoading = false;
        if (response.success) {
          this.showLogin = false;
          this.isLoggedIn = true;
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/events']);
          }
        }
      },
      error: (error) => {
        this.loginLoading = false;
        this.loginError = error.error?.message || 'Login failed. Please check your credentials.';
        this.generateCaptcha();
        this.captchaInput = '';
      }
    });
  }

  onRegister(form: any) {
    const name = form.value.name;
    const email = form.value.email;
    const password = form.value.password;
    const phone = form.value.phone;
    this.registerError = '';
    this.registerSuccess = '';
    if (!name || !email || !password || !this.captchaInput) {
      this.registerError = 'Please fill in all required fields.';
      return;
    }
    if (this.captchaInput.toLowerCase() !== this.captchaCode.toLowerCase()) {
      this.registerError = 'Incorrect captcha. Please try again.';
      this.generateCaptcha();
      this.captchaInput = '';
      return;
    }
    this.registerLoading = true;
    this.authService.register({ name, email, password, phone }).subscribe({
      next: (response) => {
        this.registerLoading = false;
        if (response.success) {
          this.registerSuccess = response.message || 'Account created! Please verify your email, then log in.';
          form.resetForm();
          this.generateCaptcha();
          this.captchaInput = '';
          setTimeout(() => { this.switchTab('login'); }, 2800);
        }
      },
      error: (error) => {
        this.registerLoading = false;
        this.registerError = error.error?.message || 'Registration failed. Please try again.';
        this.generateCaptcha();
        this.captchaInput = '';
      }
    });
  }

  onForgotPassword(form: any) {
    const email = form.value.email;
    this.forgotPasswordError = '';
    this.forgotPasswordSuccess = '';

    if (!email) {
      this.forgotPasswordError = 'Please enter your email address.';
      return;
    }

    this.forgotPasswordLoading = true;
    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordSuccess = response.message;
        form.resetForm();
      },
      error: (error) => {
        this.forgotPasswordLoading = false;
        this.forgotPasswordError = error.error?.message || 'Unable to send reset link right now.';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  handleProfileClick() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
      return;
    }
    if (!this.showLogin) {
      this.toggleLogin();
    }
  }
}
