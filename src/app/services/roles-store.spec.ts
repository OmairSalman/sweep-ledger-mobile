import { TestBed } from '@angular/core/testing';

import { RolesStore } from './roles-store';

describe('RolesStore', () => {
  let service: RolesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolesStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
