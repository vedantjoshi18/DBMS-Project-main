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
          <p class="crumb">Home > {{ type === 'club' ? 'Clubs' : 'Departments' }}</p>
          <h1>{{ type === 'club' ? 'Student Clubs' : 'Academic Departments' }}</h1>
          <input [(ngModel)]="searchTerm" placeholder="Search by name..." class="search">
        </div>

        <div class="grid" *ngIf="groups$ | async as groups">
          <article class="card" *ngFor="let group of filterGroups(groups)">
            <div class="cover" [ngClass]="{ 'club-card': group.type === 'club', 'dept-card': group.type === 'department' }"></div>
            <h3>{{ group.name }}</h3>
            <p>{{ group.description || 'Organizer group on campus' }}</p>
            <div class="chips">
              <span class="chip" *ngFor="let tag of group.tags || []">{{ tag }}</span>
            </div>
            <a [routerLink]="group.type === 'club' ? ['/clubs', group.slug] : ['/departments', group.slug]">View Events →</a>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page { min-height:100vh; padding:120px 0 70px; }
    .inner { width:min(1200px,92vw); margin:0 auto; }
    .crumb { color: rgba(255,255,255,.6); }
    h1 { color:#fff; margin:8px 0 16px; }
    .search { width:100%; max-width:360px; background: rgba(255,255,255,.06); color:#fff; border:1px solid rgba(255,255,255,.14); border-radius:10px; padding:10px 12px; }
    .grid { margin-top:20px; display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap:16px; }
    .card { background: rgba(255,255,255,.05); backdrop-filter: blur(20px); border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:16px; color:#fff; }
    .cover { height:120px; border-radius:12px; margin-bottom:12px; background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%); }
    .club-card { border-color: rgba(220, 38, 38, 0.2); }
    .dept-card { background: linear-gradient(135deg, #1d4ed8 0%, #111827 100%); border-color: rgba(59, 130, 246, 0.2); }
    .chips { display:flex; flex-wrap:wrap; gap:6px; margin:8px 0 12px; }
    .chip { border:1px solid rgba(255,255,255,.2); border-radius:999px; padding:3px 8px; font-size:.75rem; }
    a { color:#ffb4b4; text-decoration:none; font-weight:600; }
    @media (max-width: 1000px) { .grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
    @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
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
