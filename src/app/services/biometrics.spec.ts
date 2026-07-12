import { TestBed } from '@angular/core/testing';

import { Biometrics } from './biometrics';

describe('Biometrics', () => {
  let service: Biometrics;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Biometrics);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
