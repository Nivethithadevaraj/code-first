import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import axios from 'axios';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: any = {
    name: '',
    email: '',
    passwordHash: '',
    dateOfBirth: '',
    gender: '',
    designation: '',
    role: 'Student',
    department: '',
    phoneNumber: '',
    address: ''
  };

  message = '';
  error = '';

  constructor(private router: Router) {}

  async submit() {
    console.log('🚀 Submit clicked!', this.user);

    this.message = '';
    this.error = '';

    // 🧠 Basic validation
    if (!this.user.name || !this.user.email || !this.user.passwordHash) {
      this.error = 'Please fill all required fields';
      return;
    }

    // 🧩 Ensure dateOfBirth is optional but valid
    if (!this.user.dateOfBirth) {
      delete this.user.dateOfBirth;
    }

    try {
      // ✅ Correct endpoint: User/register
      const res = await axios.post(
        'https://localhost:7256/api/User/register',
        this.user
      );

      console.log('✅ Registration success:', res.data);
      this.message = 'Registration successful! Redirecting to login...';
      this.error = '';

      setTimeout(() => this.router.navigate(['/login']), 1500);
    } catch (err: any) {
      console.error('❌ Registration failed:', err.response?.data || err.message);
      this.error =
        typeof err.response?.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response?.data || 'Registration failed.');
    }
  }
}
