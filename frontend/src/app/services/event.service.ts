import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from '../../environments/environment';

interface EventsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Event[];
}

interface EventResponse {
  success: boolean;
  message?: string;
  data: Event;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/events`;
  private contactUrl = `${environment.apiUrl}/contact`;

  getEvents(params?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<Event[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<EventsResponse>(this.apiUrl, { params: httpParams }).pipe(
      map(response => {
        if (response.success) {
          // Map backend event structure to frontend format
          return response.data.map(event => ({
            ...event,
            id: event.id || parseInt(event._id?.slice(-6) || '0', 16), // Generate numeric ID for compatibility
            price: event.ticketPrice || event.price || 0,
            date: typeof event.date === 'string' ? event.date : event.date.toISOString(),
            status: this.mapStatus(event.status)
          } as Event));
        }
        return [];
      })
    );
  }

  getEventById(id: string | number): Observable<Event> {
    // Convert numeric ID to MongoDB _id if needed (for backward compatibility)
    const eventId = typeof id === 'number' ? this.convertNumericToId(id) : id;

    return this.http.get<EventResponse>(`${this.apiUrl}/${eventId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          const event = response.data;
          return {
            ...event,
            id: event.id || parseInt(event._id?.slice(-6) || '0', 16),
            price: event.ticketPrice || event.price || 0,
            date: typeof event.date === 'string' ? event.date : event.date.toISOString(),
            status: this.mapStatus(event.status)
          } as Event;
        }
        throw new Error('Event not found');
      })
    );
  }

  createEvent(eventData: Partial<Event>): Observable<Event> {
    return this.http.post<EventResponse>(this.apiUrl, eventData).pipe(
      map(response => {
        if (response.success && response.data) {
          const event = response.data;
          return {
            ...event,
            id: event.id || parseInt(event._id?.slice(-6) || '0', 16),
            price: event.ticketPrice || event.price || 0,
            date: typeof event.date === 'string' ? event.date : event.date.toISOString(),
            status: this.mapStatus(event.status)
          } as Event;
        }
        throw new Error('Failed to create event');
      })
    );
  }

  updateEvent(id: string, eventData: Partial<Event>): Observable<Event> {
    return this.http.put<EventResponse>(`${this.apiUrl}/${id}`, eventData).pipe(
      map(response => {
        if (response.success && response.data) {
          const event = response.data;
          return {
            ...event,
            id: event.id || parseInt(event._id?.slice(-6) || '0', 16),
            price: event.ticketPrice || event.price || 0,
            date: typeof event.date === 'string' ? event.date : event.date.toISOString(),
            status: this.mapStatus(event.status)
          } as Event;
        }
        throw new Error('Failed to update event');
      })
    );
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete event');
        }
      })
    );
  }

  sendContactMessage(data: { name: string; email: string; subject: string; message: string }): Observable<any> {
    return this.http.post(this.contactUrl, data);
  }

  // Helper method to map backend status to frontend status
  private mapStatus(status: string): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'open' | 'sold-out' {
    const statusMap: { [key: string]: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'open' | 'sold-out' } = {
      'upcoming': 'open',
      'ongoing': 'open',
      'completed': 'sold-out',
      'cancelled': 'cancelled',
      'open': 'open',
      'sold-out': 'sold-out'
    };
    return statusMap[status] || 'open';
  }

  // Helper method to convert numeric ID to MongoDB-like ID (for backward compatibility)
  private convertNumericToId(numId: number): string {
    // This is a simple conversion - in production, you'd want a proper mapping
    // For now, we'll try to find by numeric ID or use a fallback
    return numId.toString();
  }
}