import { Injectable, Injector, NgZone } from '@angular/core';
import { VERSION } from '@angular/fire';
import { Auth, authState } from '@angular/fire/auth';
import { registerVersion } from 'firebase/app';
import { Analytics } from './analytics';
import { isSupported, setUserId } from './firebase';
import * as i0 from "@angular/core";
import * as i1 from "@angular/fire/auth";
export class UserTrackingService {
    initialized;
    disposables = [];
    constructor(auth, zone, injector) {
        registerVersion('angularfire', VERSION.full, 'user-tracking');
        let resolveInitialized;
        this.initialized = zone.runOutsideAngular(() => new Promise(resolve => { resolveInitialized = resolve; }));
        // The APP_INITIALIZER that is making isSupported() sync for the sake of convenient DI
        // may not be done when services are initialized. Guard the functionality by first ensuring
        // that the (global) promise has resolved, then get Analytics from the injector.
        isSupported().then(() => {
            const analytics = injector.get(Analytics);
            if (analytics) {
                this.disposables = [
                    // TODO add credential tracking back in
                    authState(auth).subscribe(user => {
                        setUserId(analytics, user?.uid);
                        resolveInitialized();
                    }),
                ];
            }
            else {
                resolveInitialized();
            }
        });
    }
    ngOnDestroy() {
        this.disposables.forEach(it => it.unsubscribe());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: UserTrackingService, deps: [{ token: i1.Auth }, { token: i0.NgZone }, { token: i0.Injector }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: UserTrackingService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: UserTrackingService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.Auth }, { type: i0.NgZone }, { type: i0.Injector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci10cmFja2luZy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FuYWx5dGljcy91c2VyLXRyYWNraW5nLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRS9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsTUFBTSxZQUFZLENBQUM7OztBQUdwRCxNQUFNLE9BQU8sbUJBQW1CO0lBRWQsV0FBVyxDQUFnQjtJQUNuQyxXQUFXLEdBQW1CLEVBQUUsQ0FBQztJQUV6QyxZQUNFLElBQVUsRUFDVixJQUFZLEVBQ1osUUFBa0I7UUFFbEIsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQzlELElBQUksa0JBQThCLENBQUM7UUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNHLHNGQUFzRjtRQUN0RiwyRkFBMkY7UUFDM0YsZ0ZBQWdGO1FBQ2hGLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDdEIsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxJQUFJLFNBQVMsRUFBRTtnQkFDYixJQUFJLENBQUMsV0FBVyxHQUFHO29CQUNqQix1Q0FBdUM7b0JBQ3ZDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQy9CLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUNoQyxrQkFBa0IsRUFBRSxDQUFDO29CQUN2QixDQUFDLENBQUM7aUJBQ0gsQ0FBQzthQUNIO2lCQUFNO2dCQUNMLGtCQUFrQixFQUFFLENBQUM7YUFDdEI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNuRCxDQUFDO3VHQWxDVSxtQkFBbUI7MkdBQW5CLG1CQUFtQjs7MkZBQW5CLG1CQUFtQjtrQkFEL0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIEluamVjdG9yLCBOZ1pvbmUsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgVkVSU0lPTiB9IGZyb20gJ0Bhbmd1bGFyL2ZpcmUnO1xuaW1wb3J0IHsgQXV0aCwgYXV0aFN0YXRlIH0gZnJvbSAnQGFuZ3VsYXIvZmlyZS9hdXRoJztcbmltcG9ydCB7IHJlZ2lzdGVyVmVyc2lvbiB9IGZyb20gJ2ZpcmViYXNlL2FwcCc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IEFuYWx5dGljcyB9IGZyb20gJy4vYW5hbHl0aWNzJztcbmltcG9ydCB7IGlzU3VwcG9ydGVkLCBzZXRVc2VySWQgfSBmcm9tICcuL2ZpcmViYXNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFVzZXJUcmFja2luZ1NlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuXG4gIHB1YmxpYyByZWFkb25seSBpbml0aWFsaXplZDogUHJvbWlzZTx2b2lkPjtcbiAgcHJpdmF0ZSBkaXNwb3NhYmxlczogU3Vic2NyaXB0aW9uW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhdXRoOiBBdXRoLFxuICAgIHpvbmU6IE5nWm9uZSxcbiAgICBpbmplY3RvcjogSW5qZWN0b3IsXG4gICkge1xuICAgIHJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcmZpcmUnLCBWRVJTSU9OLmZ1bGwsICd1c2VyLXRyYWNraW5nJyk7XG4gICAgbGV0IHJlc29sdmVJbml0aWFsaXplZDogKCkgPT4gdm9pZDtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHsgcmVzb2x2ZUluaXRpYWxpemVkID0gcmVzb2x2ZTsgfSkpO1xuICAgIC8vIFRoZSBBUFBfSU5JVElBTElaRVIgdGhhdCBpcyBtYWtpbmcgaXNTdXBwb3J0ZWQoKSBzeW5jIGZvciB0aGUgc2FrZSBvZiBjb252ZW5pZW50IERJXG4gICAgLy8gbWF5IG5vdCBiZSBkb25lIHdoZW4gc2VydmljZXMgYXJlIGluaXRpYWxpemVkLiBHdWFyZCB0aGUgZnVuY3Rpb25hbGl0eSBieSBmaXJzdCBlbnN1cmluZ1xuICAgIC8vIHRoYXQgdGhlIChnbG9iYWwpIHByb21pc2UgaGFzIHJlc29sdmVkLCB0aGVuIGdldCBBbmFseXRpY3MgZnJvbSB0aGUgaW5qZWN0b3IuXG4gICAgaXNTdXBwb3J0ZWQoKS50aGVuKCgpID0+IHtcbiAgICAgIGNvbnN0IGFuYWx5dGljcyA9IGluamVjdG9yLmdldChBbmFseXRpY3MpO1xuICAgICAgaWYgKGFuYWx5dGljcykge1xuICAgICAgICB0aGlzLmRpc3Bvc2FibGVzID0gW1xuICAgICAgICAgIC8vIFRPRE8gYWRkIGNyZWRlbnRpYWwgdHJhY2tpbmcgYmFjayBpblxuICAgICAgICAgIGF1dGhTdGF0ZShhdXRoKS5zdWJzY3JpYmUodXNlciA9PiB7XG4gICAgICAgICAgICBzZXRVc2VySWQoYW5hbHl0aWNzLCB1c2VyPy51aWQpO1xuICAgICAgICAgICAgcmVzb2x2ZUluaXRpYWxpemVkKCk7XG4gICAgICAgICAgfSksXG4gICAgICAgIF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlSW5pdGlhbGl6ZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuZm9yRWFjaChpdCA9PiBpdC51bnN1YnNjcmliZSgpKTtcbiAgfVxufVxuIl19