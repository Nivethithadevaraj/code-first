import { Injectable } from '@angular/core';
import { AxiosService } from './axios.service';
import { Observable } from 'rxjs';

export interface User {
  userId?: number;
  name: string;
  dateOfBirth?: string;
  designation?: string; // Teacher / Student
  email: string;
  passwordHash?: string; // raw password sent to backend (backend will hash)
  profilePicUrl?: string;
  // other optional fields...
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private api: AxiosService) {}

  register(user: any) {
    return this.api.post<any>('auth/register', user);
  }

  login(email: string, password: string) {
    return this.api.post<any>('auth/login', { email, password });
  }

  getMe(): Observable<User> {
    return this.api.get<User>('user/me');
  }

  getAll(): Observable<User[]> {
    return this.api.get<User[]>('user');
  }

  getById(id: number) {
    return this.api.get<User>(`user/${id}`);
  }

  create(user: User) {
    return this.api.post<any>('user', user);
  }

  update(id: number, user: User) {
    return this.api.put<any>(`user/${id}`, user);
  }

  delete(id: number) {
    return this.api.delete<any>(`user/${id}`);
  }
}
