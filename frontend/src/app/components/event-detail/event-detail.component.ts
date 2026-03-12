import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import type { Event } from '../../models/event.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <ng-container *ngIf="event$ | async as event; else loading">
    <div class="event-detail-container">
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

            <div class="organized-by glass-card" *ngIf="event.organizerGroup && isOrganizerObject(event.organizerGroup)">
              <h4>Organized by</h4>
              <div class="organizer-info">
                <img *ngIf="event.organizerGroup.image" [src]="event.organizerGroup.image" [alt]="event.organizerGroup.name">
                <div>
                  <span class="organizer-name">{{ event.organizerGroup.name }}</span>
                  <span class="organizer-type-badge">{{ event.organizerGroupType | titlecase }}</span>
                </div>
                <a [routerLink]="getOrganizerLink(event)" class="btn btn-glass">View All Events →</a>
              </div>
            </div>
            
            <div class="registration-panel glass-card">
              <div class="registration-copy">
                <span class="price-label">Registration</span>
                <h3 class="registration-title">Register Through Google Form</h3>
                <p class="registration-text">
                  Use the organizer's Google Form to register for this event instead of booking tickets on the website.
                </p>

                <a *ngIf="event.registrationLink; else noRegistrationLink"
                   class="btn btn-primary btn-lg"
                   [href]="event.registrationLink"
                   target="_blank"
                   rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 3h7v7"/>
                    <path d="M10 14 21 3"/>
                    <path d="M21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  </svg>
                  Open Registration Form
                </a>

                <ng-template #noRegistrationLink>
                  <div class="registration-pending">
                    The organizer has not added the Google Form link yet. Please check back soon.
                  </div>
                </ng-template>
              </div>

              <div class="registration-meta">
                <span class="registration-note-label">How it works</span>
                <p class="registration-note">
                  Registration happens outside the app. Submission confirmation and follow-up details will come directly from the organizer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ng-container>

    <ng-template #loading>
      <div class="skeleton-page">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </ng-template>
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

    .organized-by {
      padding: 20px;
      margin-bottom: 24px;
    }

    .organized-by h4 {
      margin: 0 0 12px;
      font-size: 1rem;
    }

    .organizer-info {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .organizer-info img {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.16);
    }

    .organizer-name {
      display: block;
      font-weight: 600;
    }

    .organizer-type-badge {
      display: inline-block;
      margin-top: 2px;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.75);
    }
    
    /* Registration */
    .registration-panel {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) minmax(220px, 1fr);
      gap: 24px;
      padding: 24px;
      align-items: start;
    }

    .registration-title {
      margin: 0 0 10px;
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 600;
    }

    .registration-text {
      margin: 0 0 18px;
      color: rgba(255, 255, 255, 0.72);
      line-height: 1.7;
    }

    .registration-meta {
      padding: 18px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.04);
    }

    .registration-note-label {
      display: inline-block;
      margin-bottom: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.56);
    }

    .registration-note {
      margin: 0;
      color: rgba(255, 255, 255, 0.72);
      font-size: 0.93rem;
      line-height: 1.6;
    }

    .registration-pending {
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px dashed rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.03);
      color: rgba(255, 255, 255, 0.72);
      line-height: 1.6;
    }
    
    .price-label {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 4px;
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
    
    @media (max-width: 700px) {
      .registration-panel {
        grid-template-columns: 1fr;
      }
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

    .btn-glass {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      color: white;
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease;
      white-space: nowrap;
    }
    .btn-glass:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.35);
    }

    /* Loading skeleton */
    .skeleton-page {
      min-height: 100vh;
      padding: 140px 24px 80px;
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: start;
    }
    @media (max-width: 900px) { .skeleton-page { grid-template-columns: 1fr; } }

    .skeleton-img { height: 400px; border-radius: 20px; background: rgba(255,255,255,.06); animation: shimmer 1.6s infinite; }
    .skeleton-line { height: 18px; border-radius: 6px; background: rgba(255,255,255,.06); margin-bottom: 14px; animation: shimmer 1.6s infinite; }
    .skeleton-line.short { width: 40%; }
    .skeleton-line.medium { width: 70%; }
    .skeleton-body { display: flex; flex-direction: column; }

    @keyframes shimmer {
      0%   { opacity: .5; }
      50%  { opacity: 1; }
      100% { opacity: .5; }
    }
  `]
})
export class EventDetailComponent {
  route = inject(ActivatedRoute);
  eventService = inject(EventService);
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

  isOrganizerObject(value: unknown): value is { name: string; slug: string; type: 'club' | 'department'; image?: string } {
    return Boolean(value && typeof value === 'object' && 'name' in value && 'slug' in value && 'type' in value);
  }

  getOrganizerLink(event: Event): string[] {
    if (!event.organizerGroup || !this.isOrganizerObject(event.organizerGroup)) {
      return ['/events'];
    }

    const base = event.organizerGroup.type === 'department' ? '/departments' : '/clubs';
    return [base, event.organizerGroup.slug];
  }
}