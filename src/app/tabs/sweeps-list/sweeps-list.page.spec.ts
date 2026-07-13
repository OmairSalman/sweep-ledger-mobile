import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SweepsListPage } from './sweeps-list.page';

describe('SweepsListPage', () => {
  let component: SweepsListPage;
  let fixture: ComponentFixture<SweepsListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SweepsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
