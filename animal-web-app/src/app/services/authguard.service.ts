import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginRegisterService } from './login-register.service';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService implements CanActivate {
  public userId!: string;
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
    let expectedRole = next.data['expectedRole'];
    if (!this.userId) {
      this.userId = this.loginRegService.getUserId();
    }
    const currentUser = this.userId;
    const userDetails = this.loginRegService.loadUserDetailsFromCache(currentUser);
    expectedRole = expectedRole as number;
    if (this.router.navigated) {
      if (userDetails && (userDetails.userAccountType === expectedRole)) {
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
