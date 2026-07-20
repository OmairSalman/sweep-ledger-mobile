import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageFormModal } from './page-form.page';

describe('PageFormPage', () => {
  let component: PageFormModal;
  let fixture: ComponentFixture<PageFormModal>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PageFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
