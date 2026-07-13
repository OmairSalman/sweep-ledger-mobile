import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SweepDetailPage } from './sweep-detail.page';

describe('SweepDetailPage', () => {
  let component: SweepDetailPage;
  let fixture: ComponentFixture<SweepDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SweepDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
