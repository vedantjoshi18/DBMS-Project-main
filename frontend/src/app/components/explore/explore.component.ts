import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="explore-page">
      <div class="inner">
        <h1>Explore Campus Organizers</h1>
        <p>Choose your path and discover events by community.</p>
        <div class="grid">
          <a routerLink="/clubs" class="card club-card">
            <div class="icon">🎭</div>
            <h2>Student Clubs</h2>
            <p>Creative, technical, and social student communities.</p>
            <span>Explore Clubs →</span>
          </a>
          <a routerLink="/departments" class="card dept-card">
            <div class="icon">🏛️</div>
            <h2>Academic Departments</h2>
            <p>Department-hosted seminars, workshops, and competitions.</p>
            <span>Explore Departments →</span>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .explore-page { min-height: 100vh; display:grid; place-items:center; padding:120px 16px 60px; }
    .inner { width:min(1000px, 100%); text-align:center; }
    h1 { color:#fff; margin:0 0 8px; font-size: clamp(2rem,4vw,2.8rem); }
    p { color: rgba(255,255,255,.7); }
    .grid { margin-top: 28px; display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:20px; }
    .card { text-decoration:none; color:#fff; padding:24px; border-radius:20px; background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border:1px solid rgba(255,255,255,.1); text-align:left; }
    .club-card { border-color: rgba(220, 38, 38, 0.2); }
    .club-card:hover { border-color: rgba(220, 38, 38, 0.5); box-shadow: 0 20px 40px rgba(220,38,38,0.15); }
    .dept-card { border-color: rgba(59, 130, 246, 0.2); }
    .dept-card:hover { border-color: rgba(59, 130, 246, 0.5); box-shadow: 0 20px 40px rgba(59,130,246,0.15); }
    .icon { font-size:2rem; margin-bottom:10px; }
    span { display:inline-block; margin-top:16px; color:#ffb4b4; font-weight:600; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class ExploreComponent {}
