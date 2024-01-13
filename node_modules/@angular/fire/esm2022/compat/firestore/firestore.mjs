import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, InjectionToken, NgZone, Optional, PLATFORM_ID } from '@angular/core';
import { ɵAngularFireSchedulers } from '@angular/fire';
import { AppCheckInstances } from '@angular/fire/app-check';
import { FIREBASE_APP_NAME, FIREBASE_OPTIONS, ɵcacheInstance, ɵfirebaseAppFactory } from '@angular/fire/compat';
import { SETTINGS as AUTH_SETTINGS, AngularFireAuth, LANGUAGE_CODE, PERSISTENCE, TENANT_ID, USE_EMULATOR as USE_AUTH_EMULATOR, USE_DEVICE_LANGUAGE, ɵauthFactory, } from '@angular/fire/compat/auth';
import { from, of } from 'rxjs';
import { AngularFirestoreCollection } from './collection/collection';
import { AngularFirestoreCollectionGroup } from './collection-group/collection-group';
import { AngularFirestoreDocument } from './document/document';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire";
import * as i2 from "@angular/fire/compat/auth";
import * as i3 from "@angular/fire/app-check";
/**
 * The value of this token determines whether or not the firestore will have persistance enabled
 */
export const ENABLE_PERSISTENCE = new InjectionToken('angularfire2.enableFirestorePersistence');
export const PERSISTENCE_SETTINGS = new InjectionToken('angularfire2.firestore.persistenceSettings');
export const SETTINGS = new InjectionToken('angularfire2.firestore.settings');
export const USE_EMULATOR = new InjectionToken('angularfire2.firestore.use-emulator');
/**
 * A utility methods for associating a collection reference with
 * a query.
 *
 * @param collectionRef - A collection reference to query
 * @param queryFn - The callback to create a query
 *
 * Example:
 * const { query, ref } = associateQuery(docRef.collection('items'), ref => {
 *  return ref.where('age', '<', 200);
 * });
 */
export function associateQuery(collectionRef, queryFn = ref => ref) {
    const query = queryFn(collectionRef);
    const ref = collectionRef;
    return { query, ref };
}
/**
 * AngularFirestore Service
 *
 * This service is the main entry point for this feature module. It provides
 * an API for creating Collection and Reference services. These services can
 * then be used to do data updates and observable streams of the data.
 *
 * Example:
 *
 * import { Component } from '@angular/core';
 * import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
 * import { Observable } from 'rxjs/Observable';
 * import { from } from 'rxjs/observable';
 *
 * @Component({
 *   selector: 'app-my-component',
 *   template: `
 *    <h2>Items for {{ (profile | async)?.name }}
 *    <ul>
 *       <li *ngFor="let item of items | async">{{ item.name }}</li>
 *    </ul>
 *    <div class="control-input">
 *       <input type="text" #itemname />
 *       <button (click)="addItem(itemname.value)">Add Item</button>
 *    </div>
 *   `
 * })
 * export class MyComponent implements OnInit {
 *
 *   // services for data operations and data streaming
 *   private readonly itemsRef: AngularFirestoreCollection<Item>;
 *   private readonly profileRef: AngularFirestoreDocument<Profile>;
 *
 *   // observables for template
 *   items: Observable<Item[]>;
 *   profile: Observable<Profile>;
 *
 *   // inject main service
 *   constructor(private readonly afs: AngularFirestore) {}
 *
 *   ngOnInit() {
 *     this.itemsRef = afs.collection('items', ref => ref.where('user', '==', 'davideast').limit(10));
 *     this.items = this.itemsRef.valueChanges().map(snap => snap.docs.map(data => doc.data()));
 *     // this.items = from(this.itemsRef); // you can also do this with no mapping
 *
 *     this.profileRef = afs.doc('users/davideast');
 *     this.profile = this.profileRef.valueChanges();
 *   }
 *
 *   addItem(name: string) {
 *     const user = 'davideast';
 *     this.itemsRef.add({ name, user });
 *   }
 * }
 */
export class AngularFirestore {
    schedulers;
    firestore;
    persistenceEnabled$;
    /**
     * Each Feature of AngularFire has a FirebaseApp injected. This way we
     * don't rely on the main Firebase App instance and we can create named
     * apps and use multiple apps.
     */
    constructor(options, name, shouldEnablePersistence, settings, 
    // eslint-disable-next-line @typescript-eslint/ban-types
    platformId, zone, schedulers, persistenceSettings, _useEmulator, auth, useAuthEmulator, authSettings, // can't use firebase.auth.AuthSettings here
    tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
        this.schedulers = schedulers;
        const app = ɵfirebaseAppFactory(options, zone, name);
        const useEmulator = _useEmulator;
        if (auth) {
            ɵauthFactory(app, zone, useAuthEmulator, tenantId, languageCode, useDeviceLanguage, authSettings, persistence);
        }
        [this.firestore, this.persistenceEnabled$] = ɵcacheInstance(`${app.name}.firestore`, 'AngularFirestore', app.name, () => {
            const firestore = zone.runOutsideAngular(() => app.firestore());
            if (settings) {
                firestore.settings(settings);
            }
            if (useEmulator) {
                firestore.useEmulator(...useEmulator);
            }
            if (shouldEnablePersistence && !isPlatformServer(platformId)) {
                // We need to try/catch here because not all enablePersistence() failures are caught
                // https://github.com/firebase/firebase-js-sdk/issues/608
                const enablePersistence = () => {
                    try {
                        return from(firestore.enablePersistence(persistenceSettings || undefined).then(() => true, () => false));
                    }
                    catch (e) {
                        if (typeof console !== 'undefined') {
                            console.warn(e);
                        }
                        return of(false);
                    }
                };
                return [firestore, zone.runOutsideAngular(enablePersistence)];
            }
            else {
                return [firestore, of(false)];
            }
        }, [settings, useEmulator, shouldEnablePersistence]);
    }
    collection(pathOrRef, queryFn) {
        let collectionRef;
        if (typeof pathOrRef === 'string') {
            collectionRef = this.firestore.collection(pathOrRef);
        }
        else {
            collectionRef = pathOrRef;
        }
        const { ref, query } = associateQuery(collectionRef, queryFn);
        const refInZone = this.schedulers.ngZone.run(() => ref);
        return new AngularFirestoreCollection(refInZone, query, this);
    }
    /**
     * Create a reference to a Firestore Collection Group based on a collectionId
     * and an optional query function to narrow the result
     * set.
     */
    collectionGroup(collectionId, queryGroupFn) {
        const queryFn = queryGroupFn || (ref => ref);
        const collectionGroup = this.firestore.collectionGroup(collectionId);
        return new AngularFirestoreCollectionGroup(queryFn(collectionGroup), this);
    }
    doc(pathOrRef) {
        let ref;
        if (typeof pathOrRef === 'string') {
            ref = this.firestore.doc(pathOrRef);
        }
        else {
            ref = pathOrRef;
        }
        const refInZone = this.schedulers.ngZone.run(() => ref);
        return new AngularFirestoreDocument(refInZone, this);
    }
    /**
     * Returns a generated Firestore Document Id.
     */
    createId() {
        return this.firestore.collection('_').doc().id;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFirestore, deps: [{ token: FIREBASE_OPTIONS }, { token: FIREBASE_APP_NAME, optional: true }, { token: ENABLE_PERSISTENCE, optional: true }, { token: SETTINGS, optional: true }, { token: PLATFORM_ID }, { token: i0.NgZone }, { token: i1.ɵAngularFireSchedulers }, { token: PERSISTENCE_SETTINGS, optional: true }, { token: USE_EMULATOR, optional: true }, { token: i2.AngularFireAuth, optional: true }, { token: USE_AUTH_EMULATOR, optional: true }, { token: AUTH_SETTINGS, optional: true }, { token: TENANT_ID, optional: true }, { token: LANGUAGE_CODE, optional: true }, { token: USE_DEVICE_LANGUAGE, optional: true }, { token: PERSISTENCE, optional: true }, { token: i3.AppCheckInstances, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFirestore, providedIn: 'any' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFirestore, decorators: [{
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
                    args: [ENABLE_PERSISTENCE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [SETTINGS]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: i0.NgZone }, { type: i1.ɵAngularFireSchedulers }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [PERSISTENCE_SETTINGS]
                }] }, { type: undefined, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZXN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBhdC9maXJlc3RvcmUvZmlyZXN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hILE9BQU8sRUFDTCxRQUFRLElBQUksYUFBYSxFQUN6QixlQUFlLEVBQ2YsYUFBYSxFQUNiLFdBQVcsRUFDWCxTQUFTLEVBQ1QsWUFBWSxJQUFJLGlCQUFpQixFQUNqQyxtQkFBbUIsRUFDbkIsWUFBWSxHQUNiLE1BQU0sMkJBQTJCLENBQUM7QUFHbkMsT0FBTyxFQUFjLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDNUMsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDckUsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFXL0QsT0FBTyxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLDJCQUEyQixDQUFDOzs7OztBQUVuQzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLElBQUksY0FBYyxDQUFVLHlDQUF5QyxDQUFDLENBQUM7QUFDekcsTUFB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UTs7MEJBRTNCLE1BQU07MkJBQUMsV0FBVzs7MEJBR2xCLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsb0JBQW9COzswQkFDdkMsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxZQUFZOzswQkFDL0IsUUFBUTs7MEJBQ1IsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyxpQkFBaUI7OzBCQUNwQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7OzBCQUNoQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFNBQVM7OzBCQUM1QixRQUFROzswQkFBSSxNQUFNOzJCQUFDLGFBQWE7OzBCQUNoQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLG1CQUFtQjs7MEJBQ3RDLFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsV0FBVzs7MEJBQzlCLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1BsYXRmb3JtU2VydmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIE5nWm9uZSwgT3B0aW9uYWwsIFBMQVRGT1JNX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyDJtUFuZ3VsYXJGaXJlU2NoZWR1bGVycyB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUnO1xuaW1wb3J0IHsgQXBwQ2hlY2tJbnN0YW5jZXMgfSBmcm9tICdAYW5ndWxhci9maXJlL2FwcC1jaGVjayc7XG5pbXBvcnQgeyBGSVJFQkFTRV9BUFBfTkFNRSwgRklSRUJBU0VfT1BUSU9OUywgybVjYWNoZUluc3RhbmNlLCDJtWZpcmViYXNlQXBwRmFjdG9yeSB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUvY29tcGF0JztcbmltcG9ydCB7XG4gIFNFVFRJTkdTIGFzIEFVVEhfU0VUVElOR1MsXG4gIEFuZ3VsYXJGaXJlQXV0aCxcbiAgTEFOR1VBR0VfQ09ERSxcbiAgUEVSU0lTVEVOQ0UsXG4gIFRFTkFOVF9JRCxcbiAgVVNFX0VNVUxBVE9SIGFzIFVTRV9BVVRIX0VNVUxBVE9SLFxuICBVU0VfREVWSUNFX0xBTkdVQUdFLFxuICDJtWF1dGhGYWN0b3J5LFxufSBmcm9tICdAYW5ndWxhci9maXJlL2NvbXBhdC9hdXRoJztcbmltcG9ydCB7IEZpcmViYXNlT3B0aW9ucyB9IGZyb20gJ2ZpcmViYXNlL2FwcCc7XG5pbXBvcnQgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UvY29tcGF0L2FwcCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVzdG9yZUNvbGxlY3Rpb24gfSBmcm9tICcuL2NvbGxlY3Rpb24vY29sbGVjdGlvbic7XG5pbXBvcnQgeyBBbmd1bGFyRmlyZXN0b3JlQ29sbGVjdGlvbkdyb3VwIH0gZnJvbSAnLi9jb2xsZWN0aW9uLWdyb3VwL2NvbGxlY3Rpb24tZ3JvdXAnO1xuaW1wb3J0IHsgQW5ndWxhckZpcmVzdG9yZURvY3VtZW50IH0gZnJvbSAnLi9kb2N1bWVudC9kb2N1bWVudCc7XG5pbXBvcnQge1xuICBBc3NvY2lhdGVkUmVmZXJlbmNlLFxuICBDb2xsZWN0aW9uUmVmZXJlbmNlLFxuICBEb2N1bWVudFJlZmVyZW5jZSxcbiAgUGVyc2lzdGVuY2VTZXR0aW5ncyxcbiAgUXVlcnksXG4gIFF1ZXJ5Rm4sXG4gIFF1ZXJ5R3JvdXBGbixcbiAgU2V0dGluZ3Ncbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCAnZmlyZWJhc2UvY29tcGF0L2F1dGgnO1xuaW1wb3J0ICdmaXJlYmFzZS9jb21wYXQvZmlyZXN0b3JlJztcblxuLyoqXG4gKiBUaGUgdmFsdWUgb2YgdGhpcyB0b2tlbiBkZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IHRoZSBmaXJlc3RvcmUgd2lsbCBoYXZlIHBlcnNpc3RhbmNlIGVuYWJsZWRcbiAqL1xuZXhwb3J0IGNvbnN0IEVOQUJMRV9QRVJTSVNURU5DRSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxib29sZWFuPignYW5ndWxhcmZpcmUyLmVuYWJsZUZpcmVzdG9yZVBlcnNpc3RlbmNlJyk7XG5leHBvcnQgY29uc3QgUEVSU0lTVEVOQ0VfU0VUVElOR1MgPSBuZXcgSW5qZWN0aW9uVG9rZW48UGVyc2lzdGVuY2VTZXR0aW5ncyB8IHVuZGVmaW5lZD4oJ2FuZ3VsYXJmaXJlMi5maXJlc3RvcmUucGVyc2lzdGVuY2VTZXR0aW5ncycpO1xuZXhwb3J0IGNvbnN0IFNFVFRJTkdTID0gbmV3IEluamVjdGlvblRva2VuPFNldHRpbmdzPignYW5ndWxhcmZpcmUyLmZpcmVzdG9yZS5zZXR0aW5ncycpO1xuXG50eXBlIFVzZUVtdWxhdG9yQXJndW1lbnRzID0gUGFyYW1ldGVyczxmaXJlYmFzZS5maXJlc3RvcmUuRmlyZXN0b3JlWyd1c2VFbXVsYXRvciddPjtcbmV4cG9ydCBjb25zdCBVU0VfRU1VTEFUT1IgPSBuZXcgSW5qZWN0aW9uVG9rZW48VXNlRW11bGF0b3JBcmd1bWVudHM+KCdhbmd1bGFyZmlyZTIuZmlyZXN0b3JlLnVzZS1lbXVsYXRvcicpO1xuXG4vKipcbiAqIEEgdXRpbGl0eSBtZXRob2RzIGZvciBhc3NvY2lhdGluZyBhIGNvbGxlY3Rpb24gcmVmZXJlbmNlIHdpdGhcbiAqIGEgcXVlcnkuXG4gKlxuICogQHBhcmFtIGNvbGxlY3Rpb25SZWYgLSBBIGNvbGxlY3Rpb24gcmVmZXJlbmNlIHRvIHF1ZXJ5XG4gKiBAcGFyYW0gcXVlcnlGbiAtIFRoZSBjYWxsYmFjayB0byBjcmVhdGUgYSBxdWVyeVxuICpcbiAqIEV4YW1wbGU6XG4gKiBjb25zdCB7IHF1ZXJ5LCByZWYgfSA9IGFzc29jaWF0ZVF1ZXJ5KGRvY1JlZi5jb2xsZWN0aW9uKCdpdGVtcycpLCByZWYgPT4ge1xuICogIHJldHVybiByZWYud2hlcmUoJ2FnZScsICc8JywgMjAwKTtcbiAqIH0pO1xuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzb2NpYXRlUXVlcnk8VD4oY29sbGVjdGlvblJlZjogQ29sbGVjdGlvblJlZmVyZW5jZTxUPiwgcXVlcnlGbiA9IHJlZiA9PiByZWYpOiBBc3NvY2lhdGVkUmVmZXJlbmNlPFQ+IHtcbiAgY29uc3QgcXVlcnkgPSBxdWVyeUZuKGNvbGxlY3Rpb25SZWYpO1xuICBjb25zdCByZWYgPSBjb2xsZWN0aW9uUmVmO1xuICByZXR1cm4geyBxdWVyeSwgcmVmIH07XG59XG5cbi8qKlxuICogQW5ndWxhckZpcmVzdG9yZSBTZXJ2aWNlXG4gKlxuICogVGhpcyBzZXJ2aWNlIGlzIHRoZSBtYWluIGVudHJ5IHBvaW50IGZvciB0aGlzIGZlYXR1cmUgbW9kdWxlLiBJdCBwcm92aWRlc1xuICogYW4gQVBJIGZvciBjcmVhdGluZyBDb2xsZWN0aW9uIGFuZCBSZWZlcmVuY2Ugc2VydmljZXMuIFRoZXNlIHNlcnZpY2VzIGNhblxuICogdGhlbiBiZSB1c2VkIHRvIGRvIGRhdGEgdXBkYXRlcyBhbmQgb2JzZXJ2YWJsZSBzdHJlYW1zIG9mIHRoZSBkYXRhLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKiBpbXBvcnQgeyBBbmd1bGFyRmlyZXN0b3JlLCBBbmd1bGFyRmlyZXN0b3JlQ29sbGVjdGlvbiwgQW5ndWxhckZpcmVzdG9yZURvY3VtZW50IH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9maXJlc3RvcmUnO1xuICogaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMvT2JzZXJ2YWJsZSc7XG4gKiBpbXBvcnQgeyBmcm9tIH0gZnJvbSAncnhqcy9vYnNlcnZhYmxlJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAtbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgIDxoMj5JdGVtcyBmb3Ige3sgKHByb2ZpbGUgfCBhc3luYyk/Lm5hbWUgfX1cbiAqICAgIDx1bD5cbiAqICAgICAgIDxsaSAqbmdGb3I9XCJsZXQgaXRlbSBvZiBpdGVtcyB8IGFzeW5jXCI+e3sgaXRlbS5uYW1lIH19PC9saT5cbiAqICAgIDwvdWw+XG4gKiAgICA8ZGl2IGNsYXNzPVwiY29udHJvbC1pbnB1dFwiPlxuICogICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgI2l0ZW1uYW1lIC8+XG4gKiAgICAgICA8YnV0dG9uIChjbGljayk9XCJhZGRJdGVtKGl0ZW1uYW1lLnZhbHVlKVwiPkFkZCBJdGVtPC9idXR0b24+XG4gKiAgICA8L2Rpdj5cbiAqICAgYFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gKlxuICogICAvLyBzZXJ2aWNlcyBmb3IgZGF0YSBvcGVyYXRpb25zIGFuZCBkYXRhIHN0cmVhbWluZ1xuICogICBwcml2YXRlIHJlYWRvbmx5IGl0ZW1zUmVmOiBBbmd1bGFyRmlyZXN0b3JlQ29sbGVjdGlvbjxJdGVtPjtcbiAqICAgcHJpdmF0ZSByZWFkb25seSBwcm9maWxlUmVmOiBBbmd1bGFyRmlyZXN0b3JlRG9jdW1lbnQ8UHJvZmlsZT47XG4gKlxuICogICAvLyBvYnNlcnZhYmxlcyBmb3IgdGVtcGxhdGVcbiAqICAgaXRlbXM6IE9ic2VydmFibGU8SXRlbVtdPjtcbiAqICAgcHJvZmlsZTogT2JzZXJ2YWJsZTxQcm9maWxlPjtcbiAqXG4gKiAgIC8vIGluamVjdCBtYWluIHNlcnZpY2VcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhZnM6IEFuZ3VsYXJGaXJlc3RvcmUpIHt9XG4gKlxuICogICBuZ09uSW5pdCgpIHtcbiAqICAgICB0aGlzLml0ZW1zUmVmID0gYWZzLmNvbGxlY3Rpb24oJ2l0ZW1zJywgcmVmID0+IHJlZi53aGVyZSgndXNlcicsICc9PScsICdkYXZpZGVhc3QnKS5saW1pdCgxMCkpO1xuICogICAgIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zUmVmLnZhbHVlQ2hhbmdlcygpLm1hcChzbmFwID0+IHNuYXAuZG9jcy5tYXAoZGF0YSA9PiBkb2MuZGF0YSgpKSk7XG4gKiAgICAgLy8gdGhpcy5pdGVtcyA9IGZyb20odGhpcy5pdGVtc1JlZik7IC8vIHlvdSBjYW4gYWxzbyBkbyB0aGlzIHdpdGggbm8gbWFwcGluZ1xuICpcbiAqICAgICB0aGlzLnByb2ZpbGVSZWYgPSBhZnMuZG9jKCd1c2Vycy9kYXZpZGVhc3QnKTtcbiAqICAgICB0aGlzLnByb2ZpbGUgPSB0aGlzLnByb2ZpbGVSZWYudmFsdWVDaGFuZ2VzKCk7XG4gKiAgIH1cbiAqXG4gKiAgIGFkZEl0ZW0obmFtZTogc3RyaW5nKSB7XG4gKiAgICAgY29uc3QgdXNlciA9ICdkYXZpZGVhc3QnO1xuICogICAgIHRoaXMuaXRlbXNSZWYuYWRkKHsgbmFtZSwgdXNlciB9KTtcbiAqICAgfVxuICogfVxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdhbnknXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGaXJlc3RvcmUge1xuICBwdWJsaWMgcmVhZG9ubHkgZmlyZXN0b3JlOiBmaXJlYmFzZS5maXJlc3RvcmUuRmlyZXN0b3JlO1xuICBwdWJsaWMgcmVhZG9ubHkgcGVyc2lzdGVuY2VFbmFibGVkJDogT2JzZXJ2YWJsZTxib29sZWFuPjtcblxuICAvKipcbiAgICogRWFjaCBGZWF0dXJlIG9mIEFuZ3VsYXJGaXJlIGhhcyBhIEZpcmViYXNlQXBwIGluamVjdGVkLiBUaGlzIHdheSB3ZVxuICAgKiBkb24ndCByZWx5IG9uIHRoZSBtYWluIEZpcmViYXNlIEFwcCBpbnN0YW5jZSBhbmQgd2UgY2FuIGNyZWF0ZSBuYW1lZFxuICAgKiBhcHBzIGFuZCB1c2UgbXVsdGlwbGUgYXBwcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoRklSRUJBU0VfT1BUSU9OUykgb3B0aW9uczogRmlyZWJhc2VPcHRpb25zLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoRklSRUJBU0VfQVBQX05BTUUpIG5hbWU6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChFTkFCTEVfUEVSU0lTVEVOQ0UpIHNob3VsZEVuYWJsZVBlcnNpc3RlbmNlOiBib29sZWFuIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFNFVFRJTkdTKSBzZXR0aW5nczogU2V0dGluZ3MgfCBudWxsLFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXR5cGVzXG4gICAgQEluamVjdChQTEFURk9STV9JRCkgcGxhdGZvcm1JZDogT2JqZWN0LFxuICAgIHpvbmU6IE5nWm9uZSxcbiAgICBwdWJsaWMgc2NoZWR1bGVyczogybVBbmd1bGFyRmlyZVNjaGVkdWxlcnMsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChQRVJTSVNURU5DRV9TRVRUSU5HUykgcGVyc2lzdGVuY2VTZXR0aW5nczogUGVyc2lzdGVuY2VTZXR0aW5ncyB8IG51bGwsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChVU0VfRU1VTEFUT1IpIF91c2VFbXVsYXRvcjogYW55LFxuICAgIEBPcHRpb25hbCgpIGF1dGg6IEFuZ3VsYXJGaXJlQXV0aCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVTRV9BVVRIX0VNVUxBVE9SKSB1c2VBdXRoRW11bGF0b3I6IGFueSxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFVVEhfU0VUVElOR1MpIGF1dGhTZXR0aW5nczogYW55LCAvLyBjYW4ndCB1c2UgZmlyZWJhc2UuYXV0aC5BdXRoU2V0dGluZ3MgaGVyZVxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVEVOQU5UX0lEKSB0ZW5hbnRJZDogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KExBTkdVQUdFX0NPREUpIGxhbmd1YWdlQ29kZTogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFVTRV9ERVZJQ0VfTEFOR1VBR0UpIHVzZURldmljZUxhbmd1YWdlOiBib29sZWFuIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KFBFUlNJU1RFTkNFKSBwZXJzaXN0ZW5jZTogc3RyaW5nIHwgbnVsbCxcbiAgICBAT3B0aW9uYWwoKSBfYXBwQ2hlY2tJbnN0YW5jZXM6IEFwcENoZWNrSW5zdGFuY2VzLFxuICApIHtcbiAgICBjb25zdCBhcHAgPSDJtWZpcmViYXNlQXBwRmFjdG9yeShvcHRpb25zLCB6b25lLCBuYW1lKTtcbiAgICBjb25zdCB1c2VFbXVsYXRvcjogVXNlRW11bGF0b3JBcmd1bWVudHMgfCBudWxsID0gX3VzZUVtdWxhdG9yO1xuXG4gICAgaWYgKGF1dGgpIHtcbiAgICAgIMm1YXV0aEZhY3RvcnkoYXBwLCB6b25lLCB1c2VBdXRoRW11bGF0b3IsIHRlbmFudElkLCBsYW5ndWFnZUNvZGUsIHVzZURldmljZUxhbmd1YWdlLCBhdXRoU2V0dGluZ3MsIHBlcnNpc3RlbmNlKTtcbiAgICB9XG5cbiAgICBbdGhpcy5maXJlc3RvcmUsIHRoaXMucGVyc2lzdGVuY2VFbmFibGVkJF0gPSDJtWNhY2hlSW5zdGFuY2UoYCR7YXBwLm5hbWV9LmZpcmVzdG9yZWAsICdBbmd1bGFyRmlyZXN0b3JlJywgYXBwLm5hbWUsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpcmVzdG9yZSA9IHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gYXBwLmZpcmVzdG9yZSgpKTtcbiAgICAgIGlmIChzZXR0aW5ncykge1xuICAgICAgICBmaXJlc3RvcmUuc2V0dGluZ3Moc2V0dGluZ3MpO1xuICAgICAgfVxuICAgICAgaWYgKHVzZUVtdWxhdG9yKSB7XG4gICAgICAgIGZpcmVzdG9yZS51c2VFbXVsYXRvciguLi51c2VFbXVsYXRvcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzaG91bGRFbmFibGVQZXJzaXN0ZW5jZSAmJiAhaXNQbGF0Zm9ybVNlcnZlcihwbGF0Zm9ybUlkKSkge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIHRyeS9jYXRjaCBoZXJlIGJlY2F1c2Ugbm90IGFsbCBlbmFibGVQZXJzaXN0ZW5jZSgpIGZhaWx1cmVzIGFyZSBjYXVnaHRcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZpcmViYXNlL2ZpcmViYXNlLWpzLXNkay9pc3N1ZXMvNjA4XG4gICAgICAgIGNvbnN0IGVuYWJsZVBlcnNpc3RlbmNlID0gKCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gZnJvbShmaXJlc3RvcmUuZW5hYmxlUGVyc2lzdGVuY2UocGVyc2lzdGVuY2VTZXR0aW5ncyB8fCB1bmRlZmluZWQpLnRoZW4oKCkgPT4gdHJ1ZSwgKCkgPT4gZmFsc2UpKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7IGNvbnNvbGUud2FybihlKTsgfVxuICAgICAgICAgICAgcmV0dXJuIG9mKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBbZmlyZXN0b3JlLCB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKGVuYWJsZVBlcnNpc3RlbmNlKV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gW2ZpcmVzdG9yZSwgb2YoZmFsc2UpXTtcbiAgICAgIH1cblxuICAgIH0sIFtzZXR0aW5ncywgdXNlRW11bGF0b3IsIHNob3VsZEVuYWJsZVBlcnNpc3RlbmNlXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgcmVmZXJlbmNlIHRvIGEgRmlyZXN0b3JlIENvbGxlY3Rpb24gYmFzZWQgb24gYSBwYXRoIG9yXG4gICAqIENvbGxlY3Rpb25SZWZlcmVuY2UgYW5kIGFuIG9wdGlvbmFsIHF1ZXJ5IGZ1bmN0aW9uIHRvIG5hcnJvdyB0aGUgcmVzdWx0XG4gICAqIHNldC5cbiAgICovXG4gIGNvbGxlY3Rpb248VD4ocGF0aDogc3RyaW5nLCBxdWVyeUZuPzogUXVlcnlGbik6IEFuZ3VsYXJGaXJlc3RvcmVDb2xsZWN0aW9uPFQ+O1xuICBjb2xsZWN0aW9uPFQ+KHJlZjogQ29sbGVjdGlvblJlZmVyZW5jZSwgcXVlcnlGbj86IFF1ZXJ5Rm4pOiBBbmd1bGFyRmlyZXN0b3JlQ29sbGVjdGlvbjxUPjtcbiAgY29sbGVjdGlvbjxUPihwYXRoT3JSZWY6IHN0cmluZyB8IENvbGxlY3Rpb25SZWZlcmVuY2U8VD4sIHF1ZXJ5Rm4/OiBRdWVyeUZuKTogQW5ndWxhckZpcmVzdG9yZUNvbGxlY3Rpb248VD4ge1xuICAgIGxldCBjb2xsZWN0aW9uUmVmOiBDb2xsZWN0aW9uUmVmZXJlbmNlPFQ+O1xuICAgIGlmICh0eXBlb2YgcGF0aE9yUmVmID09PSAnc3RyaW5nJykge1xuICAgICAgY29sbGVjdGlvblJlZiA9IHRoaXMuZmlyZXN0b3JlLmNvbGxlY3Rpb24ocGF0aE9yUmVmKSBhcyBmaXJlYmFzZS5maXJlc3RvcmUuQ29sbGVjdGlvblJlZmVyZW5jZTxUPjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29sbGVjdGlvblJlZiA9IHBhdGhPclJlZjtcbiAgICB9XG4gICAgY29uc3QgeyByZWYsIHF1ZXJ5IH0gPSBhc3NvY2lhdGVRdWVyeTxUPihjb2xsZWN0aW9uUmVmLCBxdWVyeUZuKTtcbiAgICBjb25zdCByZWZJblpvbmUgPSB0aGlzLnNjaGVkdWxlcnMubmdab25lLnJ1bigoKSA9PiByZWYpO1xuICAgIHJldHVybiBuZXcgQW5ndWxhckZpcmVzdG9yZUNvbGxlY3Rpb248VD4ocmVmSW5ab25lLCBxdWVyeSwgdGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgcmVmZXJlbmNlIHRvIGEgRmlyZXN0b3JlIENvbGxlY3Rpb24gR3JvdXAgYmFzZWQgb24gYSBjb2xsZWN0aW9uSWRcbiAgICogYW5kIGFuIG9wdGlvbmFsIHF1ZXJ5IGZ1bmN0aW9uIHRvIG5hcnJvdyB0aGUgcmVzdWx0XG4gICAqIHNldC5cbiAgICovXG4gIGNvbGxlY3Rpb25Hcm91cDxUPihjb2xsZWN0aW9uSWQ6IHN0cmluZywgcXVlcnlHcm91cEZuPzogUXVlcnlHcm91cEZuPFQ+KTogQW5ndWxhckZpcmVzdG9yZUNvbGxlY3Rpb25Hcm91cDxUPiB7XG4gICAgY29uc3QgcXVlcnlGbiA9IHF1ZXJ5R3JvdXBGbiB8fCAocmVmID0+IHJlZik7XG4gICAgY29uc3QgY29sbGVjdGlvbkdyb3VwOiBRdWVyeTxUPiA9IHRoaXMuZmlyZXN0b3JlLmNvbGxlY3Rpb25Hcm91cChjb2xsZWN0aW9uSWQpIGFzIGZpcmViYXNlLmZpcmVzdG9yZS5RdWVyeTxUPjtcbiAgICByZXR1cm4gbmV3IEFuZ3VsYXJGaXJlc3RvcmVDb2xsZWN0aW9uR3JvdXA8VD4ocXVlcnlGbihjb2xsZWN0aW9uR3JvdXApLCB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSByZWZlcmVuY2UgdG8gYSBGaXJlc3RvcmUgRG9jdW1lbnQgYmFzZWQgb24gYSBwYXRoIG9yXG4gICAqIERvY3VtZW50UmVmZXJlbmNlLiBOb3RlIHRoYXQgZG9jdW1lbnRzIGFyZSBub3QgcXVlcnlhYmxlIGJlY2F1c2UgdGhleSBhcmVcbiAgICogc2ltcGx5IG9iamVjdHMuIEhvd2V2ZXIsIGRvY3VtZW50cyBoYXZlIHN1Yi1jb2xsZWN0aW9ucyB0aGF0IHJldHVybiBhXG4gICAqIENvbGxlY3Rpb24gcmVmZXJlbmNlIGFuZCBjYW4gYmUgcXVlcmllZC5cbiAgICovXG4gIGRvYzxUPihwYXRoOiBzdHJpbmcpOiBBbmd1bGFyRmlyZXN0b3JlRG9jdW1lbnQ8VD47XG4gIGRvYzxUPihyZWY6IERvY3VtZW50UmVmZXJlbmNlKTogQW5ndWxhckZpcmVzdG9yZURvY3VtZW50PFQ+O1xuICBkb2M8VD4ocGF0aE9yUmVmOiBzdHJpbmcgfCBEb2N1bWVudFJlZmVyZW5jZTxUPik6IEFuZ3VsYXJGaXJlc3RvcmVEb2N1bWVudDxUPiB7XG4gICAgbGV0IHJlZjogRG9jdW1lbnRSZWZlcmVuY2U8VD47XG4gICAgaWYgKHR5cGVvZiBwYXRoT3JSZWYgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZWYgPSB0aGlzLmZpcmVzdG9yZS5kb2MocGF0aE9yUmVmKSBhcyBmaXJlYmFzZS5maXJlc3RvcmUuRG9jdW1lbnRSZWZlcmVuY2U8VD47XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZiA9IHBhdGhPclJlZjtcbiAgICB9XG4gICAgY29uc3QgcmVmSW5ab25lID0gdGhpcy5zY2hlZHVsZXJzLm5nWm9uZS5ydW4oKCkgPT4gcmVmKTtcbiAgICByZXR1cm4gbmV3IEFuZ3VsYXJGaXJlc3RvcmVEb2N1bWVudDxUPihyZWZJblpvbmUsIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBnZW5lcmF0ZWQgRmlyZXN0b3JlIERvY3VtZW50IElkLlxuICAgKi9cbiAgY3JlYXRlSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlyZXN0b3JlLmNvbGxlY3Rpb24oJ18nKS5kb2MoKS5pZDtcbiAgfVxufVxuIl19