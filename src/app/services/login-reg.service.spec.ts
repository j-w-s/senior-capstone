import { TestBed } from '@angular/core/testing';

import { LoginRegService } from './login-reg.service';

describe('LoginRegService', () => {
  let service: LoginRegService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginRegService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
