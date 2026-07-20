import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { pickerGuard } from './picker-guard';

describe('pickerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pickerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
