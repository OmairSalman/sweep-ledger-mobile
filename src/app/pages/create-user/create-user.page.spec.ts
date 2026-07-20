import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateUserModal } from './create-user.page';

describe('CreateUserPage', () => {
  let component: CreateUserModal;
  let fixture: ComponentFixture<CreateUserModal>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUserModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
