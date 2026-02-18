import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="event-detail-container" *ngIf="event$ | async as event">
      <div class="container">
        <!-- Back Button -->
        <a routerLink="/events" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Events
        </a>
        
        <div class="event-detail-grid">
          <!-- Event Image -->
          <div class="event-image-wrapper glass-card">
            <img [src]="event.image" [alt]="event.title" class="event-hero-image">
            <div class="image-overlay">
              <span class="event-status" [class.open]="event.status === 'open'" [class.closed]="event.status !== 'open'">
                {{ event.status | uppercase }}
              </span>
            </div>
          </div>
          
          <!-- Event Info -->
          <div class="event-info">
            <span class="event-category-badge">{{ event.category }}</span>
            <h1 class="event-title">{{ event.title }}</h1>
            
            <div class="event-meta-info">
              <div class="meta-item">
                <div class="meta-icon" style="background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <span class="meta-label">Date</span>
                  <span class="meta-value">{{ getEventDate(event) }}</span>
                </div>
              </div>
              
              <div class="meta-item">
                <div class="meta-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <span class="meta-label">Location</span>
                  <span class="meta-value">{{ getEventLocation(event) }}</span>
                </div>
              </div>
              
              <div class="meta-item">
                <div class="meta-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <span class="meta-label">Time</span>
                  <span class="meta-value">{{ getEventTime(event) }}</span>
                </div>
              </div>
            </div>
            
            <div class="event-description glass-card">
              <h3>About This Event</h3>
              <p>{{ event.description }}</p>
            </div>
            
            <div class="event-actions">
              <div class="price-display">
                <span class="price-label">Ticket Price</span>
                <span class="price-value">{{ (event.ticketPrice || event.price || 0) | currency }}</span>
              </div>
              
              <button class="btn btn-primary btn-lg" 
                      (click)="bookTicket(event)"
                      [disabled]="event.status !== 'open' && event.status !== 'upcoming'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Book Tickets Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .event-detail-container {
      min-height: 100vh;
      padding: 120px 0 80px;
      position: relative;
      z-index: 1;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-weight: 500;
      margin-bottom: 32px;
      transition: all 0.3s ease;
    }
    
    .back-link:hover {
      color: white;
    }
    
    .event-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: start;
    }
    
    @media (max-width: 900px) {
      .event-detail-grid {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }
    
    /* Event Image */
    .event-image-wrapper {
      position: relative;
      overflow: hidden;
      padding: 0;
    }
    
    .event-hero-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: 20px;
    }
    
    .image-overlay {
      position: absolute;
      top: 16px;
      right: 16px;
    }
    
    .event-status {
      padding: 8px 16px;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .event-status.open {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    
    .event-status.closed {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    
    /* Event Info */
    .event-category-badge {
      display: inline-block;
      padding: 8px 16px;
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .event-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      margin-bottom: 24px;
      line-height: 1.2;
    }
    
    /* Meta Info */
    .event-meta-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .meta-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .meta-icon svg {
      stroke: white;
    }
    
    .meta-label {
      display: block;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 2px;
    }
    
    .meta-value {
      display: block;
      font-weight: 600;
    }
    
    /* Description */
    .event-description {
      padding: 24px;
      margin-bottom: 32px;
    }
    
    .event-description h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 12px;
    }
    
    .event-description p {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.7;
    }
    
    /* Actions */
    .event-actions {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    
    .price-display {
      display: flex;
      flex-direction: column;
    }
    
    .price-label {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 4px;
    }
    
    .price-value {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
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
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      color: white;
      box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 30px rgba(255, 255, 255, 0.2);
    }
    
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-lg {
      padding: 16px 32px;
      font-size: 1rem;
    }
    
    /* Glass Card */
    .glass-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class EventDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  eventService = inject(EventService);
  authService = inject(AuthService);
  event$!: Observable<Event>;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.event$ = this.eventService.getEventById(id);
    } else {
      throw new Error('Event ID is required');
    }
  }

  getEventDate(event: Event): string {
    if (event.date) {
      const date = typeof event.date === 'string' ? new Date(event.date) : event.date;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Date TBA';
  }

  getEventLocation(event: Event): string {
    if (event.location) {
      return `${event.location.venue}, ${event.location.city}`;
    }
    return 'Location TBA';
  }

  getEventTime(event: Event): string {
    if (event.time) {
      return event.time;
    }
    return 'Time TBA';
  }

  bookTicket(event: Event) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/book', event._id || event.id]);
    } else {
      this.authService.openLoginModal();
    }
  }
}