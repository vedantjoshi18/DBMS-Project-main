import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { BookingService } from '../../services/booking.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="booking-page">
      <div class="booking-container">
        <div class="form-header">
          <h2 class="form-title">Secure Your Spot</h2>
          <p class="event-name">{{ eventTitle }}</p>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="glass-form">
          <div class="form-group">
            <label for="numberOfTickets">Number of Tickets</label>
            <div class="input-wrapper">
              <mat-icon>confirmation_number</mat-icon>
              <input type="number" id="numberOfTickets" formControlName="numberOfTickets" min="1" max="5">
            </div>
            <div class="error-msg" *ngIf="bookingForm.get('numberOfTickets')?.touched && bookingForm.get('numberOfTickets')?.invalid">
              1-5 tickets allowed
            </div>
          </div>

          <button type="submit" [disabled]="bookingForm.invalid || loading || !eventId" class="submit-btn">
            <span *ngIf="!loading">Confirm Booking</span>
            <span *ngIf="loading">Processing...</span>
            <mat-icon *ngIf="!loading">arrow_forward</mat-icon>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .booking-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 120px 1rem 2rem; /* Clear navbar */
      box-sizing: border-box;
    }

    .booking-container {
      width: 100%;
      max-width: 500px;
      perspective: 1000px;
      animation: fadeIn 0.8s ease-out;
    }

    .glass-form {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
    }

    .glass-form::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    }

    .form-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .form-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(to right, #fff, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
    }

    .event-name {
      color: #a5b4fc;
      font-size: 1.1rem;
      margin-top: 0.5rem;
      font-weight: 500;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      color: #d1d5db;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .input-wrapper {
      position: relative;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .input-wrapper:focus-within {
      background: rgba(0, 0, 0, 0.4);
      border-color: #818cf8;
      box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.1);
    }

    .input-wrapper mat-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      transition: color 0.3s ease;
    }

    .input-wrapper:focus-within mat-icon {
      color: #818cf8;
    }

    input {
      width: 100%;
      background: transparent;
      border: none;
      padding: 1rem 1rem 1rem 3rem;
      color: #fff;
      font-size: 1rem;
      outline: none;
      font-family: inherit;
    }

    input::placeholder {
      color: #4b5563;
    }

    .error-msg {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 0.5rem;
      margin-left: 0.5rem;
      animation: slideDown 0.2s ease-out;
    }

    .error-message {
      background-color: #f44336;
      color: white;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 0.9rem;
    }

    .submit-btn {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      margin-top: 1rem;
      position: relative;
      overflow: hidden;
    }

    .submit-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px rgba(124, 58, 237, 0.5);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #374151;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      .booking-page {
        padding-top: 100px;
      }
    }
  `]
})
export class BookingFormComponent {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  eventService = inject(EventService);
  bookingService = inject(BookingService);
  snackBar = inject(MatSnackBar);

  eventId: string = '';
  eventTitle: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  bookingForm: FormGroup = this.fb.group({
    numberOfTickets: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      // Try to get event by ID (could be numeric or MongoDB _id)
      this.eventService.getEventById(idParam).subscribe({
        next: (event) => {
          this.eventTitle = event.title;
          // Use MongoDB _id if available, otherwise use the numeric ID converted
          this.eventId = event._id || idParam;
        },
        error: (error) => {
          this.errorMessage = 'Event not found';
          this.snackBar.open('Event not found', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onSubmit() {
    if (this.bookingForm.valid && !this.loading && this.eventId) {
      this.loading = true;
      this.errorMessage = '';

      this.bookingService.createBooking({
        eventId: this.eventId,
        numberOfTickets: this.bookingForm.value.numberOfTickets
      }).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Booking Confirmed! 🚀', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/my-bookings']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Failed to create booking. Please try again.';
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}
