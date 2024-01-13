import { Inject, Injectable, InjectionToken, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { AppCheckInstances } from '@angular/fire/app-check';
import { FIREBASE_APP_NAME, FIREBASE_OPTIONS, ɵcacheInstance, ɵfirebaseAppFactory } from '@angular/fire/compat';
import { createStorageRef } from './ref';
import 'firebase/compat/storage';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire";
import * as i2 from "@angular/fire/app-check";
export const BUCKET = new InjectionToken('angularfire2.storageBucket');
export const MAX_UPLOAD_RETRY_TIME = new InjectionToken('angularfire2.storage.maxUploadRetryTime');
export const MAX_OPERATION_RETRY_TIME = new InjectionToken('angularfire2.storage.maxOperationRetryTime');
export const USE_EMULATOR = new InjectionToken('angularfire2.storage.use-emulator');
/**
 * AngularFireStorage Service
 *
 * This service is the main entry point for this feature module. It provides
 * an API for uploading and downloading binary files from Cloud Storage for
 * Firebase.
 */
export class AngularFireStorage {
    storage;
    constructor(options, name, storageBucket, 
    // eslint-disable-next-line @typescript-eslint/ban-types
    platformId, zone, schedulers, maxUploadRetryTime, maxOperationRetryTime, _useEmulator, _appCheckInstances) {
        const app = ɵfirebaseAppFactory(options, zone, name);
        this.storage = ɵcacheInstance(`${app.name}.storage.${storageBucket}`, 'AngularFireStorage', app.name, () => {
            const storage = zone.runOutsideAngular(() => app.storage(storageBucket || undefined));
            const useEmulator = _useEmulator;
            if (useEmulator) {
                storage.useEmulator(...useEmulator);
            }
            if (maxUploadRetryTime) {
                storage.setMaxUploadRetryTime(maxUploadRetryTime);
            }
            if (maxOperationRetryTime) {
                storage.setMaxOperationRetryTime(maxOperationRetryTime);
            }
            return storage;
        }, [maxUploadRetryTime, maxOperationRetryTime]);
    }
    ref(path) {
        return createStorageRef(this.storage.ref(path));
    }
    refFromURL(path) {
        return createStorageRef(this.storage.refFromURL(path));
    }
    upload(path, data, metadata) {
        const storageRef = this.storage.ref(path);
        const ref = createStorageRef(storageRef);
        return ref.put(data, metadata);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireStorage, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: BUCKET, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: MAX_UPLOAD_RETRY_TIME, optional: true }, { token: MAX_OPERATION_RETRY_TIME, optional: true }, { token: USE_EMULATOR, optional: true }, { token: i2.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireStorage, providedIn: 'any' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireStorage, decorators: [{
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
                    args: [BUCKET]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.NgZone }, { type: i1.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAX_UPLOAD_RETRY_TIME]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAX_OPERATION_RETRY_TIME]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [USE_EMULATOR]
                }] }, { type: i2.AppCheckInstances, decorators: [{
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wYXQvc3RvcmFnZS9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBSWhILE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUN6QyxPQUFPLHlCQUF5QixDQUFDOzs7O0FBRWpDLE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBUyw0QkFBNEIsQ0FBQyxDQUFDO0FBQy9FLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLElBQUksY0FBYyxDQUFTLHlDQUF5QyxDQUFDLENBQUM7QUFDM0csTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxjQUFjLENBQVMsNENBQTRDLENBQUMsQ0FBQztBQUdqSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQXVCLG1DQUFtQyxDQUFDLENBQUM7QUFFMUc7Ozs7OztHQU1HO0FBSUgsTUFBTSxPQUFPLGtCQUFrQjtJQUNiLE9BQU8sQ0FBMkI7SUFFbEQsWUFDNEIsT0FBd0IsRUFDWCxJQUErQixFQUMxQyxhQUE0QjtJQUN4RCx3REFBd0Q7SUFDbkMsVUFBa0IsRUFDdkMsSUFBWSxFQUNaLFVBQWtDLEVBQ1Msa0JBQXVCLEVBQ3BCLHFCQUEwQixFQUN0QyxZQUFpQixFQUN2QyxrQkFBcUM7UUFFakQsTUFBTSxHQUFHLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLFlBQVksYUFBYSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7WUFDekcsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxXQUFXLEdBQUcsWUFBeUMsQ0FBQztZQUM5RCxJQUFJLFdBQVcsRUFBRTtnQkFDZixPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUM7YUFDckM7WUFDRCxJQUFJLGtCQUFrQixFQUFFO2dCQUN0QixPQUFPLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUNuRDtZQUNELElBQUkscUJBQXFCLEVBQUU7Z0JBQ3pCLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxHQUFHLENBQUMsSUFBWTtRQUNkLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVk7UUFDckIsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxNQUFNLENBQUMsSUFBWSxFQUFFLElBQVMsRUFBRSxRQUF5QjtRQUN2RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxNQUFNLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6QyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7dUdBN0NVLGtCQUFrQixrQkFJbkIsZ0JBQWdCLGFBQ0osaUJBQWlCLDZCQUNqQixNQUFNLDZCQUVsQixXQUFXLHlFQUdDLHFCQUFxQiw2QkFDckIsd0JBQXdCLDZCQUN4QixZQUFZOzJHQWJ2QixrQkFBa0IsY0FGakIsS0FBSzs7MkZBRU4sa0JBQWtCO2tCQUg5QixVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxLQUFLO2lCQUNsQjs7MEJBS0ksTUFBTTsyQkFBQyxnQkFBZ0I7OzBCQUN2QixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGlCQUFpQjs7MEJBQ3BDLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsTUFBTTs7MEJBRXpCLE1BQU07MkJBQUMsV0FBVzs7MEJBR2xCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMscUJBQXFCOzswQkFDeEMsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyx3QkFBd0I7OzBCQUMzQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFlBQVk7OzBCQUMvQixRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgTmdab25lLCBPcHRpb25hbCwgUExBVEZPUk1fSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IMm1QW5ndWxhckZpcmVTY2hlZHVsZXJzIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZSc7XG5pbXBvcnQgeyBBcHBDaGVja0luc3RhbmNlcyB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUvYXBwLWNoZWNrJztcbmltcG9ydCB7IEZJUkVCQVNFX0FQUF9OQU1FLCBGSVJFQkFTRV9PUFRJT05TLCDJtWNhY2hlSW5zdGFuY2UsIMm1ZmlyZWJhc2VBcHBGYWN0b3J5IH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9jb21wYXQnO1xuaW1wb3J0IHsgRmlyZWJhc2VPcHRpb25zIH0gZnJvbSAnZmlyZWJhc2UvYXBwJztcbmltcG9ydCBmaXJlYmFzZSBmcm9tICdmaXJlYmFzZS9jb21wYXQvYXBwJztcbmltcG9ydCB7IFVwbG9hZE1ldGFkYXRhIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGNyZWF0ZVN0b3JhZ2VSZWYgfSBmcm9tICcuL3JlZic7XG5pbXBvcnQgJ2ZpcmViYXNlL2NvbXBhdC9zdG9yYWdlJztcblxuZXhwb3J0IGNvbnN0IEJVQ0tFVCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdhbmd1bGFyZmlyZTIuc3RvcmFnZUJ1Y2tldCcpO1xuZXhwb3J0IGNvbnN0IE1BWF9VUExPQURfUkVUUllfVElNRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxudW1iZXI+KCdhbmd1bGFyZmlyZTIuc3RvcmFnZS5tYXhVcGxvYWRSZXRyeVRpbWUnKTtcbmV4cG9ydCBjb25zdCBNQVhfT1BFUkFUSU9OX1JFVFJZX1RJTUUgPSBuZXcgSW5qZWN0aW9uVG9rZW48bnVtYmVyPignYW5ndWxhcmZpcmUyLnN0b3JhZ2UubWF4T3BlcmF0aW9uUmV0cnlUaW1lJyk7XG5cbnR5cGUgVXNlRW11bGF0b3JBcmd1bWVudHMgPSBQYXJhbWV0ZXJzPGZpcmViYXNlLnN0b3JhZ2UuU3RvcmFnZVsndXNlRW11bGF0b3InXT47XG5leHBvcnQgY29uc3QgVVNFX0VNVUxBVE9SID0gbmV3IEluamVjdGlvblRva2VuPFVzZUVtdWxhdG9yQXJndW1lbnRzPignYW5ndWxhcmZpcmUyLnN0b3JhZ2UudXNlLWVtdWxhdG9yJyk7XG5cbi8qKlxuICogQW5ndWxhckZpcmVTdG9yYWdlIFNlcnZpY2VcbiAqXG4gKiBUaGlzIHNlcnZpY2UgaXMgdGhlIG1haW4gZW50cnkgcG9pbnQgZm9yIHRoaXMgZmVhdHVyZSBtb2R1bGUuIEl0IHByb3ZpZGVzXG4gKiBhbiBBUEkgZm9yIHVwbG9hZGluZyBhbmQgZG93bmxvYWRpbmcgYmluYXJ5IGZpbGVzIGZyb20gQ2xvdWQgU3RvcmFnZSBmb3JcbiAqIEZpcmViYXNlLlxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdhbnknXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGaXJlU3RvcmFnZSB7XG4gIHB1YmxpYyByZWFkb25seSBzdG9yYWdlOiBmaXJlYmFzZS5zdG9yYWdlLlN0b3JhZ2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChGSVJFQkFTRV9PUFRJT05TKSBvcHRpb25zOiBGaXJlYmFzZU9wdGlvbnMsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChGSVJFQkFTRV9BUFBfTkFNRSkgbmFtZTogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEJVQ0tFVCkgc3RvcmFnZUJ1Y2tldDogc3RyaW5nIHwgbnVsbCxcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10eXBlc1xuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICB6b25lOiBOZ1pvbmUsXG4gICAgc2NoZWR1bGVyczogybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVhfVVBMT0FEX1JFVFJZX1RJTUUpIG1heFVwbG9hZFJldHJ5VGltZTogYW55LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFYX09QRVJBVElPTl9SRVRSWV9USU1FKSBtYXhPcGVyYXRpb25SZXRyeVRpbWU6IGFueSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVTRV9FTVVMQVRPUikgX3VzZUVtdWxhdG9yOiBhbnksXG4gICAgQE9wdGlvbmFsKCkgX2FwcENoZWNrSW5zdGFuY2VzOiBBcHBDaGVja0luc3RhbmNlcyxcbiAgKSB7XG4gICAgY29uc3QgYXBwID0gybVmaXJlYmFzZUFwcEZhY3Rvcnkob3B0aW9ucywgem9uZSwgbmFtZSk7XG4gICAgdGhpcy5zdG9yYWdlID0gybVjYWNoZUluc3RhbmNlKGAke2FwcC5uYW1lfS5zdG9yYWdlLiR7c3RvcmFnZUJ1Y2tldH1gLCAnQW5ndWxhckZpcmVTdG9yYWdlJywgYXBwLm5hbWUsICgpID0+IHtcbiAgICAgIGNvbnN0IHN0b3JhZ2UgPSB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IGFwcC5zdG9yYWdlKHN0b3JhZ2VCdWNrZXQgfHwgdW5kZWZpbmVkKSk7XG4gICAgICBjb25zdCB1c2VFbXVsYXRvciA9IF91c2VFbXVsYXRvciBhcyBVc2VFbXVsYXRvckFyZ3VtZW50c3xudWxsO1xuICAgICAgaWYgKHVzZUVtdWxhdG9yKSB7XG4gICAgICAgIHN0b3JhZ2UudXNlRW11bGF0b3IoLi4udXNlRW11bGF0b3IpO1xuICAgICAgfVxuICAgICAgaWYgKG1heFVwbG9hZFJldHJ5VGltZSkge1xuICAgICAgICBzdG9yYWdlLnNldE1heFVwbG9hZFJldHJ5VGltZShtYXhVcGxvYWRSZXRyeVRpbWUpO1xuICAgICAgfVxuICAgICAgaWYgKG1heE9wZXJhdGlvblJldHJ5VGltZSkge1xuICAgICAgICBzdG9yYWdlLnNldE1heE9wZXJhdGlvblJldHJ5VGltZShtYXhPcGVyYXRpb25SZXRyeVRpbWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0b3JhZ2U7XG4gICAgfSwgW21heFVwbG9hZFJldHJ5VGltZSwgbWF4T3BlcmF0aW9uUmV0cnlUaW1lXSk7XG4gIH1cblxuICByZWYocGF0aDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVN0b3JhZ2VSZWYodGhpcy5zdG9yYWdlLnJlZihwYXRoKSk7XG4gIH1cblxuICByZWZGcm9tVVJMKHBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiBjcmVhdGVTdG9yYWdlUmVmKHRoaXMuc3RvcmFnZS5yZWZGcm9tVVJMKHBhdGgpKTtcbiAgfVxuXG4gIHVwbG9hZChwYXRoOiBzdHJpbmcsIGRhdGE6IGFueSwgbWV0YWRhdGE/OiBVcGxvYWRNZXRhZGF0YSkge1xuICAgIGNvbnN0IHN0b3JhZ2VSZWYgPSB0aGlzLnN0b3JhZ2UucmVmKHBhdGgpO1xuICAgIGNvbnN0IHJlZiA9IGNyZWF0ZVN0b3JhZ2VSZWYoc3RvcmFnZVJlZik7XG4gICAgcmV0dXJuIHJlZi5wdXQoZGF0YSwgbWV0YWRhdGEpO1xuICB9XG5cbn1cbiJdfQ==