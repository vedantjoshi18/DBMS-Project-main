import { AfterViewInit, Component, ElementRef, HostListener, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Event } from '../../models/event.model';
import { OrganizerGroup } from '../../models/organizer-group.model';
import { EventService } from '../../services/event.service';
import { OrganizerGroupService } from '../../services/organizer-group.service';
import { CategoryFilterPipe } from '../../pipes/category-filter.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CategoryFilterPipe],
  template: `
    <div class="scroll-progress" [style.transform]="'scaleX(' + scrollProgress + ')'" aria-hidden="true"></div>

    <section class="hero" id="home">
      <div class="orbs" aria-hidden="true">
        <span class="orb orb-red"></span>
        <span class="orb orb-gold"></span>
        <span class="orb orb-blue"></span>
      </div>
      <div class="section-inner hero-wrap">
        <div class="hero-copy">
          <span class="section-badge">College Event Management Platform</span>
          <h1 class="hero-title">Where Clubs, Departments, and Students <span class="gradient-text">Build Campus Culture</span></h1>
          <p class="hero-subtitle">Discover technical sprints, cultural nights, workshops, and social drives through one unified event experience.</p>
          <div class="hero-actions">
            <a routerLink="/events" class="btn btn-primary">Browse Events</a>
            <a routerLink="/explore" class="btn btn-glass">Explore Organizers</a>
          </div>
          <div class="hero-meta">
            <div class="meta-pill">
              <strong>{{ clubCount }}</strong>
              <span>Active Clubs</span>
            </div>
            <div class="meta-pill">
              <strong>{{ deptCount }}</strong>
              <span>Departments</span>
            </div>
            <div class="meta-pill">
              <strong>24/7</strong>
              <span>Student Access</span>
            </div>
          </div>
        </div>
        <div
          class="hero-panel glass-card"
          (mousemove)="onHeroPanelMove($event)"
          (mouseleave)="onHeroPanelLeave()"
          [style.transform]="heroPanelTransform"
        >
          <div class="panel-head">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <p>Campus Highlights</p>
          </div>
          <h3>Discover what is trending this week</h3>
          <p>Featured selections are curated across clubs and departments so students can quickly find high-impact events.</p>
          <a class="panel-link" routerLink="/events">View full calendar</a>
        </div>
      </div>
    </section>

    <nav class="quick-dock" aria-label="Quick section navigation">
      <button type="button" (click)="scrollToSection('home')">Home</button>
      <button type="button" (click)="scrollToSection('events')">Events</button>
      <button type="button" (click)="scrollToSection('categories')">Groups</button>
      <button type="button" (click)="scrollToSection('about')">About</button>
      <button type="button" (click)="scrollToSection('contact')">Support</button>
    </nav>

    <section class="section scroll-reveal" #scrollSection>
      <div class="section-inner">
        <div class="section-header">
          <span class="section-badge">Trending Now</span>
          <h2 class="section-title">Hot <span class="gradient-text">Events</span></h2>
          <p class="section-subtitle">Most saved and most discussed events right now</p>
        </div>
        <div class="hot-row">
          <article class="event-card hot-card" *ngFor="let event of hotEvents$ | async" [routerLink]="['/event', event._id]">
            <span class="hot-badge">HOT</span>
            <img [src]="event.image" [alt]="event.title">
            <div class="card-content">
              <h3>{{ event.title }}</h3>
              <p>{{ event.category }} · {{ event.date | date:'mediumDate' }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section scroll-reveal" #scrollSection>
      <div class="section-inner">
        <div class="section-header">
          <span class="section-badge">Fresh Picks</span>
          <h2 class="section-title">Recently <span class="gradient-text">Added</span></h2>
        </div>
        <div class="recent-grid timeline-grid">
          <article class="event-card small timeline-card" *ngFor="let event of recentEvents$ | async; let i = index" [routerLink]="['/event', event._id]">
            <span class="timeline-index">{{ i + 1 }}</span>
            <img [src]="event.image" [alt]="event.title">
            <div class="card-content">
              <h3>{{ event.title }}</h3>
              <p>{{ event.date | date:'mediumDate' }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section scroll-reveal" id="categories" #scrollSection>
      <div class="section-inner">
        <div class="section-header">
          <span class="section-badge">Organizer Directory</span>
          <h2 class="section-title">Explore by <span class="gradient-text">Category</span></h2>
        </div>
        <div class="explore-grid">
          <a class="explore-card clubs-card" routerLink="/clubs">
            <h3>Student Clubs</h3>
            <p>{{ clubCount }} active clubs</p>
            <div class="chip-row">
              <span class="chip" *ngFor="let club of (clubs$ | async)?.slice(0,4)">{{ club.name }}</span>
            </div>
            <span class="cta">Explore Clubs →</span>
          </a>
          <a class="explore-card departments-card" routerLink="/departments">
            <h3>Departments</h3>
            <p>{{ deptCount }} departments</p>
            <div class="chip-row">
              <span class="chip" *ngFor="let dept of (departments$ | async)?.slice(0,4)">{{ dept.name }}</span>
            </div>
            <span class="cta">Explore Departments →</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section events-section scroll-reveal" id="events" #scrollSection>
      <div class="section-inner">
        <div class="section-header">
          <span class="section-badge">Featured Events</span>
          <h2 class="section-title">Campus <span class="gradient-text">Events</span></h2>
          <p class="section-subtitle">Curated selections from active organizers</p>
        </div>
        <div class="filter-bar">
          <select [(ngModel)]="selectedCategory" class="filter-select">
            <option value="All">All Categories</option>
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
        <div class="recent-grid">
          <article class="event-card featured-card" *ngFor="let event of (featuredEvents$ | async) | categoryFilter:selectedCategory" [routerLink]="['/event', event._id]">
            <img [src]="event.image" [alt]="event.title">
            <div class="card-content">
              <h3>{{ event.title }}</h3>
              <p>{{ event.category }} · {{ event.date | date:'mediumDate' }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section scroll-reveal" id="about" #scrollSection>
      <div class="section-inner">
        <div class="section-header info-block">
          <span class="section-badge">About The Platform</span>
          <h2 class="section-title">Built for <span class="gradient-text">Campus Life</span></h2>
          <p class="section-subtitle">EventHub unifies registrations, organizer discovery, and event visibility across every school experience.</p>
        </div>
      </div>
    </section>

    <section class="section scroll-reveal" id="contact" #scrollSection>
      <div class="section-inner">
        <div class="section-header info-block contact-block">
          <span class="section-badge">Support</span>
          <h2 class="section-title">Need <span class="gradient-text">Help?</span></h2>
          <p class="section-subtitle">Reach the event desk for ticketing, organizer onboarding, and event publishing support.</p>
        </div>
      </div>
    </section>

    <footer class="section">
      <div class="section-inner footer-text">© {{ year }} EventHub College Platform</div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      color: #fdf7f2;
      font-family: 'Sora', 'Segoe UI', Tahoma, sans-serif;
      --accent-warm: #f28743;
      --accent-gold: #f8d889;
      --accent-cool: #a6ceff;
      --surface-border: rgba(255, 255, 255, 0.13);
      --surface-bg: rgba(255, 255, 255, 0.05);
      background:
        radial-gradient(circle at 10% 20%, rgba(207, 66, 32, 0.18), transparent 44%),
        radial-gradient(circle at 85% 12%, rgba(236, 185, 86, 0.12), transparent 38%),
        linear-gradient(180deg, #120b08 0%, #171412 45%, #101317 100%);
    }
    .scroll-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      transform-origin: left center;
      background: linear-gradient(90deg, var(--accent-warm), var(--accent-gold), var(--accent-cool));
      z-index: 90;
      box-shadow: 0 0 20px rgba(248, 216, 137, 0.5);
    }
    .section { padding: 84px 0; }
    .section-inner { width: min(1200px, 92vw); margin: 0 auto; }
    .section-header { margin-bottom: 26px; }
    .section-badge {
      display: inline-block;
      background: rgba(242, 132, 70, 0.14);
      border: 1px solid rgba(242, 132, 70, 0.28);
      color: #ffc18f;
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 0.76rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .section-title { font-size: clamp(1.9rem, 4vw, 2.9rem); margin: 12px 0; line-height: 1.15; }
    .gradient-text {
      background: linear-gradient(135deg, #f28743 0%, #f8d889 58%, #a6ceff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .section-subtitle { color: rgba(253, 247, 242, 0.74); }
    .glass-card {
      border: 1px solid var(--surface-border);
      background: linear-gradient(150deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.02));
      backdrop-filter: blur(18px);
      border-radius: 18px;
    }

    .hero {
      position: relative;
      overflow: hidden;
      padding: 104px 0 72px;
    }
    .orbs {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    .orb {
      position: absolute;
      border-radius: 999px;
      filter: blur(32px);
      opacity: 0.6;
      animation: floatPulse 7s ease-in-out infinite;
    }
    .orb-red { width: 220px; height: 220px; left: 5%; top: 7%; background: rgba(245, 92, 53, 0.4); }
    .orb-gold { width: 170px; height: 170px; right: 15%; top: 18%; background: rgba(247, 198, 92, 0.34); animation-delay: 1.1s; }
    .orb-blue { width: 150px; height: 150px; right: 8%; bottom: 16%; background: rgba(107, 162, 232, 0.25); animation-delay: 2.2s; }
    @keyframes floatPulse {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    .hero-wrap {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 30px;
      align-items: end;
    }
    .hero-copy { animation: fadeUp 0.7s ease both; }
    .hero-title { font-size: clamp(2.2rem, 6vw, 4rem); line-height: 1.05; margin: 16px 0; letter-spacing: -0.02em; }
    .hero-subtitle { max-width: 70ch; color: rgba(253, 247, 242, 0.79); }
    .hero-actions { display: flex; gap: 12px; margin-top: 22px; flex-wrap: wrap; }
    .btn {
      text-decoration: none;
      border-radius: 12px;
      padding: 12px 18px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      letter-spacing: 0.01em;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary {
      background: linear-gradient(135deg, #f26a34 0%, #ca431e 100%);
      color: #fff8f1;
      box-shadow: 0 12px 24px rgba(202, 67, 30, 0.3);
    }
    .btn-glass {
      background: rgba(255, 255, 255, 0.06);
      color: #fff8f1;
      border: 1px solid rgba(255, 255, 255, 0.17);
    }
    .hero-meta {
      margin-top: 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .meta-pill {
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 12px;
      padding: 9px 12px;
      background: rgba(255, 255, 255, 0.04);
      min-width: 120px;
    }
    .meta-pill strong { display: block; font-size: 1.1rem; }
    .meta-pill span { color: rgba(253, 247, 242, 0.74); font-size: 0.8rem; }

    .hero-panel { padding: 16px; animation: fadeUp 0.85s ease both; }
    .panel-head { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; }
    .dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.4); }
    .panel-head p { margin: 0 0 0 8px; color: rgba(253, 247, 242, 0.72); font-size: 0.83rem; }
    .hero-panel h3 { margin: 0 0 8px; font-size: 1.2rem; }
    .hero-panel p { margin: 0; color: rgba(253, 247, 242, 0.74); line-height: 1.6; }
    .panel-link { margin-top: 16px; display: inline-flex; color: #ffcf9d; text-decoration: none; font-weight: 700; }

    .quick-dock {
      position: fixed;
      right: 18px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 70;
      display: grid;
      gap: 8px;
      padding: 10px;
      border-radius: 14px;
      border: 1px solid var(--surface-border);
      background: rgba(12, 13, 17, 0.6);
      backdrop-filter: blur(12px);
    }
    .quick-dock button {
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.04);
      color: #fdf7f2;
      border-radius: 10px;
      padding: 7px 10px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .quick-dock button:hover {
      transform: translateX(-2px);
      border-color: rgba(248, 216, 137, 0.7);
    }

    .hot-row {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(270px, 340px);
      gap: 16px;
      overflow: auto;
      padding-bottom: 8px;
    }
    .recent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .timeline-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
    .event-card {
      position: relative;
      background: var(--surface-bg);
      backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.11);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .event-card:hover {
      transform: translateY(-4px);
      border-color: rgba(244, 166, 109, 0.52);
    }
    .event-card img { width: 100%; height: 170px; object-fit: cover; }
    .event-card.small img { height: 135px; }
    .card-content { padding: 14px; }
    .card-content h3 { margin: 0 0 6px; font-size: 1rem; }
    .card-content p { margin: 0; color: rgba(253, 247, 242, 0.72); font-size: 0.9rem; }
    .hot-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: linear-gradient(135deg, #fa7a3d, #d85a1b);
      color: #fff;
      padding: 4px 10px;
      border-radius: 50px;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 14px rgba(216, 90, 27, 0.45);
    }
    .timeline-card { padding-top: 18px; }
    .timeline-index {
      position: absolute;
      top: 8px;
      right: 10px;
      color: rgba(253, 247, 242, 0.45);
      font-size: 1.4rem;
      font-weight: 800;
    }

    .explore-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    .explore-card {
      display: block;
      text-decoration: none;
      color: #fff8f1;
      padding: 24px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(20px);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .explore-card:hover { transform: translateY(-4px); }
    .clubs-card {
      background: linear-gradient(160deg, rgba(247, 123, 68, 0.33), rgba(16, 15, 14, 0.9));
      box-shadow: 0 20px 40px rgba(155, 63, 28, 0.22);
    }
    .departments-card {
      background: linear-gradient(160deg, rgba(86, 136, 214, 0.28), rgba(15, 17, 22, 0.92));
      box-shadow: 0 20px 40px rgba(48, 92, 163, 0.2);
    }
    .chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    .chip {
      border: 1px solid rgba(255, 255, 255, 0.24);
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 0.75rem;
      background: rgba(255, 255, 255, 0.06);
    }
    .cta { color: #ffe1bf; font-weight: 700; }

    .filter-bar { margin-bottom: 16px; }
    .filter-select {
      background: rgba(255, 255, 255, 0.07);
      color: #fff8f1;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 10px;
      padding: 10px 12px;
      min-width: 230px;
    }
    .featured-card { border-color: rgba(248, 190, 130, 0.28); }

    .info-block {
      padding: 20px;
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      background: var(--surface-bg);
    }
    .contact-block {
      background: linear-gradient(160deg, rgba(107, 162, 232, 0.14), rgba(255, 255, 255, 0.03));
    }
    .footer-text { color: rgba(253, 247, 242, 0.58); text-align: center; }
    .scroll-reveal { opacity: 0; transform: translateY(22px); transition: all 0.6s ease; }
    .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 980px) {
      .hero-wrap { grid-template-columns: 1fr; }
      .hero-panel { max-width: 620px; }
      .explore-grid { grid-template-columns: 1fr; }
      .quick-dock {
        top: auto;
        right: 12px;
        left: 12px;
        bottom: 12px;
        transform: none;
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
      .quick-dock button { padding: 8px 6px; font-size: 0.7rem; }
    }
    @media (max-width: 640px) {
      .section { padding: 66px 0; }
      .hero { padding: 92px 0 56px; }
      .hero-title { font-size: clamp(1.9rem, 10vw, 2.8rem); }
      .filter-select { min-width: 100%; }
    }
  `]
})
export class HomeComponent implements AfterViewInit {
  @ViewChildren('scrollSection') scrollSections!: QueryList<ElementRef>;

  private readonly eventService = inject(EventService);
  private readonly groupService = inject(OrganizerGroupService);

  hotEvents$: Observable<Event[]> = this.eventService.getHotEvents();
  recentEvents$: Observable<Event[]> = this.eventService.getRecentEvents();
  featuredEvents$: Observable<Event[]> = this.eventService.getFeaturedEvents();
  clubs$: Observable<OrganizerGroup[]> = this.groupService.getAllGroups('club');
  departments$: Observable<OrganizerGroup[]> = this.groupService.getAllGroups('department');

  clubCount = 0;
  deptCount = 0;
  selectedCategory = 'All';
  year = new Date().getFullYear();
  scrollProgress = 0;
  heroTiltX = 0;
  heroTiltY = 0;

  get heroPanelTransform(): string {
    return `perspective(900px) rotateX(${this.heroTiltX}deg) rotateY(${this.heroTiltY}deg)`;
  }

  ngAfterViewInit(): void {
    this.clubs$.subscribe((items) => {
      this.clubCount = items.length;
    });
    this.departments$.subscribe((items) => {
      this.deptCount = items.length;
    });
    this.initScrollAnimations();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const current = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = total > 0 ? Math.min(1, current / total) : 0;
  }

  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onHeroPanelMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;
    this.heroTiltY = (xRatio - 0.5) * 8;
    this.heroTiltX = (0.5 - yRatio) * 8;
  }

  onHeroPanelLeave(): void {
    this.heroTiltX = 0;
    this.heroTiltY = 0;
  }

  private initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    setTimeout(() => {
      this.scrollSections.forEach((section) => {
        observer.observe(section.nativeElement);
      });
    }, 80);
  }
}
