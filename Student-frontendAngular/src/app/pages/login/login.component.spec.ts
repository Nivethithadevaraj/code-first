import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import axios from 'axios';

describe('LoginComponent (Jasmine)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.stub();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when fields are empty', () => {
    component.user = { email: '', passwordHash: '' };
    component.submit();
    expect(component.error).toBe('Please fill all required fields');
  });

  it('should call axios.post and set message on success', async () => {
    spyOn(axios, 'post').and.returnValue(Promise.resolve({ data: { token: 'abc' } }));
    component.user = { email: 'test@gmail.com', passwordHash: '1234' };

    await component.submit();

    expect(axios.post).toHaveBeenCalled();
    // ✅ Adjusted to include exclamation mark
    expect(component.message).toBe('Login successful!');
  });

  it('should show error on invalid credentials', async () => {
    spyOn(axios, 'post').and.returnValue(
      Promise.reject({ response: { data: { message: 'Invalid credentials' } } })
    );
    component.user = { email: 'wrong@gmail.com', passwordHash: '1234' };

    await component.submit();

    expect(component.error).toBe('Invalid credentials');
  });
});
