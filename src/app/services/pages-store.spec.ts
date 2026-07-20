import { TestBed } from '@angular/core/testing';

import { PagesStore } from './pages-store';

describe('PagesStore', () => {
  let service: PagesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PagesStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
