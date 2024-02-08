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
    const currentUserId = this.loginReg.currentUser;
    const cachedUserDetails = this.loginReg.checkUserDetailsInCache(currentUserId);
    if (cachedUserDetails && cachedUserDetails.userAccountType === expectedRole) {
      return true;
    } else {
      // If not in cache or role mismatch, fetch from Firestore
      return this.loginReg.getUserDetails(currentUserId)
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

}
