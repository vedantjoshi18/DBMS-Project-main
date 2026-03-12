import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from '../../environments/environment';
import { OrganizerGroupService } from './organizer-group.service';

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

interface EventQueryParams {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  organizerGroup?: string;
  organizerGroupType?: 'club' | 'department';
  isHot?: boolean;
  isFeatured?: boolean;
  recent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly organizerGroupService = inject(OrganizerGroupService);
  private readonly apiUrl = `${environment.apiUrl}/events`;
  private readonly contactUrl = `${environment.apiUrl}/contact`;

  private readonly mapEvent = (event: Event): Event => ({
    ...event,
    id: event.id || Number.parseInt(event._id?.slice(-6) || '0', 16),
    price: event.ticketPrice || event.price || 0,
    date: typeof event.date === 'string' ? event.date : event.date.toISOString(),
    status: this.mapStatus(event.status)
  } as Event);

  getEvents(params?: EventQueryParams): Observable<Event[]> {
    return this.queryEvents(params);
  }

  getEventById(id: string | number): Observable<Event> {
    // Convert numeric ID to MongoDB _id if needed (for backward compatibility)
    const eventId = typeof id === 'number' ? this.convertNumericToId(id) : id;

    return this.http.get<EventResponse>(`${this.apiUrl}/${eventId}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.mapEvent(response.data);
        }
        throw new Error('Event not found');
      })
    );
  }

  createEvent(eventData: Partial<Event>): Observable<Event> {
    return this.http.post<EventResponse>(this.apiUrl, eventData).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.mapEvent(response.data);
        }
        throw new Error('Failed to create event');
      })
    );
  }

  updateEvent(id: string, eventData: Partial<Event>): Observable<Event> {
    return this.http.put<EventResponse>(`${this.apiUrl}/${id}`, eventData).pipe(
      map(response => {
        if (response.success && response.data) {
          return this.mapEvent(response.data);
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

  getHotEvents(): Observable<Event[]> {
    return this.queryEvents({ isHot: true, limit: 6 });
  }

  getFeaturedEvents(): Observable<Event[]> {
    return this.queryEvents({ isFeatured: true, limit: 8 });
  }

  getRecentEvents(): Observable<Event[]> {
    return this.queryEvents({ recent: true, limit: 8 });
  }

  getEventsByGroup(groupSlug: string): Observable<Event[]> {
    return this.organizerGroupService.getEventsByGroup(groupSlug);
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

  private queryEvents(params?: EventQueryParams): Observable<Event[]> {
    const httpParams = this.buildHttpParams(params);

    return this.http.get<EventsResponse>(this.apiUrl, { params: httpParams }).pipe(
      map((response) => {
        if (response.success) {
          return response.data.map(this.mapEvent);
        }
        return [];
      })
    );
  }

  private buildHttpParams(params?: EventQueryParams): HttpParams {
    if (!params) {
      return new HttpParams();
    }

    const valuePairs: Array<[string, string | undefined]> = [
      ['category', params.category],
      ['status', params.status],
      ['search', params.search],
      ['organizerGroup', params.organizerGroup],
      ['organizerGroupType', params.organizerGroupType]
    ];

    const numberPairs: Array<[string, number | undefined]> = [
      ['page', params.page],
      ['limit', params.limit]
    ];

    const booleanPairs: Array<[string, boolean | undefined]> = [
      ['isHot', params.isHot],
      ['isFeatured', params.isFeatured],
      ['recent', params.recent]
    ];

    let httpParams = new HttpParams();

    for (const [key, value] of valuePairs) {
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    }

    for (const [key, value] of numberPairs) {
      if (typeof value === 'number') {
        httpParams = httpParams.set(key, value.toString());
      }
    }

    for (const [key, value] of booleanPairs) {
      if (typeof value === 'boolean') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }
}