import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ParticleBackgroundComponent } from './components/particle-background/particle-background.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ParticleBackgroundComponent],
  template: `
    <app-particle-background></app-particle-background>
    <div class="app-content-layer">
      <app-navbar *ngIf="showNavbar"></app-navbar>
      <div class="route-shell" [@routeAnimations]="routeTransitionState">
        <router-outlet #outlet="outlet"></router-outlet>
      </div>
    </div>
  `,
  animations: [
    trigger('routeAnimations', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('240ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
      background: #080808;
    }

    .app-content-layer {
      position: relative;
      z-index: 1;
    }

    .route-shell {
      position: relative;
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'event-manager';
  showNavbar = true;
  routeTransitionState = 0;
  private router = inject(Router);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide navbar on admin routes
      this.showNavbar = !event.url.includes('/admin');
      this.routeTransitionState++;
    });
  }
}
