import { TestBed } from '@angular/core/testing';

import { TokenRefresh } from './token-refresh';

describe('TokenRefresh', () => {
  let service: TokenRefresh;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenRefresh);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
