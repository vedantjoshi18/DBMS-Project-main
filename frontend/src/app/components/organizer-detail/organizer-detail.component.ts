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
        <div class="hero" *ngIf="group$ | async as group">
          <span class="type">{{ group.type | uppercase }}</span>
          <h1>{{ group.name }}</h1>
          <p>{{ group.description }}</p>
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
    .page { min-height:100vh; padding:120px 0 70px; }
    .inner { width:min(1200px,92vw); margin:0 auto; }
    .hero { background: rgba(255,255,255,.05); backdrop-filter: blur(20px); border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:20px; color:#fff; }
    .type { display:inline-block; padding:4px 10px; border-radius:999px; border:1px solid rgba(255,255,255,.2); font-size:.75rem; }
    h1 { margin:10px 0; }
    .chips { display:flex; flex-wrap:wrap; gap:8px; }
    .chip { border:1px solid rgba(255,255,255,.2); border-radius:999px; padding:3px 8px; font-size:.75rem; }
    .filters { margin:18px 0; display:flex; gap:8px; }
    .filters button { background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.15); color:#fff; border-radius:999px; padding:8px 14px; }
    .filters button.active { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-color: transparent; }
    .grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
    .event { text-decoration:none; color:#fff; background: rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:14px; overflow:hidden; }
    .event img { width:100%; height:150px; object-fit:cover; }
    .body { padding:12px; }
    .body p { color: rgba(255,255,255,.7); margin:4px 0 0; }
    .empty { grid-column: 1/-1; text-align:center; color: rgba(255,255,255,.75); padding:28px; border:1px dashed rgba(255,255,255,.2); border-radius:14px; }
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
