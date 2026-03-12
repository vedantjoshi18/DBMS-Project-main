import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { OrganizerGroup } from '../../models/organizer-group.model';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Glassmorphic Sidebar -->
      <aside class="sidebar">
        <div class="logo-container">
          <span class="logo-text">Event<span class="logo-accent">Hub</span></span>
          <span class="badge">Admin</span>
        </div>
        
        <nav class="nav-menu">
          <a (click)="currentView = 'dashboard'" [class.active]="currentView === 'dashboard'" class="nav-item">
            <mat-icon>dashboard</mat-icon>
            <span>Overview</span>
          </a>
          <a (click)="currentView = 'events'" [class.active]="currentView === 'events'" class="nav-item">
            <mat-icon>event</mat-icon>
            <span>Events</span>
          </a>
          <a (click)="currentView = 'groups'" [class.active]="currentView === 'groups'" class="nav-item">
            <mat-icon>apartment</mat-icon>
            <span>Organizer Groups</span>
          </a>
          <a (click)="currentView = 'users'" [class.active]="currentView === 'users'" class="nav-item">
            <mat-icon>group</mat-icon>
            <span>Users</span>
          </a>
          <hr class="nav-divider">
          <a routerLink="/events" class="nav-item">
            <mat-icon>home</mat-icon>
            <span>Go to Website</span>
          </a>
          <a (click)="logout()" class="nav-item logout">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="admin-profile">
            <div class="avatar">A</div>
            <div class="info">
              <span class="name">Admin User</span>
              <span class="role">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Header -->
        <header class="top-bar">
          <h1 class="page-title">{{ getTitle() }}</h1>
          <div class="actions">
            <button class="btn-icon"><mat-icon>notifications</mat-icon></button>
            <button class="btn-primary" *ngIf="currentView === 'events'" (click)="openEventModal()">
              <mat-icon>add</mat-icon> New Event
            </button>
            <button class="btn-primary" *ngIf="currentView === 'groups'" (click)="openGroupModal()">
              <mat-icon>add</mat-icon> New Group
            </button>
          </div>
        </header>

        <div class="content-scroll">
          <!-- Dashboard View -->
          <div *ngIf="currentView === 'dashboard'" class="dashboard-grid">
            <!-- Stats Cards -->
            <div class="stat-card">
              <div class="icon-box red-glow">
                <mat-icon>event</mat-icon>
              </div>
              <div class="stat-details">
                <h3>Total Events</h3>
                <p class="value">{{ stats?.totalEvents || 0 }}</p>
                <span class="trend positive">+12% this week</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="icon-box blue-glow">
                <mat-icon>group</mat-icon>
              </div>
              <div class="stat-details">
                <h3>Active Users</h3>
                <p class="value">{{ stats?.totalUsers || 0 }}</p>
                <span class="trend positive">+5 New today</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="icon-box green-glow">
                <mat-icon>confirmation_number</mat-icon>
              </div>
              <div class="stat-details">
                <h3>Total Bookings</h3>
                <p class="value">{{ stats?.totalBookings || 0 }}</p>
                <span class="trend positive">+8% vs last month</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="icon-box orange-glow">
                <mat-icon>payments</mat-icon>
              </div>
              <div class="stat-details">
                <h3>Total Revenue</h3>
                <p class="value">{{ stats?.totalRevenue | currency }}</p>
                <span class="trend neutral">Steady growth</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="icon-box red-glow">
                <mat-icon>groups</mat-icon>
              </div>
              <div class="stat-details">
                <h3>Total Clubs</h3>
                <p class="value">{{ stats?.totalClubs || 0 }}</p>
                <span class="trend positive">Student-driven communities</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="icon-box blue-glow">
                <mat-icon>school</mat-icon>
              </div>
              <div class="stat-details">
                <h3>Total Departments</h3>
                <p class="value">{{ stats?.totalDepartments || 0 }}</p>
                <span class="trend neutral">Academic organizers</span>
              </div>
            </div>

            <!-- Recent Activity / Charts Placeholder -->
            <div class="wide-card">
              <h2>Recent System Activity</h2>
              <div class="activity-list">
                <div class="activity-item" *ngFor="let i of [1,2,3]">
                  <div class="dot"></div>
                  <p>New booking for <strong>Tech Conference 2026</strong></p>
                  <span class="time">2 mins ago</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Events View -->
          <div *ngIf="currentView === 'events'" class="table-view">
            <div class="glass-table-container">
              <table class="glass-table">
                <thead>
                  <tr>
                    <th>Event Details</th>
                    <th>Date & Location</th>
                    <th>Availability</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let event of events">
                    <td>
                      <div class="event-cell">
                        <div class="event-thumb">
                          <img *ngIf="event.image" [src]="event.image" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
                          <mat-icon *ngIf="!event.image">image</mat-icon>
                        </div>
                        <div class="event-text">
                          <span class="title">{{ event.title }}</span>
                          <span class="subtitle">{{ event.category }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="info-cell">
                        <span>{{ event.date | date:'mediumDate' }}</span>
                        <span class="sub-text">{{ event.location?.city || 'TBA' }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="progress-cell">
                        <div class="progress-bar">
                          <div class="fill" [style.width.%]="getFillPercentage(event)"></div>
                        </div>
                        <span class="meta">{{ (event.maxAttendees || 0) - (event.currentAttendees || 0) }} left</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill" [ngClass]="event.status">
                        <span class="dot"></span> {{ event.status }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn-icon sm" (click)="openEventModal(event)"><mat-icon>edit</mat-icon></button>
                        <button class="btn-icon sm delete" (click)="deleteEvent(event._id)"><mat-icon>delete</mat-icon></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div *ngIf="currentView === 'groups'" class="table-view">
            <div class="grid-2" style="margin-bottom: 16px;">
              <button class="btn-ghost" [style.borderColor]="groupTypeTab === 'club' ? 'var(--primary)' : 'var(--glass-border)'" (click)="groupTypeTab = 'club'">Clubs</button>
              <button class="btn-ghost" [style.borderColor]="groupTypeTab === 'department' ? 'var(--primary)' : 'var(--glass-border)'" (click)="groupTypeTab = 'department'">Departments</button>
            </div>

            <div class="glass-table-container">
              <table class="glass-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Slug</th>
                    <th>Tags</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let group of filteredGroups">
                    <td>{{ group.name }}</td>
                    <td>{{ group.type }}</td>
                    <td>{{ group.slug }}</td>
                    <td>{{ (group.tags || []).join(', ') }}</td>
                    <td>{{ group.isActive ? 'Yes' : 'No' }}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn-icon sm" (click)="openGroupModal(group)"><mat-icon>edit</mat-icon></button>
                        <button class="btn-icon sm delete" (click)="deleteGroup(group._id || '')"><mat-icon>delete</mat-icon></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Users View -->
          <div *ngIf="currentView === 'users'" class="table-view">
            <div class="glass-table-container">
              <table class="glass-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of users">
                    <td>
                      <div class="user-cell">
                        <div class="avatar sm">{{ user.name.charAt(0) }}</div>
                        <div class="user-info">
                          <span class="name">{{ user.name }}</span>
                          <span class="email">{{ user.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="role-badge" [class.admin]="user.role === 'admin'">
                        {{ user.role }}
                      </span>
                    </td>
                    <td>{{ user.createdAt | date:'mediumDate' }}</td>
                    <td>
                      <button class="btn-icon sm delete" 
                              (click)="deleteUser(user._id)" 
                              [disabled]="user.role === 'admin'"
                              [style.opacity]="user.role === 'admin' ? 0.3 : 1">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <!-- Glass Modal -->
      <div class="modal-overlay" *ngIf="showEventModal">
        <div class="glass-modal animate-scale-in">
          <div class="modal-header">
            <h2>{{ isEditing ? 'Edit Event' : 'Create New Event' }}</h2>
            <button class="btn-close" (click)="closeEventModal()"><mat-icon>close</mat-icon></button>
          </div>
          
          <form [formGroup]="eventForm" (ngSubmit)="saveEvent()" class="custom-form">
            <div class="form-section">
              <label>Event Title</label>
              <input type="text" formControlName="title" placeholder="e.g. Neon Nights Music Festival">
            </div>

            <div class="grid-2">
              <div class="form-section">
                <label>Date & Time</label>
                <input type="datetime-local" formControlName="date">
              </div>
              <div class="form-section">
                <label>Category</label>
                <select formControlName="category">
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Academic">Academic</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Competition">Competition</option>
                  <option value="Social">Social</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-section">
                <label>Organizer Group</label>
                <select formControlName="organizerGroup">
                  <option value="">Select organizer group</option>
                  <option *ngFor="let group of groups" [value]="group._id">{{ group.name }} ({{ group.type }})</option>
                </select>
              </div>
              <div class="form-section" style="display:flex; align-items:flex-end; gap:18px;">
                <label style="display:flex; align-items:center; gap:8px; margin:0;">
                  <input type="checkbox" formControlName="isHot" style="width:auto;"> Is Hot
                </label>
                <label style="display:flex; align-items:center; gap:8px; margin:0;">
                  <input type="checkbox" formControlName="isFeatured" style="width:auto;"> Is Featured
                </label>
              </div>
            </div>

            <div class="form-section">
              <label>Description</label>
              <textarea formControlName="description" rows="3" placeholder="Describe the event..."></textarea>
            </div>

            <div class="grid-2">
              <div class="form-section">
                <label>Ticket Price ($)</label>
                <input type="number" formControlName="ticketPrice">
              </div>
              <div class="form-section">
                <label>Max Attendees</label>
                <input type="number" formControlName="maxAttendees">
              </div>
            </div>

            <div class="form-section">
              <label>Google Form Registration Link</label>
              <input type="url" formControlName="registrationLink" placeholder="https://docs.google.com/forms/...">
            </div>

            <div class="form-section">
              <label>Location (City)</label>
              <input type="text" formControlName="location" placeholder="e.g. New York">
            </div>

            <div class="form-section">
              <label>Image URL</label>
              <input type="text" formControlName="image" placeholder="https://...">
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-ghost" (click)="closeEventModal()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="eventForm.invalid">
                {{ isEditing ? 'Update Event' : 'Publish Event' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="showGroupModal">
        <div class="glass-modal animate-scale-in">
          <div class="modal-header">
            <h2>{{ isGroupEditing ? 'Edit Organizer Group' : 'Create Organizer Group' }}</h2>
            <button class="btn-close" (click)="closeGroupModal()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="groupForm" (ngSubmit)="saveGroup()" class="custom-form">
            <div class="grid-2">
              <div class="form-section">
                <label>Name</label>
                <input formControlName="name" type="text">
              </div>
              <div class="form-section">
                <label>Type</label>
                <select formControlName="type">
                  <option value="club">Club</option>
                  <option value="department">Department</option>
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-section">
                <label>Slug</label>
                <input formControlName="slug" type="text">
              </div>
              <div class="form-section">
                <label>Tags (comma separated)</label>
                <input formControlName="tags" type="text">
              </div>
            </div>

            <div class="form-section">
              <label>Description</label>
              <textarea rows="3" formControlName="description"></textarea>
            </div>

            <div class="grid-2">
              <div class="form-section">
                <label>Image URL</label>
                <input formControlName="image" type="text">
              </div>
              <div class="form-section">
                <label>Cover Image URL</label>
                <input formControlName="coverImage" type="text">
              </div>
            </div>

            <label style="display:flex; align-items:center; gap:10px; margin:0;">
              <input type="checkbox" formControlName="isActive" style="width:auto;">
              Is Active
            </label>

            <div class="modal-footer">
              <button type="button" class="btn-ghost" (click)="closeGroupModal()">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="groupForm.invalid">{{ isGroupEditing ? 'Update Group' : 'Create Group' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Outfit', 'Inter', sans-serif;
      --primary: #dc2626;
      --primary-glow: rgba(220, 38, 38, 0.4);
      --bg-dark: #0a0a12;
      --glass-bg: rgba(255, 255, 255, 0.03);
      --glass-border: rgba(255, 255, 255, 0.08);
      --text-main: #ffffff;
      --text-muted: rgba(255, 255, 255, 0.6);
    }

    .admin-layout {
      display: flex;
      height: 100vh;
      background: var(--bg-dark);
      overflow: hidden;
      color: var(--text-main);
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(220, 38, 38, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%);
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      background: rgba(18, 18, 24, 0.6);
      backdrop-filter: blur(20px);
      border-right: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      padding: 24px;
      z-index: 10;
    }

    .logo-container {
      margin-bottom: 40px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .logo-accent { color: var(--primary); }

    .badge {
      font-size: 0.7rem;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      padding: 2px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 16px;
      border-radius: 12px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .nav-item:hover {
      background: var(--glass-bg);
      color: white;
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(220, 38, 38, 0.1) 0%, transparent 100%);
      color: var(--primary);
      border-left: 3px solid var(--primary);
    }

    .nav-divider {
      border: none;
      border-top: 1px solid var(--glass-border);
      margin: 8px 0;
    }

    .nav-item.logout {
      color: #ef4444;
      margin-top: auto;
    }

    .nav-item.logout:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .sidebar-footer {
      border-top: 1px solid var(--glass-border);
      padding-top: 20px;
    }

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #333, #555);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .info {
      display: flex;
      flex-direction: column;
    }

    .name { font-weight: 600; font-size: 0.9rem; }
    .role { font-size: 0.75rem; color: var(--text-muted); }

    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .top-bar {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      border-bottom: 1px solid var(--glass-border);
    }

    .page-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
    }

    .actions { display: flex; gap: 16px; align-items: center; }

    .btn-icon {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-icon:hover { background: rgba(255,255,255,0.1); }

    .btn-primary {
      background: var(--primary);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 15px var(--primary-glow);
      transition: all 0.2s;
    }

    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px var(--primary-glow); }

    .content-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 40px;
    }

    /* Dashboard Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }

    @media (max-width: 1200px) {
      .dashboard-grid { grid-template-columns: repeat(3, 1fr); }
      .wide-card { grid-column: span 3; }
    }
    @media (max-width: 900px) {
      .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
      .wide-card { grid-column: span 2; }
    }
    @media (max-width: 600px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .wide-card { grid-column: span 1; }
    }

    .stat-card {
      background: rgba(30, 30, 40, 0.4);
      border: 1px solid var(--glass-border);
      padding: 24px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.3s;
    }

    .stat-card:hover { transform: translateY(-5px); background: rgba(30,30,40,0.6); }

    .icon-box {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .red-glow { background: rgba(220, 38, 38, 0.1); color: #ef4444; box-shadow: 0 0 20px rgba(220, 38, 38, 0.2); }
    .blue-glow { background: rgba(59, 130, 246, 0.1); color: #3b82f6; box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
    .green-glow { background: rgba(34, 197, 94, 0.1); color: #22c55e; box-shadow: 0 0 20px rgba(34, 197, 94, 0.2); }
    .orange-glow { background: rgba(249, 115, 22, 0.1); color: #f97316; box-shadow: 0 0 20px rgba(249, 115, 22, 0.2); }

    .stat-details h3 { font-size: 0.9rem; color: var(--text-muted); margin: 0 0 4px 0; font-weight: 500; }
    .stat-details .value { font-size: 1.8rem; font-weight: 700; margin: 0; }
    .trend { font-size: 0.8rem; margin-top: 4px; display: block; }
    .trend.positive { color: #22c55e; }
    .trend.neutral { color: var(--text-muted); }

    .wide-card {
      grid-column: span 2;
      background: rgba(30, 30, 40, 0.4);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 24px;
    }
    
    .wide-card h2 { font-size: 1.2rem; margin-top: 0; margin-bottom: 20px; }

    .activity-list { display: flex; flex-direction: column; gap: 16px; }
    .activity-item { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; color: var(--text-muted); }
    .dot { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 10px var(--primary); }
    .time { margin-left: auto; font-size: 0.8rem; opacity: 0.7; }

    /* Tables */
    .glass-table-container {
      background: rgba(30, 30, 40, 0.4);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      overflow-x: auto;
    }

    .glass-table { width: 100%; border-collapse: collapse; }
    
    .glass-table th {
      text-align: left;
      padding: 20px 24px;
      color: var(--text-muted);
      font-weight: 500;
      border-bottom: 1px solid var(--glass-border);
      background: rgba(255,255,255,0.02);
    }

    .glass-table td {
      padding: 20px 24px;
      border-bottom: 1px solid var(--glass-border);
      color: white;
    }

    .glass-table tr:hover { background: rgba(255,255,255,0.02); }

    .event-cell { display: flex; align-items: center; gap: 16px; }
    .event-thumb {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #333, #444);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
    }
    .event-text { display: flex; flex-direction: column; }
    .event-text .title { font-weight: 600; font-size: 1rem; }
    .event-text .subtitle { font-size: 0.85rem; color: var(--text-muted); }

    .info-cell {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .info-cell .sub-text {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .status-pill {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--glass-border);
      text-transform: capitalize;
    }
    .status-pill.open { background: rgba(34, 197, 94, 0.1); color: #22c55e; border-color: rgba(34, 197, 94, 0.2); }
    .status-pill.cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
    
    .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .action-buttons { display: flex; gap: 8px; }
    .btn-icon.sm { width: 32px; height: 32px; font-size: 14px; }
    .btn-icon.delete:hover { background: rgba(220, 38, 38, 0.2); color: #ef4444; }

    .progress-cell { display: flex; flex-direction: column; gap: 6px; min-width: 120px; }
    .progress-bar { width: 100%; height: 6px; background: rgba(255,255,255,.1); border-radius: 999px; overflow: hidden; }
    .progress-bar .fill { height: 100%; background: linear-gradient(90deg, #dc2626, #ff6b6b); border-radius: 999px; transition: width .4s ease; }
    .progress-cell .meta { font-size: .8rem; color: var(--text-muted); }

    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-info { display: flex; flex-direction: column; }
    .user-info .name { font-weight: 600; }
    .user-info .email { font-size: 0.85rem; color: var(--text-muted); }

    .role-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: .75rem;
      font-weight: 600;
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.15);
      text-transform: capitalize;
    }
    .role-badge.admin { background: rgba(220,38,38,.15); border-color: rgba(220,38,38,.3); color: #f87171; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex; align-items: center; justify-content: center;
    }

    .glass-modal {
      width: 600px; max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      background: #181820;
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }

    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .btn-close { background: none; border: none; color: var(--text-muted); cursor: pointer; }

    .custom-form { display: flex; flex-direction: column; gap: 20px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    
    label { display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-muted); }
    input, select, textarea {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      color: white;
      font-family: inherit;
      transition: all 0.2s;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(255,255,255,0.05);
    }

    .modal-footer { display: flex; justify-content: flex-end; gap: 16px; margin-top: 10px; }
    .btn-ghost { background: none; border: 1px solid var(--glass-border); color: white; padding: 10px 24px; border-radius: 10px; cursor: pointer; }

    /* Animations */
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-scale-in { animation: scaleIn 0.3s ease-out; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

    /* Responsive sidebar */
    @media (max-width: 768px) {
      .admin-layout { flex-direction: column; height: auto; overflow: auto; }
      .sidebar { width: 100%; flex-direction: row; padding: 16px 20px; align-items: center; }
      .sidebar-footer { display: none; }
      .nav-menu { flex-direction: row; flex-wrap: wrap; flex: 1; gap: 4px; }
      .nav-item { padding: 8px 12px; font-size: .85rem; }
      .logo-container { margin-bottom: 0; margin-right: 20px; }
      .main-content { overflow: auto; }
      .content-scroll { overflow: visible; padding: 20px; }
      .top-bar { padding: 0 20px; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  currentView = 'dashboard';
  stats: any = {
    totalEvents: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalClubs: 0,
    totalDepartments: 0
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
      case 'dashboard': return 'Dashboard Overview';
      case 'events': return 'Manage Events';
      case 'groups': return 'Organizer Groups';
      case 'users': return 'User Management';
      default: return 'Admin Panel';
    }
  }

  get filteredGroups(): OrganizerGroup[] {
    return this.groups.filter((group) => group.type === this.groupTypeTab);
  }

  getFillPercentage(event: Event): number {
    if (!event.maxAttendees) return 0;
    const current = event.currentAttendees || 0;
    return Math.min(100, (current / event.maxAttendees) * 100);
  }

  loadStats() {
    console.log('Loading stats...');
    this.adminService.getStats().subscribe({
      next: (res) => {
        console.log('Stats loaded:', res);
        this.stats = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadEvents() {
    console.log('Loading events...');
    this.eventService.getEvents().subscribe({
      next: (res) => {
        console.log('Events loaded:', res);
        this.events = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading events:', err)
    });
  }

  loadUsers() {
    console.log('Loading users...');
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        console.log('Users loaded:', res);
        this.users = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadGroups() {
    this.adminService.getGroupStats().subscribe({
      next: (response) => {
        this.groups = response.data?.groups || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading groups:', error);
      }
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      console.log('Deleting user:', id);
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.loadUsers();
          this.loadStats();
        },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  deleteEvent(id: any) {
    if (confirm('Are you sure you want to delete this event?')) {
      console.log('Deleting event:', id);
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          console.log('Event deleted successfully');
          this.loadEvents();
          this.loadStats();
        },
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
        title: event.title,
        date: event.date,
        category: event.category,
        description: event.description,
        ticketPrice: event.ticketPrice || event.price,
        maxAttendees: event.maxAttendees,
        registrationLink: event.registrationLink || '',
        organizerGroup: typeof event.organizerGroup === 'string' ? event.organizerGroup : event.organizerGroup?._id || '',
        isHot: event.isHot || false,
        isFeatured: event.isFeatured || false,
        location: loc,
        image: event.image
      });
    } else {
      this.isEditing = false;
      this.editingId = null;
      this.eventForm.reset({
        ticketPrice: 0,
        maxAttendees: 100,
        category: 'Technical',
        organizerGroup: '',
        isHot: false,
        isFeatured: false,
        registrationLink: ''
      });
    }
  }

  closeEventModal() {
    this.showEventModal = false;
  }

  openGroupModal(group?: OrganizerGroup) {
    this.showGroupModal = true;

    if (group) {
      this.isGroupEditing = true;
      this.editingGroupId = group._id || null;
      this.groupForm.patchValue({
        name: group.name,
        type: group.type,
        slug: group.slug,
        description: group.description || '',
        image: group.image || '',
        coverImage: group.coverImage || '',
        tags: (group.tags || []).join(', '),
        isActive: group.isActive
      });
    } else {
      this.isGroupEditing = false;
      this.editingGroupId = null;
      this.groupForm.reset({
        name: '',
        type: 'club',
        slug: '',
        description: '',
        image: '',
        coverImage: '',
        tags: '',
        isActive: true
      });
    }
  }

  closeGroupModal() {
    this.showGroupModal = false;
  }

  saveGroup() {
    if (this.groupForm.invalid) {
      return;
    }

    const payload = {
      ...this.groupForm.value,
      tags: String(this.groupForm.value.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    };

    const request$ = this.isGroupEditing && this.editingGroupId
      ? this.adminService.updateGroup(this.editingGroupId, payload)
      : this.adminService.createGroup(payload);

    request$.subscribe({
      next: () => {
        this.closeGroupModal();
        this.loadGroups();
        this.loadStats();
      },
      error: (error) => {
        console.error('Error saving group:', error);
        alert(error.error?.message || 'Failed to save group');
      }
    });
  }

  deleteGroup(id: string) {
    if (!id || !confirm('Delete this organizer group?')) {
      return;
    }

    this.adminService.deleteGroup(id).subscribe({
      next: () => {
        this.loadGroups();
        this.loadStats();
      },
      error: (error) => {
        console.error('Error deleting group:', error);
        alert(error.error?.message || 'Failed to delete group');
      }
    });
  }

  saveEvent() {
    if (this.eventForm.invalid) {
      const invalidFields = Object.entries(this.eventForm.controls)
        .filter(([, control]) => control.invalid)
        .map(([fieldName]) => fieldName);

      console.warn('Form invalid:', invalidFields);
      alert(`Please complete the required fields: ${invalidFields.join(', ')}`);
      return;
    }

    const formValue = this.eventForm.value;

    // Extract time from the date input
    const dateObj = new Date(formValue.date);
    const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const eventData = {
      ...formValue,
      time: timeString,
      registrationLink: String(formValue.registrationLink || '').trim(),
      location: {
        city: formValue.location,
        venue: 'TBA',
        address: formValue.location // backend requires address
      }
    };

    console.log('Saving event data:', eventData);

    if (this.isEditing && this.editingId) {
      console.log(`Updating event with ID: ${this.editingId}`);
      if (this.editingId.length < 10) {
        console.warn('Warning: Editing ID seems too short for a MongoDB ObjectId:', this.editingId);
      }

      this.eventService.updateEvent(this.editingId, eventData).subscribe({
        next: (res) => {
          console.log('Event updated successfully:', res);
          this.closeEventModal();
          this.loadEvents();
          this.loadStats();
        },
        error: (err) => {
          console.error('Error updating event:', err);
          if (err.error?.errors?.length) {
            alert(`Failed to update event: ${err.error.errors.join(', ')}`);
          } else if (err.error?.message) {
            alert(`Failed to update event: ${err.error.message}`);
          }
          this.cdr.detectChanges(); // Update view in case we show error
        }
      });
    } else {
      console.log('Creating new event...');
      this.eventService.createEvent(eventData).subscribe({
        next: (res) => {
          console.log('Event created successfully:', res);
          this.closeEventModal();
          this.loadEvents();
          this.loadStats();
        },
        error: (err) => {
          console.error('Error creating event:', err);
          if (err.error?.errors?.length) {
            alert(`Failed to create event: ${err.error.errors.join(', ')}`);
          } else if (err.error?.message) {
            alert(`Failed to create event: ${err.error.message}`);
          }
          this.cdr.detectChanges();
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
