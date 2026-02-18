import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Booking } from '../../models/booking.model';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="profile-container">
      <!-- User Profile Section -->
      <div class="profile-header" *ngIf="user$ | async as user">
        <div class="profile-avatar">
            <span class="avatar-text">{{ user.name?.charAt(0)?.toUpperCase() || 'U' }}</span>
        </div>
        <div class="profile-info">
          <h1 class="user-name">{{ user.name }}</h1>
          <p class="user-email">
            <mat-icon>email</mat-icon>
            {{ user.email }}
          </p>
          <div class="user-badges">
             <span class="badge">{{ user.role || 'User' }}</span>
             <span class="badge joined">Joined {{ user.createdAt | date:'mediumDate' }}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Bookings Section (Reused) -->
      <h2 class="section-title">My Bookings</h2>
      
      <div class="bookings-grid" *ngIf="bookings$ | async as bookings">
        <div class="booking-card" *ngFor="let booking of bookings; let i = index" [style.animation-delay]="i * 100 + 'ms'">
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="icon-wrapper">
              <mat-icon>confirmation_number</mat-icon>
            </div>
            
            <h3 class="event-title">{{ booking.eventTitle }}</h3>
            
            <div class="details">
              <div class="detail-item">
                <mat-icon>airplane_ticket</mat-icon>
                <span>{{ booking.tickets }} Tickets</span>
              </div>
              <div class="detail-item">
                <mat-icon>calendar_today</mat-icon>
                <span>{{ booking.bookingDate | date:'mediumDate' }}</span>
              </div>
            </div>

            <div class="status-badge">
              Confirmed
            </div>
          </div>
        </div>

        <div *ngIf="bookings.length === 0" class="no-bookings">
          <mat-icon>event_busy</mat-icon>
          <p>No bookings found. Start exploring events!</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .profile-container {
      padding: 120px 2rem 4rem;
      min-height: 100vh;
      color: white;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Profile Header Styles */
    .profile-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 3rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 3rem;
      backdrop-filter: blur(10px);
      animation: fadeIn 0.6s ease-out;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
      border: 4px solid rgba(255, 255, 255, 0.1);
    }

    .avatar-text {
      font-size: 3rem;
      font-weight: 700;
      color: white;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-name {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(to right, #fff, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .user-email {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.1rem;
      margin: 0;
    }

    .user-email mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .user-badges {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
    }

    .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 99px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .badge.joined {
        background: transparent;
        border-style: dashed;
    }

    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
      margin: 3rem 0;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      color: white;
      padding-left: 1rem;
      border-left: 4px solid #6366f1;
    }

    /* Original Bookings Grid Styles */
    .bookings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
      padding: 1rem;
    }

    .booking-card {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2rem;
      backdrop-filter: blur(10px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      animation: fadeInUp 0.6s ease-out backwards;
      cursor: default;
    }

    .booking-card:hover {
      transform: translateY(-8px) scale(1.02);
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .card-glow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .booking-card:hover .card-glow {
      opacity: 1;
    }

    .card-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .icon-wrapper {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }

    .icon-wrapper mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #818cf8;
    }

    .event-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1.5rem;
      color: #fff;
      line-height: 1.3;
    }

    .details {
      width: 100%;
      display: flex;
      justify-content: space-around;
      margin-bottom: 2rem;
      padding: 1rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: #d1d5db;
      font-size: 0.9rem;
    }

    .detail-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #a5b4fc;
    }

    .status-badge {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      padding: 0.5rem 1.5rem;
      border-radius: 99px;
      font-size: 0.875rem;
      font-weight: 600;
      border: 1px solid rgba(16, 185, 129, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .no-bookings {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 24px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
    }

    .no-bookings mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(255, 255, 255, 0.2);
      margin-bottom: 1rem;
    }

    .no-bookings p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.25rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 100px 1rem 2rem;
      }
      .profile-header {
        flex-direction: column;
        text-align: center;
        padding: 2rem;
      }
      .user-name {
        font-size: 2rem;
      }
      .user-email {
        justify-content: center;
      }
      .bookings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent {
    bookingService = inject(BookingService);
    authService = inject(AuthService);

    bookings$: Observable<Booking[]> = this.bookingService.getMyBookings();
    user$ = this.authService.currentUser$;
}
