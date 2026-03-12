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
      <div class="detail-page">

        <!-- Back nav -->
        <div class="back-bar">
          <div class="wide-inner">
            <a routerLink="/events" class="back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              All Events
            </a>
          </div>
        </div>

        <!-- Hero image -->
        <div class="detail-hero">
          <img [src]="event.image" [alt]="event.title" class="detail-hero-img">
          <div class="detail-hero-overlay"></div>
          <div class="detail-hero-caption wide-inner">
            <span class="event-status-badge"
              [class.open]="event.status === 'upcoming' || event.status === 'open'"
              [class.full]="event.status === 'sold-out'"
              [class.done]="event.status === 'completed' || event.status === 'cancelled'">
              {{ event.status | uppercase }}
            </span>
            <span class="category-badge">{{ event.category }}</span>
          </div>
        </div>

        <!-- Content grid -->
        <div class="detail-body wide-inner">
          <div class="detail-main">
            <h1 class="detail-title">{{ event.title }}</h1>

            <!-- Meta row -->
            <div class="meta-row">
              <div class="meta-item" *ngIf="event.date">
                <span class="meta-icon-svg">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <div class="meta-text">
                  <span class="meta-label">Date</span>
                  <span class="meta-value">{{ getEventDate(event) }}</span>
                </div>
              </div>
              <div class="meta-item" *ngIf="event.time">
                <span class="meta-icon-svg">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <div class="meta-text">
                  <span class="meta-label">Time</span>
                  <span class="meta-value">{{ getEventTime(event) }}</span>
                </div>
              </div>
              <div class="meta-item" *ngIf="event.location">
                <span class="meta-icon-svg">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <div class="meta-text">
                  <span class="meta-label">Location</span>
                  <span class="meta-value">{{ getEventLocation(event) }}</span>
                </div>
              </div>
              <div class="meta-item">
                <span class="meta-icon-svg">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                </span>
                <div class="meta-text">
                  <span class="meta-label">Price</span>
                  <span class="meta-value">{{ event.ticketPrice === 0 ? 'Free' : '₹' + event.ticketPrice }}</span>
                </div>
              </div>
              <div class="meta-item" *ngIf="event.maxAttendees">
                <span class="meta-icon-svg">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <div class="meta-text">
                  <span class="meta-label">Capacity</span>
                  <span class="meta-value">{{ (event.currentAttendees || 0) }} / {{ event.maxAttendees }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="description-block">
              <h2 class="section-label">About this event</h2>
              <p class="description-text">{{ event.description }}</p>
            </div>

            <!-- Organizer -->
            <div class="organizer-block" *ngIf="event.organizerGroup && isOrganizerObject(event.organizerGroup)">
              <h2 class="section-label">Organised by</h2>
              <a class="organizer-card" [routerLink]="getOrganizerLink(event)">
                <div class="org-avatar" *ngIf="event.organizerGroup?.image">
                  <img [src]="event.organizerGroup?.image" alt="">
                </div>
                <div class="org-avatar org-avatar-placeholder" *ngIf="!event.organizerGroup?.image">
                  {{ event.organizerGroup?.name?.charAt(0) | uppercase }}
                </div>
                <div class="org-info">
                  <span class="org-type">{{ event.organizerGroupType === 'department' ? 'Department' : 'Student Club' }}</span>
                  <span class="org-name">{{ event.organizerGroup?.name }}</span>
                </div>
                <span class="org-arrow">→</span>
              </a>
            </div>
          </div>

          <!-- Sidebar: registration panel -->
          <div class="detail-sidebar">
            <div class="reg-panel">
              <h3 class="reg-title">Register</h3>
              <p class="reg-sub">Secure your spot for this event. Register now before seats fill up.</p>

              <ng-container *ngIf="event.registrationLink; else noLink">
                <a [href]="event.registrationLink"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="btn-filled reg-btn"
                   [class.disabled]="event.status === 'completed' || event.status === 'cancelled' || event.status === 'sold-out'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Register via Google Form
                </a>
              </ng-container>
              <ng-template #noLink>
                <div class="no-reg">
                  <p>Registration details coming soon. Check back closer to the event date.</p>
                </div>
              </ng-template>

              <div class="reg-meta">
                <div class="reg-meta-item">
                  <span class="rm-label">Status</span>
                  <span class="rm-value status-badge"
                    [class.open]="event.status === 'upcoming' || event.status === 'open'"
                    [class.full]="event.status === 'sold-out'"
                    [class.done]="event.status === 'completed' || event.status === 'cancelled'">
                    {{ event.status | titlecase }}
                  </span>
                </div>
                <div class="reg-meta-item" *ngIf="event.maxAttendees">
                  <span class="rm-label">Capacity</span>
                  <span class="rm-value">{{ event.maxAttendees }} seats</span>
                </div>
                <div class="reg-meta-item" *ngIf="event.ticketPrice !== undefined">
                  <span class="rm-label">Price</span>
                  <span class="rm-value">{{ event.ticketPrice === 0 ? 'Free' : '₹' + event.ticketPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #loading>
      <div class="loading-state">
        <div class="skeleton-hero"></div>
        <div class="skeleton-content wide-inner">
          <div class="sk-block"></div>
          <div class="sk-block sk-short"></div>
          <div class="sk-block sk-medium"></div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; background: var(--bg-void); color: var(--text-primary); min-height: 100vh; }

    .wide-inner { width: min(1200px, 92vw); margin: 0 auto; }

    /* ── Back bar ─────────────────────────────── */
    .back-bar { padding: 24px 0 0; }
    .back-link {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
      letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted);
      text-decoration: none; transition: color 0.2s;
    }
    .back-link:hover { color: var(--text-primary); }
    .back-link svg { transition: transform 0.2s; }
    .back-link:hover svg { transform: translateX(-3px); }

    /* ── Hero image ───────────────────────────── */
    .detail-hero {
      position: relative; height: 55vh; min-height: 380px; overflow: hidden; margin: 20px 0 0;
    }
    .detail-hero-img { width: 100%; height: 100%; object-fit: cover; }
    .detail-hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(8,8,8,.95) 0%, rgba(8,8,8,.3) 50%, transparent 100%);
    }
    .detail-hero-caption {
      position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 10px;
    }
    .event-status-badge, .category-badge {
      font-family: 'DM Sans', sans-serif; font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase;
      padding: 4px 12px; border-radius: 999px;
    }
    .event-status-badge {
      background: rgba(8,8,8,.6); border: 1px solid var(--border-mid); color: var(--text-muted);
    }
    .event-status-badge.open { color: #4ade80; border-color: rgba(74,222,128,.3); }
    .event-status-badge.full { color: var(--accent); border-color: rgba(200,55,45,.3); }
    .event-status-badge.done { color: var(--text-muted); }
    .category-badge {
      font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 0.85rem;
      letter-spacing: 0.04em; text-transform: none;
      color: rgba(245,240,235,.7); background: none; border: none; padding: 0;
    }

    /* ── Content grid ─────────────────────────── */
    .detail-body {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 60px;
      padding: 52px 0 100px;
      align-items: start;
    }

    /* Main column */
    .detail-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(2.8rem, 5vw, 5rem);
      line-height: 0.92;
      color: var(--text-primary);
      margin: 0 0 32px;
    }

    /* Meta row */
    .meta-row {
      display: flex; flex-wrap: wrap; gap: 24px;
      padding: 24px 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 40px;
    }
    .meta-item { display: flex; align-items: center; gap: 10px; }
    .meta-icon-svg {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .meta-text { display: flex; flex-direction: column; gap: 2px; }
    .meta-label {
      font-family: 'DM Sans', sans-serif; font-size: 0.67rem; letter-spacing: 0.12em;
      text-transform: uppercase; color: var(--text-muted);
    }
    .meta-value {
      font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500; color: var(--text-primary);
    }

    /* Description */
    .section-label {
      font-family: 'DM Sans', sans-serif; font-size: 0.72rem; letter-spacing: 0.14em;
      text-transform: uppercase; color: var(--text-muted); margin: 0 0 16px;
    }
    .description-block { margin-bottom: 40px; }
    .description-text {
      font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 300;
      line-height: 1.85; color: var(--text-secondary); white-space: pre-line;
    }

    /* Organizer */
    .organizer-block { margin-bottom: 40px; }
    .organizer-card {
      display: flex; align-items: center; gap: 16px;
      padding: 20px; border: 1px solid var(--border-mid); border-radius: var(--radius-md);
      text-decoration: none; color: inherit; background: var(--bg-surface);
      transition: border-color 0.2s, background 0.2s;
    }
    .organizer-card:hover { border-color: var(--border-hi); background: var(--bg-lift); }
    .org-avatar { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
    .org-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .org-avatar-placeholder {
      width: 48px; height: 48px; border-radius: 50%; background: var(--bg-lift); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; color: var(--text-secondary);
    }
    .org-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
    .org-type { font-family: 'DM Sans', sans-serif; font-size: 0.67rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); }
    .org-name { font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 600; color: var(--text-primary); }
    .org-arrow { color: var(--text-muted); font-family: 'DM Sans', sans-serif; transition: transform 0.2s, color 0.2s; }
    .organizer-card:hover .org-arrow { transform: translateX(4px); color: var(--text-primary); }

    /* ── Sidebar ──────────────────────────────── */
    .detail-sidebar { position: sticky; top: 100px; }
    .reg-panel {
      background: var(--bg-surface); border: 1px solid var(--border-mid);
      border-radius: var(--radius-md); padding: 28px;
    }
    .reg-title {
      font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: var(--text-primary); margin: 0 0 8px;
    }
    .reg-sub {
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 300;
      color: var(--text-secondary); line-height: 1.6; margin: 0 0 24px;
    }
    .btn-filled {
      background: #c8372d; color: #fff;
      padding: 14px 28px; border-radius: 999px;
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600;
      letter-spacing: 0.06em; text-transform: uppercase;
      border: none; cursor: pointer; text-decoration: none;
      display: inline-flex; align-items: center; gap: 9px; width: 100%; justify-content: center;
      transition: background 0.15s, transform 0.15s;
    }
    .btn-filled:hover { background: #e8572d; transform: translateY(-1px); }
    .btn-filled.disabled { opacity: 0.4; pointer-events: none; }
    .reg-btn { margin-bottom: 20px; }
    .no-reg {
      background: var(--bg-lift); border-radius: 8px; padding: 16px;
      margin-bottom: 20px;
    }
    .no-reg p { font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--text-muted); margin: 0; line-height: 1.6; }
    .reg-meta { border-top: 1px solid var(--border-subtle); padding-top: 16px; display: flex; flex-direction: column; gap: 12px; }
    .reg-meta-item { display: flex; justify-content: space-between; align-items: center; }
    .rm-label { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
    .rm-value { font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 500; color: var(--text-primary); }
    .status-badge {
      font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
      padding: 3px 10px; border-radius: 999px; border: 1px solid var(--border-mid);
    }
    .status-badge.open { color: #4ade80; border-color: rgba(74,222,128,.3); }
    .status-badge.full { color: var(--accent); border-color: rgba(200,55,45,.3); }
    .status-badge.done { color: var(--text-muted); }

    /* ── Loading ──────────────────────────────── */
    .loading-state { background: var(--bg-void); min-height: 100vh; }
    .skeleton-hero { height: 55vh; background: var(--bg-surface); animation: shimmer 1.6s infinite; }
    .skeleton-content { padding: 40px 0; display: flex; flex-direction: column; gap: 16px; }
    .sk-block { height: 20px; border-radius: 6px; background: var(--bg-surface); animation: shimmer 1.6s infinite; }
    .sk-short { width: 40%; }
    .sk-medium { width: 65%; }
    @keyframes shimmer { 0%,100% { opacity: .5; } 50% { opacity: 1; } }

    /* ── Responsive ───────────────────────────── */
    @media (max-width: 900px) {
      .detail-body { grid-template-columns: 1fr; gap: 40px; }
      .detail-sidebar { position: static; }
    }
    @media (max-width: 640px) {
      .meta-row { gap: 16px; }
      .detail-hero { height: 40vh; min-height: 260px; }
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
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return 'Date TBA';
  }

  getEventLocation(event: Event): string {
    if (event.location) return `${event.location.venue}, ${event.location.city}`;
    return 'Location TBA';
  }

  getEventTime(event: Event): string {
    return event.time || 'Time TBA';
  }

  isOrganizerObject(value: unknown): value is { name: string; slug: string; type: 'club' | 'department'; image?: string } {
    return Boolean(value && typeof value === 'object' && 'name' in value && 'slug' in value && 'type' in value);
  }

  getOrganizerLink(event: Event): string[] {
    if (!event.organizerGroup || !this.isOrganizerObject(event.organizerGroup)) return ['/events'];
    const base = event.organizerGroup.type === 'department' ? '/departments' : '/clubs';
    return [base, event.organizerGroup.slug];
  }
}
