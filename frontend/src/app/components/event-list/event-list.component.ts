import { Component, inject, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { CategoryFilterPipe } from '../../pipes/category-filter.pipe';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CategoryFilterPipe,
    FormsModule
  ],
  template: `
    <!-- Hero Section -->
    <section class="hero" id="home">
      <div class="hero-wrapper">
        <div class="hero-content">
          <div class="hero-badge animate-on-load">
            <span class="badge-dot"></span>
            <span>Discover Amazing Events Near You</span>
          </div>
          <h1 class="hero-title animate-on-load delay-1">
            Create <span class="gradient-text">Unforgettable</span><br>
            Experiences Together
          </h1>
          <p class="hero-subtitle animate-on-load delay-2">
            Join thousands of event enthusiasts. Discover, create, and manage events 
            that bring people together and create lasting memories.
          </p>
          <div class="hero-cta animate-on-load delay-3">
            <button class="btn btn-primary btn-lg" (click)="scrollToEvents()">
              <span>Explore Events</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div class="hero-stats animate-on-load delay-4">
            <div class="stat-item">
              <span class="stat-number">50K+</span>
              <span class="stat-label">Events Hosted</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">200K+</span>
              <span class="stat-label">Happy Attendees</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">4.9</span>
              <span class="stat-label">User Rating</span>
            </div>
          </div>
        </div>
        <div class="hero-visual animate-on-load delay-2">
          <div class="hero-card hero-card-1">
            <div class="card-image" style="background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);">
              <span class="card-icon">🎵</span>
            </div>
            <div class="card-info">
              <h4>Summer Music Fest</h4>
              <p>August 15, 2026</p>
            </div>
          </div>
          <div class="hero-card hero-card-2">
            <div class="card-image" style="background: linear-gradient(135deg, #ff4d4d 0%, #dc2626 100%);">
              <span class="card-icon">🎨</span>
            </div>
            <div class="card-info">
              <h4>Art Exhibition Week</h4>
              <p>September 3, 2026</p>
            </div>
          </div>
          <div class="hero-card hero-card-3">
            <div class="card-image" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">
              <span class="card-icon">💻</span>
            </div>
            <div class="card-info">
              <h4>Tech Conference</h4>
              <p>October 20, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Events Section -->
    <section class="section events-section scroll-reveal" id="events" #scrollSection>
      <div class="section-inner">
        <div class="section-header">
          <span class="section-badge">Featured Events</span>
          <h2 class="section-title">Upcoming <span class="gradient-text">Events</span></h2>
          <p class="section-subtitle">Discover the most anticipated events happening near you</p>
        </div>
        
        <div class="filter-bar">
          <select [(ngModel)]="selectedCategory" class="filter-select">
            <option value="All">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Music">Music</option>
            <option value="Business">Business</option>
            <option value="Art">Art</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
        
        <div class="events-grid">
          <article class="event-card" *ngFor="let event of events$ | async | categoryFilter:selectedCategory; let i = index" 
                   [routerLink]="['/event', event._id || event.id]"
                   [style.animation-delay]="(i * 0.1) + 's'">
            <div class="event-image">
              <img [src]="event.image" [alt]="event.title">
              <span class="event-category">{{ event.category }}</span>
              <button class="event-favorite" (click)="$event.stopPropagation()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
            <div class="event-content">
              <div class="event-date">
                <span class="date-day">{{ getEventDay(event) }}</span>
                <span class="date-month">{{ getEventMonth(event) }}</span>
              </div>
              <div class="event-details">
                <h3 class="event-title">{{ event.title }}</h3>
                <p class="event-location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {{ event.location?.venue || event.location?.city || 'Location TBA' }}
                </p>
                <div class="event-meta">
                  <span class="event-price">{{ (event.ticketPrice || event.price || 0) | currency }}</span>
                  <span class="event-attendees">
                    <span class="attendee-avatars" *ngIf="(event.currentAttendees || 0) > 0">
                      <span class="avatar" style="background: #dc2626;">A</span>
                      <span class="avatar" style="background: #ff4d4d;">B</span>
                      <span class="avatar" style="background: #ef4444;">C</span>
                    </span>
                    +{{ event.currentAttendees || 0 }} going
                  </span>
                </div>
              </div>
            </div>
            <button class="btn btn-primary register-btn">Register Now</button>
          </article>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="section about-section scroll-reveal" id="about" #scrollSection>
      <div class="section-inner">
        <div class="about-grid">
          <div class="about-content">
            <span class="section-badge">About Us</span>
            <h2 class="section-title">Why Choose <span class="gradient-text">EventHub</span>?</h2>
            <p class="about-text">
              We're passionate about bringing people together through extraordinary events. 
              Our platform makes it easy to discover, create, and manage events that leave lasting impressions.
            </p>
            
            <div class="features-list">
              <div class="feature-item">
                <div class="feature-icon" style="background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div class="feature-content">
                  <h4>Easy Event Creation</h4>
                  <p>Create stunning events in minutes with our intuitive tools</p>
                </div>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon" style="background: linear-gradient(135deg, #ff4d4d 0%, #dc2626 100%);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div class="feature-content">
                  <h4>Smart Networking</h4>
                  <p>Connect with like-minded attendees and expand your network</p>
                </div>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div class="feature-content">
                  <h4>Seamless Scheduling</h4>
                  <p>Advanced calendar integration and reminder system</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="about-visual">
            <div class="about-card">
              <div class="about-stats-grid">
                <div class="about-stat">
                  <span class="about-stat-number">50K+</span>
                  <span class="about-stat-label">Events Created</span>
                </div>
                <div class="about-stat">
                  <span class="about-stat-number">200K+</span>
                  <span class="about-stat-label">Happy Users</span>
                </div>
                <div class="about-stat">
                  <span class="about-stat-number">150+</span>
                  <span class="about-stat-label">Cities Worldwide</span>
                </div>
                <div class="about-stat">
                  <span class="about-stat-number">99%</span>
                  <span class="about-stat-label">Satisfaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="section categories-section scroll-reveal" id="categories" #scrollSection>
      <div class="section-inner">
        <div class="section-header">
          <span class="section-badge">Browse Categories</span>
          <h2 class="section-title">Explore by <span class="gradient-text">Category</span></h2>
          <p class="section-subtitle">Find events that match your interests</p>
        </div>
        
        <div class="categories-grid">
          <div class="category-card" (click)="selectedCategory = 'Music'; scrollToEvents()">
            <div class="category-icon" style="background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);">
              🎵
            </div>
            <h3>Music & Concerts</h3>
            <p>Live performances and festivals</p>
            <span class="category-count">{{ getCategoryCount('Music') }} Events</span>
          </div>
          
          <div class="category-card" (click)="selectedCategory = 'Technology'; scrollToEvents()">
            <div class="category-icon" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">
              💻
            </div>
            <h3>Tech & Innovation</h3>
            <p>Conferences and workshops</p>
            <span class="category-count">{{ getCategoryCount('Technology') }} Events</span>
          </div>
          
          <div class="category-card" (click)="selectedCategory = 'Art'; scrollToEvents()">
            <div class="category-icon" style="background: linear-gradient(135deg, #ff4d4d 0%, #dc2626 100%);">
              🎨
            </div>
            <h3>Art & Culture</h3>
            <p>Exhibitions and galleries</p>
            <span class="category-count">{{ getCategoryCount('Art') }} Events</span>
          </div>
          
          <div class="category-card" (click)="selectedCategory = 'Business'; scrollToEvents()">
            <div class="category-icon" style="background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);">
              💼
            </div>
            <h3>Business & Networking</h3>
            <p>Meetups and seminars</p>
            <span class="category-count">{{ getCategoryCount('Business') }} Events</span>
          </div>
          
          <div class="category-card" (click)="selectedCategory = 'Sports'; scrollToEvents()">
            <div class="category-icon" style="background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);">
              ⚽
            </div>
            <h3>Sports & Fitness</h3>
            <p>Competitions and activities</p>
            <span class="category-count">{{ getCategoryCount('Sports') }} Events</span>
          </div>
          
          <div class="category-card" (click)="selectedCategory = 'All'; scrollToEvents()">
            <div class="category-icon" style="background: linear-gradient(135deg, #dc2626 0%, #000000 100%);">
              ✨
            </div>
            <h3>All Categories</h3>
            <p>Browse everything</p>
            <span class="category-count">{{ allEvents.length }} Events</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="section contact-section scroll-reveal" id="contact" #scrollSection>
      <div class="section-inner">
        <div class="contact-grid">
          <div class="contact-info">
            <span class="section-badge">Get In Touch</span>
            <h2 class="section-title">Let's <span class="gradient-text">Connect</span></h2>
            <p class="contact-text">
              Have questions about hosting or attending events? 
              We're here to help you create amazing experiences.
            </p>
            
            <div class="contact-details">
              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h4>Visit Us</h4>
                  <p>Christ University Kengeri Campus</p>
                </div>
              </div>
              
              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h4>Email Us</h4>
                  <p>vedant.joshi&#64;btech.christuniversity.in</p>
                </div>
              </div>
              
              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h4>Call Us</h4>
                  <p>+91 9606157692</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="contact-form-wrapper">
            <form class="contact-form" (ngSubmit)="onContactSubmit()" #contactFormRef="ngForm">
              <div class="form-group">
                <label for="name">Your Name</label>
                <input type="text" id="name" name="name" [(ngModel)]="contactForm.name" placeholder="John Doe" required>
              </div>
              <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" [(ngModel)]="contactForm.email" placeholder="john@example.com" required>
              </div>
              <div class="form-group">
                <label for="subject">Subject</label>
                <input type="text" id="subject" name="subject" [(ngModel)]="contactForm.subject" placeholder="How can we help?">
              </div>
              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="4" [(ngModel)]="contactForm.message" placeholder="Your message here..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-full" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Sending...' : (isSent ? 'Sent!' : 'Send Message') }}
                <svg *ngIf="!isSubmitting && !isSent" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <svg *ngIf="isSent" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-brand">
            <a routerLink="/" class="footer-logo">
              <span class="logo-icon">✦</span>
              <span class="logo-text">EventHub</span>
            </a>
            <p>Creating unforgettable experiences and bringing people together through amazing events.</p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div class="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a (click)="scrollToSection('home')">Home</a></li>
              <li><a (click)="scrollToSection('events')">Events</a></li>
              <li><a (click)="scrollToSection('about')">About Us</a></li>
              <li><a (click)="scrollToSection('categories')">Categories</a></li>
              <li><a (click)="scrollToSection('contact')">Contact</a></li>
            </ul>
          </div>
          
          <div class="footer-links">
            <h4>Categories</h4>
            <ul>
              <li><a (click)="selectCategory('Music')">Music & Concerts</a></li>
              <li><a (click)="selectCategory('Technology')">Tech & Innovation</a></li>
              <li><a (click)="selectCategory('Art')">Art & Culture</a></li>
              <li><a (click)="selectCategory('Business')">Business</a></li>
              <li><a (click)="selectCategory('Sports')">Sports & Fitness</a></li>
            </ul>
          </div>
          
          <div class="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Subscribe to our newsletter for the latest events.</p>
            <form class="newsletter-form">
              <input type="email" placeholder="Enter your email" required>
              <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2026 EventHub. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* ============================================
       BASE STYLES
       ============================================ */
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
    }
    
    /* ============================================
       SCROLL REVEAL ANIMATIONS
       ============================================ */
    .scroll-reveal {
      opacity: 0;
      transform: translateY(60px);
      transition: all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    
    .scroll-reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Load Animations */
    .animate-on-load {
      opacity: 0;
      transform: translateY(30px);
      animation: fadeInUp 0.8s ease forwards;
    }
    
    .animate-on-load.delay-1 { animation-delay: 0.2s; }
    .animate-on-load.delay-2 { animation-delay: 0.4s; }
    .animate-on-load.delay-3 { animation-delay: 0.6s; }
    .animate-on-load.delay-4 { animation-delay: 0.8s; }
    
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* ============================================
       SECTION LAYOUT
       ============================================ */
    .section {
      padding: 100px 0;
      position: relative;
      z-index: 1;
    }
    
    .section-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .section-badge {
      display: inline-block;
      padding: 8px 20px;
      background: rgba(220, 38, 38, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(220, 38, 38, 0.2);
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #ff6b6b;
      margin-bottom: 16px;
    }
    
    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.2;
      color: white;
    }
    
    .section-subtitle {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.6);
      max-width: 600px;
      margin: 0 auto;
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* ============================================
       HERO SECTION
       ============================================ */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding: 120px 0 80px;
      position: relative;
      z-index: 1;
    }
    
    .hero-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      width: 100%;
    }
    
    @media (max-width: 1024px) {
      .hero-wrapper {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
    
    .hero-content {
      max-width: 600px;
    }
    
    @media (max-width: 1024px) {
      .hero-content {
        max-width: none;
        margin: 0 auto;
      }
    }
    
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50px;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 24px;
    }
    
    .badge-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }
    
    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 24px;
      color: white;
    }
    
    .hero-subtitle {
      font-size: 1.15rem;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 32px;
      line-height: 1.7;
    }
    
    .hero-cta {
      display: flex;
      gap: 16px;
      margin-bottom: 48px;
      flex-wrap: wrap;
    }
    
    @media (max-width: 1024px) {
      .hero-cta {
        justify-content: center;
      }
    }
    
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 32px;
      flex-wrap: wrap;
    }
    
    @media (max-width: 1024px) {
      .hero-stats {
        justify-content: center;
      }
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    
    .stat-number {
      font-family: 'Outfit', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stat-label {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .stat-divider {
      width: 1px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
    }
    
    @media (max-width: 600px) {
      .stat-divider { display: none; }
    }
    
    /* Hero Visual */
    .hero-visual {
      position: relative;
      height: 500px;
    }
    
    @media (max-width: 1024px) {
      .hero-visual { display: none; }
    }
    
    .hero-card {
      position: absolute;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      animation: cardFloat 6s infinite ease-in-out;
    }
    
    .hero-card:hover {
      transform: translateY(-10px) scale(1.02);
    }
    
    .hero-card-1 { top: 5%; left: 5%; animation-delay: 0s; }
    .hero-card-2 { top: 35%; right: 0; animation-delay: -2s; }
    .hero-card-3 { bottom: 5%; left: 15%; animation-delay: -4s; }
    
    @keyframes cardFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    
    .hero-card .card-image {
      width: 180px;
      height: 100px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    
    .card-icon { font-size: 2.5rem; }
    
    .hero-card .card-info h4 {
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: white;
    }
    
    .hero-card .card-info p {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
    }
    
    /* ============================================
       BUTTONS
       ============================================ */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      color: white;
      box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(255, 255, 255, 0.2);
    }
    
    .btn-glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .btn-glass:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .btn-lg {
      padding: 16px 32px;
      font-size: 1rem;
    }
    
    .btn-full { width: 100%; }
    
    /* ============================================
       EVENTS SECTION
       ============================================ */
    .events-section {
      background: transparent;
    }
    
    .filter-bar {
      margin-bottom: 40px;
    }
    
    .filter-select {
      padding: 14px 24px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 200px;
    }
    
    .filter-select:focus {
      outline: none;
      border-color: #dc2626;
    }
    
    .filter-select option {
      background: #0c0f1a;
      color: white;
    }
    
    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 30px;
    }
    
    .event-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s ease;
      animation: fadeInUp 0.6s ease forwards;
      opacity: 0;
    }
    
    .event-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      border-color: rgba(220, 38, 38, 0.3);
    }
    
    .event-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    
    .event-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    .event-card:hover .event-image img {
      transform: scale(1.1);
    }
    
    .event-category {
      position: absolute;
      top: 16px;
      left: 16px;
      padding: 6px 14px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 500;
      color: white;
    }
    
    .event-favorite {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: white;
    }
    
    .event-favorite:hover {
      background: rgba(245, 87, 108, 0.3);
      border-color: #f5576c;
    }
    
    .event-content {
      padding: 20px;
      display: flex;
      gap: 16px;
    }
    
    .event-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 60px;
      padding: 12px;
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      border-radius: 12px;
      text-align: center;
    }
    
    .date-day {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1;
      color: white;
    }
    
    .date-month {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .event-details { flex: 1; }
    
    .event-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: white;
    }
    
    .event-location {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 12px;
    }
    
    .event-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .event-price {
      font-family: 'Outfit', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .event-attendees {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .attendee-avatars {
      display: flex;
    }
    
    .avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 600;
      margin-left: -8px;
      border: 2px solid #0c0f1a;
      color: white;
    }
    
    .avatar:first-child { margin-left: 0; }
    
    .register-btn {
      margin: 0 20px 20px;
    }
    
    /* ============================================
       ABOUT SECTION
       ============================================ */
    .about-section {
      overflow: hidden;
    }
    
    .about-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 40px;
      align-items: start;
    }
    
    @media (max-width: 900px) {
      .about-grid {
        grid-template-columns: 1fr;
        gap: 40px;
      }
    }
    
    .about-content {
      max-width: 100%;
    }
    
    .about-text {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 28px;
      line-height: 1.7;
      max-width: 500px;
    }
    
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .feature-item {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    
    .feature-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(220, 38, 38, 0.3);
      transform: translateX(8px);
    }
    
    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .feature-content h4 {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: white;
    }
    
    .feature-content p {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
      line-height: 1.4;
    }
    
    .about-visual {
      display: flex;
      justify-content: flex-end;
    }
    
    .about-card {
      padding: 32px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      width: 100%;
      max-width: 320px;
    }
    
    .about-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .about-stat {
      text-align: center;
    }
    
    .about-stat-number {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: block;
      margin-bottom: 4px;
    }
    
    .about-stat-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
    }
    
    /* ============================================
       CATEGORIES SECTION
       ============================================ */
    .categories-section {
      background: transparent;
    }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 24px;
    }
    
    .category-card {
      text-align: center;
      padding: 32px 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .category-card:hover {
      transform: translateY(-8px);
      border-color: rgba(220, 38, 38, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .category-icon {
      width: 70px;
      height: 70px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 20px;
    }
    
    .category-card h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: white;
    }
    
    .category-card p {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 12px;
    }
    
    .category-count {
      font-size: 0.8rem;
      color: #a78bfa;
      font-weight: 600;
    }
    
    /* ============================================
       CONTACT SECTION
       ============================================ */
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: start;
    }
    
    @media (max-width: 900px) {
      .contact-grid {
        grid-template-columns: 1fr;
        gap: 40px;
      }
    }
    
    .contact-text {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 32px;
      line-height: 1.7;
    }
    
    .contact-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .contact-item {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    
    .contact-item:hover {
      background: rgba(255, 255, 255, 0.05);
      transform: translateX(8px);
    }
    
    .contact-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .contact-item h4 {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: white;
    }
    
    .contact-item p {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.5);
    }
    
    .contact-form-wrapper {
      padding: 40px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
    }
    
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-group label {
      font-size: 0.9rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .form-group input,
    .form-group textarea {
      padding: 14px 18px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }
    
    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
    
    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }
    
    /* ============================================
       FOOTER
       ============================================ */
    .footer {
      background: rgba(0, 0, 0, 0.4);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 80px 0 30px;
      position: relative;
      z-index: 1;
    }
    
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
      gap: 24px;
      margin-bottom: 40px;
    }
    
    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 30px;
      }
    }
    
    @media (max-width: 600px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .footer-logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      margin-bottom: 16px;
    }
    
    .footer-logo .logo-icon {
      font-size: 1.8rem;
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .footer-logo .logo-text {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.5rem;
      color: white;
    }
    
    .footer-brand p {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 20px;
      max-width: 280px;
      line-height: 1.6;
    }
    
    .social-links {
      display: flex;
      gap: 12px;
    }
    
    .social-link {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
    }
    
    .social-link:hover {
      background: linear-gradient(135deg, #dc2626 0%, #1a1a1a 100%);
      border-color: transparent;
      color: white;
      transform: translateY(-3px);
    }
    
    .footer-links h4 {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 20px;
      color: white;
    }
    
    .footer-links ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .footer-links li {
      margin-bottom: 12px;
    }
    
    .footer-links a {
      color: rgba(255, 255, 255, 0.5);
      text-decoration: none;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .footer-links a:hover {
      color: white;
    }
    
    .footer-newsletter h4 {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: white;
      white-space: nowrap;
    }
    
    .footer-newsletter p {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 12px;
      white-space: nowrap;
    }
    
    .newsletter-form {
      display: flex;
      gap: 8px;
      max-width: 280px;
    }
    
    @media (max-width: 600px) {
      .newsletter-form {
        flex-direction: column;
        max-width: 100%;
      }
    }
    
    .newsletter-form input {
      flex: 1;
      min-width: 0;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: white;
      font-size: 0.85rem;
    }
    
    .newsletter-form input:focus {
      outline: none;
      border-color: #dc2626;
    }
    
    .newsletter-form .btn {
      padding: 10px 16px;
      font-size: 0.85rem;
      white-space: nowrap;
    }
    
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    @media (max-width: 600px) {
      .footer-bottom {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
    
    .footer-bottom p {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.4);
    }
    
    .footer-bottom-links {
      display: flex;
      gap: 24px;
    }
    
    .footer-bottom-links a {
      color: rgba(255, 255, 255, 0.5);
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .footer-bottom-links a:hover {
      color: white;
    }
  `]
})
export class EventListComponent implements AfterViewInit {
  @ViewChildren('scrollSection') scrollSections!: QueryList<ElementRef>;

  eventService = inject(EventService);
  events$ = this.eventService.getEvents();
  allEvents: any[] = [];
  categoryCounts: { [key: string]: number } = {};
  selectedCategory = 'All';

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  isSubmitting = false;
  isSent = false;

  onContactSubmit() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;
    this.eventService.sendContactMessage(this.contactForm).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.isSent = true;
        this.contactForm = { name: '', email: '', subject: '', message: '' };

        // Show alert after a brief delay to allow UI to update to "Sent!"
        setTimeout(() => {
          alert('Message sent successfully!');
          // Revert button text after 3 seconds
          setTimeout(() => {
            this.isSent = false;
          }, 3000);
        }, 100);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSubmitting = false;
        setTimeout(() => alert('Failed to send message. Please try again later.'), 100);
      }
    });
  }

  ngAfterViewInit() {
    this.initScrollAnimations();

    // Subscribe to events to calculate counts
    this.events$.subscribe(events => {
      this.allEvents = events;
      this.calculateCategoryCounts();
    });
  }

  calculateCategoryCounts() {
    this.categoryCounts = {};
    this.allEvents.forEach(event => {
      const cat = event.category || 'Other';
      this.categoryCounts[cat] = (this.categoryCounts[cat] || 0) + 1;
    });
  }

  getCategoryCount(category: string): number {
    if (this.categoryCounts[category]) return this.categoryCounts[category];

    // Handle special cases or partial matches if needed
    // Map simplified category names to potential DB values
    const map: { [key: string]: string[] } = {
      'Music': ['Music', 'Concert', 'Concerts'],
      'Technology': ['Technology', 'Tech', 'Innovation'],
      'Art': ['Art', 'Arts', 'Culture'],
      'Business': ['Business', 'Finance'],
      'Sports': ['Sports', 'Fitness']
    };

    if (map[category]) {
      return map[category].reduce((acc, c) => acc + (this.categoryCounts[c] || 0), 0);
    }

    return this.categoryCounts[category] || 0;
  }

  initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all scroll-reveal sections
    setTimeout(() => {
      this.scrollSections.forEach(section => {
        observer.observe(section.nativeElement);
      });
    }, 100);
  }

  scrollToEvents() {
    this.scrollToSection('events');
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.scrollToEvents();
  }

  getEventDay(event: any): string {
    if (event.date) {
      const date = typeof event.date === 'string' ? new Date(event.date) : event.date;
      return date.getDate().toString().padStart(2, '0');
    }
    const days = ['01', '05', '12', '15', '20', '25', '28'];
    const id = event.id || parseInt(event._id?.slice(-6) || '0', 16);
    return days[id % days.length];
  }

  getEventMonth(event: any): string {
    if (event.date) {
      const date = typeof event.date === 'string' ? new Date(event.date) : event.date;
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return months[date.getMonth()];
    }
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const id = event.id || parseInt(event._id?.slice(-6) || '0', 16);
    return months[id % months.length];
  }
}