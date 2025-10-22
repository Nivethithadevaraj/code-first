import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import axios from 'axios';

describe('DashboardComponent (Jasmine)', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch users successfully', async () => {
    spyOn(axios, 'get').and.returnValue(Promise.resolve({ data: [{ id: 1, name: 'Alice' }] }));
    await component.loadUsers();
    expect(component.users.length).toBeGreaterThan(0);
  });

  it('should handle error while loading users', async () => {
    spyOn(axios, 'get').and.returnValue(
      Promise.reject({ response: { data: { message: 'Failed to load users' } } })
    );
    await component.loadUsers();
    // ✅ match actual wording in component
    expect(component.error).toBe('Failed to load users');
  });
});
