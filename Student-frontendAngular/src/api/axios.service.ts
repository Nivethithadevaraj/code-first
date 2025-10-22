import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AxiosService {
  // runtime base URL so you don't need environment.ts
  private apiBase = `${window.location.origin}/api`;

  constructor(private http: HttpClient) {}

  private authOptions() {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  get<T>(path: string) {
    return this.http.get<T>(`${this.apiBase}/${path}`, this.authOptions());
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(`${this.apiBase}/${path}`, body, this.authOptions());
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(`${this.apiBase}/${path}`, body, this.authOptions());
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.apiBase}/${path}`, this.authOptions());
  }
}
