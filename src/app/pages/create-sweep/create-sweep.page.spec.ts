import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateSweepPage } from './create-sweep.page';

describe('CreateSweepPage', () => {
  let component: CreateSweepPage;
  let fixture: ComponentFixture<CreateSweepPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSweepPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
