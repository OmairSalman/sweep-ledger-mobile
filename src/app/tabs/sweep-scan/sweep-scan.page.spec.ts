import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SweepScanPage } from './sweep-scan.page';

describe('SweepScanPage', () => {
  let component: SweepScanPage;
  let fixture: ComponentFixture<SweepScanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SweepScanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
