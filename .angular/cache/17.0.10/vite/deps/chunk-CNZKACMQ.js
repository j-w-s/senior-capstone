import {
  getLimitedUseToken,
  getToken,
  initializeAppCheck,
  onTokenChanged,
  setTokenAutoRefreshEnabled
} from "./chunk-3PP5LNKO.js";
import {
  isPlatformServer
} from "./chunk-YJNPXDWQ.js";
import {
  FirebaseApp,
  FirebaseApps,
  VERSION,
  ɵAPP_CHECK_PROVIDER_NAME,
  ɵAngularFireSchedulers,
  ɵAppCheckInstances,
  ɵgetAllInstancesOf,
  ɵgetDefaultInstanceOf,
  ɵzoneWrap
} from "./chunk-LFHMWOXJ.js";
import {
  InjectionToken,
  Injector,
  NgModule,
  NgZone,
  Optional,
  PLATFORM_ID,
  concatMap,
  distinct,
  from,
  isDevMode,
  setClassMetadata,
  timer,
  ɵɵdefineInjector,
  ɵɵdefineNgModule
} from "./chunk-UCPKFTR5.js";
import {
  registerVersion
} from "./chunk-HHEXDI44.js";

// node_modules/@angular/fire/fesm2022/angular-fire-app-check.mjs
var AppCheck = class {
  constructor(appCheck) {
    return appCheck;
  }
};
var appCheckInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(ɵAPP_CHECK_PROVIDER_NAME))), distinct());
var PROVIDED_APP_CHECK_INSTANCES = new InjectionToken("angularfire2.app-check-instances");
function defaultAppCheckInstanceFactory(provided, defaultApp) {
  const defaultAppCheck = ɵgetDefaultInstanceOf(ɵAPP_CHECK_PROVIDER_NAME, provided, defaultApp);
  return defaultAppCheck && new AppCheck(defaultAppCheck);
}
var LOCALHOSTS = ["localhost", "0.0.0.0", "127.0.0.1"];
var isLocalhost = typeof window !== "undefined" && LOCALHOSTS.includes(window.location.hostname);
function appCheckInstanceFactory(fn) {
  return (zone, injector, platformId) => {
    if (!isPlatformServer(platformId) && (isDevMode() || isLocalhost)) {
      globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN ??= true;
    }
    const appCheck = zone.runOutsideAngular(() => fn(injector));
    return new AppCheck(appCheck);
  };
}
var APP_CHECK_INSTANCES_PROVIDER = {
  provide: ɵAppCheckInstances,
  deps: [[new Optional(), PROVIDED_APP_CHECK_INSTANCES]]
};
var DEFAULT_APP_CHECK_INSTANCE_PROVIDER = {
  provide: AppCheck,
  useFactory: defaultAppCheckInstanceFactory,
  deps: [[new Optional(), PROVIDED_APP_CHECK_INSTANCES], FirebaseApp, PLATFORM_ID]
};
var AppCheckModule = class _AppCheckModule {
  constructor() {
    registerVersion("angularfire", VERSION.full, "app-check");
  }
  static ɵfac = function AppCheckModule_Factory(t) {
    return new (t || _AppCheckModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AppCheckModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [DEFAULT_APP_CHECK_INSTANCE_PROVIDER, APP_CHECK_INSTANCES_PROVIDER]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppCheckModule, [{
    type: NgModule,
    args: [{
      providers: [DEFAULT_APP_CHECK_INSTANCE_PROVIDER, APP_CHECK_INSTANCES_PROVIDER]
    }]
  }], () => [], null);
})();
function provideAppCheck(fn, ...deps) {
  return {
    ngModule: AppCheckModule,
    providers: [{
      provide: PROVIDED_APP_CHECK_INSTANCES,
      useFactory: appCheckInstanceFactory(fn),
      multi: true,
      deps: [NgZone, Injector, PLATFORM_ID, ɵAngularFireSchedulers, FirebaseApps, ...deps]
    }]
  };
}
var getLimitedUseToken2 = ɵzoneWrap(getLimitedUseToken, true);
var getToken2 = ɵzoneWrap(getToken, true);
var initializeAppCheck2 = ɵzoneWrap(initializeAppCheck, true);
var onTokenChanged2 = ɵzoneWrap(onTokenChanged, true);
var setTokenAutoRefreshEnabled2 = ɵzoneWrap(setTokenAutoRefreshEnabled, true);

export {
  AppCheck,
  appCheckInstance$,
  AppCheckModule,
  provideAppCheck,
  getLimitedUseToken2 as getLimitedUseToken,
  getToken2 as getToken,
  initializeAppCheck2 as initializeAppCheck,
  onTokenChanged2 as onTokenChanged,
  setTokenAutoRefreshEnabled2 as setTokenAutoRefreshEnabled
};
//# sourceMappingURL=chunk-CNZKACMQ.js.map
