import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginRegisterService } from '../services/login-register.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private loginRegService: LoginRegisterService, private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        localStorage.setItem('lastKnownRoute', event.urlAfterRedirects);
      }
    });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRole = next.data['expectedRole'];
    const currentUser = this.loginRegService.currentUser;
    const userDetails = this.loginRegService.loadUserDetailsFromCache(currentUser);
    if (!this.router.navigated) {
      if (userDetails && (userDetails.userAccountType as number == expectedRole as number)) {
        return true;
      } else {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }
    else {
      return true;
    }
  }
}
