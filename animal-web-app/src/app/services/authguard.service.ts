import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginRegisterService } from './login-register.service';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService implements CanActivate {
  user$: any;
  constructor(private loginRegisterService: LoginRegisterService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRole = next.data['expectedRole'];
    const currentUser = this.loginRegisterService.currentUser;
    const userDetails = this.loginRegisterService.loadUserDetailsFromCache(currentUser);

    if (userDetails && (userDetails.userAccountType as number == expectedRole as number)) {
      return true;
    } else {
      return false;
    }
  }
}
