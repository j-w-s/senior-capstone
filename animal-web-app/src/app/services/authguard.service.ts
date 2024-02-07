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
    // get the user's details from the service
    return this.loginRegisterService.getUserDetails(this.loginRegisterService.currentUser)
      .then(user => {
        // check if the user has the required role
        const requiredRole = next.data['requiredRole'];
        if (user && user.userAccountType === requiredRole) {
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      })
      .catch(err => {
        console.error('Error getting user details: ', err);
        this.router.navigate(['/unauthorized']); // red. to an unauthorized page
        return false;
      });
  }
}
