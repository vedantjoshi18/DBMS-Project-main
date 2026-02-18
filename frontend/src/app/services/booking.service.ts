import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Booking } from '../models/booking.model';
import { environment } from '../../environments/environment';

interface BookingResponse {
  success: boolean;
  message?: string;
  data: Booking;
}

interface BookingsResponse {
  success: boolean;
  count?: number;
  data: Booking[];
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bookings`;

  createBooking(bookingData: { eventId: string; numberOfTickets: number }): Observable<Booking> {
    return this.http.post<BookingResponse>(this.apiUrl, {
      eventId: bookingData.eventId,
      numberOfTickets: bookingData.numberOfTickets
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.mapBooking(response.data);
        }
        throw new Error(response.message || 'Failed to create booking');
      })
    );
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<BookingsResponse>(`${this.apiUrl}/my-bookings`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.map(booking => this.mapBooking(booking));
        }
        return [];
      })
    );
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<BookingResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.mapBooking(response.data);
        }
        throw new Error('Booking not found');
      })
    );
  }

  cancelBooking(id: string): Observable<Booking> {
    return this.http.put<BookingResponse>(`${this.apiUrl}/${id}/cancel`, {}).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.mapBooking(response.data);
        }
        throw new Error(response.message || 'Failed to cancel booking');
      })
    );
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<BookingsResponse>(`${this.apiUrl}/admin/all`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.map(booking => this.mapBooking(booking));
        }
        return [];
      })
    );
  }

  // Legacy method for backward compatibility
  getUserBookings(email: string): Observable<Booking[]> {
    // Backend doesn't support filtering by email directly
    // Return user's own bookings instead
    return this.getMyBookings();
  }

  // Helper method to map backend booking to frontend format
  private mapBooking(booking: Booking): Booking {
    const event = typeof booking.event === 'object' ? booking.event : { _id: booking.event as string };
    
    return {
      ...booking,
      id: booking.id || parseInt(booking._id?.slice(-6) || '0', 16),
      eventId: typeof booking.event === 'string' ? parseInt(booking.event.slice(-6), 16) : parseInt(event._id?.slice(-6) || '0', 16),
      eventTitle: typeof booking.event === 'object' ? booking.event.title : undefined,
      tickets: booking.numberOfTickets || booking.tickets || 1,
      numberOfTickets: booking.numberOfTickets || booking.tickets || 1,
      userEmail: typeof booking.user === 'object' ? booking.user.email : undefined,
      userName: typeof booking.user === 'object' ? booking.user.name : undefined,
      bookingDate: booking.createdAt ? new Date(booking.createdAt) : new Date()
    };
  }
}