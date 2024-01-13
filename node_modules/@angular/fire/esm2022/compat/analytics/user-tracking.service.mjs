import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { VERSION } from '@angular/fire';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFireAnalytics } from './analytics';
import * as i0 from "@angular/core";
import * as i1 from "./analytics";
import * as i2 from "@angular/fire/compat/auth";
export class UserTrackingService {
    initialized;
    disposables = [];
    // TODO a user properties injector
    constructor(analytics, 
    // eslint-disable-next-line @typescript-eslint/ban-types
    platformId, auth, zone) {
        firebase.registerVersion('angularfire', VERSION.full, 'compat-user-tracking');
        if (!isPlatformServer(platformId)) {
            let resolveInitialized;
            this.initialized = zone.runOutsideAngular(() => new Promise(resolve => resolveInitialized = resolve));
            this.disposables = [
                auth.authState.subscribe(user => {
                    analytics.setUserId(user?.uid);
                    resolveInitialized();
                }),
                auth.credential.subscribe(credential => {
                    if (credential) {
                        const method = credential.user.isAnonymous ? 'anonymous' : credential.additionalUserInfo.providerId;
                        if (credential.additionalUserInfo.isNewUser) {
                            analytics.logEvent('sign_up', { method });
                        }
                        analytics.logEvent('login', { method });
                    }
                })
            ];
        }
        else {
            this.initialized = Promise.resolve();
        }
    }
    ngOnDestroy() {
        this.disposables.forEach(it => it.unsubscribe());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: UserTrackingService, deps: [{ token: i1.AngularFireAnalytics }, { token: PLATFORM_ID }, { token: i2.AngularFireAuth }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: UserTrackingService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: UserTrackingService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.AngularFireAnalytics }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i2.AngularFireAuth }, { type: i0.NgZone }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci10cmFja2luZy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBhdC9hbmFseXRpY3MvdXNlci10cmFja2luZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBYSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN4QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDNUQsT0FBTyxRQUFRLE1BQU0scUJBQXFCLENBQUM7QUFFM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sYUFBYSxDQUFDOzs7O0FBR25ELE1BQU0sT0FBTyxtQkFBbUI7SUFFOUIsV0FBVyxDQUFnQjtJQUNuQixXQUFXLEdBQW1CLEVBQUUsQ0FBQztJQUV6QyxrQ0FBa0M7SUFDbEMsWUFDRSxTQUErQjtJQUMvQix3REFBd0Q7SUFDbkMsVUFBa0IsRUFDdkMsSUFBcUIsRUFDckIsSUFBWTtRQUVaLFFBQVEsQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDakMsSUFBSSxrQkFBa0IsQ0FBQztZQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEcsSUFBSSxDQUFDLFdBQVcsR0FBRztnQkFDZixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDOUIsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQy9CLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQztnQkFDRixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDckMsSUFBSSxVQUFVLEVBQUU7d0JBQ2QsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQzt3QkFDcEcsSUFBSSxVQUFVLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFOzRCQUMzQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7eUJBQzNDO3dCQUNELFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztxQkFDekM7Z0JBQ0gsQ0FBQyxDQUFDO2FBQ0wsQ0FBQztTQUNIO2FBQU07WUFDTCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUN0QztJQUVILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNuRCxDQUFDO3VHQXhDVSxtQkFBbUIsc0RBU3BCLFdBQVc7MkdBVFYsbUJBQW1COzsyRkFBbkIsbUJBQW1CO2tCQUQvQixVQUFVOzswQkFVTixNQUFNOzJCQUFDLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1BsYXRmb3JtU2VydmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSwgTmdab25lLCBPbkRlc3Ryb3ksIFBMQVRGT1JNX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBWRVJTSU9OIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZSc7XG5pbXBvcnQgeyBBbmd1bGFyRmlyZUF1dGggfSBmcm9tICdAYW5ndWxhci9maXJlL2NvbXBhdC9hdXRoJztcbmltcG9ydCBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZS9jb21wYXQvYXBwJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVBbmFseXRpY3MgfSBmcm9tICcuL2FuYWx5dGljcyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBVc2VyVHJhY2tpbmdTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcblxuICBpbml0aWFsaXplZDogUHJvbWlzZTx2b2lkPjtcbiAgcHJpdmF0ZSBkaXNwb3NhYmxlczogU3Vic2NyaXB0aW9uW10gPSBbXTtcblxuICAvLyBUT0RPIGEgdXNlciBwcm9wZXJ0aWVzIGluamVjdG9yXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFuYWx5dGljczogQW5ndWxhckZpcmVBbmFseXRpY3MsXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHlwZXNcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgYXV0aDogQW5ndWxhckZpcmVBdXRoLFxuICAgIHpvbmU6IE5nWm9uZSxcbiAgKSB7XG4gICAgZmlyZWJhc2UucmVnaXN0ZXJWZXJzaW9uKCdhbmd1bGFyZmlyZScsIFZFUlNJT04uZnVsbCwgJ2NvbXBhdC11c2VyLXRyYWNraW5nJyk7XG4gICAgaWYgKCFpc1BsYXRmb3JtU2VydmVyKHBsYXRmb3JtSWQpKSB7XG4gICAgICBsZXQgcmVzb2x2ZUluaXRpYWxpemVkO1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiByZXNvbHZlSW5pdGlhbGl6ZWQgPSByZXNvbHZlKSk7XG4gICAgICB0aGlzLmRpc3Bvc2FibGVzID0gW1xuICAgICAgICAgIGF1dGguYXV0aFN0YXRlLnN1YnNjcmliZSh1c2VyID0+IHtcbiAgICAgICAgICAgIGFuYWx5dGljcy5zZXRVc2VySWQodXNlcj8udWlkKTtcbiAgICAgICAgICAgIHJlc29sdmVJbml0aWFsaXplZCgpO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIGF1dGguY3JlZGVudGlhbC5zdWJzY3JpYmUoY3JlZGVudGlhbCA9PiB7XG4gICAgICAgICAgICBpZiAoY3JlZGVudGlhbCkge1xuICAgICAgICAgICAgICBjb25zdCBtZXRob2QgPSBjcmVkZW50aWFsLnVzZXIuaXNBbm9ueW1vdXMgPyAnYW5vbnltb3VzJyA6IGNyZWRlbnRpYWwuYWRkaXRpb25hbFVzZXJJbmZvLnByb3ZpZGVySWQ7XG4gICAgICAgICAgICAgIGlmIChjcmVkZW50aWFsLmFkZGl0aW9uYWxVc2VySW5mby5pc05ld1VzZXIpIHtcbiAgICAgICAgICAgICAgICBhbmFseXRpY3MubG9nRXZlbnQoJ3NpZ25fdXAnLCB7IG1ldGhvZCB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhbmFseXRpY3MubG9nRXZlbnQoJ2xvZ2luJywgeyBtZXRob2QgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuZm9yRWFjaChpdCA9PiBpdC51bnN1YnNjcmliZSgpKTtcbiAgfVxufVxuIl19