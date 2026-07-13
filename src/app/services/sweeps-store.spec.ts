import { TestBed } from '@angular/core/testing';

import { SweepsStore } from './sweeps-store';

describe('SweepsStore', () => {
  let service: SweepsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SweepsStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
