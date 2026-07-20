import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleFormModal } from './role-form.page';

describe('RoleFormPage', () => {
  let component: RoleFormModal;
  let fixture: ComponentFixture<RoleFormModal>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
