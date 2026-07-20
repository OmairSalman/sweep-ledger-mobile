import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagesListPage } from './pages-list.page';

describe('PagesListPage', () => {
  let component: PagesListPage;
  let fixture: ComponentFixture<PagesListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
