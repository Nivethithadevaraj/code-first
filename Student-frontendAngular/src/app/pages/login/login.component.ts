import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user: any = { email: '', passwordHash: '' };
  message: string = '';
  error: string = '';

  constructor(private router: Router) {}

  async submit() {
    this.message = '';
    this.error = '';

    if (!this.user.email || !this.user.passwordHash) {
      this.error = 'Please fill all required fields';
      return;
    }

    try {
      const response = await axios.post('https://localhost:7256/api/User/login', this.user);
      const data = response.data;

      this.message = 'Login successful!';
      localStorage.setItem('token', data.token);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.response?.data?.message || 'Invalid credentials';
    }
  }
}
