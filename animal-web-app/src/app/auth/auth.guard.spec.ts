import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { LoginRegisterService } from '../services/login-register.service';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let loginRegisterServiceSpy: jasmine.SpyObj<LoginRegisterService>;
  let router: Router;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('LoginRegisterService', ['getUserDetails']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: LoginRegisterService, useValue: spy }
      ]
    });

    authGuard = TestBed.inject(AuthGuard);
    loginRegisterServiceSpy = TestBed.inject(LoginRegisterService) as jasmine.SpyObj<LoginRegisterService>;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should allow navigation if user has the required role', async () => {
    const mockUser = { userAccountType: 3 };
    loginRegisterServiceSpy.getUserDetails.and.returnValue(Promise.resolve(mockUser));

    const next = { data: { requiredRole: 3 } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = await authGuard.canActivate(next, state);
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should redirect to unauthorized if user does not have the required role', async () => {
    const mockUser = { userAccountType: 2 };
    loginRegisterServiceSpy.getUserDetails.and.returnValue(Promise.resolve(mockUser));

    const next = { data: { requiredRole: 3 } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = await authGuard.canActivate(next, state);
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});
