import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesListPage } from './roles-list.page';

describe('RolesListPage', () => {
  let component: RolesListPage;
  let fixture: ComponentFixture<RolesListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
