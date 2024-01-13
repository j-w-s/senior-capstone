import { Inject, Injectable, InjectionToken, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { AppCheckInstances } from '@angular/fire/app-check';
import { FIREBASE_APP_NAME, FIREBASE_OPTIONS, ɵcacheInstance, ɵfirebaseAppFactory } from '@angular/fire/compat';
import { SETTINGS as AUTH_SETTINGS, AngularFireAuth, LANGUAGE_CODE, PERSISTENCE, TENANT_ID, USE_EMULATOR as USE_AUTH_EMULATOR, USE_DEVICE_LANGUAGE, ɵauthFactory, } from '@angular/fire/compat/auth';
import { createListReference } from './list/create-reference';
import { createObjectReference } from './object/create-reference';
import { getRef } from './utils';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire";
import * as i2 from "@angular/fire/compat/auth";
import * as i3 from "@angular/fire/app-check";
export const URL = new InjectionToken('angularfire2.realtimeDatabaseURL');
export const USE_EMULATOR = new InjectionToken('angularfire2.database.use-emulator');
export class AngularFireDatabase {
    schedulers;
    database;
    constructor(options, name, databaseURL, 
    // eslint-disable-next-line @typescript-eslint/ban-types
    platformId, zone, schedulers, _useEmulator, // tuple isn't working here
    auth, useAuthEmulator, authSettings, // can't use firebase.auth.AuthSettings here
    tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
        this.schedulers = schedulers;
        const useEmulator = _useEmulator;
        const app = ɵfirebaseAppFactory(options, zone, name);
        if (auth) {
            ɵauthFactory(app, zone, useAuthEmulator, tenantId, languageCode, useDeviceLanguage, authSettings, persistence);
        }
        this.database = ɵcacheInstance(`${app.name}.database.${databaseURL}`, 'AngularFireDatabase', app.name, () => {
            const database = zone.runOutsideAngular(() => app.database(databaseURL || undefined));
            if (useEmulator) {
                database.useEmulator(...useEmulator);
            }
            return database;
        }, [useEmulator]);
    }
    list(pathOrRef, queryFn) {
        const ref = this.schedulers.ngZone.runOutsideAngular(() => getRef(this.database, pathOrRef));
        let query = ref;
        if (queryFn) {
            query = queryFn(ref);
        }
        return createListReference(query, this);
    }
    object(pathOrRef) {
        const ref = this.schedulers.ngZone.runOutsideAngular(() => getRef(this.database, pathOrRef));
        return createObjectReference(ref, this);
    }
    createPushId() {
        const ref = this.schedulers.ngZone.runOutsideAngular(() => this.database.ref());
        return ref.push().key;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireDatabase, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: URL, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: USE_EMULATOR, optional: true }, { token: i2.AngularFireAuth, optional: true }, { token: USE_AUTH_EMULATOR, optional: true }, { token: AUTH_SETTINGS, optional: true }, { token: TENANT_ID, optional: true }, { token: LANGUAGE_CODE, optional: true }, { token: USE_DEVICE_LANGUAGE, optional: true }, { token: PERSISTENCE, optional: true }, { token: i3.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireDatabase, providedIn: 'any' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireDatabase, decorators: [{
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
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [URL]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.NgZone }, { type: i1.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_EMULATOR]
                }] }, { type: i2.AngularFireAuth, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_AUTH_EMULATOR]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [AUTH_SETTINGS]
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
                }] }, { type: i3.AppCheckInstances, decorators: [{
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcGF0L2RhdGFiYXNlL2RhdGFiYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hILE9BQU8sRUFDTCxRQUFRLElBQUksYUFBYSxFQUN6QixlQUFlLEVBQ2YsYUFBYSxFQUNiLFdBQVcsRUFDWCxTQUFTLEVBQ1QsWUFBWSxJQUFJLGlCQUFpQixFQUNqQyxtQkFBbUIsRUFDbkIsWUFBWSxHQUNiLE1BQU0sMkJBQTJCLENBQUM7QUFJbkMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNqQyxPQUFPLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sMEJBQTBCLENBQUM7Ozs7O0FBRWxDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQ0FBa0MsQ0FBQyxDQUFDO0FBR2xGLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBdUIsb0NBQW9DLENBQUMsQ0FBQztBQUszRyxNQUFNLE9BQU8sbUJBQW1CO0lBVXJCO0lBVE8sUUFBUSxDQUE2QjtJQUVyRCxZQUM0QixPQUF3QixFQUNYLElBQStCLEVBQzdDLFdBQTBCO0lBQ25ELHdEQUF3RDtJQUNuQyxVQUFrQixFQUN2QyxJQUFZLEVBQ0wsVUFBa0MsRUFDUCxZQUFpQixFQUFFLDJCQUEyQjtJQUNwRSxJQUFxQixFQUNNLGVBQW9CLEVBQ3hCLFlBQWlCLEVBQUUsNENBQTRDO0lBQ25FLFFBQXVCLEVBQ25CLFlBQTJCLEVBQ3JCLGlCQUFpQyxFQUN6QyxXQUEwQixFQUMvQyxrQkFBcUM7UUFUMUMsZUFBVSxHQUFWLFVBQVUsQ0FBd0I7UUFZekMsTUFBTSxXQUFXLEdBQWdDLFlBQVksQ0FBQztRQUM5RCxNQUFNLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXJELElBQUksSUFBSSxFQUFFO1lBQ1IsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ2hIO1FBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxhQUFhLFdBQVcsRUFBRSxFQUFFLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQzFHLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLElBQUksV0FBVyxFQUFFO2dCQUNmLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQzthQUN0QztZQUNELE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVELElBQUksQ0FBSSxTQUF3QixFQUFFLE9BQWlCO1FBQ2pELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDN0YsSUFBSSxLQUFLLEdBQWtCLEdBQUcsQ0FBQztRQUMvQixJQUFJLE9BQU8sRUFBRTtZQUNYLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEI7UUFDRCxPQUFPLG1CQUFtQixDQUFJLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsTUFBTSxDQUFJLFNBQXdCO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDN0YsT0FBTyxxQkFBcUIsQ0FBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELFlBQVk7UUFDVixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDaEYsT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDO0lBQ3hCLENBQUM7dUdBdkRVLG1CQUFtQixrQkFJcEIsZ0JBQWdCLGFBQ0osaUJBQWlCLDZCQUNqQixHQUFHLDZCQUVmLFdBQVcseUVBR0MsWUFBWSw0RUFFWixpQkFBaUIsNkJBQ2pCLGFBQWEsNkJBQ2IsU0FBUyw2QkFDVCxhQUFhLDZCQUNiLG1CQUFtQiw2QkFDbkIsV0FBVzsyR0FsQnRCLG1CQUFtQixjQUZsQixLQUFLOzsyRkFFTixtQkFBbUI7a0JBSC9CLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLEtBQUs7aUJBQ2xCOzswQkFLSSxNQUFNOzJCQUFDLGdCQUFnQjs7MEJBQ3ZCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsaUJBQWlCOzswQkFDcEMsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxHQUFHOzswQkFFdEIsTUFBTTsyQkFBQyxXQUFXOzswQkFHbEIsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxZQUFZOzswQkFDL0IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxpQkFBaUI7OzBCQUNwQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7OzBCQUNoQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFNBQVM7OzBCQUM1QixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7OzBCQUNoQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLG1CQUFtQjs7MEJBQ3RDLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsV0FBVzs7MEJBQzlCLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBOZ1pvbmUsIE9wdGlvbmFsLCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMgfSBmcm9tICdAYW5ndWxhci9maXJlJztcbmltcG9ydCB7IEFwcENoZWNrSW5zdGFuY2VzIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9hcHAtY2hlY2snO1xuaW1wb3J0IHsgRklSRUJBU0VfQVBQX05BTUUsIEZJUkVCQVNFX09QVElPTlMsIMm1Y2FjaGVJbnN0YW5jZSwgybVmaXJlYmFzZUFwcEZhY3RvcnkgfSBmcm9tICdAYW5ndWxhci9maXJlL2NvbXBhdCc7XG5pbXBvcnQge1xuICBTRVRUSU5HUyBhcyBBVVRIX1NFVFRJTkdTLFxuICBBbmd1bGFyRmlyZUF1dGgsXG4gIExBTkdVQUdFX0NPREUsXG4gIFBFUlNJU1RFTkNFLFxuICBURU5BTlRfSUQsXG4gIFVTRV9FTVVMQVRPUiBhcyBVU0VfQVVUSF9FTVVMQVRPUixcbiAgVVNFX0RFVklDRV9MQU5HVUFHRSxcbiAgybVhdXRoRmFjdG9yeSxcbn0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9jb21wYXQvYXV0aCc7XG5pbXBvcnQgeyBGaXJlYmFzZU9wdGlvbnMgfSBmcm9tICdmaXJlYmFzZS9hcHAnO1xuaW1wb3J0IGZpcmViYXNlIGZyb20gJ2ZpcmViYXNlL2NvbXBhdC9hcHAnO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVMaXN0LCBBbmd1bGFyRmlyZU9iamVjdCwgRGF0YWJhc2VRdWVyeSwgUGF0aFJlZmVyZW5jZSwgUXVlcnlGbiB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBjcmVhdGVMaXN0UmVmZXJlbmNlIH0gZnJvbSAnLi9saXN0L2NyZWF0ZS1yZWZlcmVuY2UnO1xuaW1wb3J0IHsgY3JlYXRlT2JqZWN0UmVmZXJlbmNlIH0gZnJvbSAnLi9vYmplY3QvY3JlYXRlLXJlZmVyZW5jZSc7XG5pbXBvcnQgeyBnZXRSZWYgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCAnZmlyZWJhc2UvY29tcGF0L2F1dGgnO1xuaW1wb3J0ICdmaXJlYmFzZS9jb21wYXQvZGF0YWJhc2UnO1xuXG5leHBvcnQgY29uc3QgVVJMID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ2FuZ3VsYXJmaXJlMi5yZWFsdGltZURhdGFiYXNlVVJMJyk7XG5cbnR5cGUgVXNlRW11bGF0b3JBcmd1bWVudHMgPSBQYXJhbWV0ZXJzPGZpcmViYXNlLmRhdGFiYXNlLkRhdGFiYXNlWyd1c2VFbXVsYXRvciddPjtcbmV4cG9ydCBjb25zdCBVU0VfRU1VTEFUT1IgPSBuZXcgSW5qZWN0aW9uVG9rZW48VXNlRW11bGF0b3JBcmd1bWVudHM+KCdhbmd1bGFyZmlyZTIuZGF0YWJhc2UudXNlLWVtdWxhdG9yJyk7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ2FueSdcbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhckZpcmVEYXRhYmFzZSB7XG4gIHB1YmxpYyByZWFkb25seSBkYXRhYmFzZTogZmlyZWJhc2UuZGF0YWJhc2UuRGF0YWJhc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChGSVJFQkFTRV9PUFRJT05TKSBvcHRpb25zOiBGaXJlYmFzZU9wdGlvbnMsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChGSVJFQkFTRV9BUFBfTkFNRSkgbmFtZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVSTCkgZGF0YWJhc2VVUkw6IHN0cmluZyB8IG51bGwsXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHlwZXNcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgem9uZTogTmdab25lLFxuICAgIHB1YmxpYyBzY2hlZHVsZXJzOiDJtUFuZ3VsYXJGaXJlU2NoZWR1bGVycyxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVTRV9FTVVMQVRPUikgX3VzZUVtdWxhdG9yOiBhbnksIC8vIHR1cGxlIGlzbid0IHdvcmtpbmcgaGVyZVxuICAgIEBPcHRpb25hbCgpIGF1dGg6IEFuZ3VsYXJGaXJlQXV0aCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVTRV9BVVRIX0VNVUxBVE9SKSB1c2VBdXRoRW11bGF0b3I6IGFueSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFVVEhfU0VUVElOR1MpIGF1dGhTZXR0aW5nczogYW55LCAvLyBjYW4ndCB1c2UgZmlyZWJhc2UuYXV0aC5BdXRoU2V0dGluZ3MgaGVyZVxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVEVOQU5UX0lEKSB0ZW5hbnRJZDogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KExBTkdVQUdFX0NPREUpIGxhbmd1YWdlQ29kZTogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVTRV9ERVZJQ0VfTEFOR1VBR0UpIHVzZURldmljZUxhbmd1YWdlOiBib29sZWFuIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBFUlNJU1RFTkNFKSBwZXJzaXN0ZW5jZTogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBfYXBwQ2hlY2tJbnN0YW5jZXM6IEFwcENoZWNrSW5zdGFuY2VzLFxuICApIHtcblxuICAgIGNvbnN0IHVzZUVtdWxhdG9yOiBVc2VFbXVsYXRvckFyZ3VtZW50cyB8IG51bGwgPSBfdXNlRW11bGF0b3I7XG4gICAgY29uc3QgYXBwID0gybVmaXJlYmFzZUFwcEZhY3Rvcnkob3B0aW9ucywgem9uZSwgbmFtZSk7XG5cbiAgICBpZiAoYXV0aCkge1xuICAgICAgybVhdXRoRmFjdG9yeShhcHAsIHpvbmUsIHVzZUF1dGhFbXVsYXRvciwgdGVuYW50SWQsIGxhbmd1YWdlQ29kZSwgdXNlRGV2aWNlTGFuZ3VhZ2UsIGF1dGhTZXR0aW5ncywgcGVyc2lzdGVuY2UpO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YWJhc2UgPSDJtWNhY2hlSW5zdGFuY2UoYCR7YXBwLm5hbWV9LmRhdGFiYXNlLiR7ZGF0YWJhc2VVUkx9YCwgJ0FuZ3VsYXJGaXJlRGF0YWJhc2UnLCBhcHAubmFtZSwgKCkgPT4ge1xuICAgICAgY29uc3QgZGF0YWJhc2UgPSB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGFwcC5kYXRhYmFzZShkYXRhYmFzZVVSTCB8fCB1bmRlZmluZWQpKTtcbiAgICAgIGlmICh1c2VFbXVsYXRvcikge1xuICAgICAgICBkYXRhYmFzZS51c2VFbXVsYXRvciguLi51c2VFbXVsYXRvcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0YWJhc2U7XG4gICAgfSwgW3VzZUVtdWxhdG9yXSk7XG4gIH1cblxuICBsaXN0PFQ+KHBhdGhPclJlZjogUGF0aFJlZmVyZW5jZSwgcXVlcnlGbj86IFF1ZXJ5Rm4pOiBBbmd1bGFyRmlyZUxpc3Q8VD4ge1xuICAgIGNvbnN0IHJlZiA9IHRoaXMuc2NoZWR1bGVycy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gZ2V0UmVmKHRoaXMuZGF0YWJhc2UsIHBhdGhPclJlZikpO1xuICAgIGxldCBxdWVyeTogRGF0YWJhc2VRdWVyeSA9IHJlZjtcbiAgICBpZiAocXVlcnlGbikge1xuICAgICAgcXVlcnkgPSBxdWVyeUZuKHJlZik7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVMaXN0UmVmZXJlbmNlPFQ+KHF1ZXJ5LCB0aGlzKTtcbiAgfVxuXG4gIG9iamVjdDxUPihwYXRoT3JSZWY6IFBhdGhSZWZlcmVuY2UpOiBBbmd1bGFyRmlyZU9iamVjdDxUPiB7XG4gICAgY29uc3QgcmVmID0gdGhpcy5zY2hlZHVsZXJzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBnZXRSZWYodGhpcy5kYXRhYmFzZSwgcGF0aE9yUmVmKSk7XG4gICAgcmV0dXJuIGNyZWF0ZU9iamVjdFJlZmVyZW5jZTxUPihyZWYsIHRoaXMpO1xuICB9XG5cbiAgY3JlYXRlUHVzaElkKCkge1xuICAgIGNvbnN0IHJlZiA9IHRoaXMuc2NoZWR1bGVycy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gdGhpcy5kYXRhYmFzZS5yZWYoKSk7XG4gICAgcmV0dXJuIHJlZi5wdXNoKCkua2V5O1xuICB9XG5cbn1cblxuZXhwb3J0IHtcbiAgUGF0aFJlZmVyZW5jZSxcbiAgRGF0YWJhc2VTbmFwc2hvdCxcbiAgQ2hpbGRFdmVudCxcbiAgTGlzdGVuRXZlbnQsXG4gIFF1ZXJ5Rm4sXG4gIEFuZ3VsYXJGaXJlTGlzdCxcbiAgQW5ndWxhckZpcmVPYmplY3QsXG4gIEFuZ3VsYXJGaXJlQWN0aW9uLFxuICBBY3Rpb24sXG4gIFNuYXBzaG90QWN0aW9uXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG4iXX0=