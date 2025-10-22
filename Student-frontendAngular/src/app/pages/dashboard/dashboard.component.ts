import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import axios from 'axios';
import { EditUserDialogComponent } from './edit-user-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    EditUserDialogComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  me: any = {};
  users: any[] = [];
  role = localStorage.getItem('role') || '';
  error = '';
  showCreate = false;
  newUser: any = { name: '', email: '', passwordHash: '', designation: 'Student' };

  displayedColumns: string[] = [
    'name',
    'dateOfBirth',
    'gender',
    'designation',
    'email',
    'address',
    'actions'
  ];

  constructor(private dialog: MatDialog) {}

  async ngOnInit() {
    await this.loadProfile();
    await this.loadUsers();
  }

  // ✅ FIXED: Properly loads profile using /me endpoint
  async loadProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        return;
      }

      const res = await axios.get('https://localhost:7256/api/User/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.me = res.data;
      console.log('✅ Profile loaded:', this.me);
    } catch (err: any) {
      console.error('❌ Failed to load profile:', err.response?.data || err.message);
      this.me = { name: 'User', email: '' };
    }
  }

  // ✅ FIXED: Teacher sees all, student sees own data via /me
  async loadUsers() {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      let res;
      if (role === 'Teacher') {
        res = await axios.get('https://localhost:7256/api/User', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.users = res.data;
      } else {
        res = await axios.get('https://localhost:7256/api/User/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.users = [res.data];
      }

      console.log('✅ Users loaded:', this.users);
      this.error = '';
    } catch (err: any) {
      console.error('❌ Failed to load users:', err.response?.data || err.message);
      this.error = 'Failed to load users';
    }
  }

  toggleCreate() {
    this.showCreate = !this.showCreate;
  }

  async createUser() {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://localhost:7256/api/User', this.newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.newUser = { name: '', email: '', passwordHash: '', designation: 'Student' };
      await this.loadUsers();
      this.showCreate = false;
    } catch {
      this.error = 'Failed to create user';
    }
  }

  async deleteUser(u: any) {
    try {
      const token = localStorage.getItem('token');
      const id = u.userId || u.id;

      if (!id) {
        console.error('❌ Missing user ID for delete:', u);
        this.error = 'Invalid user data — cannot delete.';
        return;
      }

      console.log('🗑️ Deleting user:', id);

      await axios.delete(`https://localhost:7256/api/User/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Soft delete success');

      // ⚡ Immediately remove from UI without reloading all users
      this.users = this.users.filter((usr: any) => usr.userId !== id && usr.id !== id);
    } catch (err: any) {
      console.error('❌ Delete failed:', err.response?.data || err.message);
      this.error = 'Failed to delete user';
    }
  }

  edit(u: any) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '600px',
      data: { ...u },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;

      const id = result.userId || result.id;
      if (!id) {
        console.error('❌ Missing user ID:', result);
        this.error = 'Invalid user data — no ID found.';
        return;
      }

      console.log('📦 Sending PUT to:', `https://localhost:7256/api/User/${id}`);
      console.log('📤 Payload:', result);

      try {
        const token = localStorage.getItem('token');
        const res = await axios.put(`https://localhost:7256/api/User/${id}`, result, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('✅ Update success:', res.data);
        this.error = '';
        await this.loadUsers();
      } catch (err: any) {
        console.error('❌ Update failed:', err.response?.data || err.message);
        this.error = 'Failed to update user';
      }
    });
  }
}
