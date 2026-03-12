import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrganizerGroup } from '../models/organizer-group.model';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/admin`;

    getStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/stats`);
    }

    getAllUsers(): Observable<any> {
        return this.http.get(`${this.apiUrl}/users`);
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${id}`);
    }

    getGroupStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/group-stats`);
    }

    createGroup(payload: Partial<OrganizerGroup>): Observable<any> {
        return this.http.post(`${this.apiUrl}/groups`, payload);
    }

    updateGroup(id: string, payload: Partial<OrganizerGroup>): Observable<any> {
        return this.http.put(`${this.apiUrl}/groups/${id}`, payload);
    }

    deleteGroup(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/groups/${id}`);
    }
}
