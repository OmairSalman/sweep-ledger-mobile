import { TestBed } from '@angular/core/testing';

import { AssetsStore } from './assets-store';

describe('AssetsStore', () => {
  let service: AssetsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssetsStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
