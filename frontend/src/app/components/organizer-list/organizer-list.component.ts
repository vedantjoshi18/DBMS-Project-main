import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizerGroup } from '../../models/organizer-group.model';
import { OrganizerGroupService } from '../../services/organizer-group.service';

@Component({
  selector: 'app-organizer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="page">
      <div class="inner">
        <div class="header">
          <p class="crumb">Home &rsaquo; {{ type === 'club' ? 'Clubs' : 'Departments' }}</p>
          <h1>{{ type === 'club' ? 'Student Clubs' : 'Academic Departments' }}</h1>
          <div class="search-row">
            <input [(ngModel)]="searchTerm" placeholder="Search by name…" class="search">
            <span class="count-badge" *ngIf="groups$ | async as groups">
              {{ filterGroups(groups).length }} group{{ filterGroups(groups).length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <div class="grid" *ngIf="groups$ | async as groups">
          <article class="card" *ngFor="let group of filterGroups(groups)"
                   [routerLink]="group.type === 'club' ? ['/clubs', group.slug] : ['/departments', group.slug]">
            <div class="cover" [class.dept-cover]="group.type === 'department'">
              <div class="cover-overlay"></div>
            </div>
            <div class="card-body">
              <span class="type-chip" [class.club]="group.type === 'club'" [class.dept]="group.type === 'department'">
                {{ group.type }}
              </span>
              <h3>{{ group.name }}</h3>
              <p>{{ group.description || 'Organizer group on campus.' }}</p>
              <div class="chips">
                <span class="chip" *ngFor="let tag of group.tags || []">{{ tag }}</span>
              </div>
              <span class="view-link">View Events &rarr;</span>
            </div>
          </article>

          <div class="empty" *ngIf="filterGroups(groups).length === 0">
            <h3>No results found</h3>
            <p>Try a different search term.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .page { min-height: 100vh; padding: 120px 0 70px; }

    .inner { width: min(1200px, 92vw); margin: 0 auto; }

    /* ── Header ── */
    .header { margin-bottom: 32px; }
    .crumb { color: rgba(255,255,255,.5); font-size: .85rem; margin-bottom: 6px; }
    h1 { color: #fff; margin: 0 0 20px; font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 700; }

    .search-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .search {
      flex: 1; max-width: 360px;
      background: rgba(255,255,255,.06);
      color: #fff;
      border: 1px solid rgba(255,255,255,.14);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: .95rem;
      transition: border-color .2s;
    }
    .search:focus { outline: none; border-color: rgba(220,38,38,.5); }
    .search::placeholder { color: rgba(255,255,255,.4); }

    .count-badge {
      padding: 6px 14px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 999px;
      font-size: .8rem;
      color: rgba(255,255,255,.6);
    }

    /* ── Grid ── */
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
    @media (max-width: 1000px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 640px)  { .grid { grid-template-columns: 1fr; } }

    /* ── Card ── */
    .card {
      background: rgba(255,255,255,.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 18px;
      overflow: hidden;
      color: #fff;
      transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
      cursor: pointer;
    }
    .card:hover {
      transform: translateY(-5px);
      border-color: rgba(220,38,38,.35);
      box-shadow: 0 12px 40px rgba(0,0,0,.35);
    }

    .cover {
      height: 140px;
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      position: relative;
    }
    .cover.dept-cover { background: linear-gradient(135deg, #1d4ed8 0%, #111827 100%); }
    .cover-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 60%);
    }

    .card-body { padding: 16px; }

    .type-chip {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: .7rem;
      font-weight: 600;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .type-chip.club { background: rgba(220,38,38,.15); border: 1px solid rgba(220,38,38,.3); color: #f87171; }
    .type-chip.dept { background: rgba(59,130,246,.15); border: 1px solid rgba(59,130,246,.3); color: #93c5fd; }

    .card-body h3 { margin: 0 0 6px; font-size: 1.1rem; font-weight: 600; }
    .card-body p { color: rgba(255,255,255,.6); font-size: .9rem; margin: 0 0 12px; line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .chip { border: 1px solid rgba(255,255,255,.2); border-radius: 999px; padding: 3px 8px; font-size: .75rem; }

    .view-link {
      display: inline-flex; align-items: center; gap: 5px;
      color: #fca5a5; text-decoration: none; font-weight: 600; font-size: .9rem;
      transition: color .2s, gap .2s;
    }
    .view-link:hover { color: #fff; gap: 8px; }

    /* ── Empty state ── */
    .empty {
      grid-column: 1/-1;
      text-align: center;
      padding: 60px 24px;
      color: rgba(255,255,255,.5);
      border: 1px dashed rgba(255,255,255,.15);
      border-radius: 16px;
    }
    .empty h3 { margin: 0 0 8px; color: rgba(255,255,255,.75); }
  `]
})
export class OrganizerListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupService = inject(OrganizerGroupService);

  type: 'club' | 'department' = this.route.snapshot.data['type'] || 'club';
  searchTerm = '';

  groups$ = this.groupService.getAllGroups(this.type);

  filterGroups(groups: OrganizerGroup[]): OrganizerGroup[] {
    const query = this.searchTerm.trim().toLowerCase();

    if (!query) {
      return groups;
    }

    return groups.filter((group) => group.name.toLowerCase().includes(query));
  }
}
