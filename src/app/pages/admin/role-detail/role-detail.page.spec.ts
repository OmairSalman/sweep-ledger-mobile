import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleDetailPage } from './role-detail.page';

describe('RoleDetailPage', () => {
  let component: RoleDetailPage;
  let fixture: ComponentFixture<RoleDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
