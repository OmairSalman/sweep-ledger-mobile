import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRolesModal } from './user-roles.page';

describe('UserRolesPage', () => {
  let component: UserRolesModal;
  let fixture: ComponentFixture<UserRolesModal>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRolesModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
