import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrganizerGroupService } from '../../services/organizer-group.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-organizer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page">
      <div class="inner">
        <div class="group-hero" *ngIf="group$ | async as group">
          <span class="type">{{ group.type | uppercase }}</span>
          <h1 class="group-title">{{ group.name }}</h1>
          <p class="group-description">{{ group.description }}</p>
          <div class="chips">
            <span class="chip" *ngFor="let tag of group.tags || []">{{ tag }}</span>
          </div>
        </div>

        <div class="filters">
          <button [class.active]="selectedFilter === 'upcoming'" (click)="selectedFilter = 'upcoming'">Upcoming</button>
          <button [class.active]="selectedFilter === 'all'" (click)="selectedFilter = 'all'">All</button>
          <button [class.active]="selectedFilter === 'past'" (click)="selectedFilter = 'past'">Past</button>
        </div>

        <div class="grid" *ngIf="events$ | async as events">
          <article class="event" *ngFor="let event of filterEvents(events)" [routerLink]="['/event', event._id]">
            <img [src]="event.image" [alt]="event.title">
            <div class="body">
              <h3>{{ event.title }}</h3>
              <p>{{ event.date | date:'mediumDate' }} · {{ event.category }}</p>
            </div>
          </article>

          <div class="empty" *ngIf="filterEvents(events).length === 0">
            <h3>No events yet. Check back soon!</h3>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .page { min-height: 100vh; padding: 120px 0 70px; }
    .inner { width: min(1200px, 92vw); margin: 0 auto; }

    /* ── Group Hero ── */
    .group-hero {
      background: rgba(255,255,255,.05);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 20px;
      padding: 32px 28px;
      color: #fff;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,.25);
    }

    .type {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.25);
      font-size: .75rem;
      font-weight: 600;
      letter-spacing: .06em;
      color: rgba(255,255,255,.75);
      margin-bottom: 14px;
    }

    .group-title {
      margin: 0 0 12px;
      font-size: clamp(1.7rem, 3vw, 2.4rem);
      font-weight: 700;
      line-height: 1.2;
    }

    .group-description {
      color: rgba(255,255,255,.72);
      max-width: 72ch;
      line-height: 1.65;
      margin: 0 0 16px;
    }

    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 999px;
      padding: 4px 10px;
      font-size: .75rem;
      color: rgba(255,255,255,.8);
    }

    /* ── Filter tabs ── */
    .filters { margin: 0 0 20px; display: flex; gap: 8px; flex-wrap: wrap; }
    .filters button {
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.15);
      color: rgba(255,255,255,.75);
      border-radius: 999px;
      padding: 8px 18px;
      font-size: .9rem;
      cursor: pointer;
      transition: all .2s ease;
    }
    .filters button:hover { background: rgba(255,255,255,.1); color: #fff; }
    .filters button.active {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      border-color: transparent;
      color: #fff;
    }

    /* ── Event grid ── */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }

    .event {
      text-decoration: none;
      color: #fff;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 16px;
      overflow: hidden;
      transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
    }
    .event:hover {
      transform: translateY(-4px);
      border-color: rgba(220,38,38,.4);
      box-shadow: 0 12px 36px rgba(0,0,0,.3);
    }

    .event img { width: 100%; height: 180px; object-fit: cover; display: block; }

    .body { padding: 14px 16px; }
    .body h3 { margin: 0 0 6px; font-size: 1rem; font-weight: 600; line-height: 1.3; }
    .body p { color: rgba(255,255,255,.6); margin: 0; font-size: .85rem; }

    /* ── Empty state ── */
    .empty {
      grid-column: 1/-1;
      text-align: center;
      color: rgba(255,255,255,.65);
      padding: 48px 24px;
      border: 1px dashed rgba(255,255,255,.18);
      border-radius: 14px;
    }
    .empty h3 { margin: 0 0 6px; color: rgba(255,255,255,.8); }

    @media (max-width: 640px) {
      .page { padding: 96px 0 80px; }
      .group-hero { padding: 22px 18px; }
    }
  `]
})
export class OrganizerDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(OrganizerGroupService);

  selectedFilter: 'upcoming' | 'all' | 'past' = 'upcoming';

  private readonly slug = this.route.snapshot.paramMap.get('slug') || '';

  group$ = this.groupService.getGroupBySlug(this.slug);
  events$ = this.groupService.getEventsByGroup(this.slug);

  filterEvents(events: Event[]): Event[] {
    const now = new Date();

    if (this.selectedFilter === 'all') {
      return events;
    }
    if (this.selectedFilter === 'past') {
      return events.filter((event) => new Date(event.date) < now);
    }
    return events.filter((event) => new Date(event.date) >= now);
  }
}
