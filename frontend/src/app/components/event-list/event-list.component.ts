import { Component, inject, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CategoryFilterPipe } from '../../pipes/category-filter.pipe';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { OrganizerGroupService } from '../../services/organizer-group.service';
import { OrganizerGroup } from '../../models/organizer-group.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CategoryFilterPipe, FormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <!-- Hero -->
    <section class="hero" id="home">
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="hero-label">Browse All Events</span>
          <h1 class="hero-display">
            <span class="hero-line hl-1">FIND YOUR</span>
            <span class="hero-line hl-2">NEXT</span>
            <span class="hero-line hl-3 acc">EVENT</span>
          </h1>
          <p class="hero-sub">Explore every club, department, and campus happening in one place.</p>
          <button class="btn-filled" (click)="scrollToEvents()">See All Events</button>
        </div>

        <div class="hero-cards" *ngIf="heroEvents.length">
          <a class="hc-item" *ngFor="let ev of heroEvents; let i = index"
             [routerLink]="['/event', ev._id]"
             [style.animation-delay]="(i * 0.15 + 0.3) + 's'">
            <div class="hc-image">
              <img [src]="ev.image" [alt]="ev.title">
              <span class="hc-month">{{ getEventMonth(ev) }}</span>
              <span class="hc-day">{{ getEventDay(ev) }}</span>
            </div>
            <div class="hc-info">
              <span class="hc-category">{{ ev.category }}</span>
              <h4 class="hc-title">{{ ev.title }}</h4>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Events section -->
    <section class="events-section" id="events">
      <div class="section-inner">

        <!-- ── Filters ── -->
        <div class="filter-bar scroll-reveal" #scrollSection>
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="eventhub-filter-field">
              <mat-select [(ngModel)]="selectedCategory" panelClass="eventhub-select-panel">
                <mat-option value="All">All</mat-option>
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
          <div class="filter-group">
            <label class="filter-label">Organizer Type</label>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="eventhub-filter-field">
              <mat-select [(ngModel)]="selectedOrganizerType" (selectionChange)="selectedOrganizerGroup = 'All'" panelClass="eventhub-select-panel">
                <mat-option value="All">All</mat-option>
                <mat-option value="club">Clubs</mat-option>
                <mat-option value="department">Departments</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="filter-group" *ngIf="filteredGroups.length > 0">
            <label class="filter-label">Organizer</label>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="eventhub-filter-field">
              <mat-select [(ngModel)]="selectedOrganizerGroup" panelClass="eventhub-select-panel">
                <mat-option value="All">All</mat-option>
                <mat-option *ngFor="let g of filteredGroups" [value]="g._id">{{ g.name }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <span class="results-count" *ngIf="filteredEvents.length > 0">
            {{ (filteredEvents | categoryFilter:selectedCategory).length }} event(s)
          </span>
        </div>

        <!-- ── Event grid ── -->
        <div class="ev-grid scroll-reveal" #scrollSection>
          <ng-container *ngIf="filteredEvents | categoryFilter:selectedCategory as visibleEvents">
            <a class="ev-card"
               *ngFor="let ev of visibleEvents; let i = index"
               [routerLink]="['/event', ev._id]"
               [style.animation-delay]="(i * 0.05) + 's'">
              <div class="evc-image">
                <img [src]="ev.image" [alt]="ev.title">
                <span class="evc-cat">{{ ev.category }}</span>
                <span class="evc-date-badge">
                  <span class="evc-day">{{ getEventDay(ev) }}</span>
                  <span class="evc-mon">{{ getEventMonth(ev) }}</span>
                </span>
              </div>
              <div class="evc-body">
                <h3 class="evc-title">{{ ev.title }}</h3>
                <div class="evc-meta">
                  <span *ngIf="ev.location?.venue">{{ ev.location?.venue }}</span>
                  <span *ngIf="ev.ticketPrice === 0">Free</span>
                  <span *ngIf="ev.ticketPrice > 0">₹{{ ev.ticketPrice }}</span>
                </div>
                <div class="evc-footer">
                  <span class="evc-status" [class.status-open]="ev.status==='upcoming'||ev.status==='open'" [class.status-full]="ev.status==='sold-out'" [class.status-done]="ev.status==='completed'||ev.status==='cancelled'">
                    {{ ev.status }}
                  </span>
                  <span class="evc-arrow">→</span>
                </div>
              </div>
            </a>

            <div class="no-events" *ngIf="visibleEvents.length === 0">
              <p>No events match your filters.</p>
              <button class="btn-ghost" (click)="selectedCategory = 'All'; selectedOrganizerType = 'All'; selectedOrganizerGroup = 'All'">Clear Filters</button>
            </div>
          </ng-container>
        </div>
      </div>
    </section>

    <!-- Contact strip -->
    <section class="contact-section scroll-reveal" #scrollSection>
      <div class="section-inner contact-inner">
        <div class="contact-text">
          <h2 class="contact-title">WANT TO<br><span class="acc">ORGANISE?</span></h2>
          <p class="contact-sub">Reach out to list your event on EventHub and connect with hundreds of students.</p>
        </div>
        <form class="contact-form" (ngSubmit)="onContactSubmit()">
          <div class="cf-row">
            <input class="cf-input" type="text" [(ngModel)]="contactForm.name" name="name" placeholder="Your name">
            <input class="cf-input" type="email" [(ngModel)]="contactForm.email" name="email" placeholder="Email address">
          </div>
          <input class="cf-input" type="text" [(ngModel)]="contactForm.subject" name="subject" placeholder="Subject">
          <textarea class="cf-input cf-textarea" [(ngModel)]="contactForm.message" name="message" placeholder="Your message" rows="4"></textarea>
          <div class="cf-feedback cf-success" *ngIf="contactSuccess">{{ contactSuccess }}</div>
          <div class="cf-feedback cf-error" *ngIf="contactError">{{ contactError }}</div>
          <button type="submit" class="btn-filled" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Sending…' : 'Send Message' }}
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; background: var(--bg-void); color: var(--text-primary); }

    /* ── Hero ──────────────────────────────────── */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding: 140px 0 80px;
      overflow: hidden;
    }
    .hero-inner {
      width: min(1300px, 92vw);
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 48px;
      align-items: center;
    }
    .hero-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(245,240,235,.35);
      display: block;
      margin-bottom: 24px;
      animation: fadeUp 0.5s 0.1s both;
    }
    .hero-display {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin: 0 0 28px;
    }
    .hero-line {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(4.5rem, 10vw, 10rem);
      line-height: 0.9;
      color: var(--text-primary);
      display: block;
    }
    .hl-1 { animation: fadeUp 0.6s 0.2s both; }
    .hl-2 { animation: fadeUp 0.6s 0.3s both; }
    .hl-3 { animation: fadeUp 0.6s 0.45s both; }
    .acc { color: var(--accent) !important; }
    .hero-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      font-weight: 300;
      color: var(--text-secondary);
      margin: 0 0 32px;
      max-width: 44ch;
      line-height: 1.7;
      animation: fadeUp 0.5s 0.55s both;
    }
    .btn-filled {
      background: #c8372d;
      color: #fff;
      padding: 13px 30px;
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s, transform 0.15s;
      animation: fadeUp 0.5s 0.65s both;
    }
    .btn-filled:hover { background: #e8572d; transform: translateY(-1px); }
    .btn-filled:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-ghost {
      background: transparent;
      color: var(--text-primary);
      padding: 12px 26px;
      border: 1px solid var(--border-hi);
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      cursor: pointer;
      text-decoration: none;
      transition: border-color 0.15s, background 0.15s;
    }
    .btn-ghost:hover { border-color: var(--text-primary); background: rgba(245,240,235,.04); }

    /* Hero cards stack */
    .hero-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: fadeUp 0.6s 0.3s both;
    }
    .hc-item {
      display: grid;
      grid-template-columns: 100px 1fr;
      gap: 14px;
      align-items: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 12px;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, transform 0.2s;
      animation: fadeUp 0.6s both;
    }
    .hc-item:hover { border-color: var(--border-mid); transform: translateX(4px); }
    .hc-image { position: relative; height: 72px; border-radius: 8px; overflow: hidden; }
    .hc-image img { width: 100%; height: 100%; object-fit: cover; }
    .hc-month {
      position: absolute; top: 5px; right: 5px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      color: #fff;
      background: rgba(8,8,8,.6);
      padding: 0 5px;
      border-radius: 3px;
    }
    .hc-day {
      position: absolute; bottom: 5px; right: 5px;
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.1rem;
      color: #fff;
      background: rgba(8,8,8,.6);
      padding: 0 5px;
      border-radius: 3px;
    }
    .hc-category {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.67rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      display: block;
      margin-bottom: 4px;
    }
    .hc-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.35;
    }

    /* ── Events section ────────────────────────── */
    .events-section { padding: 80px 0 100px; }
    .section-inner { width: min(1300px, 92vw); margin: 0 auto; }

    /* ── Filter bar ──────────────────────────────── */
    .filter-bar {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      align-items: flex-end;
      padding: 24px 0 32px;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 40px;
    }
    .filter-group { display: flex; flex-direction: column; gap: 6px; }
    .filter-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.67rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .filter-select {
      appearance: none;
      -webkit-appearance: none;
      padding: 12px 48px 12px 18px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-primary);
      background:
        linear-gradient(180deg, rgba(245,240,235,.06), rgba(245,240,235,.02)),
        var(--bg-surface);
      border: 1px solid rgba(245,240,235,.14);
      border-radius: 999px;
      cursor: pointer;
      transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23c8372d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 12px;
      min-width: 150px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 10px 30px rgba(0,0,0,.18);
    }
    .filter-select:hover {
      border-color: rgba(245,240,235,.28);
      background:
        linear-gradient(180deg, rgba(245,240,235,.09), rgba(245,240,235,.03)),
        var(--bg-surface);
      transform: translateY(-1px);
    }
    .filter-select:focus {
      outline: none;
      border-color: rgba(200,55,45,.7);
      box-shadow: 0 0 0 4px rgba(200,55,45,.12), inset 0 1px 0 rgba(255,255,255,.05), 0 12px 30px rgba(0,0,0,.24);
    }
    .filter-select option { background: #181818; color: var(--text-primary); }
    .results-count {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-left: auto;
      align-self: flex-end;
      padding-bottom: 9px;
    }

    /* ── Event grid ──────────────────────────────── */
    .ev-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    .ev-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.25s ease, transform 0.25s ease;
    }
    .ev-card:hover { border-color: var(--border-mid); transform: translateY(-4px); }
    .evc-image { position: relative; height: 200px; overflow: hidden; }
    .evc-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .ev-card:hover .evc-image img { transform: scale(1.04); }
    .evc-cat {
      position: absolute;
      top: 10px; left: 10px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.75rem;
      font-style: italic;
      color: #f5f0eb;
      background: rgba(8,8,8,.65);
      padding: 3px 8px;
      border-radius: 4px;
    }
    .evc-date-badge {
      position: absolute;
      bottom: 10px; right: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(8,8,8,.75);
      border-radius: 6px;
      padding: 4px 8px;
    }
    .evc-day { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; color: #f5f0eb; line-height: 1; }
    .evc-mon { font-family: 'DM Sans', sans-serif; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(245,240,235,.6); }
    .evc-body { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .evc-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.35;
      flex: 1;
    }
    .evc-meta {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      gap: 10px;
    }
    .evc-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px solid var(--border-subtle);
    }
    .evc-status {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.67rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 999px;
      border: 1px solid var(--border-mid);
      color: var(--text-muted);
    }
    .status-open { color: #4ade80; border-color: rgba(74,222,128,.35); }
    .status-full { color: var(--accent); border-color: rgba(200,55,45,.35); }
    .status-done { color: var(--text-muted); border-color: var(--border-subtle); }
    .evc-arrow { font-family: 'DM Sans', sans-serif; color: var(--text-muted); font-size: 0.9rem; transition: transform 0.2s, color 0.2s; }
    .ev-card:hover .evc-arrow { transform: translateX(4px); color: var(--text-primary); }

    /* No events */
    .no-events {
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .no-events p { font-family: 'DM Sans', sans-serif; color: var(--text-muted); font-size: 1rem; }

    /* ── Contact section ──────────────────────── */
    .contact-section { padding: 100px 0; border-top: 1px solid var(--border-subtle); }
    .contact-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: start;
    }
    .contact-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(2.5rem, 5vw, 5rem);
      line-height: 0.9;
      color: var(--text-primary);
      margin: 0 0 20px;
    }
    .contact-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 300;
      color: var(--text-secondary);
      line-height: 1.7;
      max-width: 40ch;
    }
    .contact-form { display: flex; flex-direction: column; gap: 12px; }
    .cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cf-input {
      width: 100%;
      padding: 16px 18px;
      background: linear-gradient(180deg, rgba(245,240,235,.045), rgba(245,240,235,.015)), var(--bg-surface);
      border: 1px solid rgba(245,240,235,.12);
      border-radius: 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.88rem;
      color: var(--text-primary);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      box-sizing: border-box;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 12px 28px rgba(0,0,0,.14);
    }
    .cf-input::placeholder { color: var(--text-muted); }
    .cf-input:focus {
      outline: none;
      border-color: rgba(200,55,45,.65);
      box-shadow: 0 0 0 4px rgba(200,55,45,.11), inset 0 1px 0 rgba(255,255,255,.04), 0 14px 30px rgba(0,0,0,.2);
      background: linear-gradient(180deg, rgba(200,55,45,.08), rgba(245,240,235,.02)), var(--bg-surface);
    }
    .cf-input:-webkit-autofill,
    .cf-input:-webkit-autofill:hover,
    .cf-input:-webkit-autofill:focus,
    .cf-textarea:-webkit-autofill,
    .cf-textarea:-webkit-autofill:hover,
    .cf-textarea:-webkit-autofill:focus {
      -webkit-text-fill-color: var(--text-primary);
      -webkit-box-shadow: 0 0 0 1000px #141414 inset, 0 12px 28px rgba(0,0,0,.14);
      transition: background-color 9999s ease-in-out 0s;
      caret-color: var(--text-primary);
    }
    .cf-textarea { resize: vertical; min-height: 120px; }
    .cf-feedback {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      border-radius: 14px;
      padding: 12px 14px;
      border: 1px solid transparent;
    }
    .cf-success {
      color: #a8e5b4;
      background: rgba(32, 76, 45, .35);
      border-color: rgba(124, 212, 149, .18);
    }
    .cf-error {
      color: #ffb3b3;
      background: rgba(92, 30, 30, .34);
      border-color: rgba(255, 128, 128, .16);
    }

    /* ── Scroll reveal ────────────────────────── */
    .scroll-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
    .scroll-reveal.visible { opacity: 1; transform: none; }

    /* ── Keyframes ────────────────────────────── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Responsive ───────────────────────────── */
    @media (max-width: 1050px) { .hero-inner { grid-template-columns: 1fr; } .hero-cards { display: none; } }
    @media (max-width: 768px) { .contact-inner { grid-template-columns: 1fr; gap: 40px; } .cf-row { grid-template-columns: 1fr; } }
  `]
})
export class EventListComponent implements AfterViewInit {
  @ViewChildren('scrollSection') scrollSections!: QueryList<ElementRef>;

  eventService = inject(EventService);
  groupService = inject(OrganizerGroupService);
  events$ = this.eventService.getEvents();
  allEvents: any[] = [];
  organizerGroups: OrganizerGroup[] = [];
  categoryCounts: { [key: string]: number } = {};
  selectedCategory = 'All';
  selectedOrganizerType: 'All' | 'club' | 'department' = 'All';
  selectedOrganizerGroup = 'All';

  contactForm = { name: '', email: '', subject: '', message: '' };
  isSubmitting = false;
  contactSuccess = '';
  contactError = '';

  onContactSubmit() {
    this.contactError = '';
    this.contactSuccess = '';

    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.contactError = 'Please fill in your name, email, and message.';
      return;
    }

    this.isSubmitting = true;
    this.eventService.sendContactMessage(this.contactForm).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.contactForm = { name: '', email: '', subject: '', message: '' };
        this.contactSuccess = 'Message sent successfully. We will get back to you soon.';
        setTimeout(() => { this.contactSuccess = ''; }, 4000);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.isSubmitting = false;
        this.contactError = err.error?.message || 'Failed to send message. Please try again later.';
      }
    });
  }

  ngAfterViewInit() {
    this.initScrollAnimations();
    this.events$.subscribe(events => {
      this.allEvents = events;
      this.calculateCategoryCounts();
    });
    this.groupService.getAllGroups().subscribe(groups => {
      this.organizerGroups = groups;
    });
  }

  get filteredGroups(): OrganizerGroup[] {
    if (this.selectedOrganizerType === 'All') return this.organizerGroups;
    return this.organizerGroups.filter(g => g.type === this.selectedOrganizerType);
  }

  get filteredEvents(): any[] {
    let events = this.allEvents;
    if (this.selectedOrganizerType !== 'All') {
      events = events.filter(e => e.organizerGroupType === this.selectedOrganizerType);
    }
    if (this.selectedOrganizerGroup !== 'All') {
      events = events.filter(e => {
        if (typeof e.organizerGroup === 'string') return e.organizerGroup === this.selectedOrganizerGroup;
        return e.organizerGroup?._id === this.selectedOrganizerGroup;
      });
    }
    return events;
  }

  get heroEvents(): any[] {
    const featuredOrHot = this.allEvents.filter(e => e.isFeatured || e.isHot);
    const source = featuredOrHot.length >= 3 ? featuredOrHot : this.allEvents;
    return source.slice(0, 3);
  }

  calculateCategoryCounts() {
    this.categoryCounts = {};
    this.allEvents.forEach(e => {
      const cat = e.category || 'Other';
      this.categoryCounts[cat] = (this.categoryCounts[cat] || 0) + 1;
    });
  }

  getCategoryCount(category: string): number {
    return this.categoryCounts[category] || 0;
  }

  initScrollAnimations() {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    setTimeout(() => {
      this.scrollSections.forEach(s => observer.observe(s.nativeElement));
    }, 100);
  }

  scrollToEvents() {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.scrollToEvents();
  }

  getEventDay(event: any): string {
    if (event.date) {
      const d = typeof event.date === 'string' ? new Date(event.date) : event.date;
      return d.getDate().toString().padStart(2, '0');
    }
    const days = ['01', '05', '12', '15', '20', '25', '28'];
    const id = event.id || Number.parseInt(event._id?.slice(-6) || '0', 16);
    return days[id % days.length];
  }

  getEventMonth(event: any): string {
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    if (event.date) {
      const d = typeof event.date === 'string' ? new Date(event.date) : event.date;
      return months[d.getMonth()];
    }
    const id = event.id || Number.parseInt(event._id?.slice(-6) || '0', 16);
    return months[id % months.length];
  }
}
