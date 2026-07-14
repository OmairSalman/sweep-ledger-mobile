import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationFormPage } from './notification-form.page';

describe('NotificationFormPage', () => {
  let component: NotificationFormPage;
  let fixture: ComponentFixture<NotificationFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
