import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatToolbarModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled" [class.nav-hidden]="!isNavVisible">
      <div class="nav-container">
        <a routerLink="/" class="logo">
          <span class="logo-text">Event<span class="logo-accent">Hub</span></span>
        </a>
        
        <div class="nav-inner-pill">
          <ul class="nav-links">
            <li><a (click)="scrollToSection('about')" class="nav-link">About</a></li>
            <li><a routerLink="/events" routerLinkActive="active" class="nav-link">Events</a></li>
            <li><a (click)="scrollToSection('categories')" class="nav-link">Categories</a></li>
            <li><a (click)="handleProfileClick()" [class.active]="router.url === '/profile'" class="nav-link">Profile</a></li>
            <li><a (click)="scrollToSection('contact')" class="nav-link">Contact</a></li>
          </ul>
        </div>
        
        <button class="btn-pill-login" *ngIf="!isLoggedIn" (click)="toggleLogin()">Register</button>
        <button class="btn-pill-login" *ngIf="isLoggedIn" (click)="logout()">Logout</button>
        
        <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
    
    <!-- Unified Login/Signup Modal -->
    <div class="login-modal" *ngIf="showLogin">
      <div class="modal-content glass-card">
        <button class="modal-close" (click)="toggleLogin()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <!-- Toggle Tabs -->
        <div class="auth-toggle">
          <button class="toggle-btn" [class.active]="isLoginView" (click)="isLoginView = true">Login</button>
          <button class="toggle-btn" [class.active]="!isLoginView" (click)="isLoginView = false">Sign Up</button>
        </div>

        <h2 class="modal-title">{{ isLoginView ? 'Welcome Back' : 'Create Account' }}</h2>
        <p class="modal-subtitle">{{ isLoginView ? 'Enter your credentials to continue' : 'Join us to explore amazing events' }}</p>
        
        <!-- Login Form -->
        <form *ngIf="isLoginView" #loginForm="ngForm" (ngSubmit)="onLogin(loginForm)" class="registration-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" 
                   id="email"
                   name="email" 
                   ngModel 
                   required 
                   placeholder="Enter your email"
                   email>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" 
                   id="password"
                   name="password" 
                   ngModel 
                   required 
                   minlength="6"
                   placeholder="Enter your password">
          </div>
          
          <div class="captcha-container">
            <div class="captcha-display">
              <span class="captcha-text">{{captchaCode}}</span>
              <button type="button" class="refresh-btn" (click)="generateCaptcha()">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
            
            <div class="form-group">
              <label for="captcha">Enter Captcha</label>
              <input type="text" 
                     id="captcha"
                     name="captcha" 
                     [(ngModel)]="captchaInput"
                     required 
                     placeholder="Enter code above">
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary btn-full">
            <mat-icon>login</mat-icon>
            Login
          </button>
        </form>

        <!-- Signup Form -->
        <form *ngIf="!isLoginView" #signupForm="ngForm" (ngSubmit)="onRegister(signupForm)" class="registration-form">
          <div class="form-group">
            <label for="signup-name">Full Name</label>
            <input type="text" 
                   id="signup-name"
                   name="name" 
                   ngModel 
                   required 
                   placeholder="John Doe">
          </div>

          <div class="form-group">
            <label for="signup-email">Email</label>
            <input type="email" 
                   id="signup-email"
                   name="email" 
                   ngModel 
                   required 
                   placeholder="john@example.com"
                   email>
          </div>

          <div class="form-group">
            <label for="signup-phone">Phone (Optional)</label>
            <input type="tel" 
                   id="signup-phone"
                   name="phone" 
                   ngModel 
                   placeholder="9876543210">
          </div>
          
          <div class="form-group">
            <label for="signup-password">Password</label>
            <input type="password" 
                   id="signup-password"
                   name="password" 
                   ngModel 
                   required 
                   minlength="6"
                   placeholder="Create a password">
          </div>
          
          <div class="captcha-container">
            <div class="captcha-display">
              <span class="captcha-text">{{captchaCode}}</span>
              <button type="button" class="refresh-btn" (click)="generateCaptcha()">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
            
            <div class="form-group">
              <label for="signup-captcha">Enter Captcha</label>
              <input type="text" 
                     id="signup-captcha"
                     name="captcha" 
                     [(ngModel)]="captchaInput"
                     required 
                     placeholder="Enter code above">
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary btn-full">
            <mat-icon>person_add</mat-icon>
            Create Account
          </button>
        </form>
      </div>
    </div>
    
    <!-- Backdrop -->
    <div class="modal-backdrop" *ngIf="showLogin" (click)="toggleLogin()"></div>
  `,
  styles: [`
    /* Navbar */
    .navbar {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      border-radius: 50px;
      background: transparent;
      border: 1px solid transparent;
      box-shadow: none;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .navbar.scrolled {
      top: 12px;
      background: rgba(18, 18, 24, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    
    .navbar.nav-hidden {
      transform: translateX(-50%) translateY(-150%);
      opacity: 0;
      pointer-events: none;
    }
    
    .nav-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      padding: 12px 20px;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .navbar.scrolled .nav-container {
      padding: 10px 20px;
      gap: 32px;
    }
    
    /* Logo */
    .logo {
      text-decoration: none;
    }
    
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.4rem;
      color: white;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      transition: all 0.3s ease;
    }
    
    .logo:hover .logo-text {
      text-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
    }
    
    .logo-accent {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Inner Pill - Nested container for nav links */
    .nav-inner-pill {
      display: flex;
      align-items: center;
      background: rgba(40, 40, 50, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50px;
      padding: 8px 24px;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .navbar.scrolled .nav-inner-pill {
      background: rgba(50, 50, 60, 0.5);
      border-color: rgba(255, 255, 255, 0.08);
    }
    
    /* Nav Links */
    .nav-links {
      display: flex;
      list-style: none;
      gap: 28px;
      margin: 0;
      padding: 0;
    }
    
    .nav-link {
      text-decoration: none;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
      font-size: 0.85rem;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      padding: 6px 0;
      white-space: nowrap;
    }
    
    .nav-link:hover,
    .nav-link.active {
      color: white;
    }
    
    /* Login Button inside Pill */
    .btn-pill-login {
      padding: 8px 20px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      border: none;
      border-radius: 50px;
      color: white;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      white-space: nowrap;
    }
    
    .btn-pill-login:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(220, 38, 38, 0.4);
    }
    
    /* Nav Actions */
    .nav-actions {
      display: flex;
      gap: 12px;
    }
    
    .btn-gradient {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      border: none;
      border-radius: 50px;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3);
      font-family: inherit;
    }
    
    .btn-gradient:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(220, 38, 38, 0.4);
    }
    
    .btn-gradient mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    /* Mobile Menu Button */
    .mobile-menu-btn {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }
    
    .mobile-menu-btn span {
      width: 24px;
      height: 2px;
      background: white;
      transition: all 0.3s ease;
    }
    
    /* Login Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      z-index: 2000; /* Increased to cover navbar */
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .login-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2001;
      width: 90%;
      max-width: 420px;
      transition: max-width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .login-modal.wide-modal {
      max-width: 750px !important;
    }
    
    .modal-content {
      padding: 40px;
      overflow-y: auto;
      max-height: 90vh;
      border-radius: 24px;
      animation: contentFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      scrollbar-width: none;
    }

    .modal-content::-webkit-scrollbar {
      display: none;
    }

    @keyframes contentFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      padding: 8px;
      transition: all 0.3s ease;
      z-index: 10;
    }
    
    .modal-close:hover {
      color: white;
      transform: rotate(90deg);
    }
    
    .modal-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .modal-subtitle {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 30px;
      font-size: 0.95rem;
    }

    /* Auth Toggle */
    .auth-toggle {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-bottom: 28px;
      background: rgba(255, 255, 255, 0.06);
      padding: 6px;
      border-radius: 50px;
      width: fit-content;
      margin-left: auto;
      margin-right: auto;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .toggle-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      padding: 10px 28px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.02em;
    }

    .toggle-btn.active {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      box-shadow: 0 2px 10px rgba(220, 38, 38, 0.3);
    }
    
    .registration-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    form.signup-form.registration-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .signup-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      column-gap: 24px;
      row-gap: 20px;
      align-items: start;
    }

    .signup-form .btn-full {
      margin-top: 8px;
    }

    /* Captcha row: display on left, input on right, vertically aligned */
    .captcha-cell {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 8px;
    }

    .captcha-cell .captcha-display {
      margin-bottom: 0;
      height: auto;
      min-height: 52px;
    }

    /* Responsive Grid for Modal */
    @media (max-width: 600px) {
      .login-modal.wide-modal {
        max-width: 95% !important;
      }
      
      .signup-grid {
        grid-template-columns: 1fr !important;
        gap: 16px;
      }

      .captcha-cell label {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .modal-content {
        padding: 30px 20px;
      }
      
      .modal-title {
        font-size: 1.3rem;
      }
      
      .auth-toggle {
        gap: 8px;
      }
      
      .toggle-btn {
        padding: 8px 16px;
        font-size: 0.85rem;
      }
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-group label {
      font-size: 0.9rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
      margin-left: 4px; /* Slight alignment offset */
      margin-bottom: 2px;
    }
    
    .form-group input {
      padding: 14px 18px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      color: white;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    
    .form-group input:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 75, 43, 0.5);
      box-shadow: 0 0 0 4px rgba(255, 75, 43, 0.1);
    }
    
    .form-group input::placeholder {
      color: rgba(255, 255, 255, 0.45);
      font-weight: 400;
    }
    
    /* Captcha */
    .captcha-container {
      margin: 8px 0;
    }
    
    .captcha-display {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(102, 126, 234, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.3);
      border-radius: 12px;
      padding: 14px 20px;
      margin-bottom: 16px;
    }
    
    .captcha-text {
      font-family: 'Courier New', monospace;
      font-size: 1.6rem;
      font-weight: 700;
      color: white;
      letter-spacing: 6px;
      flex: 1;
      user-select: none;
      text-decoration: line-through;
      text-decoration-color: rgba(102, 126, 234, 0.3);
    }
    
    .refresh-btn {
      background: none;
      border: none;
      color: #dc2626;
      cursor: pointer;
      padding: 8px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .refresh-btn:hover {
      transform: rotate(180deg);
    }
    
    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      letter-spacing: 0.02em;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4);
      filter: brightness(1.1);
    }
    
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-outline {
      background: transparent;
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: #dc2626;
    }
    
    .btn-full {
      width: 100%;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .mobile-menu-btn {
        display: flex;
      }
      
      .nav-actions {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  isLoggedIn = false;
  isScrolled = false;
  isNavVisible = true;
  lastScrollY = 0;
  showMobileMenu = false;

  // Login modal properties
  showLogin = false;
  isLoginView = true;
  captchaCode = '';
  captchaInput = '';

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.scrollY;

    // Update scrolled state for styling
    this.isScrolled = currentScrollY > 50;

    // Show navbar at the very top
    if (currentScrollY < 10) {
      this.isNavVisible = true;
    }
    // Hide navbar when scrolling down, show when scrolling up
    else if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
      // Scrolling down - hide navbar
      this.isNavVisible = false;
    } else if (currentScrollY < this.lastScrollY) {
      // Scrolling up - show navbar
      this.isNavVisible = true;
    }

    this.lastScrollY = currentScrollY;
  }

  ngOnInit() {
    console.log('Navbar initialized');
    // Sync with AuthService login state
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    // Listen for login modal open requests
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
      this.generateCaptcha();
      this.captchaInput = '';
    }
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    this.captchaCode = '';
    for (let i = 0; i < 6; i++) {
      this.captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  onLogin(form: any) {
    const email = form.value.email;
    const password = form.value.password;

    // Check if fields are filled
    if (!email || !password || !this.captchaInput) {
      alert('Please fill in all fields.');
      return;
    }

    // Validate captcha (case-insensitive)
    if (this.captchaInput.toLowerCase() !== this.captchaCode.toLowerCase()) {
      alert('Invalid captcha! Please try again.');
      this.generateCaptcha();
      this.captchaInput = '';
      return;
    }

    console.log('Login data:', form.value);
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
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
        alert(error.error?.message || 'Login failed. Please check your credentials.');
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

    // Check if fields are filled
    if (!name || !email || !password || !this.captchaInput) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate captcha (case-insensitive)
    if (this.captchaInput.toLowerCase() !== this.captchaCode.toLowerCase()) {
      alert('Invalid captcha! Please try again.');
      this.generateCaptcha();
      this.captchaInput = '';
      return;
    }

    console.log('Register data:', form.value);
    this.authService.register({ name, email, password, phone }).subscribe({
      next: (response) => {
        if (response.success) {
          this.showLogin = false;
          this.isLoggedIn = true;
          this.router.navigate(['/events']);
        }
      },
      error: (error) => {
        alert(error.error?.message || 'Registration failed. Please try again.');
        this.generateCaptcha();
        this.captchaInput = '';
      }
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/events']);
  }

  scrollToSection(sectionId: string) {
    // First navigate to events page if not already there
    if (this.router.url !== '/events' && this.router.url !== '/') {
      this.router.navigate(['/events']).then(() => {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  handleProfileClick() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      if (!this.showLogin) {
        this.toggleLogin();
      }
    }
  }
}