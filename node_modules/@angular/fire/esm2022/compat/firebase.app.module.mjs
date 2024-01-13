import { Inject, InjectionToken, VERSION as NG_VERSION, NgModule, NgZone, Optional, PLATFORM_ID, isDevMode } from '@angular/core';
import { VERSION } from '@angular/fire';
import firebase from 'firebase/compat/app';
import { FirebaseApp } from './firebase.app';
import * as i0 from "@angular/core";
export const FIREBASE_OPTIONS = new InjectionToken('angularfire2.app.options');
export const FIREBASE_APP_NAME = new InjectionToken('angularfire2.app.name');
export function ɵfirebaseAppFactory(options, zone, nameOrConfig) {
    const name = typeof nameOrConfig === 'string' && nameOrConfig || '[DEFAULT]';
    const config = typeof nameOrConfig === 'object' && nameOrConfig || {};
    config.name = config.name || name;
    // Added any due to some inconsistency between @firebase/app and firebase types
    const existingApp = firebase.apps.filter(app => app && app.name === config.name)[0];
    // We support FirebaseConfig, initializeApp's public type only accepts string; need to cast as any
    // Could be solved with https://github.com/firebase/firebase-js-sdk/pull/1206
    const app = (existingApp || zone.runOutsideAngular(() => firebase.initializeApp(options, config)));
    try {
        if (JSON.stringify(options) !== JSON.stringify(app.options)) {
            const hmr = !!module.hot;
            log('error', `${app.name} Firebase App already initialized with different options${hmr ? ', you may need to reload as Firebase is not HMR aware.' : '.'}`);
        }
    }
    catch (e) { /* empty */ }
    return new FirebaseApp(app);
}
const log = (level, ...args) => {
    if (isDevMode() && typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console[level](...args);
    }
};
const FIREBASE_APP_PROVIDER = {
    provide: FirebaseApp,
    useFactory: ɵfirebaseAppFactory,
    deps: [
        FIREBASE_OPTIONS,
        NgZone,
        [new Optional(), FIREBASE_APP_NAME]
    ]
};
export class AngularFireModule {
    static initializeApp(options, nameOrConfig) {
        return {
            ngModule: AngularFireModule,
            providers: [
                { provide: FIREBASE_OPTIONS, useValue: options },
                { provide: FIREBASE_APP_NAME, useValue: nameOrConfig }
            ]
        };
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    constructor(platformId) {
        firebase.registerVersion('angularfire', VERSION.full, 'core');
        firebase.registerVersion('angularfire', VERSION.full, 'app-compat');
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        firebase.registerVersion('angular', NG_VERSION.full, platformId.toString());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireModule, deps: [{ token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.0.6", ngImport: i0, type: AngularFireModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireModule, providers: [FIREBASE_APP_PROVIDER] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.6", ngImport: i0, type: AngularFireModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [FIREBASE_APP_PROVIDER]
                }]
        }], ctorParameters: () => [{ type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZWJhc2UuYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wYXQvZmlyZWJhc2UuYXBwLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsTUFBTSxFQUFFLGNBQWMsRUFBdUIsT0FBTyxJQUFJLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUN2SCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXhDLE9BQU8sUUFBUSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFFN0MsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxjQUFjLENBQWtCLDBCQUEwQixDQUFDLENBQUM7QUFDaEcsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxjQUFjLENBQXFCLHVCQUF1QixDQUFDLENBQUM7QUFHakcsTUFBTSxVQUFVLG1CQUFtQixDQUFDLE9BQXdCLEVBQUUsSUFBWSxFQUFFLFlBQWtEO0lBQzVILE1BQU0sSUFBSSxHQUFHLE9BQU8sWUFBWSxLQUFLLFFBQVEsSUFBSSxZQUFZLElBQUksV0FBVyxDQUFDO0lBQzdFLE1BQU0sTUFBTSxHQUFHLE9BQU8sWUFBWSxLQUFLLFFBQVEsSUFBSSxZQUFZLElBQUksRUFBRSxDQUFDO0lBQ3RFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7SUFDbEMsK0VBQStFO0lBQy9FLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BGLGtHQUFrRztJQUNsRyw2RUFBNkU7SUFDN0UsTUFBTSxHQUFHLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE1BQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRyxJQUFJO1FBQ0YsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzNELE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBRSxNQUFjLENBQUMsR0FBRyxDQUFDO1lBQ2xDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSwyREFBMkQsR0FBRyxDQUFDLENBQUMsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUM1SjtLQUNGO0lBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUU7SUFDM0IsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQsTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFrQyxFQUFFLEdBQUcsSUFBUyxFQUFFLEVBQUU7SUFDL0QsSUFBSSxTQUFTLEVBQUUsSUFBSSxPQUFPLE9BQU8sS0FBSyxXQUFXLEVBQUU7UUFDakQsc0NBQXNDO1FBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ3pCO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSxxQkFBcUIsR0FBRztJQUM1QixPQUFPLEVBQUUsV0FBVztJQUNwQixVQUFVLEVBQUUsbUJBQW1CO0lBQy9CLElBQUksRUFBRTtRQUNKLGdCQUFnQjtRQUNoQixNQUFNO1FBQ04sQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLGlCQUFpQixDQUFDO0tBQ3BDO0NBQ0YsQ0FBQztBQUtGLE1BQU0sT0FBTyxpQkFBaUI7SUFDNUIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUF3QixFQUFFLFlBQTJDO1FBQ3hGLE9BQU87WUFDTCxRQUFRLEVBQUUsaUJBQWlCO1lBQzNCLFNBQVMsRUFBRTtnQkFDVCxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFDO2dCQUM5QyxFQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFDO2FBQ3JEO1NBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCx3REFBd0Q7SUFDeEQsWUFBaUMsVUFBa0I7UUFDakQsUUFBUSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5RCxRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3BFLGdFQUFnRTtRQUNoRSxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzlFLENBQUM7dUdBakJVLGlCQUFpQixrQkFZUixXQUFXO3dHQVpwQixpQkFBaUI7d0dBQWpCLGlCQUFpQixhQUZqQixDQUFDLHFCQUFxQixDQUFDOzsyRkFFdkIsaUJBQWlCO2tCQUg3QixRQUFRO21CQUFDO29CQUNSLFNBQVMsRUFBRSxDQUFDLHFCQUFxQixDQUFDO2lCQUNuQzs7MEJBYWMsTUFBTTsyQkFBQyxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgSW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgTW9kdWxlV2l0aFByb3ZpZGVycywgVkVSU0lPTiBhcyBOR19WRVJTSU9OLCBOZ01vZHVsZSwgTmdab25lLCBPcHRpb25hbCwgUExBVEZPUk1fSUQsIGlzRGV2TW9kZVxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tICdAYW5ndWxhci9maXJlJztcbmltcG9ydCB7IEZpcmViYXNlQXBwU2V0dGluZ3MsIEZpcmViYXNlT3B0aW9ucyB9IGZyb20gJ2ZpcmViYXNlL2FwcCc7XG5pbXBvcnQgZmlyZWJhc2UgZnJvbSAnZmlyZWJhc2UvY29tcGF0L2FwcCc7XG5pbXBvcnQgeyBGaXJlYmFzZUFwcCB9IGZyb20gJy4vZmlyZWJhc2UuYXBwJztcblxuZXhwb3J0IGNvbnN0IEZJUkVCQVNFX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48RmlyZWJhc2VPcHRpb25zPignYW5ndWxhcmZpcmUyLmFwcC5vcHRpb25zJyk7XG5leHBvcnQgY29uc3QgRklSRUJBU0VfQVBQX05BTUUgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nIHwgdW5kZWZpbmVkPignYW5ndWxhcmZpcmUyLmFwcC5uYW1lJyk7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIMm1ZmlyZWJhc2VBcHBGYWN0b3J5KG9wdGlvbnM6IEZpcmViYXNlT3B0aW9ucywgem9uZTogTmdab25lLCBuYW1lT3JDb25maWc/OiBzdHJpbmcgfCBGaXJlYmFzZUFwcFNldHRpbmdzIHwgbnVsbCkge1xuICBjb25zdCBuYW1lID0gdHlwZW9mIG5hbWVPckNvbmZpZyA9PT0gJ3N0cmluZycgJiYgbmFtZU9yQ29uZmlnIHx8ICdbREVGQVVMVF0nO1xuICBjb25zdCBjb25maWcgPSB0eXBlb2YgbmFtZU9yQ29uZmlnID09PSAnb2JqZWN0JyAmJiBuYW1lT3JDb25maWcgfHwge307XG4gIGNvbmZpZy5uYW1lID0gY29uZmlnLm5hbWUgfHwgbmFtZTtcbiAgLy8gQWRkZWQgYW55IGR1ZSB0byBzb21lIGluY29uc2lzdGVuY3kgYmV0d2VlbiBAZmlyZWJhc2UvYXBwIGFuZCBmaXJlYmFzZSB0eXBlc1xuICBjb25zdCBleGlzdGluZ0FwcCA9IGZpcmViYXNlLmFwcHMuZmlsdGVyKGFwcCA9PiBhcHAgJiYgYXBwLm5hbWUgPT09IGNvbmZpZy5uYW1lKVswXTtcbiAgLy8gV2Ugc3VwcG9ydCBGaXJlYmFzZUNvbmZpZywgaW5pdGlhbGl6ZUFwcCdzIHB1YmxpYyB0eXBlIG9ubHkgYWNjZXB0cyBzdHJpbmc7IG5lZWQgdG8gY2FzdCBhcyBhbnlcbiAgLy8gQ291bGQgYmUgc29sdmVkIHdpdGggaHR0cHM6Ly9naXRodWIuY29tL2ZpcmViYXNlL2ZpcmViYXNlLWpzLXNkay9wdWxsLzEyMDZcbiAgY29uc3QgYXBwID0gKGV4aXN0aW5nQXBwIHx8IHpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChvcHRpb25zLCBjb25maWcgYXMgYW55KSkpO1xuICB0cnkge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeShvcHRpb25zKSAhPT0gSlNPTi5zdHJpbmdpZnkoYXBwLm9wdGlvbnMpKSB7XG4gICAgICBjb25zdCBobXIgPSAhIShtb2R1bGUgYXMgYW55KS5ob3Q7XG4gICAgICBsb2coJ2Vycm9yJywgYCR7YXBwLm5hbWV9IEZpcmViYXNlIEFwcCBhbHJlYWR5IGluaXRpYWxpemVkIHdpdGggZGlmZmVyZW50IG9wdGlvbnMke2htciA/ICcsIHlvdSBtYXkgbmVlZCB0byByZWxvYWQgYXMgRmlyZWJhc2UgaXMgbm90IEhNUiBhd2FyZS4nIDogJy4nfWApO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBuZXcgRmlyZWJhc2VBcHAoYXBwKTtcbn1cblxuY29uc3QgbG9nID0gKGxldmVsOiAnbG9nJ3wnZXJyb3InfCdpbmZvJ3wnd2FybicsIC4uLmFyZ3M6IGFueSkgPT4ge1xuICBpZiAoaXNEZXZNb2RlKCkgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlW2xldmVsXSguLi5hcmdzKTtcbiAgfVxufTtcblxuY29uc3QgRklSRUJBU0VfQVBQX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBGaXJlYmFzZUFwcCxcbiAgdXNlRmFjdG9yeTogybVmaXJlYmFzZUFwcEZhY3RvcnksXG4gIGRlcHM6IFtcbiAgICBGSVJFQkFTRV9PUFRJT05TLFxuICAgIE5nWm9uZSxcbiAgICBbbmV3IE9wdGlvbmFsKCksIEZJUkVCQVNFX0FQUF9OQU1FXVxuICBdXG59O1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFtGSVJFQkFTRV9BUFBfUFJPVklERVJdXG59KVxuZXhwb3J0IGNsYXNzIEFuZ3VsYXJGaXJlTW9kdWxlIHtcbiAgc3RhdGljIGluaXRpYWxpemVBcHAob3B0aW9uczogRmlyZWJhc2VPcHRpb25zLCBuYW1lT3JDb25maWc/OiBzdHJpbmcgfCBGaXJlYmFzZUFwcFNldHRpbmdzKTogTW9kdWxlV2l0aFByb3ZpZGVyczxBbmd1bGFyRmlyZU1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogQW5ndWxhckZpcmVNb2R1bGUsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAge3Byb3ZpZGU6IEZJUkVCQVNFX09QVElPTlMsIHVzZVZhbHVlOiBvcHRpb25zfSxcbiAgICAgICAge3Byb3ZpZGU6IEZJUkVCQVNFX0FQUF9OQU1FLCB1c2VWYWx1ZTogbmFtZU9yQ29uZmlnfVxuICAgICAgXVxuICAgIH07XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10eXBlc1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3QpIHtcbiAgICBmaXJlYmFzZS5yZWdpc3RlclZlcnNpb24oJ2FuZ3VsYXJmaXJlJywgVkVSU0lPTi5mdWxsLCAnY29yZScpO1xuICAgIGZpcmViYXNlLnJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcmZpcmUnLCBWRVJTSU9OLmZ1bGwsICdhcHAtY29tcGF0Jyk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1iYXNlLXRvLXN0cmluZ1xuICAgIGZpcmViYXNlLnJlZ2lzdGVyVmVyc2lvbignYW5ndWxhcicsIE5HX1ZFUlNJT04uZnVsbCwgcGxhdGZvcm1JZC50b1N0cmluZygpKTtcbiAgfVxufVxuIl19