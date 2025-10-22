import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import axios from 'axios';

describe('RegisterComponent (Jasmine)', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, FormsModule, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if required fields missing', () => {
    component.user = { name: '', email: '', passwordHash: '' };
    component.submit();
    expect(component.error).toBe('Please fill all required fields');
  });

  it('should handle registration success', async () => {
    spyOn(axios, 'post').and.returnValue(Promise.resolve({ data: {} }));
    component.user = { name: 'John', email: 'john@gmail.com', passwordHash: '1234' };
    await component.submit();
    expect(component.message).toContain('Registration');
  });

  it('should handle registration error', async () => {
    spyOn(axios, 'post').and.returnValue(
      Promise.reject({ response: { data: { message: 'Failed' } } })
    );
    component.user = { name: 'John', email: 'john@gmail.com', passwordHash: '1234' };
    await component.submit();

    // ✅ Match actual stringified message
    expect(component.error).toContain('Failed');
  });
});
