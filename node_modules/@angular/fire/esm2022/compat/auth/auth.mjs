import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, InjectionToken, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { keepUnstableUntilFirst, ɵAngularFireSchedulers } from '@angular/fire';
import { AppCheckInstances } from '@angular/fire/app-check';
import { ɵapplyMixins, ɵlazySDKProxy } from '@angular/fire/compat';
import { FIREBASE_APP_NAME, FIREBASE_OPTIONS, ɵcacheInstance, ɵfirebaseAppFactory } from '@angular/fire/compat';
import { Observable, Subject, from, merge, of } from 'rxjs';
import { filter, first, map, observeOn, shareReplay, subscribeOn, switchMap, switchMapTo } from 'rxjs/operators';
import { proxyPolyfillCompat } from './base';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire";
import * as i2 from "@angular/fire/app-check";
export const USE_EMULATOR = new InjectionToken('angularfire2.auth.use-emulator');
export const SETTINGS = new InjectionToken('angularfire2.auth.settings');
export const TENANT_ID = new InjectionToken('angularfire2.auth.tenant-id');
export const LANGUAGE_CODE = new InjectionToken('angularfire2.auth.langugage-code');
export const USE_DEVICE_LANGUAGE = new InjectionToken('angularfire2.auth.use-device-language');
export const PERSISTENCE = new InjectionToken('angularfire.auth.persistence');
export const ɵauthFactory = (app, zone, useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence) => ɵcacheInstance(`${app.name}.auth`, 'AngularFireAuth', app.name, () => {
    const auth = zone.runOutsideAngular(() => app.auth());
    if (useEmulator) {
        auth.useEmulator(...useEmulator);
    }
    if (tenantId) {
        auth.tenantId = tenantId;
    }
    auth.languageCode = languageCode;
    if (useDeviceLanguage) {
        auth.useDeviceLanguage();
    }
    if (settings) {
        for (const [k, v] of Object.entries(settings)) {
            auth.settings[k] = v;
        }
    }
    if (persistence) {
        auth.setPersistence(persistence);
    }
    return auth;
}, [useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence]);
export class AngularFireAuth {
    /**
     * Observable of authentication state; as of Firebase 4.0 this is only triggered via sign-in/out
     */
    authState;
    /**
     * Observable of the currently signed-in user's JWT token used to identify the user to a Firebase service (or null).
     */
    idToken;
    /**
     * Observable of the currently signed-in user (or null).
     */
    user;
    /**
     * Observable of the currently signed-in user's IdTokenResult object which contains the ID token JWT string and other
     * helper properties for getting different data associated with the token as well as all the decoded payload claims
     * (or null).
     */
    idTokenResult;
    /**
     * Observable of the currently signed-in user's credential, or null
     */
    credential;
    constructor(options, name, 
    // eslint-disable-next-line @typescript-eslint/ban-types
    platformId, zone, schedulers, useEmulator, // can't use the tuple here
    settings, // can't use firebase.auth.AuthSettings here
    tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
        const logins = new Subject();
        const auth = of(undefined).pipe(observeOn(schedulers.outsideAngular), switchMap(() => zone.runOutsideAngular(() => import('firebase/compat/auth'))), map(() => ɵfirebaseAppFactory(options, zone, name)), map(app => ɵauthFactory(app, zone, useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence)), shareReplay({ bufferSize: 1, refCount: false }));
        if (isPlatformServer(platformId)) {
            this.authState = this.user = this.idToken = this.idTokenResult = this.credential = of(null);
        }
        else {
            // HACK, as we're exporting auth.Auth, rather than auth, developers importing firebase.auth
            //       (e.g, `import { auth } from 'firebase/compat/app'`) are getting an undefined auth object unexpectedly
            //       as we're completely lazy. Let's eagerly load the Auth SDK here.
            //       There could potentially be race conditions still... but this greatly decreases the odds while
            //       we reevaluate the API.
            auth.pipe(first()).subscribe();
            const redirectResult = auth.pipe(switchMap(auth => auth.getRedirectResult().then(it => it, () => null)), keepUnstableUntilFirst, shareReplay({ bufferSize: 1, refCount: false }));
            const authStateChanged = auth.pipe(switchMap(auth => new Observable(sub => ({ unsubscribe: zone.runOutsideAngular(() => auth.onAuthStateChanged(next => sub.next(next), err => sub.error(err), () => sub.complete())) }))));
            const idTokenChanged = auth.pipe(switchMap(auth => new Observable(sub => ({ unsubscribe: zone.runOutsideAngular(() => auth.onIdTokenChanged(next => sub.next(next), err => sub.error(err), () => sub.complete())) }))));
            this.authState = redirectResult.pipe(switchMapTo(authStateChanged), subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
            this.user = redirectResult.pipe(switchMapTo(idTokenChanged), subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
            this.idToken = this.user.pipe(switchMap(user => user ? from(user.getIdToken()) : of(null)));
            this.idTokenResult = this.user.pipe(switchMap(user => user ? from(user.getIdTokenResult()) : of(null)));
            this.credential = merge(redirectResult, logins, 
            // pipe in null authState to make credential zipable, just a weird devexp if
            // authState and user go null to still have a credential
            this.authState.pipe(filter(it => !it))).pipe(
            // handle the { user: { } } when a user is already logged in, rather have null
            // TODO handle the type corcersion better
            map(credential => credential?.user ? credential : null), subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
        }
        return ɵlazySDKProxy(this, auth, zone, { spy: {
                apply: (name, _, val) => {
                    // If they call a signIn or createUser function listen into the promise
                    // this will give us the user credential, push onto the logins Subject
                    // to be consumed in .credential
                    if (name.startsWith('signIn') || name.startsWith('createUser')) {
                        // TODO fix the types, the trouble is UserCredential has everything optional
                        val.then((user) => logins.next(user));
                    }
                }
            } });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireAuth, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: USE_EMULATOR, optional: true }, { token: SETTINGS, optional: true }, { token: TENANT_ID, optional: true }, { token: LANGUAGE_CODE, optional: true }, { token: USE_DEVICE_LANGUAGE, optional: true }, { token: PERSISTENCE, optional: true }, { token: i2.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireAuth, providedIn: 'any' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireAuth, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'any'
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [FIREBASE_OPTIONS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [FIREBASE_APP_NAME]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.NgZone }, { type: i1.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_EMULATOR]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [SETTINGS]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [TENANT_ID]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [LANGUAGE_CODE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_DEVICE_LANGUAGE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [PERSISTENCE]
                }] }, { type: i2.AppCheckInstances, decorators: [{
                    type: Optional
                }] }] });
ɵapplyMixins(AngularFireAuth, [proxyPolyfillCompat]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wYXQvYXV0aC9hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDL0UsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDNUQsT0FBTyxFQUFpQixZQUFZLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFlLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRzdILE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzVELE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDakgsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sUUFBUSxDQUFDOzs7O0FBTTdDLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBdUIsZ0NBQWdDLENBQUMsQ0FBQztBQUV2RyxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxjQUFjLENBQTZCLDRCQUE0QixDQUFDLENBQUM7QUFDckcsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksY0FBYyxD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RSxnQ0FBZ0M7b0JBQ2hDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFO3dCQUM5RCw0RUFBNEU7d0JBQzVFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFrQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQVcsQ0FBQyxDQUFDLENBQUM7cUJBQzVFO2dCQUNILENBQUM7YUFDRixFQUFDLENBQUMsQ0FBQztJQUVOLENBQUM7dUdBN0lVLGVBQWUsa0JBOEJoQixnQkFBZ0IsYUFDSixpQkFBaUIsNkJBRTdCLFdBQVcseUVBR0MsWUFBWSw2QkFDWixRQUFRLDZCQUNSLFNBQVMsNkJBQ1QsYUFBYSw2QkFDYixtQkFBbUIsNkJBQ25CLFdBQVc7MkdBekN0QixlQUFlLGNBRmQsS0FBSzs7MkZBRU4sZUFBZTtrQkFIM0IsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsS0FBSztpQkFDbEI7OzBCQStCSSxNQUFNOzJCQUFDLGdCQUFnQjs7MEJBQ3ZCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsaUJBQWlCOzswQkFFcEMsTUFBTTsyQkFBQyxXQUFXOzswQkFHbEIsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxZQUFZOzswQkFDL0IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxRQUFROzswQkFDM0IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxTQUFTOzswQkFDNUIsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxhQUFhOzswQkFDaEMsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxtQkFBbUI7OzBCQUN0QyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFdBQVc7OzBCQUM5QixRQUFROztBQXVHYixZQUFZLENBQUMsZUFBZSxFQUFFLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBOZ1pvbmUsIE9wdGlvbmFsLCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsga2VlcFVuc3RhYmxlVW50aWxGaXJzdCwgybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMgfSBmcm9tICdAYW5ndWxhci9maXJlJztcbmltcG9ydCB7IEFwcENoZWNrSW5zdGFuY2VzIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9hcHAtY2hlY2snO1xuaW1wb3J0IHsgybVQcm9taXNlUHJveHksIMm1YXBwbHlNaXhpbnMsIMm1bGF6eVNES1Byb3h5IH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9jb21wYXQnO1xuaW1wb3J0IHsgRklSRUJBU0VfQVBQX05BTUUsIEZJUkVCQVNFX09QVElPTlMsIEZpcmViYXNlQXBwLCDJtWNhY2hlSW5zdGFuY2UsIMm1ZmlyZWJhc2VBcHBGYWN0b3J5IH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9jb21wYXQnO1xuaW1wb3J0IHsgRmlyZWJhc2VPcHRpb25zIH0gZnJvbSAnZmlyZWJhc2UvYXBwJztcbmltcG9ydCBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZS9jb21wYXQvYXBwJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QsIGZyb20sIG1lcmdlLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZmlsdGVyLCBmaXJzdCwgbWFwLCBvYnNlcnZlT24sIHNoYXJlUmVwbGF5LCBzdWJzY3JpYmVPbiwgc3dpdGNoTWFwLCBzd2l0Y2hNYXBUbyB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IHByb3h5UG9seWZpbGxDb21wYXQgfSBmcm9tICcuL2Jhc2UnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWludGVyZmFjZVxuZXhwb3J0IGludGVyZmFjZSBBbmd1bGFyRmlyZUF1dGggZXh0ZW5kcyDJtVByb21pc2VQcm94eTxmaXJlYmFzZS5hdXRoLkF1dGg+IHt9XG5cbnR5cGUgVXNlRW11bGF0b3JBcmd1bWVudHMgPSBQYXJhbWV0ZXJzPGZpcmViYXNlLmF1dGguQXV0aFsndXNlRW11bGF0b3InXT47XG5leHBvcnQgY29uc3QgVVNFX0VNVUxBVE9SID0gbmV3IEluamVjdGlvblRva2VuPFVzZUVtdWxhdG9yQXJndW1lbnRzPignYW5ndWxhcmZpcmUyLmF1dGgudXNlLWVtdWxhdG9yJyk7XG5cbmV4cG9ydCBjb25zdCBTRVRUSU5HUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxmaXJlYmFzZS5hdXRoLkF1dGhTZXR0aW5ncz4oJ2FuZ3VsYXJmaXJlMi5hdXRoLnNldHRpbmdzJyk7XG5leHBvcnQgY29uc3QgVEVOQU5UX0lEID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ2FuZ3VsYXJmaXJlMi5hdXRoLnRlbmFudC1pZCcpO1xuZXhwb3J0IGNvbnN0IExBTkdVQUdFX0NPREUgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignYW5ndWxhcmZpcmUyLmF1dGgubGFuZ3VnYWdlLWNvZGUnKTtcbmV4cG9ydCBjb25zdCBVU0VfREVWSUNFX0xBTkdVQUdFID0gbmV3IEluamVjdGlvblRva2VuPGJvb2xlYW4+KCdhbmd1bGFyZmlyZTIuYXV0aC51c2UtZGV2aWNlLWxhbmd1YWdlJyk7XG5leHBvcnQgY29uc3QgUEVSU0lTVEVOQ0UgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignYW5ndWxhcmZpcmUuYXV0aC5wZXJzaXN0ZW5jZScpO1xuXG5leHBvcnQgY29uc3QgybVhdXRoRmFjdG9yeSA9IChcbiAgYXBwOiBGaXJlYmFzZUFwcCwgem9uZTogTmdab25lLCB1c2VFbXVsYXRvcjogVXNlRW11bGF0b3JBcmd1bWVudHN8bnVsbCxcbiAgdGVuYW50SWQ6IHN0cmluZywgbGFuZ3VhZ2VDb2RlOiBzdHJpbmd8bnVsbCwgdXNlRGV2aWNlTGFuZ3VhZ2U6IGJvb2xlYW58bnVsbCxcbiAgc2V0dGluZ3M6IGZpcmViYXNlLmF1dGguQXV0aFNldHRpbmdzfG51bGwsIHBlcnNpc3RlbmNlOiBzdHJpbmd8bnVsbCxcbikgPT4gybVjYWNoZUluc3RhbmNlKGAke2FwcC5uYW1lfS5hdXRoYCwgJ0FuZ3VsYXJGaXJlQXV0aCcsIGFwcC5uYW1lLCAoKSA9PiB7XG4gIGNvbnN0IGF1dGggPSB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGFwcC5hdXRoKCkpO1xuICBpZiAodXNlRW11bGF0b3IpIHtcbiAgICBhdXRoLnVzZUVtdWxhdG9yKC4uLnVzZUVtdWxhdG9yKTtcbiAgfVxuICBpZiAodGVuYW50SWQpIHtcbiAgICBhdXRoLnRlbmFudElkID0gdGVuYW50SWQ7XG4gIH1cbiAgYXV0aC5sYW5ndWFnZUNvZGUgPSBsYW5ndWFnZUNvZGU7XG4gIGlmICh1c2VEZXZpY2VMYW5ndWFnZSkge1xuICAgIGF1dGgudXNlRGV2aWNlTGFuZ3VhZ2UoKTtcbiAgfVxuICBpZiAoc2V0dGluZ3MpIHtcbiAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhzZXR0aW5ncykpIHtcbiAgICAgIGF1dGguc2V0dGluZ3Nba10gPSB2O1xuICAgIH1cbiAgfVxuICBpZiAocGVyc2lzdGVuY2UpIHtcbiAgICBhdXRoLnNldFBlcnNpc3RlbmNlKHBlcnNpc3RlbmNlKTtcbiAgfVxuICByZXR1cm4gYXV0aDtcbn0sIFt1c2VFbXVsYXRvciwgdGVuYW50SWQsIGxhbmd1YWdlQ29kZSwgdXNlRGV2aWNlTGFuZ3VhZ2UsIHNldHRpbmdzLCBwZXJzaXN0ZW5jZV0pO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdhbnknXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGaXJlQXV0aCB7XG5cbiAgLyoqXG4gICAqIE9ic2VydmFibGUgb2YgYXV0aGVudGljYXRpb24gc3RhdGU7IGFzIG9mIEZpcmViYXNlIDQuMCB0aGlzIGlzIG9ubHkgdHJpZ2dlcmVkIHZpYSBzaWduLWluL291dFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGF1dGhTdGF0ZTogT2JzZXJ2YWJsZTxmaXJlYmFzZS5Vc2VyfG51bGw+O1xuXG4gIC8qKlxuICAgKiBPYnNlcnZhYmxlIG9mIHRoZSBjdXJyZW50bHkgc2lnbmVkLWluIHVzZXIncyBKV1QgdG9rZW4gdXNlZCB0byBpZGVudGlmeSB0aGUgdXNlciB0byBhIEZpcmViYXNlIHNlcnZpY2UgKG9yIG51bGwpLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGlkVG9rZW46IE9ic2VydmFibGU8c3RyaW5nfG51bGw+O1xuXG4gIC8qKlxuICAgKiBPYnNlcnZhYmxlIG9mIHRoZSBjdXJyZW50bHkgc2lnbmVkLWluIHVzZXIgKG9yIG51bGwpLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHVzZXI6IE9ic2VydmFibGU8ZmlyZWJhc2UuVXNlcnxudWxsPjtcblxuICAvKipcbiAgICogT2JzZXJ2YWJsZSBvZiB0aGUgY3VycmVudGx5IHNpZ25lZC1pbiB1c2VyJ3MgSWRUb2tlblJlc3VsdCBvYmplY3Qgd2hpY2ggY29udGFpbnMgdGhlIElEIHRva2VuIEpXVCBzdHJpbmcgYW5kIG90aGVyXG4gICAqIGhlbHBlciBwcm9wZXJ0aWVzIGZvciBnZXR0aW5nIGRpZmZlcmVudCBkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGUgdG9rZW4gYXMgd2VsbCBhcyBhbGwgdGhlIGRlY29kZWQgcGF5bG9hZCBjbGFpbXNcbiAgICogKG9yIG51bGwpLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGlkVG9rZW5SZXN1bHQ6IE9ic2VydmFibGU8ZmlyZWJhc2UuYXV0aC5JZFRva2VuUmVzdWx0fG51bGw+O1xuXG4gIC8qKlxuICAgKiBPYnNlcnZhYmxlIG9mIHRoZSBjdXJyZW50bHkgc2lnbmVkLWluIHVzZXIncyBjcmVkZW50aWFsLCBvciBudWxsXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY3JlZGVudGlhbDogT2JzZXJ2YWJsZTxSZXF1aXJlZDxmaXJlYmFzZS5hdXRoLlVzZXJDcmVkZW50aWFsPnxudWxsPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KEZJUkVCQVNFX09QVElPTlMpIG9wdGlvbnM6IEZpcmViYXNlT3B0aW9ucyxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEZJUkVCQVNFX0FQUF9OQU1FKSBuYW1lOiBzdHJpbmd8bnVsbHx1bmRlZmluZWQsXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHlwZXNcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgem9uZTogTmdab25lLFxuICAgIHNjaGVkdWxlcnM6IMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVVNFX0VNVUxBVE9SKSB1c2VFbXVsYXRvcjogYW55LCAvLyBjYW4ndCB1c2UgdGhlIHR1cGxlIGhlcmVcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFNFVFRJTkdTKSBzZXR0aW5nczogYW55LCAvLyBjYW4ndCB1c2UgZmlyZWJhc2UuYXV0aC5BdXRoU2V0dGluZ3MgaGVyZVxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVEVOQU5UX0lEKSB0ZW5hbnRJZDogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KExBTkdVQUdFX0NPREUpIGxhbmd1YWdlQ29kZTogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVTRV9ERVZJQ0VfTEFOR1VBR0UpIHVzZURldmljZUxhbmd1YWdlOiBib29sZWFuIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBFUlNJU1RFTkNFKSBwZXJzaXN0ZW5jZTogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBfYXBwQ2hlY2tJbnN0YW5jZXM6IEFwcENoZWNrSW5zdGFuY2VzLFxuICApIHtcbiAgICBjb25zdCBsb2dpbnMgPSBuZXcgU3ViamVjdDxSZXF1aXJlZDxmaXJlYmFzZS5hdXRoLlVzZXJDcmVkZW50aWFsPj4oKTtcblxuICAgIGNvbnN0IGF1dGggPSBvZih1bmRlZmluZWQpLnBpcGUoXG4gICAgICBvYnNlcnZlT24oc2NoZWR1bGVycy5vdXRzaWRlQW5ndWxhciksXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBpbXBvcnQoJ2ZpcmViYXNlL2NvbXBhdC9hdXRoJykpKSxcbiAgICAgIG1hcCgoKSA9PiDJtWZpcmViYXNlQXBwRmFjdG9yeShvcHRpb25zLCB6b25lLCBuYW1lKSksXG4gICAgICBtYXAoYXBwID0+IMm1YXV0aEZhY3RvcnkoYXBwLCB6b25lLCB1c2VFbXVsYXRvciwgdGVuYW50SWQsIGxhbmd1YWdlQ29kZSwgdXNlRGV2aWNlTGFuZ3VhZ2UsIHNldHRpbmdzLCBwZXJzaXN0ZW5jZSkpLFxuICAgICAgc2hhcmVSZXBsYXkoeyBidWZmZXJTaXplOiAxLCByZWZDb3VudDogZmFsc2UgfSksXG4gICAgKTtcblxuICAgIGlmIChpc1BsYXRmb3JtU2VydmVyKHBsYXRmb3JtSWQpKSB7XG5cbiAgICAgIHRoaXMuYXV0aFN0YXRlID0gdGhpcy51c2VyID0gdGhpcy5pZFRva2VuID0gdGhpcy5pZFRva2VuUmVzdWx0ID0gdGhpcy5jcmVkZW50aWFsID0gb2YobnVsbCk7XG5cbiAgICB9IGVsc2Uge1xuXG4gICAgICAvLyBIQUNLLCBhcyB3ZSdyZSBleHBvcnRpbmcgYXV0aC5BdXRoLCByYXRoZXIgdGhhbiBhdXRoLCBkZXZlbG9wZXJzIGltcG9ydGluZyBmaXJlYmFzZS5hdXRoXG4gICAgICAvLyAgICAgICAoZS5nLCBgaW1wb3J0IHsgYXV0aCB9IGZyb20gJ2ZpcmViYXNlL2NvbXBhdC9hcHAnYCkgYXJlIGdldHRpbmcgYW4gdW5kZWZpbmVkIGF1dGggb2JqZWN0IHVuZXhwZWN0ZWRseVxuICAgICAgLy8gICAgICAgYXMgd2UncmUgY29tcGxldGVseSBsYXp5LiBMZXQncyBlYWdlcmx5IGxvYWQgdGhlIEF1dGggU0RLIGhlcmUuXG4gICAgICAvLyAgICAgICBUaGVyZSBjb3VsZCBwb3RlbnRpYWxseSBiZSByYWNlIGNvbmRpdGlvbnMgc3RpbGwuLi4gYnV0IHRoaXMgZ3JlYXRseSBkZWNyZWFzZXMgdGhlIG9kZHMgd2hpbGVcbiAgICAgIC8vICAgICAgIHdlIHJlZXZhbHVhdGUgdGhlIEFQSS5cbiAgICAgIGF1dGgucGlwZShmaXJzdCgpKS5zdWJzY3JpYmUoKTtcblxuICAgICAgY29uc3QgcmVkaXJlY3RSZXN1bHQgPSBhdXRoLnBpcGUoXG4gICAgICAgIHN3aXRjaE1hcChhdXRoID0+IGF1dGguZ2V0UmVkaXJlY3RSZXN1bHQoKS50aGVuKGl0ID0+IGl0LCAoKSA9PiBudWxsKSksXG4gICAgICAgIGtlZXBVbnN0YWJsZVVudGlsRmlyc3QsXG4gICAgICAgIHNoYXJlUmVwbGF5KHsgYnVmZmVyU2l6ZTogMSwgcmVmQ291bnQ6IGZhbHNlIH0pLFxuICAgICAgKTtcblxuICAgICAgY29uc3QgYXV0aFN0YXRlQ2hhbmdlZCA9IGF1dGgucGlwZShcbiAgICAgICAgc3dpdGNoTWFwKGF1dGggPT4gbmV3IE9ic2VydmFibGU8ZmlyZWJhc2UuVXNlcnxudWxsPihzdWIgPT5cbiAgICAgICAgICAoeyB1bnN1YnNjcmliZTogem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBhdXRoLm9uQXV0aFN0YXRlQ2hhbmdlZChcbiAgICAgICAgICAgIG5leHQgPT4gc3ViLm5leHQobmV4dCksXG4gICAgICAgICAgICBlcnIgPT4gc3ViLmVycm9yKGVyciksXG4gICAgICAgICAgICAoKSA9PiBzdWIuY29tcGxldGUoKVxuICAgICAgICAgICkpfSlcbiAgICAgICAgKSksXG4gICAgICApO1xuXG4gICAgICBjb25zdCBpZFRva2VuQ2hhbmdlZCA9IGF1dGgucGlwZShcbiAgICAgICAgc3dpdGNoTWFwKGF1dGggPT4gbmV3IE9ic2VydmFibGU8ZmlyZWJhc2UuVXNlcnxudWxsPihzdWIgPT5cbiAgICAgICAgICAoeyB1bnN1YnNjcmliZTogem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBhdXRoLm9uSWRUb2tlbkNoYW5nZWQoXG4gICAgICAgICAgICBuZXh0ID0+IHN1Yi5uZXh0KG5leHQpLFxuICAgICAgICAgICAgZXJyID0+IHN1Yi5lcnJvcihlcnIpLFxuICAgICAgICAgICAgKCkgPT4gc3ViLmNvbXBsZXRlKClcbiAgICAgICAgICApKX0pXG4gICAgICAgICkpXG4gICAgICApO1xuXG4gICAgICB0aGlzLmF1dGhTdGF0ZSA9IHJlZGlyZWN0UmVzdWx0LnBpcGUoXG4gICAgICAgIHN3aXRjaE1hcFRvKGF1dGhTdGF0ZUNoYW5nZWQpLFxuICAgICAgICBzdWJzY3JpYmVPbihzY2hlZHVsZXJzLm91dHNpZGVBbmd1bGFyKSxcbiAgICAgICAgb2JzZXJ2ZU9uKHNjaGVkdWxlcnMuaW5zaWRlQW5ndWxhciksXG4gICAgICApO1xuXG4gICAgICB0aGlzLnVzZXIgPSByZWRpcmVjdFJlc3VsdC5waXBlKFxuICAgICAgICBzd2l0Y2hNYXBUbyhpZFRva2VuQ2hhbmdlZCksXG4gICAgICAgIHN1YnNjcmliZU9uKHNjaGVkdWxlcnMub3V0c2lkZUFuZ3VsYXIpLFxuICAgICAgICBvYnNlcnZlT24oc2NoZWR1bGVycy5pbnNpZGVBbmd1bGFyKSxcbiAgICAgICk7XG5cbiAgICAgIHRoaXMuaWRUb2tlbiA9IHRoaXMudXNlci5waXBlKFxuICAgICAgICBzd2l0Y2hNYXAodXNlciA9PiB1c2VyID8gZnJvbSh1c2VyLmdldElkVG9rZW4oKSkgOiBvZihudWxsKSlcbiAgICAgICk7XG5cbiAgICAgIHRoaXMuaWRUb2tlblJlc3VsdCA9IHRoaXMudXNlci5waXBlKFxuICAgICAgICBzd2l0Y2hNYXAodXNlciA9PiB1c2VyID8gZnJvbSh1c2VyLmdldElkVG9rZW5SZXN1bHQoKSkgOiBvZihudWxsKSlcbiAgICAgICk7XG5cbiAgICAgIHRoaXMuY3JlZGVudGlhbCA9IG1lcmdlKFxuICAgICAgICByZWRpcmVjdFJlc3VsdCxcbiAgICAgICAgbG9naW5zLFxuICAgICAgICAvLyBwaXBlIGluIG51bGwgYXV0aFN0YXRlIHRvIG1ha2UgY3JlZGVudGlhbCB6aXBhYmxlLCBqdXN0IGEgd2VpcmQgZGV2ZXhwIGlmXG4gICAgICAgIC8vIGF1dGhTdGF0ZSBhbmQgdXNlciBnbyBudWxsIHRvIHN0aWxsIGhhdmUgYSBjcmVkZW50aWFsXG4gICAgICAgIHRoaXMuYXV0aFN0YXRlLnBpcGUoZmlsdGVyKGl0ID0+ICFpdCkpXG4gICAgICApLnBpcGUoXG4gICAgICAgIC8vIGhhbmRsZSB0aGUgeyB1c2VyOiB7IH0gfSB3aGVuIGEgdXNlciBpcyBhbHJlYWR5IGxvZ2dlZCBpbiwgcmF0aGVyIGhhdmUgbnVsbFxuICAgICAgICAvLyBUT0RPIGhhbmRsZSB0aGUgdHlwZSBjb3JjZXJzaW9uIGJldHRlclxuICAgICAgICBtYXAoY3JlZGVudGlhbCA9PiBjcmVkZW50aWFsPy51c2VyID8gY3JlZGVudGlhbCBhcyBSZXF1aXJlZDxmaXJlYmFzZS5hdXRoLlVzZXJDcmVkZW50aWFsPiA6IG51bGwpLFxuICAgICAgICBzdWJzY3JpYmVPbihzY2hlZHVsZXJzLm91dHNpZGVBbmd1bGFyKSxcbiAgICAgICAgb2JzZXJ2ZU9uKHNjaGVkdWxlcnMuaW5zaWRlQW5ndWxhciksXG4gICAgICApO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIMm1bGF6eVNES1Byb3h5KHRoaXMsIGF1dGgsIHpvbmUsIHsgc3B5OiB7XG4gICAgICBhcHBseTogKG5hbWUsIF8sIHZhbCkgPT4ge1xuICAgICAgICAvLyBJZiB0aGV5IGNhbGwgYSBzaWduSW4gb3IgY3JlYXRlVXNlciBmdW5jdGlvbiBsaXN0ZW4gaW50byB0aGUgcHJvbWlzZVxuICAgICAgICAvLyB0aGlzIHdpbGwgZ2l2ZSB1cyB0aGUgdXNlciBjcmVkZW50aWFsLCBwdXNoIG9udG8gdGhlIGxvZ2lucyBTdWJqZWN0XG4gICAgICAgIC8vIHRvIGJlIGNvbnN1bWVkIGluIC5jcmVkZW50aWFsXG4gICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ3NpZ25JbicpIHx8IG5hbWUuc3RhcnRzV2l0aCgnY3JlYXRlVXNlcicpKSB7XG4gICAgICAgICAgLy8gVE9ETyBmaXggdGhlIHR5cGVzLCB0aGUgdHJvdWJsZSBpcyBVc2VyQ3JlZGVudGlhbCBoYXMgZXZlcnl0aGluZyBvcHRpb25hbFxuICAgICAgICAgIHZhbC50aGVuKCh1c2VyOiBmaXJlYmFzZS5hdXRoLlVzZXJDcmVkZW50aWFsKSA9PiBsb2dpbnMubmV4dCh1c2VyIGFzIGFueSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfX0pO1xuXG4gIH1cblxufVxuXG7JtWFwcGx5TWl4aW5zKEFuZ3VsYXJGaXJlQXV0aCwgW3Byb3h5UG9seWZpbGxDb21wYXRdKTtcbiJdfQ==