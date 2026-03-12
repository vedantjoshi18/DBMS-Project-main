import { AfterViewInit, Component, ElementRef, HostListener, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    <!-- Scroll progress bar -->
    <div class="scroll-progress" [style.transform]="'scaleX(' + scrollProgress + ')'" aria-hidden="true"></div>

    <!-- ════ HERO ══════════════════════════════════════════════════════════ -->
    <section class="hero" id="home">
      <div class="hero-inner">

        <!-- Left content column -->
        <div class="hero-copy">
          <span class="hero-label">College Event Management Platform</span>

          <h1 class="hero-display">
            <span class="hero-line hero-line-1">DISCOVER</span>
            <span class="hero-line hero-line-2">CAMPUS</span>
            <span class="hero-line hero-line-3 accent-word">EVENTS</span>
          </h1>

          <div class="hero-actions">
            <a routerLink="/events" class="btn-filled">Browse Events</a>
            <a routerLink="/explore" class="btn-ghost">Explore Organizers</a>
          </div>
        </div>

        <!-- Right floating featured card -->
        <div class="hero-card-wrap" *ngIf="featuredCard$ | async as fc">
          <a class="hero-featured-card glass-card" [routerLink]="['/event', fc._id]">
            <div class="hfc-image">
              <img [src]="fc.image" [alt]="fc.title">
              <span class="hfc-category">{{ fc.category }}</span>
            </div>
            <div class="hfc-body">
              <span class="hfc-label">Featured Event</span>
              <h3 class="hfc-title">{{ fc.title }}</h3>
              <p class="hfc-date">{{ fc.date | date:'mediumDate' }}</p>
            </div>
          </a>
        </div>

      </div>

      <!-- Stats marquee strip -->
      <div class="hero-stats-strip">
        <div class="stats-track">
          <span>{{ clubCount }} Active Clubs</span>
          <span class="dot">·</span>
          <span>{{ deptCount }} Departments</span>
          <span class="dot">·</span>
          <span>100+ Events Hosted</span>
          <span class="dot">·</span>
          <span>Open to All Students</span>
          <span class="dot">·</span>
          <!-- duplicate for seamless loop -->
          <span>{{ clubCount }} Active Clubs</span>
          <span class="dot">·</span>
          <span>{{ deptCount }} Departments</span>
          <span class="dot">·</span>
          <span>100+ Events Hosted</span>
          <span class="dot">·</span>
          <span>Open to All Students</span>
          <span class="dot">·</span>
        </div>
      </div>
    </section>

    <!-- ════ MARQUEE DIVIDER ══════════════════════════════════════════════ -->
    <div class="marquee-strip">
      <div class="marquee-track">
        <span>TECHNICAL</span><span>·</span>
        <span>CULTURAL</span><span>·</span>
        <span>SPORTS</span><span>·</span>
        <span>ACADEMIC</span><span>·</span>
        <span>WORKSHOP</span><span>·</span>
        <span>SEMINAR</span><span>·</span>
        <span>TECHNICAL</span><span>·</span>
        <span>CULTURAL</span><span>·</span>
        <span>SPORTS</span><span>·</span>
        <span>ACADEMIC</span><span>·</span>
        <span>WORKSHOP</span><span>·</span>
        <span>SEMINAR</span><span>·</span>
      </div>
    </div>

    <!-- ════ HOT EVENTS — magazine spread ════════════════════════════════ -->
    <section class="section" #scrollSection id="events">
      <div class="section-inner scroll-reveal">
        <div class="section-header">
          <span class="section-eyebrow">01 · HOT EVENTS</span>
          <h2 class="section-display-title">HOT <span class="accent-word">EVENTS</span></h2>
        </div>

        <div class="magazine-grid">
          <ng-container *ngIf="hotEvents$ | async as hotList">
            <!-- Large hero card -->
            <a class="mag-card mag-large"
               *ngIf="hotList[0]"
               [routerLink]="['/event', hotList[0]._id]">
              <img [src]="hotList[0].image" [alt]="hotList[0].title">
              <div class="mag-overlay">
                <span class="mag-cat">{{ hotList[0].category }}</span>
                <h3 class="mag-title">{{ hotList[0].title }}</h3>
                <p class="mag-date">{{ hotList[0].date | date:'mediumDate' }}</p>
              </div>
            </a>
            <!-- Small stack -->
            <div class="mag-stack">
              <a class="mag-card mag-small"
                 *ngFor="let ev of hotList.slice(1,5)"
                 [routerLink]="['/event', ev._id]">
                <img [src]="ev.image" [alt]="ev.title">
                <div class="mag-overlay">
                  <span class="mag-cat">{{ ev.category }}</span>
                  <h3 class="mag-title">{{ ev.title }}</h3>
                </div>
              </a>
            </div>
          </ng-container>
        </div>
      </div>
    </section>

    <!-- ════ RECENT EVENTS — strip/editorial list ════════════════════════ -->
    <section class="section" #scrollSection>
      <div class="section-inner scroll-reveal">
        <div class="section-header">
          <span class="section-eyebrow">02 · RECENTLY ADDED</span>
          <h2 class="section-display-title">RECENTLY <span class="accent-word">ADDED</span></h2>
        </div>

        <div class="strip-list" *ngIf="recentEvents$ | async as recents">
          <a class="strip-card" *ngFor="let ev of recents; let i = index" [routerLink]="['/event', ev._id]">
            <span class="strip-num">{{ (i + 1).toString().padStart(2, '0') }}</span>
            <div class="strip-img"><img [src]="ev.image" [alt]="ev.title"></div>
            <div class="strip-info">
              <span class="strip-category">{{ ev.category }}</span>
              <h4 class="strip-title">{{ ev.title }}</h4>
              <p class="strip-meta">{{ ev.date | date:'mediumDate' }}</p>
            </div>
            <span class="strip-arrow">→</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ════ ORGANIZER DIRECTORY ═════════════════════════════════════════ -->
    <section class="section" #scrollSection id="categories">
      <div class="section-inner scroll-reveal">
        <div class="section-header">
          <span class="section-eyebrow">03 · EXPLORE BY CATEGORY</span>
          <h2 class="section-display-title">EXPLORE BY <span class="accent-word">CATEGORY</span></h2>
        </div>

        <div class="org-grid">
          <a class="org-card clubs-card" routerLink="/clubs">
            <div class="org-card-bg"></div>
            <div class="org-card-content">
              <span class="org-type">Student Clubs</span>
              <h3 class="org-count">{{ clubCount }}</h3>
              <p class="org-sub">Active clubs</p>
              <div class="org-tags">
                <span class="org-tag" *ngFor="let club of (clubs$ | async)?.slice(0,4)">{{ club.name }}</span>
              </div>
              <span class="org-cta">Explore →</span>
            </div>
          </a>
          <a class="org-card depts-card" routerLink="/departments">
            <div class="org-card-bg"></div>
            <div class="org-card-content">
              <span class="org-type">Departments</span>
              <h3 class="org-count">{{ deptCount }}</h3>
              <p class="org-sub">Academic organizers</p>
              <div class="org-tags">
                <span class="org-tag" *ngFor="let dept of (departments$ | async)?.slice(0,4)">{{ dept.name }}</span>
              </div>
              <span class="org-cta">Explore →</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- ════ FEATURED EVENTS w/ filter ══════════════════════════════════ -->
    <section class="section events-section" #scrollSection>
      <div class="section-inner scroll-reveal">
        <div class="section-header">
          <span class="section-eyebrow">04 · FEATURED EVENTS</span>
          <h2 class="section-display-title">FEATURED <span class="accent-word">EVENTS</span></h2>
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

        <div class="stack-grid">
          <a class="stack-card" *ngFor="let ev of (featuredEvents$ | async) | categoryFilter:selectedCategory; let i = index"
             [routerLink]="['/event', ev._id]"
             [style.animation-delay]="(i * 0.07) + 's'">
            <div class="sc-image">
              <img [src]="ev.image" [alt]="ev.title">
              <span class="sc-category">{{ ev.category }}</span>
            </div>
            <div class="sc-body">
              <h3 class="sc-title">{{ ev.title }}</h3>
              <p class="sc-date">{{ ev.date | date:'mediumDate' }}</p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- ════ ABOUT ════════════════════════════════════════════════════════ -->
    <section class="section" #scrollSection id="about">
      <div class="section-inner about-inner scroll-reveal">
        <div class="about-text-block">
          <div class="section-header">
            <span class="section-eyebrow">05 · ABOUT</span>
            <h2 class="section-display-title">BUILT FOR <span class="accent-word">CAMPUS LIFE</span></h2>
          </div>
          <p class="about-body">
            EventHub unifies registrations, organizer discovery, and event visibility
            across every student experience — from hackathons to cultural nights.
          </p>
        </div>
      </div>
    </section>

    <!-- ════ FOOTER ═══════════════════════════════════════════════════════ -->
    <footer class="site-footer">
      <div class="section-inner footer-inner">
        <div class="footer-logo">
          <span class="footer-event">EVENT</span><span class="footer-hub">HUB</span>
        </div>
        <p class="footer-note">© {{ year }} EventHub College Platform</p>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      background: var(--bg-void);
      color: var(--text-primary);
    }

    /* ── Scroll progress ──────────────────────── */
    .scroll-progress {
      position: fixed;
      top: 0; left: 0;
      width: 100%;
      height: 2px;
      transform-origin: left center;
      background: var(--accent);
      z-index: 90;
    }

    /* ── HERO ─────────────────────────────────── */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 140px 0 0;
      position: relative;
      overflow: hidden;
    }
    .hero-inner {
      width: min(1300px, 92vw);
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 40px;
      align-items: center;
      flex: 1;
      padding-bottom: 80px;
    }
    .hero-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(245,240,235,.35);
      display: block;
      margin-bottom: 28px;
      animation: fadeUp 0.6s 0.1s both;
    }
    .hero-display {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin: 0 0 40px;
    }
    .hero-line {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(5rem, 13vw, 13rem);
      line-height: 0.88;
      letter-spacing: 0.01em;
      color: var(--text-primary);
      display: block;
    }
    .hero-line-1 { animation: fadeUp 0.7s 0.2s both; }
    .hero-line-2 { animation: fadeUp 0.7s 0.35s both; }
    .hero-line-3 { animation: fadeUp 0.7s 0.5s both; }
    .accent-word { color: var(--accent) !important; }

    .hero-actions {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      animation: fadeUp 0.6s 0.7s both;
    }
    .btn-filled {
      background: #c8372d;
      color: #fff;
      padding: 14px 32px;
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
    }
    .btn-filled:hover { background: #e8572d; transform: translateY(-1px); }
    .btn-ghost {
      background: transparent;
      color: var(--text-primary);
      padding: 13px 31px;
      border: 1px solid var(--border-hi);
      border-radius: 999px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: border-color 0.15s, background 0.15s;
    }
    .btn-ghost:hover { border-color: var(--text-primary); background: rgba(245,240,235,.04); }

    /* Hero featured card */
    .hero-card-wrap {
      animation: fadeUp 0.8s 0.4s both;
    }
    .hero-featured-card {
      display: block;
      text-decoration: none;
      width: 260px;
      border-radius: 16px;
      overflow: hidden;
      background: var(--bg-surface);
      border: 1px solid var(--border-mid);
      transition: transform 0.35s ease;
    }
    .hero-featured-card:hover { transform: translateY(-6px); }
    .hfc-image { position: relative; height: 180px; overflow: hidden; background: var(--bg-lift); }
    .hfc-image img { width: 100%; height: 100%; object-fit: cover; }
    .hfc-category {
      position: absolute;
      top: 10px; left: 10px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.75rem;
      font-style: italic;
      color: #f5f0eb;
      background: rgba(8,8,8,.6);
      padding: 3px 8px;
      border-radius: 4px;
    }
    .hfc-body { padding: 16px; }
    .hfc-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.67rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
      display: block;
      margin-bottom: 6px;
    }
    .hfc-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: #f5f0eb;
      margin: 0 0 8px;
      line-height: 1.3;
    }
    .hfc-date {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: rgba(245,240,235,.45);
      margin: 0;
    }

    /* Stats strip */
    .hero-stats-strip {
      overflow: hidden;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-deep);
      padding: 16px 0;
      animation: fadeUp 0.6s 0.9s both;
    }
    .stats-track {
      display: flex;
      gap: 0;
      animation: marqueeScroll 25s linear infinite;
      width: max-content;
    }
    .stats-track span {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(245,240,235,.4);
      padding: 0 22px;
      white-space: nowrap;
    }
    .stats-track .dot { color: var(--accent); padding: 0 4px; }
    @keyframes marqueeScroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    /* ── MARQUEE DIVIDER ─────────────────────── */
    .marquee-strip {
      overflow: hidden;
      border-top: 1px solid var(--border-subtle);
      border-bottom: 1px solid var(--border-subtle);
      padding: 14px 0;
      background: var(--bg-deep);
    }
    .marquee-track {
      display: flex;
      animation: marqueeScroll 30s linear infinite;
      width: max-content;
    }
    .marquee-track span {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 0.9rem;
      letter-spacing: 0.16em;
      color: var(--text-muted);
      padding: 0 24px;
      white-space: nowrap;
    }

    /* ── SECTIONS ────────────────────────────── */
    .section {
      padding: 100px 0;
      background: var(--bg-void);
      position: relative;
      overflow: hidden;
    }
    .section-inner {
      width: min(1300px, 92vw);
      margin: 0 auto;
    }
    /* ── SECTION HEADER ──────────────────────── */
    .section-header {
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 44px;
    }
    .section-eyebrow {
      display: block;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(245,240,235,.28);
      margin-bottom: 10px;
    }
    .section-display-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(2.4rem, 4.5vw, 5rem);
      line-height: 0.92;
      color: var(--text-primary);
      margin: 0;
    }

    /* ── MAGAZINE GRID (hot events) ──────────── */
    .magazine-grid {
      display: grid;
      grid-template-columns: 60% 1fr;
      gap: 12px;
      height: clamp(340px, 42vw, 580px);
    }
    .mag-card {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-md);
      display: block;
      text-decoration: none;
      cursor: pointer;
    }
    .mag-card img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .mag-card:hover img { transform: scale(1.04); }
    .mag-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(8,8,8,.9) 0%, transparent 55%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 24px;
      gap: 6px;
    }
    .mag-cat {
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.8rem;
      font-style: italic;
      color: rgba(245,240,235,.7);
      letter-spacing: 0.06em;
    }
    .mag-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: #f5f0eb;
      margin: 0;
      line-height: 1.3;
    }
    .mag-large .mag-title {
      font-size: 1.6rem;
    }
    .mag-date {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: rgba(245,240,235,.5);
      margin: 0;
    }
    .mag-stack {
      display: grid;
      grid-template-rows: repeat(2, 1fr);
      gap: 12px;
    }

    /* ── STRIP LIST (recent events) ──────────── */
    .strip-list { display: flex; flex-direction: column; }
    .strip-card {
      display: grid;
      grid-template-columns: 52px 110px 1fr auto;
      gap: 20px;
      align-items: center;
      padding: 18px 0;
      border-bottom: 1px solid var(--border-subtle);
      text-decoration: none;
      color: inherit;
      transition: background 0.2s ease, border-color 0.2s ease;
    }
    .strip-card:hover {
      background: rgba(245,240,235,.04);
      border-bottom-color: rgba(245,240,235,.06);
    }
    .strip-num {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.8rem;
      line-height: 1;
      color: var(--border-mid);
    }
    .strip-img {
      width: 110px; height: 72px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
      background: var(--bg-lift);
    }
    .strip-img img { width: 100%; height: 100%; object-fit: cover; }
    .strip-info { min-width: 0; }
    .strip-category {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.67rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
      display: block;
      margin-bottom: 4px;
    }
    .strip-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: #f5f0eb;
      margin: 0 0 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .strip-meta {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin: 0;
    }
    .strip-arrow {
      font-family: 'DM Sans', sans-serif;
      color: var(--text-muted);
      font-size: 1rem;
      transition: transform 0.2s ease, color 0.2s ease;
    }
    .strip-card:hover .strip-arrow { transform: translateX(4px); color: var(--text-primary); }

    /* ── ORGANIZER CARDS ─────────────────────── */
    .org-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .org-card {
      position: relative;
      display: block;
      text-decoration: none;
      overflow: hidden;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      padding: 36px;
      min-height: 280px;
      transition: border-color 0.3s ease;
    }
    .org-card:hover { border-color: var(--border-mid); }
    .clubs-card { background: rgba(200,55,45,.06); }
    .depts-card { background: rgba(100,140,200,.06); }
    .org-card-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      height: 100%;
    }
    .org-type {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .org-count {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 5rem;
      line-height: 0.9;
      color: var(--text-primary);
      margin: 0;
    }
    .org-sub {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-style: italic;
      color: var(--text-secondary);
      margin: 0;
    }
    .org-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }
    .org-tag {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.72rem;
      padding: 4px 10px;
      border: 1px solid var(--border-mid);
      border-radius: 999px;
      color: var(--text-secondary);
    }
    .org-cta {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: var(--accent);
      margin-top: auto;
      padding-top: 16px;
    }

    /* ── STACK GRID (featured events) ────────── */
    .stack-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .stack-card {
      display: block;
      text-decoration: none;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      transition: transform 0.3s ease, border-color 0.3s ease;
    }
    .stack-card:hover { transform: translateY(-4px); border-color: var(--border-mid); }
    .sc-image { position: relative; height: 200px; overflow: hidden; background: var(--bg-lift); }
    .sc-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .stack-card:hover .sc-image img { transform: scale(1.04); }
    .sc-category {
      position: absolute;
      top: 10px; left: 10px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.75rem;
      font-style: italic;
      color: #f5f0eb;
      background: rgba(8,8,8,.6);
      padding: 3px 8px;
      border-radius: 4px;
    }
    .sc-body { padding: 16px; }
    .sc-title {
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: #f5f0eb;
      margin: 0 0 8px;
      line-height: 1.4;
    }
    .sc-date {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* ── ABOUT ───────────────────────────────── */
    .about-inner {
      display: flex;
      align-items: flex-start;
      gap: 60px;
    }
    .about-text-block {
      max-width: 680px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .about-body {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.1rem;
      font-weight: 300;
      line-height: 1.8;
      color: var(--text-secondary);
      max-width: 52ch;
    }

    /* ── FOOTER ──────────────────────────────── */
    .site-footer {
      border-top: 1px solid var(--border-subtle);
      padding: 48px 0;
      background: var(--bg-void);
    }
    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .footer-logo { display: flex; align-items: baseline; }
    .footer-event {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.3rem;
      letter-spacing: 0.04em;
      color: var(--text-primary);
    }
    .footer-hub {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.3rem;
      letter-spacing: 0.04em;
      color: var(--accent);
    }
    .footer-note {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* ── SCROLL REVEAL ───────────────────────── */
    .scroll-reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
    }
    /* direct .visible OR parent section carrying .visible */
    .scroll-reveal.visible,
    .section.visible > .scroll-reveal { opacity: 1; transform: translateY(0); }

    /* ── FILTER BAR ──────────────────────────── */
    .filter-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 32px; }
    .filter-select {
      appearance: none;
      -webkit-appearance: none;
      padding: 10px 38px 10px 18px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      color: var(--text-primary);
      background: var(--bg-surface);
      border: 1px solid var(--border-mid);
      border-radius: 999px;
      cursor: pointer;
      transition: border-color 0.15s;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23f5f0eb' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      background-size: 12px;
      min-width: 180px;
    }
    .filter-select:hover { border-color: var(--border-hi); }
    .filter-select:focus { outline: none; border-color: var(--accent); }
    .filter-select option { background: var(--bg-surface); color: var(--text-primary); }

    /* ── KEYFRAMES ───────────────────────────── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── RESPONSIVE ──────────────────────────── */
    @media (max-width: 1100px) {
      .magazine-grid { grid-template-columns: 1fr; height: auto; }
      .mag-large { height: 400px; }
      .mag-stack { grid-template-rows: none; grid-template-columns: repeat(2, 1fr); }
      .mag-small { height: 200px; }
    }
    @media (max-width: 900px) {
      .hero-inner { grid-template-columns: 1fr; }
      .hero-card-wrap { display: none; }
      .org-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .strip-card { grid-template-columns: 40px 80px 1fr; }
      .strip-arrow { display: none; }
      .about-inner { flex-direction: column; gap: 24px; }
      .footer-inner { flex-direction: column; align-items: flex-start; }
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
  featuredCard$: Observable<Event | undefined> = this.eventService.getFeaturedEvents().pipe(map(events => events?.[0]));
  clubs$: Observable<OrganizerGroup[]> = this.groupService.getAllGroups('club');
  departments$: Observable<OrganizerGroup[]> = this.groupService.getAllGroups('department');

  clubCount = 0;
  deptCount = 0;
  selectedCategory = 'All';
  year = new Date().getFullYear();
  scrollProgress = 0;

  ngAfterViewInit(): void {
    this.clubs$.subscribe(items => { this.clubCount = items.length; });
    this.departments$.subscribe(items => { this.deptCount = items.length; });
    this.initScrollAnimations();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const current = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = total > 0 ? Math.min(1, current / total) : 0;
  }

  private initScrollAnimations() {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    setTimeout(() => {
      this.scrollSections.forEach(s => observer.observe(s.nativeElement));
    }, 80);
  }
}
