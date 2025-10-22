import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Edit User</h2>

    <div mat-dialog-content 
         style="display:flex;flex-direction:column;gap:12px;max-height:60vh;overflow-y:auto;padding-right:8px;">
      
      <mat-form-field appearance="outline">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="data.name" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Date of Birth</mat-label>
        <input matInput type="date" [(ngModel)]="data.dateOfBirth" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Gender</mat-label>
        <mat-select [(ngModel)]="data.gender">
          <mat-option value="male">Male</mat-option>
          <mat-option value="female">Female</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Designation</mat-label>
        <input matInput [(ngModel)]="data.designation" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput type="email" [(ngModel)]="data.email" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Role</mat-label>
        <mat-select [(ngModel)]="data.role">
          <mat-option value="Teacher">Teacher</mat-option>
          <mat-option value="Student">Student</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Department</mat-label>
        <input matInput [(ngModel)]="data.department" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Phone Number</mat-label>
        <input matInput [(ngModel)]="data.phoneNumber" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Address</mat-label>
        <textarea matInput rows="2" [(ngModel)]="data.address"></textarea>
      </mat-form-field>

    </div>

    <div mat-dialog-actions align="end" style="position:sticky;bottom:0;background:#fff;padding-top:8px;">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()">Save</button>
    </div>
  `
})
export class EditUserDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  save() {
    // ✅ Ensure ID is preserved before closing
    if (!this.data.id && this.data.userId) {
      this.data.id = this.data.userId;
    }
    console.log('✅ Closing dialog with data:', this.data);
    this.dialogRef.close(this.data);
  }

  cancel() {
    this.dialogRef.close();
  }
}
