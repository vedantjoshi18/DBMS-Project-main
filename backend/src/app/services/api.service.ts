import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Helper to get headers with token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Auth APIs
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`, { 
      headers: this.getHeaders() 
    });
  }

  // Event APIs
  getAllEvents(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`, { params });
  }

  getEvent(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}`);
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/events`, eventData, {
      headers: this.getHeaders()
    });
  }

  updateEvent(id: string, eventData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/events/${id}`, eventData, {
      headers: this.getHeaders()
    });
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/events/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Booking APIs
  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, bookingData, {
      headers: this.getHeaders()
    });
  }

  getMyBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bookings/my-bookings`, {
      headers: this.getHeaders()
    });
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/bookings/${id}/cancel`, {}, {
      headers: this.getHeaders()
    });
  }
}