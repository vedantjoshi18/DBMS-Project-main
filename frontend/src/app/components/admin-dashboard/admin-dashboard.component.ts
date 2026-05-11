import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { OrganizerGroup } from '../../models/organizer-group.model';
import { RouterModule, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatSelectModule, RouterModule],
  template: `
    <div class="admin-shell">

      <!-- ── Sidebar ──────────────────────────────── -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span class="sl-event">EVENT</span><span class="sl-hub">HUB</span>
          <span class="admin-badge">Admin</span>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item" [class.active]="currentView === 'dashboard'" (click)="currentView = 'dashboard'">
            <mat-icon>dashboard</mat-icon><span>Overview</span>
          </button>
          <button class="nav-item" [class.active]="currentView === 'events'" (click)="currentView = 'events'">
            <mat-icon>event</mat-icon><span>Events</span>
          </button>
          <button class="nav-item" [class.active]="currentView === 'groups'" (click)="currentView = 'groups'">
            <mat-icon>apartment</mat-icon><span>Organizers</span>
          </button>
          <button class="nav-item" [class.active]="currentView === 'users'" (click)="currentView = 'users'">
            <mat-icon>group</mat-icon><span>Users</span>
          </button>
        </nav>

        <div class="sidebar-bottom">
          <a routerLink="/events" class="nav-item"><mat-icon>home</mat-icon><span>Live Site</span></a>
          <button class="nav-item logout-item" (click)="logout()"><mat-icon>logout</mat-icon><span>Logout</span></button>
        </div>
      </aside>

      <!-- ── Main area ─────────────────────────────── -->
      <main class="admin-main">
        <header class="admin-header">
          <h1 class="admin-view-title">{{ getTitle() }}</h1>
          <button class="btn-filled" *ngIf="currentView === 'events'" (click)="openEventModal()">
            <mat-icon>add</mat-icon> New Event
          </button>
          <button class="btn-filled" *ngIf="currentView === 'groups'" (click)="openGroupModal()">
            <mat-icon>add</mat-icon> New Group
          </button>
        </header>

        <!-- ── Dashboard overview ── -->
        <div class="view" *ngIf="currentView === 'dashboard'">
          <div class="stats-grid">
            <div class="stat-card primary-stat">
              <span class="stat-label">Total Events</span>
              <span class="stat-num">{{ stats.totalEvents || 0 }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Users</span>
              <span class="stat-num">{{ stats.totalUsers || 0 }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Bookings</span>
              <span class="stat-num">{{ stats.totalBookings || 0 }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Clubs</span>
              <span class="stat-num">{{ stats.totalClubs || 0 }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Departments</span>
              <span class="stat-num">{{ stats.totalDepartments || 0 }}</span>
            </div>
          </div>

          <h2 class="section-heading">Recent Events</h2>
          <table class="data-table">
            <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th>Fill</th></tr></thead>
            <tbody>
              <tr *ngFor="let ev of events.slice(0, 8)">
                <td class="td-title">{{ ev.title }}</td>
                <td><span class="tag">{{ ev.category }}</span></td>
                <td class="td-muted">{{ ev.date | date:'mediumDate' }}</td>
                <td><span class="status-pill" [class.open]="ev.status==='upcoming'||ev.status==='open'" [class.done]="ev.status==='completed'||ev.status==='cancelled'">{{ ev.status }}</span></td>
                <td>
                  <div class="fill-bar"><div class="fill-inner" [style.width]="getFillPercentage(ev) + '%'"></div></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── Events view ── -->
        <div class="view" *ngIf="currentView === 'events'">
          <table class="data-table">
            <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let ev of events">
                <td class="td-title">{{ ev.title }}</td>
                <td><span class="tag">{{ ev.category }}</span></td>
                <td class="td-muted">{{ ev.date | date:'mediumDate' }}</td>
                <td class="td-muted">{{ ev.ticketPrice === 0 ? 'Free' : '₹' + ev.ticketPrice }}</td>
                <td><span class="status-pill" [class.open]="ev.status==='upcoming'||ev.status==='open'" [class.done]="ev.status==='completed'||ev.status==='cancelled'">{{ ev.status }}</span></td>
                <td class="td-actions">
                  <button class="action-btn edit-btn" (click)="openEventModal(ev)"><mat-icon>edit</mat-icon></button>
                  <button class="action-btn del-btn" (click)="deleteEvent(ev._id || ev.id)"><mat-icon>delete</mat-icon></button>
                </td>
              </tr>
              <tr *ngIf="events.length === 0"><td colspan="6" class="empty-row">No events found.</td></tr>
            </tbody>
          </table>
        </div>

        <!-- ── Groups view ── -->
        <div class="view" *ngIf="currentView === 'groups'">
          <div class="tab-row">
            <button class="tab-btn" [class.active]="groupTypeTab === 'club'" (click)="groupTypeTab = 'club'">Clubs</button>
            <button class="tab-btn" [class.active]="groupTypeTab === 'department'" (click)="groupTypeTab = 'department'">Departments</button>
          </div>
          <table class="data-table">
            <thead><tr><th>Name</th><th>Slug</th><th>Tags</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let g of filteredGroups">
                <td class="td-title">{{ g.name }}</td>
                <td class="td-muted">{{ g.slug }}</td>
                <td class="td-muted">{{ (g.tags || []).join(', ') || '—' }}</td>
                <td><span class="status-pill" [class.open]="g.isActive" [class.done]="!g.isActive">{{ g.isActive ? 'Active' : 'Inactive' }}</span></td>
                <td class="td-actions">
                  <button class="action-btn edit-btn" (click)="openGroupModal(g)"><mat-icon>edit</mat-icon></button>
                  <button class="action-btn del-btn" (click)="deleteGroup(g._id!)"><mat-icon>delete</mat-icon></button>
                </td>
              </tr>
              <tr *ngIf="filteredGroups.length === 0"><td colspan="5" class="empty-row">No groups found.</td></tr>
            </tbody>
          </table>
        </div>

        <!-- ── Users view ── -->
        <div class="view" *ngIf="currentView === 'users'">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td class="td-title">{{ u.name }}</td>
                <td class="td-muted">{{ u.email }}</td>
                <td><span class="tag">{{ u.role || 'user' }}</span></td>
                <td class="td-muted">{{ u.createdAt | date:'mediumDate' }}</td>
                <td class="td-actions">
                  <button class="action-btn del-btn" (click)="deleteUser(u._id)"><mat-icon>delete</mat-icon></button>
                </td>
              </tr>
              <tr *ngIf="users.length === 0"><td colspan="5" class="empty-row">No users found.</td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- ══ Event Modal ═══════════════════════════════════════════════════════ -->
    <div class="modal-backdrop" *ngIf="showEventModal" (click)="closeEventModal()"></div>
    <div class="modal" *ngIf="showEventModal">
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditing ? 'Edit Event' : 'New Event' }}</h2>
        <button class="modal-close" (click)="closeEventModal()"><mat-icon>close</mat-icon></button>
      </div>
      <form [formGroup]="eventForm" (ngSubmit)="saveEvent()" class="modal-form">
        <div class="form-grid">
          <div class="field full">
            <label>Title *</label>
            <input type="text" formControlName="title" placeholder="Event title">
          </div>
          <div class="field">
            <label>Date & Time *</label>
            <input type="datetime-local" formControlName="date">
          </div>
          <div class="field">
            <label>Category *</label>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="eventhub-admin-field">
              <mat-select formControlName="category" panelClass="eventhub-select-panel">
                <mat-option value="Technical">Technical</mat-option>
                <mat-option value="Cultural">Cultural</mat-option>
                <mat-option value="Sports">Sports</mat-option>
                <mat-option value="Academic">Academic</mat-option>
                <mat-option value="Workshop">Workshop</mat-option>
                <mat-option value="Seminar">Seminar</mat-option>
                <mat-option value="Competition">Competition</mat-option>
                <mat-option value="Social">Social</mat-option>
                <mat-option value="Other">Other</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="field full">
            <label>Description *</label>
            <textarea formControlName="description" rows="4" placeholder="Event description"></textarea>
          </div>
          <div class="field">
            <label>Organizer Group *</label>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="eventhub-admin-field">
              <mat-select formControlName="organizerGroup" panelClass="eventhub-select-panel">
                <mat-option value="">Select group</mat-option>
                <mat-option *ngFor="let g of groups" [value]="g._id">{{ g.name }} ({{ g.type }})</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="field">
            <label>Location *</label>
            <input type="text" formControlName="location" placeholder="City or venue">
          </div>
          <div class="field">
            <label>Price (₹)</label>
            <input type="number" formControlName="ticketPrice" min="0">
          </div>
          <div class="field">
            <label>Max Attendees</label>
            <input type="number" formControlName="maxAttendees" min="1">
          </div>
          <div class="field full">
            <label>Image URL</label>
            <input type="url" formControlName="image" placeholder="https://...">
          </div>
          <div class="field full">
            <label>Google Form Registration Link</label>
            <input type="url" formControlName="registrationLink" placeholder="https://docs.google.com/forms/...">
            <span class="field-hint" *ngIf="eventForm.get('registrationLink')?.errors?.['pattern']">Must be a Google Forms link</span>
          </div>
          <div class="field checkbox-field">
            <label><input type="checkbox" formControlName="isHot"> Mark as Hot</label>
          </div>
          <div class="field checkbox-field">
            <label><input type="checkbox" formControlName="isFeatured"> Mark as Featured</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-ghost" (click)="closeEventModal()">Cancel</button>
          <button type="submit" class="btn-filled" [disabled]="eventForm.invalid">{{ isEditing ? 'Save Changes' : 'Create Event' }}</button>
        </div>
      </form>
    </div>

    <!-- ══ Group Modal ═══════════════════════════════════════════════════════ -->
    <div class="modal-backdrop" *ngIf="showGroupModal" (click)="closeGroupModal()"></div>
    <div class="modal" *ngIf="showGroupModal">
      <div class="modal-header">
        <h2 class="modal-title">{{ isGroupEditing ? 'Edit Group' : 'New Group' }}</h2>
        <button class="modal-close" (click)="closeGroupModal()"><mat-icon>close</mat-icon></button>
      </div>
      <form [formGroup]="groupForm" (ngSubmit)="saveGroup()" class="modal-form">
        <div class="form-grid">
          <div class="field">
            <label>Name *</label>
            <input type="text" formControlName="name" placeholder="Group name">
          </div>
          <div class="field">
            <label>Type *</label>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="eventhub-admin-field">
              <mat-select formControlName="type" panelClass="eventhub-select-panel">
                <mat-option value="club">Club</mat-option>
                <mat-option value="department">Department</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="field">
            <label>Slug *</label>
            <input type="text" formControlName="slug" placeholder="url-slug">
          </div>
          <div class="field checkbox-field">
            <label><input type="checkbox" formControlName="isActive"> Active</label>
          </div>
          <div class="field full">
            <label>Description</label>
            <textarea formControlName="description" rows="3"></textarea>
          </div>
          <div class="field">
            <label>Logo Image URL</label>
            <input type="url" formControlName="image">
          </div>
          <div class="field">
            <label>Cover Image URL</label>
            <input type="url" formControlName="coverImage">
          </div>
          <div class="field full">
            <label>Tags (comma-separated)</label>
            <input type="text" formControlName="tags" placeholder="tech, coding, robotics">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-ghost" (click)="closeGroupModal()">Cancel</button>
          <button type="submit" class="btn-filled" [disabled]="groupForm.invalid">{{ isGroupEditing ? 'Save Changes' : 'Create Group' }}</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; background: var(--bg-void); min-height: 100vh; }

    /* ── Shell layout ─────────────────────────── */
    .admin-shell {
      display: grid;
      grid-template-columns: 220px 1fr;
      min-height: 100vh;
    }

    /* ── Sidebar ──────────────────────────────── */
    .sidebar {
      background: var(--bg-void);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      padding: 28px 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .sidebar-logo {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 0 20px 28px;
      border-bottom: 1px solid var(--border-subtle);
      flex-wrap: wrap;
    }
    .sl-event {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem;
      letter-spacing: 0.04em; color: var(--text-primary);
    }
    .sl-hub {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem;
      letter-spacing: 0.04em; color: var(--accent);
    }
    .admin-badge {
      font-family: 'DM Sans', sans-serif; font-size: 0.6rem; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--accent); border: 1px solid rgba(200,55,45,.4);
      padding: 2px 7px; border-radius: 999px;
    }
    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 20px 12px;
    }
    .sidebar-bottom {
      padding: 12px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: none;
      width: 100%;
      text-align: left;
      transition: color 0.15s, background 0.15s;
    }
    .nav-item:hover { color: var(--text-primary); background: var(--bg-surface); }
    .nav-item.active {
      color: var(--text-primary);
      background: var(--bg-surface);
      border-left: 3px solid var(--accent);
      padding-left: 9px;
    }
    .nav-item mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .logout-item { color: rgba(200,55,45,.7); }
    .logout-item:hover { color: var(--accent); background: rgba(200,55,45,.08); }

    /* ── Main ─────────────────────────────────── */
    .admin-main { padding: 36px 40px; min-width: 0; }
    .admin-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 36px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .admin-view-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(1.8rem, 3vw, 2.8rem);
      color: var(--text-primary);
      margin: 0;
      letter-spacing: 0.02em;
    }
    .section-heading {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin: 40px 0 16px;
    }

    /* ── Buttons ──────────────────────────────── */
    .btn-filled {
      background: #c8372d; color: #fff;
      padding: 10px 22px; border-radius: 999px;
      font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
      letter-spacing: 0.05em; text-transform: uppercase;
      border: none; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px;
      transition: background 0.15s, transform 0.15s;
    }
    .btn-filled:hover { background: #e8572d; transform: translateY(-1px); }
    .btn-filled:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .btn-ghost {
      background: transparent; color: var(--text-secondary);
      padding: 9px 20px; border: 1px solid var(--border-mid);
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
      cursor: pointer; transition: border-color 0.15s, color 0.15s;
    }
    .btn-ghost:hover { border-color: var(--border-hi); color: var(--text-primary); }

    /* ── Stats grid ───────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 22px 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .primary-stat { border-top: 2px solid var(--accent); }
    .stat-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.67rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .stat-num {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 3rem;
      line-height: 1;
      color: var(--text-primary);
    }

    /* ── Data table ───────────────────────────── */
    .view { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
    }
    .data-table th {
      font-size: 0.67rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid var(--border-mid);
    }
    .data-table td {
      padding: 14px 12px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      vertical-align: middle;
    }
    .data-table tr:hover td { background: var(--bg-surface); color: var(--text-primary); }
    .td-title { font-weight: 500; color: var(--text-primary) !important; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .td-muted { color: var(--text-muted) !important; font-size: 0.82rem; }
    .empty-row { text-align: center; color: var(--text-muted); padding: 40px 12px !important; }

    /* Tags & badges */
    .tag {
      font-size: 0.67rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
      padding: 3px 8px; border-radius: 999px;
      background: var(--bg-lift); border: 1px solid var(--border-mid); color: var(--text-secondary);
    }
    .status-pill {
      font-size: 0.67rem; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase;
      padding: 3px 9px; border-radius: 999px;
      background: none; border: 1px solid var(--border-mid); color: var(--text-muted);
      white-space: nowrap;
    }
    .status-pill.open { color: #4ade80; border-color: rgba(74,222,128,.3); }
    .status-pill.done { color: var(--text-muted); }

    /* Fill bar */
    .fill-bar { width: 80px; height: 3px; background: var(--bg-lift); border-radius: 99px; }
    .fill-inner { height: 100%; background: var(--accent); border-radius: 99px; transition: width 0.4s; }

    /* Actions */
    .td-actions { display: flex; gap: 6px; align-items: center; }
    .action-btn {
      background: none; border: none; cursor: pointer; width: 30px; height: 30px;
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); transition: background 0.15s, color 0.15s;
    }
    .action-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .edit-btn:hover { background: var(--bg-lift); color: var(--text-primary); }
    .del-btn:hover { background: rgba(200,55,45,.15); color: var(--accent); }

    /* Tab row */
    .tab-row { display: flex; gap: 4px; margin-bottom: 24px; }
    .tab-btn {
      padding: 8px 18px; background: none; border: 1px solid var(--border-subtle);
      border-radius: 999px; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
      color: var(--text-muted); cursor: pointer; transition: all 0.15s;
    }
    .tab-btn.active { background: var(--bg-surface); color: var(--text-primary); border-color: var(--border-mid); }
    .tab-btn:hover { color: var(--text-primary); }

    /* ── Modal ────────────────────────────────── */
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.82); backdrop-filter: blur(6px);
      z-index: 200;
    }
    .modal {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 201;
      background: var(--bg-deep);
      border: 1px solid var(--border-mid);
      border-radius: var(--radius-lg);
      width: min(680px, 95vw);
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 22px 28px 18px;
      border-bottom: 1px solid var(--border-subtle);
      position: sticky; top: 0; background: var(--bg-deep); z-index: 1;
    }
    .modal-title {
      font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem;
      color: var(--text-primary); margin: 0;
    }
    .modal-close {
      background: none; border: none; cursor: pointer;
      color: var(--text-muted); width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 6px; transition: color 0.15s, background 0.15s;
    }
    .modal-close:hover { color: var(--text-primary); background: var(--bg-lift); }
    .modal-form { padding: 24px 28px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field.full { grid-column: 1 / -1; }
    .field.checkbox-field { flex-direction: row; align-items: center; gap: 8px; }
    .field label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted);
    }
    .field input, .field select, .field textarea {
      background: linear-gradient(180deg, rgba(245,240,235,.05), rgba(245,240,235,.02)), var(--bg-surface);
      border: 1px solid rgba(245,240,235,.12);
      border-radius: 14px;
      padding: 12px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.88rem;
      color: var(--text-primary);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      width: 100%;
      box-sizing: border-box;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 10px 24px rgba(0,0,0,.12);
    }
    .field input::placeholder, .field textarea::placeholder { color: var(--text-muted); }
    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none;
      border-color: rgba(200,55,45,.68);
      box-shadow: 0 0 0 4px rgba(200,55,45,.12), inset 0 1px 0 rgba(255,255,255,.03), 0 12px 30px rgba(0,0,0,.16);
    }
    .field select {
      appearance: none;
      -webkit-appearance: none;
      padding-right: 44px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23c8372d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      background-size: 12px;
    }
    .field select option { background: #181818; color: var(--text-primary); }
    .field textarea { resize: vertical; }
    .field input[type="checkbox"] { width: auto; }
    .field-hint { font-family: 'DM Sans', sans-serif; font-size: 0.72rem; color: var(--accent); margin-top: 2px; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 16px 28px 24px;
      border-top: 1px solid var(--border-subtle);
    }

    /* ── Responsive ───────────────────────────── */
    @media (max-width: 900px) {
      .admin-shell { grid-template-columns: 1fr; }
      .sidebar { height: auto; position: static; flex-direction: row; flex-wrap: wrap; padding: 16px; }
      .sidebar-nav { flex-direction: row; flex-wrap: wrap; }
      .admin-main { padding: 20px 16px; }
    }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  currentView = 'dashboard';
  stats: any = {
    totalEvents: 0, totalUsers: 0, totalBookings: 0,
    totalClubs: 0, totalDepartments: 0
  };
  events: Event[] = [];
  users: any[] = [];
  groups: OrganizerGroup[] = [];
  groupTypeTab: 'club' | 'department' = 'club';

  showEventModal = false;
  isEditing = false;
  editingId: string | null = null;
  eventForm: FormGroup;
  showGroupModal = false;
  isGroupEditing = false;
  editingGroupId: string | null = null;
  groupForm: FormGroup;

  adminService = inject(AdminService);
  eventService = inject(EventService);
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);

  constructor() {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      category: ['Technical', Validators.required],
      description: ['', Validators.required],
      organizerGroup: ['', Validators.required],
      isHot: [false],
      isFeatured: [false],
      ticketPrice: [0, [Validators.required, Validators.min(0)]],
      maxAttendees: [100, [Validators.required, Validators.min(1)]],
      registrationLink: ['', Validators.pattern(/^https:\/\/(docs\.google\.com\/forms|forms\.gle)\//i)],
      location: ['', Validators.required],
      image: ['']
    });

    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      type: ['club', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      image: [''],
      coverImage: [''],
      tags: [''],
      isActive: [true]
    });

    this.groupForm.get('name')?.valueChanges.subscribe((value) => {
      if (!this.isGroupEditing) {
        const generated = String(value || '').toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');
        this.groupForm.patchValue({ slug: generated }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.loadStats();
    this.loadEvents();
    this.loadUsers();
    this.loadGroups();
  }

  getTitle(): string {
    switch (this.currentView) {
      case 'dashboard': return 'Overview';
      case 'events': return 'Events';
      case 'groups': return 'Organizer Groups';
      case 'users': return 'Users';
      default: return 'Admin';
    }
  }

  get filteredGroups(): OrganizerGroup[] {
    return this.groups.filter(g => g.type === this.groupTypeTab);
  }

  getFillPercentage(event: Event): number {
    if (!event.maxAttendees) return 0;
    return Math.min(100, ((event.currentAttendees || 0) / event.maxAttendees) * 100);
  }

  loadStats() {
    this.adminService.getStats().subscribe({
      next: (res) => { this.stats = res.data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (res) => { this.events = res; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading events:', err)
    });
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (res) => { this.users = res.data; this.cdr.detectChanges(); },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadGroups() {
    this.adminService.getGroupStats().subscribe({
      next: (response) => { this.groups = response.data?.groups || []; this.cdr.detectChanges(); },
      error: (error) => console.error('Error loading groups:', error)
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => { this.loadUsers(); this.loadStats(); },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  deleteEvent(id: any) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => { this.loadEvents(); this.loadStats(); },
        error: (err) => console.error('Error deleting event:', err)
      });
    }
  }

  openEventModal(event?: Event) {
    this.showEventModal = true;
    if (event) {
      this.isEditing = true;
      this.editingId = event._id || event.id?.toString() || null;
      const loc = typeof event.location === 'object' ? event.location.city : event.location;
      this.eventForm.patchValue({
        title: event.title, date: event.date, category: event.category,
        description: event.description, ticketPrice: event.ticketPrice || event.price,
        maxAttendees: event.maxAttendees, registrationLink: event.registrationLink || '',
        organizerGroup: typeof event.organizerGroup === 'string' ? event.organizerGroup : event.organizerGroup?._id || '',
        isHot: event.isHot || false, isFeatured: event.isFeatured || false,
        location: loc, image: event.image
      });
    } else {
      this.isEditing = false;
      this.editingId = null;
      this.eventForm.reset({ ticketPrice: 0, maxAttendees: 100, category: 'Technical', organizerGroup: '', isHot: false, isFeatured: false, registrationLink: '' });
    }
  }

  closeEventModal() { this.showEventModal = false; }

  openGroupModal(group?: OrganizerGroup) {
    this.showGroupModal = true;
    if (group) {
      this.isGroupEditing = true;
      this.editingGroupId = group._id || null;
      this.groupForm.patchValue({
        name: group.name, type: group.type, slug: group.slug,
        description: group.description || '', image: group.image || '',
        coverImage: group.coverImage || '', tags: (group.tags || []).join(', '),
        isActive: group.isActive
      });
    } else {
      this.isGroupEditing = false;
      this.editingGroupId = null;
      this.groupForm.reset({ name: '', type: 'club', slug: '', description: '', image: '', coverImage: '', tags: '', isActive: true });
    }
  }

  closeGroupModal() { this.showGroupModal = false; }

  saveGroup() {
    if (this.groupForm.invalid) return;
    const payload = {
      ...this.groupForm.value,
      tags: String(this.groupForm.value.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)
    };
    const request$ = this.isGroupEditing && this.editingGroupId
      ? this.adminService.updateGroup(this.editingGroupId, payload)
      : this.adminService.createGroup(payload);
    request$.subscribe({
      next: () => { this.closeGroupModal(); this.loadGroups(); this.loadStats(); },
      error: (error) => alert(error.error?.message || 'Failed to save group')
    });
  }

  deleteGroup(id: string) {
    if (!id || !confirm('Delete this organizer group?')) return;
    this.adminService.deleteGroup(id).subscribe({
      next: () => { this.loadGroups(); this.loadStats(); },
      error: (error) => alert(error.error?.message || 'Failed to delete group')
    });
  }

  saveEvent() {
    if (this.eventForm.invalid) {
      const invalidFields = Object.entries(this.eventForm.controls)
        .filter(([, c]) => c.invalid).map(([f]) => f);
      alert(`Please complete required fields: ${invalidFields.join(', ')}`);
      return;
    }
    const formValue = this.eventForm.value;
    const dateObj = new Date(formValue.date);
    const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const eventData = {
      ...formValue, time: timeString,
      registrationLink: String(formValue.registrationLink || '').trim(),
      location: { city: formValue.location, venue: 'TBA', address: formValue.location }
    };

    if (this.isEditing && this.editingId) {
      this.eventService.updateEvent(this.editingId, eventData).subscribe({
        next: () => { this.closeEventModal(); this.loadEvents(); this.loadStats(); },
        error: (err) => alert(err.error?.message || 'Failed to update event')
      });
    } else {
      this.eventService.createEvent(eventData).subscribe({
        next: () => { this.closeEventModal(); this.loadEvents(); this.loadStats(); },
        error: (err) => alert(err.error?.message || 'Failed to create event')
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
