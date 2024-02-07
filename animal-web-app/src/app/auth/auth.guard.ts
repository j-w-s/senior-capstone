import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginRegisterService } from '../services/login-register.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private loginReg: LoginRegisterService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRole = next.data['expectedRole'];
    return this.loginReg.getUserDetails(this.loginReg.currentUser)
      .then((user) => {
        if (user && user.userAccountType === expectedRole) {
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      })
      .catch(err => {
        console.error('Error getting user details: ', err);
        this.router.navigate(['/unauthorized']);
        return false;
      });
  }
}
