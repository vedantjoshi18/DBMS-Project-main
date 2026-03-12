import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrganizerGroup } from '../models/organizer-group.model';
import { Event } from '../models/event.model';

interface GroupsResponse {
  success: boolean;
  count: number;
  data: OrganizerGroup[];
}

interface GroupResponse {
  success: boolean;
  data: OrganizerGroup & { recentEvents?: Event[] };
}

interface EventsResponse {
  success: boolean;
  count: number;
  total: number;
  data: Event[];
}

@Injectable({ providedIn: 'root' })
export class OrganizerGroupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/organizer-groups`;

  getAllGroups(type?: 'club' | 'department'): Observable<OrganizerGroup[]> {
    let params = new HttpParams();

    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<GroupsResponse>(this.apiUrl, { params }).pipe(
      map((response) => (response.success ? response.data : []))
    );
  }

  getGroupBySlug(slug: string): Observable<OrganizerGroup> {
    return this.http.get<GroupResponse>(`${this.apiUrl}/${slug}`).pipe(
      map((response) => response.data)
    );
  }

  getEventsByGroup(slug: string): Observable<Event[]> {
    return this.http.get<EventsResponse>(`${this.apiUrl}/${slug}/events`).pipe(
      map((response) => (response.success ? response.data : []))
    );
  }

  createGroup(data: Partial<OrganizerGroup>): Observable<OrganizerGroup> {
    return this.http.post<{ success: boolean; data: OrganizerGroup }>(this.apiUrl, data).pipe(
      map((response) => response.data)
    );
  }

  updateGroup(id: string, data: Partial<OrganizerGroup>): Observable<OrganizerGroup> {
    return this.http.put<{ success: boolean; data: OrganizerGroup }>(`${this.apiUrl}/${id}`, data).pipe(
      map((response) => response.data)
    );
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined)
    );
  }
}
