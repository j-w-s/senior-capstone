import {
  firebase
} from "./chunk-45S7XIES.js";
import "./chunk-CNZKACMQ.js";
import "./chunk-3PP5LNKO.js";
import {
  isPlatformServer
} from "./chunk-YJNPXDWQ.js";
import {
  AbstractUserDataWriter,
  Bytes,
  DatabaseId,
  DocumentKey,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  FieldPath$1,
  FirestoreError,
  GeoPoint,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  WriteBatch,
  __PRIVATE_cast,
  __PRIVATE_debugAssert,
  __PRIVATE_isBase64Available,
  __PRIVATE_logWarn,
  __PRIVATE_validateIsNotUsedTogether,
  addDoc,
  arrayRemove,
  arrayUnion,
  clearIndexedDbPersistence,
  collection,
  collectionGroup,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  disableNetwork,
  doc,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  enableNetwork,
  endAt,
  endBefore,
  ensureFirestoreConfigured,
  executeWrite,
  fe,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  increment,
  limit,
  limitToLast,
  loadBundle,
  namedQuery,
  onSnapshot,
  onSnapshotsInSync,
  orderBy,
  query,
  queryEqual,
  refEqual,
  runTransaction,
  serverTimestamp,
  setDoc,
  setLogLevel,
  snapshotEqual,
  startAfter,
  startAt,
  updateDoc,
  waitForPendingWrites,
  where
} from "./chunk-RG7HO3HY.js";
import "./chunk-SFOPF4EI.js";
import {
  VERSION as VERSION2,
  keepUnstableUntilFirst,
  ɵAngularFireSchedulers,
  ɵAppCheckInstances
} from "./chunk-LFHMWOXJ.js";
import "./chunk-GJHES7CW.js";
import {
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  NgZone,
  Observable,
  Optional,
  PLATFORM_ID,
  Subject,
  VERSION,
  asyncScheduler,
  distinctUntilChanged,
  filter,
  first,
  from,
  isDevMode,
  map,
  merge,
  observeOn,
  of,
  pairwise,
  scan,
  setClassMetadata,
  shareReplay,
  startWith,
  subscribeOn,
  switchMap,
  switchMapTo,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵinject
} from "./chunk-UCPKFTR5.js";
import "./chunk-LHRTKJE6.js";
import {
  Component,
  getModularInstance
} from "./chunk-HHEXDI44.js";
import {
  __spreadValues
} from "./chunk-EQU7RARR.js";

// node_modules/firebase/compat/app/dist/esm/index.esm.js
var name = "firebase";
var version = "10.7.1";
firebase.registerVersion(name, version, "app-compat");

// node_modules/@angular/fire/fesm2022/angular-fire-compat.mjs
var noopFunctions = ["ngOnDestroy"];
var ɵlazySDKProxy = (klass, observable, zone, options = {}) => {
  return new Proxy(klass, {
    get: (_, name3) => zone.runOutsideAngular(() => {
      if (klass[name3]) {
        if (options?.spy?.get) {
          options.spy.get(name3, klass[name3]);
        }
        return klass[name3];
      }
      if (noopFunctions.indexOf(name3) > -1) {
        return () => void 0;
      }
      const promise = observable.toPromise().then((mod) => {
        const ret = mod?.[name3];
        if (typeof ret === "function") {
          return ret.bind(mod);
        } else if (ret?.then) {
          return ret.then((res) => zone.run(() => res));
        } else {
          return zone.run(() => ret);
        }
      });
      return new Proxy(() => void 0, {
        get: (_2, name4) => promise[name4],
        // TODO handle callbacks as transparently as I can
        apply: (self, _2, args) => promise.then((it) => {
          const res = it?.(...args);
          if (options?.spy?.apply) {
            options.spy.apply(name3, args, res);
          }
          return res;
        })
      });
    })
  });
};
var ɵapplyMixins = (derivedCtor, constructors) => {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype || baseCtor).forEach((name3) => {
      Object.defineProperty(derivedCtor.prototype, name3, Object.getOwnPropertyDescriptor(baseCtor.prototype || baseCtor, name3));
    });
  });
};
var FirebaseApp = class {
  constructor(app) {
    return app;
  }
};
var FIREBASE_OPTIONS = new InjectionToken("angularfire2.app.options");
var FIREBASE_APP_NAME = new InjectionToken("angularfire2.app.name");
function ɵfirebaseAppFactory(options, zone, nameOrConfig) {
  const name3 = typeof nameOrConfig === "string" && nameOrConfig || "[DEFAULT]";
  const config = typeof nameOrConfig === "object" && nameOrConfig || {};
  config.name = config.name || name3;
  const existingApp = firebase.apps.filter((app2) => app2 && app2.name === config.name)[0];
  const app = existingApp || zone.runOutsideAngular(() => firebase.initializeApp(options, config));
  try {
    if (JSON.stringify(options) !== JSON.stringify(app.options)) {
      const hmr = !!module.hot;
      log$1("error", `${app.name} Firebase App already initialized with different options${hmr ? ", you may need to reload as Firebase is not HMR aware." : "."}`);
    }
  } catch (e) {
  }
  return new FirebaseApp(app);
}
var log$1 = (level, ...args) => {
  if (isDevMode() && typeof console !== "undefined") {
    console[level](...args);
  }
};
var FIREBASE_APP_PROVIDER = {
  provide: FirebaseApp,
  useFactory: ɵfirebaseAppFactory,
  deps: [FIREBASE_OPTIONS, NgZone, [new Optional(), FIREBASE_APP_NAME]]
};
var AngularFireModule = class _AngularFireModule {
  static initializeApp(options, nameOrConfig) {
    return {
      ngModule: _AngularFireModule,
      providers: [{
        provide: FIREBASE_OPTIONS,
        useValue: options
      }, {
        provide: FIREBASE_APP_NAME,
        useValue: nameOrConfig
      }]
    };
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(platformId) {
    firebase.registerVersion("angularfire", VERSION2.full, "core");
    firebase.registerVersion("angularfire", VERSION2.full, "app-compat");
    firebase.registerVersion("angular", VERSION.full, platformId.toString());
  }
  static ɵfac = function AngularFireModule_Factory(t) {
    return new (t || _AngularFireModule)(ɵɵinject(PLATFORM_ID));
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AngularFireModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [FIREBASE_APP_PROVIDER]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFireModule, [{
    type: NgModule,
    args: [{
      providers: [FIREBASE_APP_PROVIDER]
    }]
  }], () => [{
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }], null);
})();
function ɵcacheInstance(cacheKey, moduleName, appName, fn, deps) {
  const [, instance, cachedDeps] = globalThis.ɵAngularfireInstanceCache.find((it) => it[0] === cacheKey) || [];
  if (instance) {
    if (!matchDep(deps, cachedDeps)) {
      log("error", `${moduleName} was already initialized on the ${appName} Firebase App with different settings.${IS_HMR ? " You may need to reload as Firebase is not HMR aware." : ""}`);
      log("warn", {
        is: deps,
        was: cachedDeps
      });
    }
    return instance;
  } else {
    const newInstance = fn();
    globalThis.ɵAngularfireInstanceCache.push([cacheKey, newInstance, deps]);
    return newInstance;
  }
}
function matchDep(a, b) {
  try {
    return a.toString() === b.toString();
  } catch (_) {
    return a === b;
  }
}
var IS_HMR = typeof module !== "undefined" && !!module.hot;
var log = (level, ...args) => {
  if (isDevMode() && typeof console !== "undefined") {
    console[level](...args);
  }
};
globalThis.ɵAngularfireInstanceCache ||= [];

// node_modules/@angular/fire/fesm2022/angular-fire-compat-auth.mjs
var proxyPolyfillCompat = {
  name: null,
  config: null,
  emulatorConfig: null,
  app: null,
  applyActionCode: null,
  checkActionCode: null,
  confirmPasswordReset: null,
  createUserWithEmailAndPassword: null,
  currentUser: null,
  fetchSignInMethodsForEmail: null,
  isSignInWithEmailLink: null,
  getRedirectResult: null,
  languageCode: null,
  settings: null,
  onAuthStateChanged: null,
  onIdTokenChanged: null,
  sendSignInLinkToEmail: null,
  sendPasswordResetEmail: null,
  setPersistence: null,
  signInAndRetrieveDataWithCredential: null,
  signInAnonymously: null,
  signInWithCredential: null,
  signInWithCustomToken: null,
  signInWithEmailAndPassword: null,
  signInWithPhoneNumber: null,
  signInWithEmailLink: null,
  signInWithPopup: null,
  signInWithRedirect: null,
  signOut: null,
  tenantId: null,
  updateCurrentUser: null,
  useDeviceLanguage: null,
  useEmulator: null,
  verifyPasswordResetCode: null
};
var USE_EMULATOR = new InjectionToken("angularfire2.auth.use-emulator");
var SETTINGS = new InjectionToken("angularfire2.auth.settings");
var TENANT_ID = new InjectionToken("angularfire2.auth.tenant-id");
var LANGUAGE_CODE = new InjectionToken("angularfire2.auth.langugage-code");
var USE_DEVICE_LANGUAGE = new InjectionToken("angularfire2.auth.use-device-language");
var PERSISTENCE = new InjectionToken("angularfire.auth.persistence");
var ɵauthFactory = (app, zone, useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence) => ɵcacheInstance(`${app.name}.auth`, "AngularFireAuth", app.name, () => {
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
var AngularFireAuth = class _AngularFireAuth {
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
  constructor(options, name3, platformId, zone, schedulers, useEmulator, settings, tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
    const logins = new Subject();
    const auth = of(void 0).pipe(observeOn(schedulers.outsideAngular), switchMap(() => zone.runOutsideAngular(() => import("./index.esm-JUJ4IQ7O.js"))), map(() => ɵfirebaseAppFactory(options, zone, name3)), map((app) => ɵauthFactory(app, zone, useEmulator, tenantId, languageCode, useDeviceLanguage, settings, persistence)), shareReplay({
      bufferSize: 1,
      refCount: false
    }));
    if (isPlatformServer(platformId)) {
      this.authState = this.user = this.idToken = this.idTokenResult = this.credential = of(null);
    } else {
      auth.pipe(first()).subscribe();
      const redirectResult = auth.pipe(switchMap((auth2) => auth2.getRedirectResult().then((it) => it, () => null)), keepUnstableUntilFirst, shareReplay({
        bufferSize: 1,
        refCount: false
      }));
      const authStateChanged = auth.pipe(switchMap((auth2) => new Observable((sub) => ({
        unsubscribe: zone.runOutsideAngular(() => auth2.onAuthStateChanged((next) => sub.next(next), (err) => sub.error(err), () => sub.complete()))
      }))));
      const idTokenChanged = auth.pipe(switchMap((auth2) => new Observable((sub) => ({
        unsubscribe: zone.runOutsideAngular(() => auth2.onIdTokenChanged((next) => sub.next(next), (err) => sub.error(err), () => sub.complete()))
      }))));
      this.authState = redirectResult.pipe(switchMapTo(authStateChanged), subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
      this.user = redirectResult.pipe(switchMapTo(idTokenChanged), subscribeOn(schedulers.outsideAngular), observeOn(schedulers.insideAngular));
      this.idToken = this.user.pipe(switchMap((user) => user ? from(user.getIdToken()) : of(null)));
      this.idTokenResult = this.user.pipe(switchMap((user) => user ? from(user.getIdTokenResult()) : of(null)));
      this.credential = merge(
        redirectResult,
        logins,
        // pipe in null authState to make credential zipable, just a weird devexp if
        // authState and user go null to still have a credential
        this.authState.pipe(filter((it) => !it))
      ).pipe(
        // handle the { user: { } } when a user is already logged in, rather have null
        // TODO handle the type corcersion better
        map((credential) => credential?.user ? credential : null),
        subscribeOn(schedulers.outsideAngular),
        observeOn(schedulers.insideAngular)
      );
    }
    return ɵlazySDKProxy(this, auth, zone, {
      spy: {
        apply: (name4, _, val) => {
          if (name4.startsWith("signIn") || name4.startsWith("createUser")) {
            val.then((user) => logins.next(user));
          }
        }
      }
    });
  }
  static ɵfac = function AngularFireAuth_Factory(t) {
    return new (t || _AngularFireAuth)(ɵɵinject(FIREBASE_OPTIONS), ɵɵinject(FIREBASE_APP_NAME, 8), ɵɵinject(PLATFORM_ID), ɵɵinject(NgZone), ɵɵinject(ɵAngularFireSchedulers), ɵɵinject(USE_EMULATOR, 8), ɵɵinject(SETTINGS, 8), ɵɵinject(TENANT_ID, 8), ɵɵinject(LANGUAGE_CODE, 8), ɵɵinject(USE_DEVICE_LANGUAGE, 8), ɵɵinject(PERSISTENCE, 8), ɵɵinject(ɵAppCheckInstances, 8));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _AngularFireAuth,
    factory: _AngularFireAuth.ɵfac,
    providedIn: "any"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFireAuth, [{
    type: Injectable,
    args: [{
      providedIn: "any"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [FIREBASE_OPTIONS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [FIREBASE_APP_NAME]
    }]
  }, {
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }, {
    type: NgZone
  }, {
    type: ɵAngularFireSchedulers
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_EMULATOR]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [SETTINGS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [TENANT_ID]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [LANGUAGE_CODE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_DEVICE_LANGUAGE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [PERSISTENCE]
    }]
  }, {
    type: ɵAppCheckInstances,
    decorators: [{
      type: Optional
    }]
  }], null);
})();
ɵapplyMixins(AngularFireAuth, [proxyPolyfillCompat]);
var AngularFireAuthModule = class _AngularFireAuthModule {
  constructor() {
    firebase.registerVersion("angularfire", VERSION2.full, "auth-compat");
  }
  static ɵfac = function AngularFireAuthModule_Factory(t) {
    return new (t || _AngularFireAuthModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AngularFireAuthModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [AngularFireAuth]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFireAuthModule, [{
    type: NgModule,
    args: [{
      providers: [AngularFireAuth]
    }]
  }], () => [], null);
})();

// node_modules/@firebase/firestore-compat/dist/index.esm2017.js
var name2 = "@firebase/firestore-compat";
var version2 = "0.3.23";
function validateSetOptions(methodName, options) {
  if (options === void 0) {
    return {
      merge: false
    };
  }
  if (options.mergeFields !== void 0 && options.merge !== void 0) {
    throw new FirestoreError("invalid-argument", `Invalid options passed to function ${methodName}(): You cannot specify both "merge" and "mergeFields".`);
  }
  return options;
}
function assertUint8ArrayAvailable() {
  if (typeof Uint8Array === "undefined") {
    throw new FirestoreError("unimplemented", "Uint8Arrays are not available in this environment.");
  }
}
function assertBase64Available() {
  if (!__PRIVATE_isBase64Available()) {
    throw new FirestoreError("unimplemented", "Blobs are unavailable in Firestore in this environment.");
  }
}
var Blob = class _Blob {
  constructor(_delegate) {
    this._delegate = _delegate;
  }
  static fromBase64String(base64) {
    assertBase64Available();
    return new _Blob(Bytes.fromBase64String(base64));
  }
  static fromUint8Array(array) {
    assertUint8ArrayAvailable();
    return new _Blob(Bytes.fromUint8Array(array));
  }
  toBase64() {
    assertBase64Available();
    return this._delegate.toBase64();
  }
  toUint8Array() {
    assertUint8ArrayAvailable();
    return this._delegate.toUint8Array();
  }
  isEqual(other) {
    return this._delegate.isEqual(other._delegate);
  }
  toString() {
    return "Blob(base64: " + this.toBase64() + ")";
  }
};
function isPartialObserver(obj) {
  return implementsAnyMethods(obj, ["next", "error", "complete"]);
}
function implementsAnyMethods(obj, methods) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const object = obj;
  for (const method of methods) {
    if (method in object && typeof object[method] === "function") {
      return true;
    }
  }
  return false;
}
var IndexedDbPersistenceProvider = class {
  enableIndexedDbPersistence(firestore, forceOwnership) {
    return enableIndexedDbPersistence(firestore._delegate, { forceOwnership });
  }
  enableMultiTabIndexedDbPersistence(firestore) {
    return enableMultiTabIndexedDbPersistence(firestore._delegate);
  }
  clearIndexedDbPersistence(firestore) {
    return clearIndexedDbPersistence(firestore._delegate);
  }
};
var Firestore = class {
  constructor(databaseIdOrApp, _delegate, _persistenceProvider) {
    this._delegate = _delegate;
    this._persistenceProvider = _persistenceProvider;
    this.INTERNAL = {
      delete: () => this.terminate()
    };
    if (!(databaseIdOrApp instanceof DatabaseId)) {
      this._appCompat = databaseIdOrApp;
    }
  }
  get _databaseId() {
    return this._delegate._databaseId;
  }
  settings(settingsLiteral) {
    const currentSettings = this._delegate._getSettings();
    if (!settingsLiteral.merge && currentSettings.host !== settingsLiteral.host) {
      __PRIVATE_logWarn("You are overriding the original host. If you did not intend to override your settings, use {merge: true}.");
    }
    if (settingsLiteral.merge) {
      settingsLiteral = Object.assign(Object.assign({}, currentSettings), settingsLiteral);
      delete settingsLiteral.merge;
    }
    this._delegate._setSettings(settingsLiteral);
  }
  useEmulator(host, port, options = {}) {
    connectFirestoreEmulator(this._delegate, host, port, options);
  }
  enableNetwork() {
    return enableNetwork(this._delegate);
  }
  disableNetwork() {
    return disableNetwork(this._delegate);
  }
  enablePersistence(settings) {
    let synchronizeTabs = false;
    let experimentalForceOwningTab = false;
    if (settings) {
      synchronizeTabs = !!settings.synchronizeTabs;
      experimentalForceOwningTab = !!settings.experimentalForceOwningTab;
      __PRIVATE_validateIsNotUsedTogether("synchronizeTabs", synchronizeTabs, "experimentalForceOwningTab", experimentalForceOwningTab);
    }
    return synchronizeTabs ? this._persistenceProvider.enableMultiTabIndexedDbPersistence(this) : this._persistenceProvider.enableIndexedDbPersistence(this, experimentalForceOwningTab);
  }
  clearPersistence() {
    return this._persistenceProvider.clearIndexedDbPersistence(this);
  }
  terminate() {
    if (this._appCompat) {
      this._appCompat._removeServiceInstance("firestore-compat");
      this._appCompat._removeServiceInstance("firestore");
    }
    return this._delegate._delete();
  }
  waitForPendingWrites() {
    return waitForPendingWrites(this._delegate);
  }
  onSnapshotsInSync(arg) {
    return onSnapshotsInSync(this._delegate, arg);
  }
  get app() {
    if (!this._appCompat) {
      throw new FirestoreError("failed-precondition", "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    }
    return this._appCompat;
  }
  collection(pathString) {
    try {
      return new CollectionReference(this, collection(this._delegate, pathString));
    } catch (e) {
      throw replaceFunctionName(e, "collection()", "Firestore.collection()");
    }
  }
  doc(pathString) {
    try {
      return new DocumentReference2(this, doc(this._delegate, pathString));
    } catch (e) {
      throw replaceFunctionName(e, "doc()", "Firestore.doc()");
    }
  }
  collectionGroup(collectionId) {
    try {
      return new Query(this, collectionGroup(this._delegate, collectionId));
    } catch (e) {
      throw replaceFunctionName(e, "collectionGroup()", "Firestore.collectionGroup()");
    }
  }
  runTransaction(updateFunction) {
    return runTransaction(this._delegate, (transaction) => updateFunction(new Transaction(this, transaction)));
  }
  batch() {
    ensureFirestoreConfigured(this._delegate);
    return new WriteBatch2(new WriteBatch(this._delegate, (mutations) => executeWrite(this._delegate, mutations)));
  }
  loadBundle(bundleData) {
    return loadBundle(this._delegate, bundleData);
  }
  namedQuery(name3) {
    return namedQuery(this._delegate, name3).then((expQuery) => {
      if (!expQuery) {
        return null;
      }
      return new Query(
        this,
        // We can pass `expQuery` here directly since named queries don't have a UserDataConverter.
        // Otherwise, we would have to create a new ExpQuery and pass the old UserDataConverter.
        expQuery
      );
    });
  }
};
var UserDataWriter = class extends AbstractUserDataWriter {
  constructor(firestore) {
    super();
    this.firestore = firestore;
  }
  convertBytes(bytes) {
    return new Blob(new Bytes(bytes));
  }
  convertReference(name3) {
    const key = this.convertDocumentKey(name3, this.firestore._databaseId);
    return DocumentReference2.forKey(
      key,
      this.firestore,
      /* converter= */
      null
    );
  }
};
function setLogLevel2(level) {
  setLogLevel(level);
}
var Transaction = class {
  constructor(_firestore, _delegate) {
    this._firestore = _firestore;
    this._delegate = _delegate;
    this._userDataWriter = new UserDataWriter(_firestore);
  }
  get(documentRef) {
    const ref = castReference(documentRef);
    return this._delegate.get(ref).then((result) => new DocumentSnapshot2(this._firestore, new DocumentSnapshot(this._firestore._delegate, this._userDataWriter, result._key, result._document, result.metadata, ref.converter)));
  }
  set(documentRef, data, options) {
    const ref = castReference(documentRef);
    if (options) {
      validateSetOptions("Transaction.set", options);
      this._delegate.set(ref, data, options);
    } else {
      this._delegate.set(ref, data);
    }
    return this;
  }
  update(documentRef, dataOrField, value, ...moreFieldsAndValues) {
    const ref = castReference(documentRef);
    if (arguments.length === 2) {
      this._delegate.update(ref, dataOrField);
    } else {
      this._delegate.update(ref, dataOrField, value, ...moreFieldsAndValues);
    }
    return this;
  }
  delete(documentRef) {
    const ref = castReference(documentRef);
    this._delegate.delete(ref);
    return this;
  }
};
var WriteBatch2 = class {
  constructor(_delegate) {
    this._delegate = _delegate;
  }
  set(documentRef, data, options) {
    const ref = castReference(documentRef);
    if (options) {
      validateSetOptions("WriteBatch.set", options);
      this._delegate.set(ref, data, options);
    } else {
      this._delegate.set(ref, data);
    }
    return this;
  }
  update(documentRef, dataOrField, value, ...moreFieldsAndValues) {
    const ref = castReference(documentRef);
    if (arguments.length === 2) {
      this._delegate.update(ref, dataOrField);
    } else {
      this._delegate.update(ref, dataOrField, value, ...moreFieldsAndValues);
    }
    return this;
  }
  delete(documentRef) {
    const ref = castReference(documentRef);
    this._delegate.delete(ref);
    return this;
  }
  commit() {
    return this._delegate.commit();
  }
};
var FirestoreDataConverter = class _FirestoreDataConverter {
  constructor(_firestore, _userDataWriter, _delegate) {
    this._firestore = _firestore;
    this._userDataWriter = _userDataWriter;
    this._delegate = _delegate;
  }
  fromFirestore(snapshot, options) {
    const expSnapshot = new QueryDocumentSnapshot(
      this._firestore._delegate,
      this._userDataWriter,
      snapshot._key,
      snapshot._document,
      snapshot.metadata,
      /* converter= */
      null
    );
    return this._delegate.fromFirestore(new QueryDocumentSnapshot2(this._firestore, expSnapshot), options !== null && options !== void 0 ? options : {});
  }
  toFirestore(modelObject, options) {
    if (!options) {
      return this._delegate.toFirestore(modelObject);
    } else {
      return this._delegate.toFirestore(modelObject, options);
    }
  }
  // Use the same instance of `FirestoreDataConverter` for the given instances
  // of `Firestore` and `PublicFirestoreDataConverter` so that isEqual() will
  // compare equal for two objects created with the same converter instance.
  static getInstance(firestore, converter) {
    const converterMapByFirestore = _FirestoreDataConverter.INSTANCES;
    let untypedConverterByConverter = converterMapByFirestore.get(firestore);
    if (!untypedConverterByConverter) {
      untypedConverterByConverter = /* @__PURE__ */ new WeakMap();
      converterMapByFirestore.set(firestore, untypedConverterByConverter);
    }
    let instance = untypedConverterByConverter.get(converter);
    if (!instance) {
      instance = new _FirestoreDataConverter(firestore, new UserDataWriter(firestore), converter);
      untypedConverterByConverter.set(converter, instance);
    }
    return instance;
  }
};
FirestoreDataConverter.INSTANCES = /* @__PURE__ */ new WeakMap();
var DocumentReference2 = class _DocumentReference {
  constructor(firestore, _delegate) {
    this.firestore = firestore;
    this._delegate = _delegate;
    this._userDataWriter = new UserDataWriter(firestore);
  }
  static forPath(path, firestore, converter) {
    if (path.length % 2 !== 0) {
      throw new FirestoreError("invalid-argument", `Invalid document reference. Document references must have an even number of segments, but ${path.canonicalString()} has ${path.length}`);
    }
    return new _DocumentReference(firestore, new DocumentReference(firestore._delegate, converter, new DocumentKey(path)));
  }
  static forKey(key, firestore, converter) {
    return new _DocumentReference(firestore, new DocumentReference(firestore._delegate, converter, key));
  }
  get id() {
    return this._delegate.id;
  }
  get parent() {
    return new CollectionReference(this.firestore, this._delegate.parent);
  }
  get path() {
    return this._delegate.path;
  }
  collection(pathString) {
    try {
      return new CollectionReference(this.firestore, collection(this._delegate, pathString));
    } catch (e) {
      throw replaceFunctionName(e, "collection()", "DocumentReference.collection()");
    }
  }
  isEqual(other) {
    other = getModularInstance(other);
    if (!(other instanceof DocumentReference)) {
      return false;
    }
    return refEqual(this._delegate, other);
  }
  set(value, options) {
    options = validateSetOptions("DocumentReference.set", options);
    try {
      if (options) {
        return setDoc(this._delegate, value, options);
      } else {
        return setDoc(this._delegate, value);
      }
    } catch (e) {
      throw replaceFunctionName(e, "setDoc()", "DocumentReference.set()");
    }
  }
  update(fieldOrUpdateData, value, ...moreFieldsAndValues) {
    try {
      if (arguments.length === 1) {
        return updateDoc(this._delegate, fieldOrUpdateData);
      } else {
        return updateDoc(this._delegate, fieldOrUpdateData, value, ...moreFieldsAndValues);
      }
    } catch (e) {
      throw replaceFunctionName(e, "updateDoc()", "DocumentReference.update()");
    }
  }
  delete() {
    return deleteDoc(this._delegate);
  }
  onSnapshot(...args) {
    const options = extractSnapshotOptions(args);
    const observer = wrapObserver(args, (result) => new DocumentSnapshot2(this.firestore, new DocumentSnapshot(this.firestore._delegate, this._userDataWriter, result._key, result._document, result.metadata, this._delegate.converter)));
    return onSnapshot(this._delegate, options, observer);
  }
  get(options) {
    let snap;
    if ((options === null || options === void 0 ? void 0 : options.source) === "cache") {
      snap = getDocFromCache(this._delegate);
    } else if ((options === null || options === void 0 ? void 0 : options.source) === "server") {
      snap = getDocFromServer(this._delegate);
    } else {
      snap = getDoc(this._delegate);
    }
    return snap.then((result) => new DocumentSnapshot2(this.firestore, new DocumentSnapshot(this.firestore._delegate, this._userDataWriter, result._key, result._document, result.metadata, this._delegate.converter)));
  }
  withConverter(converter) {
    return new _DocumentReference(this.firestore, converter ? this._delegate.withConverter(FirestoreDataConverter.getInstance(this.firestore, converter)) : this._delegate.withConverter(null));
  }
};
function replaceFunctionName(e, original, updated) {
  e.message = e.message.replace(original, updated);
  return e;
}
function extractSnapshotOptions(args) {
  for (const arg of args) {
    if (typeof arg === "object" && !isPartialObserver(arg)) {
      return arg;
    }
  }
  return {};
}
function wrapObserver(args, wrapper) {
  var _a, _b;
  let userObserver;
  if (isPartialObserver(args[0])) {
    userObserver = args[0];
  } else if (isPartialObserver(args[1])) {
    userObserver = args[1];
  } else if (typeof args[0] === "function") {
    userObserver = {
      next: args[0],
      error: args[1],
      complete: args[2]
    };
  } else {
    userObserver = {
      next: args[1],
      error: args[2],
      complete: args[3]
    };
  }
  return {
    next: (val) => {
      if (userObserver.next) {
        userObserver.next(wrapper(val));
      }
    },
    error: (_a = userObserver.error) === null || _a === void 0 ? void 0 : _a.bind(userObserver),
    complete: (_b = userObserver.complete) === null || _b === void 0 ? void 0 : _b.bind(userObserver)
  };
}
var DocumentSnapshot2 = class {
  constructor(_firestore, _delegate) {
    this._firestore = _firestore;
    this._delegate = _delegate;
  }
  get ref() {
    return new DocumentReference2(this._firestore, this._delegate.ref);
  }
  get id() {
    return this._delegate.id;
  }
  get metadata() {
    return this._delegate.metadata;
  }
  get exists() {
    return this._delegate.exists();
  }
  data(options) {
    return this._delegate.data(options);
  }
  get(fieldPath, options) {
    return this._delegate.get(fieldPath, options);
  }
  isEqual(other) {
    return snapshotEqual(this._delegate, other._delegate);
  }
};
var QueryDocumentSnapshot2 = class extends DocumentSnapshot2 {
  data(options) {
    const data = this._delegate.data(options);
    if (this._delegate._converter) {
      return data;
    } else {
      __PRIVATE_debugAssert(data !== void 0, "Document in a QueryDocumentSnapshot should exist");
      return data;
    }
  }
};
var Query = class _Query {
  constructor(firestore, _delegate) {
    this.firestore = firestore;
    this._delegate = _delegate;
    this._userDataWriter = new UserDataWriter(firestore);
  }
  where(fieldPath, opStr, value) {
    try {
      return new _Query(this.firestore, query(this._delegate, where(fieldPath, opStr, value)));
    } catch (e) {
      throw replaceFunctionName(e, /(orderBy|where)\(\)/, "Query.$1()");
    }
  }
  orderBy(fieldPath, directionStr) {
    try {
      return new _Query(this.firestore, query(this._delegate, orderBy(fieldPath, directionStr)));
    } catch (e) {
      throw replaceFunctionName(e, /(orderBy|where)\(\)/, "Query.$1()");
    }
  }
  limit(n) {
    try {
      return new _Query(this.firestore, query(this._delegate, limit(n)));
    } catch (e) {
      throw replaceFunctionName(e, "limit()", "Query.limit()");
    }
  }
  limitToLast(n) {
    try {
      return new _Query(this.firestore, query(this._delegate, limitToLast(n)));
    } catch (e) {
      throw replaceFunctionName(e, "limitToLast()", "Query.limitToLast()");
    }
  }
  startAt(...args) {
    try {
      return new _Query(this.firestore, query(this._delegate, startAt(...args)));
    } catch (e) {
      throw replaceFunctionName(e, "startAt()", "Query.startAt()");
    }
  }
  startAfter(...args) {
    try {
      return new _Query(this.firestore, query(this._delegate, startAfter(...args)));
    } catch (e) {
      throw replaceFunctionName(e, "startAfter()", "Query.startAfter()");
    }
  }
  endBefore(...args) {
    try {
      return new _Query(this.firestore, query(this._delegate, endBefore(...args)));
    } catch (e) {
      throw replaceFunctionName(e, "endBefore()", "Query.endBefore()");
    }
  }
  endAt(...args) {
    try {
      return new _Query(this.firestore, query(this._delegate, endAt(...args)));
    } catch (e) {
      throw replaceFunctionName(e, "endAt()", "Query.endAt()");
    }
  }
  isEqual(other) {
    return queryEqual(this._delegate, other._delegate);
  }
  get(options) {
    let query2;
    if ((options === null || options === void 0 ? void 0 : options.source) === "cache") {
      query2 = getDocsFromCache(this._delegate);
    } else if ((options === null || options === void 0 ? void 0 : options.source) === "server") {
      query2 = getDocsFromServer(this._delegate);
    } else {
      query2 = getDocs(this._delegate);
    }
    return query2.then((result) => new QuerySnapshot2(this.firestore, new QuerySnapshot(this.firestore._delegate, this._userDataWriter, this._delegate, result._snapshot)));
  }
  onSnapshot(...args) {
    const options = extractSnapshotOptions(args);
    const observer = wrapObserver(args, (snap) => new QuerySnapshot2(this.firestore, new QuerySnapshot(this.firestore._delegate, this._userDataWriter, this._delegate, snap._snapshot)));
    return onSnapshot(this._delegate, options, observer);
  }
  withConverter(converter) {
    return new _Query(this.firestore, converter ? this._delegate.withConverter(FirestoreDataConverter.getInstance(this.firestore, converter)) : this._delegate.withConverter(null));
  }
};
var DocumentChange = class {
  constructor(_firestore, _delegate) {
    this._firestore = _firestore;
    this._delegate = _delegate;
  }
  get type() {
    return this._delegate.type;
  }
  get doc() {
    return new QueryDocumentSnapshot2(this._firestore, this._delegate.doc);
  }
  get oldIndex() {
    return this._delegate.oldIndex;
  }
  get newIndex() {
    return this._delegate.newIndex;
  }
};
var QuerySnapshot2 = class {
  constructor(_firestore, _delegate) {
    this._firestore = _firestore;
    this._delegate = _delegate;
  }
  get query() {
    return new Query(this._firestore, this._delegate.query);
  }
  get metadata() {
    return this._delegate.metadata;
  }
  get size() {
    return this._delegate.size;
  }
  get empty() {
    return this._delegate.empty;
  }
  get docs() {
    return this._delegate.docs.map((doc2) => new QueryDocumentSnapshot2(this._firestore, doc2));
  }
  docChanges(options) {
    return this._delegate.docChanges(options).map((docChange) => new DocumentChange(this._firestore, docChange));
  }
  forEach(callback, thisArg) {
    this._delegate.forEach((snapshot) => {
      callback.call(thisArg, new QueryDocumentSnapshot2(this._firestore, snapshot));
    });
  }
  isEqual(other) {
    return snapshotEqual(this._delegate, other._delegate);
  }
};
var CollectionReference = class _CollectionReference extends Query {
  constructor(firestore, _delegate) {
    super(firestore, _delegate);
    this.firestore = firestore;
    this._delegate = _delegate;
  }
  get id() {
    return this._delegate.id;
  }
  get path() {
    return this._delegate.path;
  }
  get parent() {
    const docRef = this._delegate.parent;
    return docRef ? new DocumentReference2(this.firestore, docRef) : null;
  }
  doc(documentPath) {
    try {
      if (documentPath === void 0) {
        return new DocumentReference2(this.firestore, doc(this._delegate));
      } else {
        return new DocumentReference2(this.firestore, doc(this._delegate, documentPath));
      }
    } catch (e) {
      throw replaceFunctionName(e, "doc()", "CollectionReference.doc()");
    }
  }
  add(data) {
    return addDoc(this._delegate, data).then((docRef) => new DocumentReference2(this.firestore, docRef));
  }
  isEqual(other) {
    return refEqual(this._delegate, other._delegate);
  }
  withConverter(converter) {
    return new _CollectionReference(this.firestore, converter ? this._delegate.withConverter(FirestoreDataConverter.getInstance(this.firestore, converter)) : this._delegate.withConverter(null));
  }
};
function castReference(documentRef) {
  return __PRIVATE_cast(documentRef, DocumentReference);
}
var FieldPath2 = class _FieldPath {
  /**
   * Creates a FieldPath from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames - A list of field names.
   */
  constructor(...fieldNames) {
    this._delegate = new FieldPath(...fieldNames);
  }
  static documentId() {
    return new _FieldPath(FieldPath$1.keyField().canonicalString());
  }
  isEqual(other) {
    other = getModularInstance(other);
    if (!(other instanceof FieldPath)) {
      return false;
    }
    return this._delegate._internalPath.isEqual(other._internalPath);
  }
};
var FieldValue = class _FieldValue {
  constructor(_delegate) {
    this._delegate = _delegate;
  }
  static serverTimestamp() {
    const delegate = serverTimestamp();
    delegate._methodName = "FieldValue.serverTimestamp";
    return new _FieldValue(delegate);
  }
  static delete() {
    const delegate = deleteField();
    delegate._methodName = "FieldValue.delete";
    return new _FieldValue(delegate);
  }
  static arrayUnion(...elements) {
    const delegate = arrayUnion(...elements);
    delegate._methodName = "FieldValue.arrayUnion";
    return new _FieldValue(delegate);
  }
  static arrayRemove(...elements) {
    const delegate = arrayRemove(...elements);
    delegate._methodName = "FieldValue.arrayRemove";
    return new _FieldValue(delegate);
  }
  static increment(n) {
    const delegate = increment(n);
    delegate._methodName = "FieldValue.increment";
    return new _FieldValue(delegate);
  }
  isEqual(other) {
    return this._delegate.isEqual(other._delegate);
  }
};
var firestoreNamespace = {
  Firestore,
  GeoPoint,
  Timestamp,
  Blob,
  Transaction,
  WriteBatch: WriteBatch2,
  DocumentReference: DocumentReference2,
  DocumentSnapshot: DocumentSnapshot2,
  Query,
  QueryDocumentSnapshot: QueryDocumentSnapshot2,
  QuerySnapshot: QuerySnapshot2,
  CollectionReference,
  FieldPath: FieldPath2,
  FieldValue,
  setLogLevel: setLogLevel2,
  CACHE_SIZE_UNLIMITED: fe
};
function configureForFirebase(firebase2, firestoreFactory) {
  firebase2.INTERNAL.registerComponent(new Component("firestore-compat", (container) => {
    const app = container.getProvider("app-compat").getImmediate();
    const firestoreExp = container.getProvider("firestore").getImmediate();
    return firestoreFactory(app, firestoreExp);
  }, "PUBLIC").setServiceProps(Object.assign({}, firestoreNamespace)));
}
function registerFirestore(instance) {
  configureForFirebase(instance, (app, firestoreExp) => new Firestore(app, firestoreExp, new IndexedDbPersistenceProvider()));
  instance.registerVersion(name2, version2);
}
registerFirestore(firebase);

// node_modules/@angular/fire/fesm2022/angular-fire-compat-firestore.mjs
function _fromRef(ref, scheduler = asyncScheduler) {
  return new Observable((subscriber) => {
    let unsubscribe;
    if (scheduler != null) {
      scheduler.schedule(() => {
        unsubscribe = ref.onSnapshot({
          includeMetadataChanges: true
        }, subscriber);
      });
    } else {
      unsubscribe = ref.onSnapshot({
        includeMetadataChanges: true
      }, subscriber);
    }
    return () => {
      if (unsubscribe != null) {
        unsubscribe();
      }
    };
  });
}
function fromRef(ref, scheduler) {
  return _fromRef(ref, scheduler);
}
function fromDocRef(ref, scheduler) {
  return fromRef(ref, scheduler).pipe(startWith(void 0), pairwise(), map((snapshots) => {
    const [priorPayload, payload] = snapshots;
    if (!payload.exists) {
      return {
        payload,
        type: "removed"
      };
    }
    if (!priorPayload?.exists) {
      return {
        payload,
        type: "added"
      };
    }
    return {
      payload,
      type: "modified"
    };
  }));
}
function fromCollectionRef(ref, scheduler) {
  return fromRef(ref, scheduler).pipe(map((payload) => ({
    payload,
    type: "query"
  })));
}
var AngularFirestoreDocument = class {
  ref;
  afs;
  /**
   * The constructor takes in a DocumentReference to provide wrapper methods
   * for data operations, data streaming, and Symbol.observable.
   */
  constructor(ref, afs) {
    this.ref = ref;
    this.afs = afs;
  }
  /**
   * Create or overwrite a single document.
   */
  set(data, options) {
    return this.ref.set(data, options);
  }
  /**
   * Update some fields of a document without overwriting the entire document.
   */
  update(data) {
    return this.ref.update(data);
  }
  /**
   * Delete a document.
   */
  delete() {
    return this.ref.delete();
  }
  /**
   * Create a reference to a sub-collection given a path and an optional query
   * function.
   */
  collection(path, queryFn) {
    const collectionRef = this.ref.collection(path);
    const {
      ref,
      query: query2
    } = associateQuery(collectionRef, queryFn);
    return new AngularFirestoreCollection(ref, query2, this.afs);
  }
  /**
   * Listen to snapshot updates from the document.
   */
  snapshotChanges() {
    const scheduledFromDocRef$ = fromDocRef(this.ref, this.afs.schedulers.outsideAngular);
    return scheduledFromDocRef$.pipe(keepUnstableUntilFirst);
  }
  valueChanges(options = {}) {
    return this.snapshotChanges().pipe(map(({
      payload
    }) => options.idField ? __spreadValues(__spreadValues({}, payload.data()), {
      [options.idField]: payload.id
    }) : payload.data()));
  }
  /**
   * Retrieve the document once.
   */
  get(options) {
    return from(this.ref.get(options)).pipe(keepUnstableUntilFirst);
  }
};
function docChanges(query2, scheduler) {
  return fromCollectionRef(query2, scheduler).pipe(startWith(void 0), pairwise(), map((actionTuple) => {
    const [priorAction, action] = actionTuple;
    const docChanges2 = action.payload.docChanges();
    const actions = docChanges2.map((change) => ({
      type: change.type,
      payload: change
    }));
    if (priorAction && JSON.stringify(priorAction.payload.metadata) !== JSON.stringify(action.payload.metadata)) {
      action.payload.docs.forEach((currentDoc, currentIndex) => {
        const docChange = docChanges2.find((d) => d.doc.ref.isEqual(currentDoc.ref));
        const priorDoc = priorAction?.payload.docs.find((d) => d.ref.isEqual(currentDoc.ref));
        if (docChange && JSON.stringify(docChange.doc.metadata) === JSON.stringify(currentDoc.metadata) || !docChange && priorDoc && JSON.stringify(priorDoc.metadata) === JSON.stringify(currentDoc.metadata)) {
        } else {
          actions.push({
            type: "modified",
            payload: {
              oldIndex: currentIndex,
              newIndex: currentIndex,
              type: "modified",
              doc: currentDoc
            }
          });
        }
      });
    }
    return actions;
  }));
}
function sortedChanges(query2, events, scheduler) {
  return docChanges(query2, scheduler).pipe(
    scan((current, changes) => combineChanges(current, changes.map((it) => it.payload), events), []),
    distinctUntilChanged(),
    // cut down on unneed change cycles
    map((changes) => changes.map((c) => ({
      type: c.type,
      payload: c
    })))
  );
}
function combineChanges(current, changes, events) {
  changes.forEach((change) => {
    if (events.indexOf(change.type) > -1) {
      current = combineChange(current, change);
    }
  });
  return current;
}
function sliceAndSplice(original, start, deleteCount, ...args) {
  const returnArray = original.slice();
  returnArray.splice(start, deleteCount, ...args);
  return returnArray;
}
function combineChange(combined, change) {
  switch (change.type) {
    case "added":
      if (combined[change.newIndex] && combined[change.newIndex].doc.ref.isEqual(change.doc.ref)) {
      } else {
        return sliceAndSplice(combined, change.newIndex, 0, change);
      }
      break;
    case "modified":
      if (combined[change.oldIndex] == null || combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
        if (change.oldIndex !== change.newIndex) {
          const copiedArray = combined.slice();
          copiedArray.splice(change.oldIndex, 1);
          copiedArray.splice(change.newIndex, 0, change);
          return copiedArray;
        } else {
          return sliceAndSplice(combined, change.newIndex, 1, change);
        }
      }
      break;
    case "removed":
      if (combined[change.oldIndex] && combined[change.oldIndex].doc.ref.isEqual(change.doc.ref)) {
        return sliceAndSplice(combined, change.oldIndex, 1);
      }
      break;
  }
  return combined;
}
function validateEventsArray(events) {
  if (!events || events.length === 0) {
    events = ["added", "removed", "modified"];
  }
  return events;
}
var AngularFirestoreCollection = class {
  ref;
  query;
  afs;
  /**
   * The constructor takes in a CollectionReference and Query to provide wrapper methods
   * for data operations and data streaming.
   *
   * Note: Data operation methods are done on the reference not the query. This means
   * when you update data it is not updating data to the window of your query unless
   * the data fits the criteria of the query. See the AssociatedRefence type for details
   * on this implication.
   */
  constructor(ref, query2, afs) {
    this.ref = ref;
    this.query = query2;
    this.afs = afs;
  }
  /**
   * Listen to the latest change in the stream. This method returns changes
   * as they occur and they are not sorted by query order. This allows you to construct
   * your own data structure.
   */
  stateChanges(events) {
    let source = docChanges(this.query, this.afs.schedulers.outsideAngular);
    if (events && events.length > 0) {
      source = source.pipe(map((actions) => actions.filter((change) => events.indexOf(change.type) > -1)));
    }
    return source.pipe(
      // We want to filter out empty arrays, but always emit at first, so the developer knows
      // that the collection has been resolve; even if it's empty
      startWith(void 0),
      pairwise(),
      filter(([prior, current]) => current.length > 0 || !prior),
      map(([, current]) => current),
      keepUnstableUntilFirst
    );
  }
  /**
   * Create a stream of changes as they occur it time. This method is similar to stateChanges()
   * but it collects each event in an array over time.
   */
  auditTrail(events) {
    return this.stateChanges(events).pipe(scan((current, action) => [...current, ...action], []));
  }
  /**
   * Create a stream of synchronized changes. This method keeps the local array in sorted
   * query order.
   */
  snapshotChanges(events) {
    const validatedEvents = validateEventsArray(events);
    const scheduledSortedChanges$ = sortedChanges(this.query, validatedEvents, this.afs.schedulers.outsideAngular);
    return scheduledSortedChanges$.pipe(keepUnstableUntilFirst);
  }
  valueChanges(options = {}) {
    return fromCollectionRef(this.query, this.afs.schedulers.outsideAngular).pipe(map((actions) => actions.payload.docs.map((a) => {
      if (options.idField) {
        return __spreadValues(__spreadValues({}, a.data()), {
          [options.idField]: a.id
        });
      } else {
        return a.data();
      }
    })), keepUnstableUntilFirst);
  }
  /**
   * Retrieve the results of the query once.
   */
  get(options) {
    return from(this.query.get(options)).pipe(keepUnstableUntilFirst);
  }
  /**
   * Add data to a collection reference.
   *
   * Note: Data operation methods are done on the reference not the query. This means
   * when you update data it is not updating data to the window of your query unless
   * the data fits the criteria of the query.
   */
  add(data) {
    return this.ref.add(data);
  }
  /**
   * Create a reference to a single document in a collection.
   */
  doc(path) {
    return new AngularFirestoreDocument(this.ref.doc(path), this.afs);
  }
};
var AngularFirestoreCollectionGroup = class {
  query;
  afs;
  /**
   * The constructor takes in a CollectionGroupQuery to provide wrapper methods
   * for data operations and data streaming.
   */
  constructor(query2, afs) {
    this.query = query2;
    this.afs = afs;
  }
  /**
   * Listen to the latest change in the stream. This method returns changes
   * as they occur and they are not sorted by query order. This allows you to construct
   * your own data structure.
   */
  stateChanges(events) {
    if (!events || events.length === 0) {
      return docChanges(this.query, this.afs.schedulers.outsideAngular).pipe(keepUnstableUntilFirst);
    }
    return docChanges(this.query, this.afs.schedulers.outsideAngular).pipe(map((actions) => actions.filter((change) => events.indexOf(change.type) > -1)), filter((changes) => changes.length > 0), keepUnstableUntilFirst);
  }
  /**
   * Create a stream of changes as they occur it time. This method is similar to stateChanges()
   * but it collects each event in an array over time.
   */
  auditTrail(events) {
    return this.stateChanges(events).pipe(scan((current, action) => [...current, ...action], []));
  }
  /**
   * Create a stream of synchronized changes. This method keeps the local array in sorted
   * query order.
   */
  snapshotChanges(events) {
    const validatedEvents = validateEventsArray(events);
    const scheduledSortedChanges$ = sortedChanges(this.query, validatedEvents, this.afs.schedulers.outsideAngular);
    return scheduledSortedChanges$.pipe(keepUnstableUntilFirst);
  }
  valueChanges(options = {}) {
    const fromCollectionRefScheduled$ = fromCollectionRef(this.query, this.afs.schedulers.outsideAngular);
    return fromCollectionRefScheduled$.pipe(map((actions) => actions.payload.docs.map((a) => {
      if (options.idField) {
        return __spreadValues({
          [options.idField]: a.id
        }, a.data());
      } else {
        return a.data();
      }
    })), keepUnstableUntilFirst);
  }
  /**
   * Retrieve the results of the query once.
   */
  get(options) {
    return from(this.query.get(options)).pipe(keepUnstableUntilFirst);
  }
};
var ENABLE_PERSISTENCE = new InjectionToken("angularfire2.enableFirestorePersistence");
var PERSISTENCE_SETTINGS = new InjectionToken("angularfire2.firestore.persistenceSettings");
var SETTINGS2 = new InjectionToken("angularfire2.firestore.settings");
var USE_EMULATOR2 = new InjectionToken("angularfire2.firestore.use-emulator");
function associateQuery(collectionRef, queryFn = (ref) => ref) {
  const query2 = queryFn(collectionRef);
  const ref = collectionRef;
  return {
    query: query2,
    ref
  };
}
var AngularFirestore = class _AngularFirestore {
  schedulers;
  firestore;
  persistenceEnabled$;
  /**
   * Each Feature of AngularFire has a FirebaseApp injected. This way we
   * don't rely on the main Firebase App instance and we can create named
   * apps and use multiple apps.
   */
  constructor(options, name3, shouldEnablePersistence, settings, platformId, zone, schedulers, persistenceSettings, _useEmulator, auth, useAuthEmulator, authSettings, tenantId, languageCode, useDeviceLanguage, persistence, _appCheckInstances) {
    this.schedulers = schedulers;
    const app = ɵfirebaseAppFactory(options, zone, name3);
    const useEmulator = _useEmulator;
    if (auth) {
      ɵauthFactory(app, zone, useAuthEmulator, tenantId, languageCode, useDeviceLanguage, authSettings, persistence);
    }
    [this.firestore, this.persistenceEnabled$] = ɵcacheInstance(`${app.name}.firestore`, "AngularFirestore", app.name, () => {
      const firestore = zone.runOutsideAngular(() => app.firestore());
      if (settings) {
        firestore.settings(settings);
      }
      if (useEmulator) {
        firestore.useEmulator(...useEmulator);
      }
      if (shouldEnablePersistence && !isPlatformServer(platformId)) {
        const enablePersistence = () => {
          try {
            return from(firestore.enablePersistence(persistenceSettings || void 0).then(() => true, () => false));
          } catch (e) {
            if (typeof console !== "undefined") {
              console.warn(e);
            }
            return of(false);
          }
        };
        return [firestore, zone.runOutsideAngular(enablePersistence)];
      } else {
        return [firestore, of(false)];
      }
    }, [settings, useEmulator, shouldEnablePersistence]);
  }
  collection(pathOrRef, queryFn) {
    let collectionRef;
    if (typeof pathOrRef === "string") {
      collectionRef = this.firestore.collection(pathOrRef);
    } else {
      collectionRef = pathOrRef;
    }
    const {
      ref,
      query: query2
    } = associateQuery(collectionRef, queryFn);
    const refInZone = this.schedulers.ngZone.run(() => ref);
    return new AngularFirestoreCollection(refInZone, query2, this);
  }
  /**
   * Create a reference to a Firestore Collection Group based on a collectionId
   * and an optional query function to narrow the result
   * set.
   */
  collectionGroup(collectionId, queryGroupFn) {
    const queryFn = queryGroupFn || ((ref) => ref);
    const collectionGroup2 = this.firestore.collectionGroup(collectionId);
    return new AngularFirestoreCollectionGroup(queryFn(collectionGroup2), this);
  }
  doc(pathOrRef) {
    let ref;
    if (typeof pathOrRef === "string") {
      ref = this.firestore.doc(pathOrRef);
    } else {
      ref = pathOrRef;
    }
    const refInZone = this.schedulers.ngZone.run(() => ref);
    return new AngularFirestoreDocument(refInZone, this);
  }
  /**
   * Returns a generated Firestore Document Id.
   */
  createId() {
    return this.firestore.collection("_").doc().id;
  }
  static ɵfac = function AngularFirestore_Factory(t) {
    return new (t || _AngularFirestore)(ɵɵinject(FIREBASE_OPTIONS), ɵɵinject(FIREBASE_APP_NAME, 8), ɵɵinject(ENABLE_PERSISTENCE, 8), ɵɵinject(SETTINGS2, 8), ɵɵinject(PLATFORM_ID), ɵɵinject(NgZone), ɵɵinject(ɵAngularFireSchedulers), ɵɵinject(PERSISTENCE_SETTINGS, 8), ɵɵinject(USE_EMULATOR2, 8), ɵɵinject(AngularFireAuth, 8), ɵɵinject(USE_EMULATOR, 8), ɵɵinject(SETTINGS, 8), ɵɵinject(TENANT_ID, 8), ɵɵinject(LANGUAGE_CODE, 8), ɵɵinject(USE_DEVICE_LANGUAGE, 8), ɵɵinject(PERSISTENCE, 8), ɵɵinject(ɵAppCheckInstances, 8));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _AngularFirestore,
    factory: _AngularFirestore.ɵfac,
    providedIn: "any"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFirestore, [{
    type: Injectable,
    args: [{
      providedIn: "any"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [FIREBASE_OPTIONS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [FIREBASE_APP_NAME]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [ENABLE_PERSISTENCE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [SETTINGS2]
    }]
  }, {
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }, {
    type: NgZone
  }, {
    type: ɵAngularFireSchedulers
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [PERSISTENCE_SETTINGS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_EMULATOR2]
    }]
  }, {
    type: AngularFireAuth,
    decorators: [{
      type: Optional
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_EMULATOR]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [SETTINGS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [TENANT_ID]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [LANGUAGE_CODE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [USE_DEVICE_LANGUAGE]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [PERSISTENCE]
    }]
  }, {
    type: ɵAppCheckInstances,
    decorators: [{
      type: Optional
    }]
  }], null);
})();
var AngularFirestoreModule = class _AngularFirestoreModule {
  constructor() {
    firebase.registerVersion("angularfire", VERSION2.full, "fst-compat");
  }
  /**
   * Attempt to enable persistent storage, if possible
   */
  static enablePersistence(persistenceSettings) {
    return {
      ngModule: _AngularFirestoreModule,
      providers: [{
        provide: ENABLE_PERSISTENCE,
        useValue: true
      }, {
        provide: PERSISTENCE_SETTINGS,
        useValue: persistenceSettings
      }]
    };
  }
  static ɵfac = function AngularFirestoreModule_Factory(t) {
    return new (t || _AngularFirestoreModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AngularFirestoreModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [AngularFirestore]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFirestoreModule, [{
    type: NgModule,
    args: [{
      providers: [AngularFirestore]
    }]
  }], () => [], null);
})();
export {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreCollectionGroup,
  AngularFirestoreDocument,
  AngularFirestoreModule,
  ENABLE_PERSISTENCE,
  PERSISTENCE_SETTINGS,
  SETTINGS2 as SETTINGS,
  USE_EMULATOR2 as USE_EMULATOR,
  associateQuery,
  combineChange,
  combineChanges,
  docChanges,
  fromCollectionRef,
  fromDocRef,
  fromRef,
  sortedChanges,
  validateEventsArray
};
/*! Bundled license information:

firebase/compat/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore-compat/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=@angular_fire_compat_firestore.js.map
