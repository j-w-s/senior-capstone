import {
  ActivationEnd,
  Router,
  ɵEmptyOutletComponent
} from "./chunk-A5COT7AQ.js";
import {
  Title
} from "./chunk-AD6AM6BT.js";
import "./chunk-YJNPXDWQ.js";
import "./chunk-4YKDSQVU.js";
import {
  Auth,
  authState
} from "./chunk-M27DZLQK.js";
import "./chunk-JQJXKPM6.js";
import "./chunk-SFOPF4EI.js";
import {
  FirebaseApp,
  FirebaseApps,
  VERSION,
  ɵAngularFireSchedulers,
  ɵgetAllInstancesOf,
  ɵgetDefaultInstanceOf,
  ɵisSupportedError,
  ɵzoneWrap
} from "./chunk-LFHMWOXJ.js";
import "./chunk-GJHES7CW.js";
import {
  APP_INITIALIZER,
  ComponentFactoryResolver$1,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  NgZone,
  Optional,
  concatMap,
  distinct,
  distinctUntilChanged,
  filter,
  from,
  groupBy,
  map,
  mergeMap,
  of,
  pairwise,
  setClassMetadata,
  startWith,
  switchMap,
  timer,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵinject
} from "./chunk-UCPKFTR5.js";
import "./chunk-LHRTKJE6.js";
import {
  Component,
  ErrorFactory,
  FirebaseError,
  Logger,
  _getProvider,
  _registerComponent,
  areCookiesEnabled,
  calculateBackoffMillis,
  deepEqual,
  getApp,
  getModularInstance,
  isBrowserExtension,
  isIndexedDBAvailable,
  registerVersion,
  validateIndexedDBOpenable
} from "./chunk-HHEXDI44.js";
import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-EQU7RARR.js";

// node_modules/@firebase/analytics/dist/esm/index.esm2017.js
var ANALYTICS_TYPE = "analytics";
var GA_FID_KEY = "firebase_id";
var ORIGIN_KEY = "origin";
var FETCH_TIMEOUT_MILLIS = 60 * 1e3;
var DYNAMIC_CONFIG_URL = "https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig";
var GTAG_URL = "https://www.googletagmanager.com/gtag/js";
var logger = new Logger("@firebase/analytics");
var ERRORS = {
  [
    "already-exists"
    /* AnalyticsError.ALREADY_EXISTS */
  ]: "A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.",
  [
    "already-initialized"
    /* AnalyticsError.ALREADY_INITIALIZED */
  ]: "initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-intialized instance.",
  [
    "already-initialized-settings"
    /* AnalyticsError.ALREADY_INITIALIZED_SETTINGS */
  ]: "Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.",
  [
    "interop-component-reg-failed"
    /* AnalyticsError.INTEROP_COMPONENT_REG_FAILED */
  ]: "Firebase Analytics Interop Component failed to instantiate: {$reason}",
  [
    "invalid-analytics-context"
    /* AnalyticsError.INVALID_ANALYTICS_CONTEXT */
  ]: "Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
  [
    "indexeddb-unavailable"
    /* AnalyticsError.INDEXEDDB_UNAVAILABLE */
  ]: "IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}",
  [
    "fetch-throttle"
    /* AnalyticsError.FETCH_THROTTLE */
  ]: "The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.",
  [
    "config-fetch-failed"
    /* AnalyticsError.CONFIG_FETCH_FAILED */
  ]: "Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}",
  [
    "no-api-key"
    /* AnalyticsError.NO_API_KEY */
  ]: 'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',
  [
    "no-app-id"
    /* AnalyticsError.NO_APP_ID */
  ]: 'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',
  [
    "no-client-id"
    /* AnalyticsError.NO_CLIENT_ID */
  ]: 'The "client_id" field is empty.',
  [
    "invalid-gtag-resource"
    /* AnalyticsError.INVALID_GTAG_RESOURCE */
  ]: "Trusted Types detected an invalid gtag resource: {$gtagURL}."
};
var ERROR_FACTORY = new ErrorFactory("analytics", "Analytics", ERRORS);
function createGtagTrustedTypesScriptURL(url) {
  if (!url.startsWith(GTAG_URL)) {
    const err = ERROR_FACTORY.create("invalid-gtag-resource", {
      gtagURL: url
    });
    logger.warn(err.message);
    return "";
  }
  return url;
}
function promiseAllSettled(promises) {
  return Promise.all(promises.map((promise) => promise.catch((e) => e)));
}
function createTrustedTypesPolicy(policyName, policyOptions) {
  let trustedTypesPolicy;
  if (window.trustedTypes) {
    trustedTypesPolicy = window.trustedTypes.createPolicy(policyName, policyOptions);
  }
  return trustedTypesPolicy;
}
function insertScriptTag(dataLayerName2, measurementId) {
  const trustedTypesPolicy = createTrustedTypesPolicy("firebase-js-sdk-policy", {
    createScriptURL: createGtagTrustedTypesScriptURL
  });
  const script = document.createElement("script");
  const gtagScriptURL = `${GTAG_URL}?l=${dataLayerName2}&id=${measurementId}`;
  script.src = trustedTypesPolicy ? trustedTypesPolicy === null || trustedTypesPolicy === void 0 ? void 0 : trustedTypesPolicy.createScriptURL(gtagScriptURL) : gtagScriptURL;
  script.async = true;
  document.head.appendChild(script);
}
function getOrCreateDataLayer(dataLayerName2) {
  let dataLayer = [];
  if (Array.isArray(window[dataLayerName2])) {
    dataLayer = window[dataLayerName2];
  } else {
    window[dataLayerName2] = dataLayer;
  }
  return dataLayer;
}
function gtagOnConfig(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, measurementId, gtagParams) {
  return __async(this, null, function* () {
    const correspondingAppId = measurementIdToAppId2[measurementId];
    try {
      if (correspondingAppId) {
        yield initializationPromisesMap2[correspondingAppId];
      } else {
        const dynamicConfigResults = yield promiseAllSettled(dynamicConfigPromisesList2);
        const foundConfig = dynamicConfigResults.find((config) => config.measurementId === measurementId);
        if (foundConfig) {
          yield initializationPromisesMap2[foundConfig.appId];
        }
      }
    } catch (e) {
      logger.error(e);
    }
    gtagCore("config", measurementId, gtagParams);
  });
}
function gtagOnEvent(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementId, gtagParams) {
  return __async(this, null, function* () {
    try {
      let initializationPromisesToWaitFor = [];
      if (gtagParams && gtagParams["send_to"]) {
        let gaSendToList = gtagParams["send_to"];
        if (!Array.isArray(gaSendToList)) {
          gaSendToList = [gaSendToList];
        }
        const dynamicConfigResults = yield promiseAllSettled(dynamicConfigPromisesList2);
        for (const sendToId of gaSendToList) {
          const foundConfig = dynamicConfigResults.find((config) => config.measurementId === sendToId);
          const initializationPromise = foundConfig && initializationPromisesMap2[foundConfig.appId];
          if (initializationPromise) {
            initializationPromisesToWaitFor.push(initializationPromise);
          } else {
            initializationPromisesToWaitFor = [];
            break;
          }
        }
      }
      if (initializationPromisesToWaitFor.length === 0) {
        initializationPromisesToWaitFor = Object.values(initializationPromisesMap2);
      }
      yield Promise.all(initializationPromisesToWaitFor);
      gtagCore("event", measurementId, gtagParams || {});
    } catch (e) {
      logger.error(e);
    }
  });
}
function wrapGtag(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2) {
  function gtagWrapper(command, ...args) {
    return __async(this, null, function* () {
      try {
        if (command === "event") {
          const [measurementId, gtagParams] = args;
          yield gtagOnEvent(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementId, gtagParams);
        } else if (command === "config") {
          const [measurementId, gtagParams] = args;
          yield gtagOnConfig(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, measurementId, gtagParams);
        } else if (command === "consent") {
          const [gtagParams] = args;
          gtagCore("consent", "update", gtagParams);
        } else if (command === "get") {
          const [measurementId, fieldName, callback] = args;
          gtagCore("get", measurementId, fieldName, callback);
        } else if (command === "set") {
          const [customParams] = args;
          gtagCore("set", customParams);
        } else {
          gtagCore(command, ...args);
        }
      } catch (e) {
        logger.error(e);
      }
    });
  }
  return gtagWrapper;
}
function wrapOrCreateGtag(initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2, dataLayerName2, gtagFunctionName) {
  let gtagCore = function(..._args) {
    window[dataLayerName2].push(arguments);
  };
  if (window[gtagFunctionName] && typeof window[gtagFunctionName] === "function") {
    gtagCore = window[gtagFunctionName];
  }
  window[gtagFunctionName] = wrapGtag(gtagCore, initializationPromisesMap2, dynamicConfigPromisesList2, measurementIdToAppId2);
  return {
    gtagCore,
    wrappedGtag: window[gtagFunctionName]
  };
}
function findGtagScriptOnPage(dataLayerName2) {
  const scriptTags = window.document.getElementsByTagName("script");
  for (const tag of Object.values(scriptTags)) {
    if (tag.src && tag.src.includes(GTAG_URL) && tag.src.includes(dataLayerName2)) {
      return tag;
    }
  }
  return null;
}
var LONG_RETRY_FACTOR = 30;
var BASE_INTERVAL_MILLIS = 1e3;
var RetryData = class {
  constructor(throttleMetadata = {}, intervalMillis = BASE_INTERVAL_MILLIS) {
    this.throttleMetadata = throttleMetadata;
    this.intervalMillis = intervalMillis;
  }
  getThrottleMetadata(appId) {
    return this.throttleMetadata[appId];
  }
  setThrottleMetadata(appId, metadata) {
    this.throttleMetadata[appId] = metadata;
  }
  deleteThrottleMetadata(appId) {
    delete this.throttleMetadata[appId];
  }
};
var defaultRetryData = new RetryData();
function getHeaders(apiKey) {
  return new Headers({
    Accept: "application/json",
    "x-goog-api-key": apiKey
  });
}
function fetchDynamicConfig(appFields) {
  return __async(this, null, function* () {
    var _a;
    const { appId, apiKey } = appFields;
    const request = {
      method: "GET",
      headers: getHeaders(apiKey)
    };
    const appUrl = DYNAMIC_CONFIG_URL.replace("{app-id}", appId);
    const response = yield fetch(appUrl, request);
    if (response.status !== 200 && response.status !== 304) {
      let errorMessage = "";
      try {
        const jsonResponse = yield response.json();
        if ((_a = jsonResponse.error) === null || _a === void 0 ? void 0 : _a.message) {
          errorMessage = jsonResponse.error.message;
        }
      } catch (_ignored) {
      }
      throw ERROR_FACTORY.create("config-fetch-failed", {
        httpStatus: response.status,
        responseMessage: errorMessage
      });
    }
    return response.json();
  });
}
function fetchDynamicConfigWithRetry(_0) {
  return __async(this, arguments, function* (app, retryData = defaultRetryData, timeoutMillis) {
    const { appId, apiKey, measurementId } = app.options;
    if (!appId) {
      throw ERROR_FACTORY.create(
        "no-app-id"
        /* AnalyticsError.NO_APP_ID */
      );
    }
    if (!apiKey) {
      if (measurementId) {
        return {
          measurementId,
          appId
        };
      }
      throw ERROR_FACTORY.create(
        "no-api-key"
        /* AnalyticsError.NO_API_KEY */
      );
    }
    const throttleMetadata = retryData.getThrottleMetadata(appId) || {
      backoffCount: 0,
      throttleEndTimeMillis: Date.now()
    };
    const signal = new AnalyticsAbortSignal();
    setTimeout(() => __async(this, null, function* () {
      signal.abort();
    }), timeoutMillis !== void 0 ? timeoutMillis : FETCH_TIMEOUT_MILLIS);
    return attemptFetchDynamicConfigWithRetry({ appId, apiKey, measurementId }, throttleMetadata, signal, retryData);
  });
}
function attemptFetchDynamicConfigWithRetry(_0, _1, _2) {
  return __async(this, arguments, function* (appFields, { throttleEndTimeMillis, backoffCount }, signal, retryData = defaultRetryData) {
    var _a;
    const { appId, measurementId } = appFields;
    try {
      yield setAbortableTimeout(signal, throttleEndTimeMillis);
    } catch (e) {
      if (measurementId) {
        logger.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${e === null || e === void 0 ? void 0 : e.message}]`);
        return { appId, measurementId };
      }
      throw e;
    }
    try {
      const response = yield fetchDynamicConfig(appFields);
      retryData.deleteThrottleMetadata(appId);
      return response;
    } catch (e) {
      const error = e;
      if (!isRetriableError(error)) {
        retryData.deleteThrottleMetadata(appId);
        if (measurementId) {
          logger.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${measurementId} provided in the "measurementId" field in the local Firebase config. [${error === null || error === void 0 ? void 0 : error.message}]`);
          return { appId, measurementId };
        } else {
          throw e;
        }
      }
      const backoffMillis = Number((_a = error === null || error === void 0 ? void 0 : error.customData) === null || _a === void 0 ? void 0 : _a.httpStatus) === 503 ? calculateBackoffMillis(backoffCount, retryData.intervalMillis, LONG_RETRY_FACTOR) : calculateBackoffMillis(backoffCount, retryData.intervalMillis);
      const throttleMetadata = {
        throttleEndTimeMillis: Date.now() + backoffMillis,
        backoffCount: backoffCount + 1
      };
      retryData.setThrottleMetadata(appId, throttleMetadata);
      logger.debug(`Calling attemptFetch again in ${backoffMillis} millis`);
      return attemptFetchDynamicConfigWithRetry(appFields, throttleMetadata, signal, retryData);
    }
  });
}
function setAbortableTimeout(signal, throttleEndTimeMillis) {
  return new Promise((resolve, reject) => {
    const backoffMillis = Math.max(throttleEndTimeMillis - Date.now(), 0);
    const timeout = setTimeout(resolve, backoffMillis);
    signal.addEventListener(() => {
      clearTimeout(timeout);
      reject(ERROR_FACTORY.create("fetch-throttle", {
        throttleEndTimeMillis
      }));
    });
  });
}
function isRetriableError(e) {
  if (!(e instanceof FirebaseError) || !e.customData) {
    return false;
  }
  const httpStatus = Number(e.customData["httpStatus"]);
  return httpStatus === 429 || httpStatus === 500 || httpStatus === 503 || httpStatus === 504;
}
var AnalyticsAbortSignal = class {
  constructor() {
    this.listeners = [];
  }
  addEventListener(listener) {
    this.listeners.push(listener);
  }
  abort() {
    this.listeners.forEach((listener) => listener());
  }
};
var defaultEventParametersForInit;
function logEvent$1(gtagFunction, initializationPromise, eventName, eventParams, options) {
  return __async(this, null, function* () {
    if (options && options.global) {
      gtagFunction("event", eventName, eventParams);
      return;
    } else {
      const measurementId = yield initializationPromise;
      const params = Object.assign(Object.assign({}, eventParams), { "send_to": measurementId });
      gtagFunction("event", eventName, params);
    }
  });
}
function setCurrentScreen$1(gtagFunction, initializationPromise, screenName, options) {
  return __async(this, null, function* () {
    if (options && options.global) {
      gtagFunction("set", { "screen_name": screenName });
      return Promise.resolve();
    } else {
      const measurementId = yield initializationPromise;
      gtagFunction("config", measurementId, {
        update: true,
        "screen_name": screenName
      });
    }
  });
}
function setUserId$1(gtagFunction, initializationPromise, id, options) {
  return __async(this, null, function* () {
    if (options && options.global) {
      gtagFunction("set", { "user_id": id });
      return Promise.resolve();
    } else {
      const measurementId = yield initializationPromise;
      gtagFunction("config", measurementId, {
        update: true,
        "user_id": id
      });
    }
  });
}
function setUserProperties$1(gtagFunction, initializationPromise, properties, options) {
  return __async(this, null, function* () {
    if (options && options.global) {
      const flatProperties = {};
      for (const key of Object.keys(properties)) {
        flatProperties[`user_properties.${key}`] = properties[key];
      }
      gtagFunction("set", flatProperties);
      return Promise.resolve();
    } else {
      const measurementId = yield initializationPromise;
      gtagFunction("config", measurementId, {
        update: true,
        "user_properties": properties
      });
    }
  });
}
function internalGetGoogleAnalyticsClientId(gtagFunction, initializationPromise) {
  return __async(this, null, function* () {
    const measurementId = yield initializationPromise;
    return new Promise((resolve, reject) => {
      gtagFunction("get", measurementId, "client_id", (clientId) => {
        if (!clientId) {
          reject(ERROR_FACTORY.create(
            "no-client-id"
            /* AnalyticsError.NO_CLIENT_ID */
          ));
        }
        resolve(clientId);
      });
    });
  });
}
function setAnalyticsCollectionEnabled$1(initializationPromise, enabled) {
  return __async(this, null, function* () {
    const measurementId = yield initializationPromise;
    window[`ga-disable-${measurementId}`] = !enabled;
  });
}
var defaultConsentSettingsForInit;
function _setConsentDefaultForInit(consentSettings) {
  defaultConsentSettingsForInit = consentSettings;
}
function _setDefaultEventParametersForInit(customParams) {
  defaultEventParametersForInit = customParams;
}
function validateIndexedDB() {
  return __async(this, null, function* () {
    if (!isIndexedDBAvailable()) {
      logger.warn(ERROR_FACTORY.create("indexeddb-unavailable", {
        errorInfo: "IndexedDB is not available in this environment."
      }).message);
      return false;
    } else {
      try {
        yield validateIndexedDBOpenable();
      } catch (e) {
        logger.warn(ERROR_FACTORY.create("indexeddb-unavailable", {
          errorInfo: e === null || e === void 0 ? void 0 : e.toString()
        }).message);
        return false;
      }
    }
    return true;
  });
}
function _initializeAnalytics(app, dynamicConfigPromisesList2, measurementIdToAppId2, installations, gtagCore, dataLayerName2, options) {
  return __async(this, null, function* () {
    var _a;
    const dynamicConfigPromise = fetchDynamicConfigWithRetry(app);
    dynamicConfigPromise.then((config) => {
      measurementIdToAppId2[config.measurementId] = config.appId;
      if (app.options.measurementId && config.measurementId !== app.options.measurementId) {
        logger.warn(`The measurement ID in the local Firebase config (${app.options.measurementId}) does not match the measurement ID fetched from the server (${config.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`);
      }
    }).catch((e) => logger.error(e));
    dynamicConfigPromisesList2.push(dynamicConfigPromise);
    const fidPromise = validateIndexedDB().then((envIsValid) => {
      if (envIsValid) {
        return installations.getId();
      } else {
        return void 0;
      }
    });
    const [dynamicConfig, fid] = yield Promise.all([
      dynamicConfigPromise,
      fidPromise
    ]);
    if (!findGtagScriptOnPage(dataLayerName2)) {
      insertScriptTag(dataLayerName2, dynamicConfig.measurementId);
    }
    if (defaultConsentSettingsForInit) {
      gtagCore("consent", "default", defaultConsentSettingsForInit);
      _setConsentDefaultForInit(void 0);
    }
    gtagCore("js", /* @__PURE__ */ new Date());
    const configProperties = (_a = options === null || options === void 0 ? void 0 : options.config) !== null && _a !== void 0 ? _a : {};
    configProperties[ORIGIN_KEY] = "firebase";
    configProperties.update = true;
    if (fid != null) {
      configProperties[GA_FID_KEY] = fid;
    }
    gtagCore("config", dynamicConfig.measurementId, configProperties);
    if (defaultEventParametersForInit) {
      gtagCore("set", defaultEventParametersForInit);
      _setDefaultEventParametersForInit(void 0);
    }
    return dynamicConfig.measurementId;
  });
}
var AnalyticsService = class {
  constructor(app) {
    this.app = app;
  }
  _delete() {
    delete initializationPromisesMap[this.app.options.appId];
    return Promise.resolve();
  }
};
var initializationPromisesMap = {};
var dynamicConfigPromisesList = [];
var measurementIdToAppId = {};
var dataLayerName = "dataLayer";
var gtagName = "gtag";
var gtagCoreFunction;
var wrappedGtagFunction;
var globalInitDone = false;
function settings(options) {
  if (globalInitDone) {
    throw ERROR_FACTORY.create(
      "already-initialized"
      /* AnalyticsError.ALREADY_INITIALIZED */
    );
  }
  if (options.dataLayerName) {
    dataLayerName = options.dataLayerName;
  }
  if (options.gtagName) {
    gtagName = options.gtagName;
  }
}
function warnOnBrowserContextMismatch() {
  const mismatchedEnvMessages = [];
  if (isBrowserExtension()) {
    mismatchedEnvMessages.push("This is a browser extension environment.");
  }
  if (!areCookiesEnabled()) {
    mismatchedEnvMessages.push("Cookies are not available.");
  }
  if (mismatchedEnvMessages.length > 0) {
    const details = mismatchedEnvMessages.map((message, index) => `(${index + 1}) ${message}`).join(" ");
    const err = ERROR_FACTORY.create("invalid-analytics-context", {
      errorInfo: details
    });
    logger.warn(err.message);
  }
}
function factory(app, installations, options) {
  warnOnBrowserContextMismatch();
  const appId = app.options.appId;
  if (!appId) {
    throw ERROR_FACTORY.create(
      "no-app-id"
      /* AnalyticsError.NO_APP_ID */
    );
  }
  if (!app.options.apiKey) {
    if (app.options.measurementId) {
      logger.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${app.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);
    } else {
      throw ERROR_FACTORY.create(
        "no-api-key"
        /* AnalyticsError.NO_API_KEY */
      );
    }
  }
  if (initializationPromisesMap[appId] != null) {
    throw ERROR_FACTORY.create("already-exists", {
      id: appId
    });
  }
  if (!globalInitDone) {
    getOrCreateDataLayer(dataLayerName);
    const { wrappedGtag, gtagCore } = wrapOrCreateGtag(initializationPromisesMap, dynamicConfigPromisesList, measurementIdToAppId, dataLayerName, gtagName);
    wrappedGtagFunction = wrappedGtag;
    gtagCoreFunction = gtagCore;
    globalInitDone = true;
  }
  initializationPromisesMap[appId] = _initializeAnalytics(app, dynamicConfigPromisesList, measurementIdToAppId, installations, gtagCoreFunction, dataLayerName, options);
  const analyticsInstance = new AnalyticsService(app);
  return analyticsInstance;
}
function getAnalytics(app = getApp()) {
  app = getModularInstance(app);
  const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
  if (analyticsProvider.isInitialized()) {
    return analyticsProvider.getImmediate();
  }
  return initializeAnalytics(app);
}
function initializeAnalytics(app, options = {}) {
  const analyticsProvider = _getProvider(app, ANALYTICS_TYPE);
  if (analyticsProvider.isInitialized()) {
    const existingInstance = analyticsProvider.getImmediate();
    if (deepEqual(options, analyticsProvider.getOptions())) {
      return existingInstance;
    } else {
      throw ERROR_FACTORY.create(
        "already-initialized"
        /* AnalyticsError.ALREADY_INITIALIZED */
      );
    }
  }
  const analyticsInstance = analyticsProvider.initialize({ options });
  return analyticsInstance;
}
function isSupported() {
  return __async(this, null, function* () {
    if (isBrowserExtension()) {
      return false;
    }
    if (!areCookiesEnabled()) {
      return false;
    }
    if (!isIndexedDBAvailable()) {
      return false;
    }
    try {
      const isDBOpenable = yield validateIndexedDBOpenable();
      return isDBOpenable;
    } catch (error) {
      return false;
    }
  });
}
function setCurrentScreen(analyticsInstance, screenName, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  setCurrentScreen$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], screenName, options).catch((e) => logger.error(e));
}
function getGoogleAnalyticsClientId(analyticsInstance) {
  return __async(this, null, function* () {
    analyticsInstance = getModularInstance(analyticsInstance);
    return internalGetGoogleAnalyticsClientId(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId]);
  });
}
function setUserId(analyticsInstance, id, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  setUserId$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], id, options).catch((e) => logger.error(e));
}
function setUserProperties(analyticsInstance, properties, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  setUserProperties$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], properties, options).catch((e) => logger.error(e));
}
function setAnalyticsCollectionEnabled(analyticsInstance, enabled) {
  analyticsInstance = getModularInstance(analyticsInstance);
  setAnalyticsCollectionEnabled$1(initializationPromisesMap[analyticsInstance.app.options.appId], enabled).catch((e) => logger.error(e));
}
function setDefaultEventParameters(customParams) {
  if (wrappedGtagFunction) {
    wrappedGtagFunction("set", customParams);
  } else {
    _setDefaultEventParametersForInit(customParams);
  }
}
function logEvent(analyticsInstance, eventName, eventParams, options) {
  analyticsInstance = getModularInstance(analyticsInstance);
  logEvent$1(wrappedGtagFunction, initializationPromisesMap[analyticsInstance.app.options.appId], eventName, eventParams, options).catch((e) => logger.error(e));
}
function setConsent(consentSettings) {
  if (wrappedGtagFunction) {
    wrappedGtagFunction("consent", "update", consentSettings);
  } else {
    _setConsentDefaultForInit(consentSettings);
  }
}
var name = "@firebase/analytics";
var version = "0.10.0";
function registerAnalytics() {
  _registerComponent(new Component(
    ANALYTICS_TYPE,
    (container, { options: analyticsOptions }) => {
      const app = container.getProvider("app").getImmediate();
      const installations = container.getProvider("installations-internal").getImmediate();
      return factory(app, installations, analyticsOptions);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ));
  _registerComponent(new Component(
    "analytics-internal",
    internalFactory,
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  registerVersion(name, version);
  registerVersion(name, version, "esm2017");
  function internalFactory(container) {
    try {
      const analytics = container.getProvider(ANALYTICS_TYPE).getImmediate();
      return {
        logEvent: (eventName, eventParams, options) => logEvent(analytics, eventName, eventParams, options)
      };
    } catch (e) {
      throw ERROR_FACTORY.create("interop-component-reg-failed", {
        reason: e
      });
    }
  }
}
registerAnalytics();

// node_modules/@angular/fire/fesm2022/angular-fire-analytics.mjs
var Analytics = class {
  constructor(analytics) {
    return analytics;
  }
};
var ANALYTICS_PROVIDER_NAME = "analytics";
var AnalyticsInstances = class {
  constructor() {
    return ɵgetAllInstancesOf(ANALYTICS_PROVIDER_NAME);
  }
};
var analyticInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(ANALYTICS_PROVIDER_NAME))), distinct());
var isAnalyticsSupportedValueSymbol = "__angularfire_symbol__analyticsIsSupportedValue";
var isAnalyticsSupportedPromiseSymbol = "__angularfire_symbol__analyticsIsSupported";
globalThis[isAnalyticsSupportedPromiseSymbol] ||= isSupported().then((it) => globalThis[isAnalyticsSupportedValueSymbol] = it).catch(() => globalThis[isAnalyticsSupportedValueSymbol] = false);
var isAnalyticsSupportedFactory = {
  async: () => globalThis[isAnalyticsSupportedPromiseSymbol],
  sync: () => {
    const ret = globalThis[isAnalyticsSupportedValueSymbol];
    if (ret === void 0) {
      throw new Error(ɵisSupportedError("Analytics"));
    }
    return ret;
  }
};
var isSupported2 = isAnalyticsSupportedFactory.async;
var getAnalytics2 = ɵzoneWrap(getAnalytics, true);
var getGoogleAnalyticsClientId2 = ɵzoneWrap(getGoogleAnalyticsClientId, true);
var initializeAnalytics2 = ɵzoneWrap(initializeAnalytics, true);
var logEvent2 = ɵzoneWrap(logEvent, true);
var setAnalyticsCollectionEnabled2 = ɵzoneWrap(setAnalyticsCollectionEnabled, true);
var setConsent2 = ɵzoneWrap(setConsent, true);
var setCurrentScreen2 = ɵzoneWrap(setCurrentScreen, true);
var setDefaultEventParameters2 = ɵzoneWrap(setDefaultEventParameters, true);
var settings2 = ɵzoneWrap(settings, true);
var setUserId2 = ɵzoneWrap(setUserId, true);
var setUserProperties2 = ɵzoneWrap(setUserProperties, true);
var UserTrackingService = class _UserTrackingService {
  initialized;
  disposables = [];
  constructor(auth, zone, injector) {
    registerVersion("angularfire", VERSION.full, "user-tracking");
    let resolveInitialized;
    this.initialized = zone.runOutsideAngular(() => new Promise((resolve) => {
      resolveInitialized = resolve;
    }));
    isSupported2().then(() => {
      const analytics = injector.get(Analytics);
      if (analytics) {
        this.disposables = [
          // TODO add credential tracking back in
          authState(auth).subscribe((user) => {
            setUserId2(analytics, user?.uid);
            resolveInitialized();
          })
        ];
      } else {
        resolveInitialized();
      }
    });
  }
  ngOnDestroy() {
    this.disposables.forEach((it) => it.unsubscribe());
  }
  static ɵfac = function UserTrackingService_Factory(t) {
    return new (t || _UserTrackingService)(ɵɵinject(Auth), ɵɵinject(NgZone), ɵɵinject(Injector));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _UserTrackingService,
    factory: _UserTrackingService.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(UserTrackingService, [{
    type: Injectable
  }], () => [{
    type: Auth
  }, {
    type: NgZone
  }, {
    type: Injector
  }], null);
})();
var FIREBASE_EVENT_ORIGIN_KEY = "firebase_event_origin";
var FIREBASE_PREVIOUS_SCREEN_CLASS_KEY = "firebase_previous_class";
var FIREBASE_PREVIOUS_SCREEN_INSTANCE_ID_KEY = "firebase_previous_id";
var FIREBASE_PREVIOUS_SCREEN_NAME_KEY = "firebase_previous_screen";
var FIREBASE_SCREEN_CLASS_KEY = "firebase_screen_class";
var FIREBASE_SCREEN_INSTANCE_ID_KEY = "firebase_screen_id";
var FIREBASE_SCREEN_NAME_KEY = "firebase_screen";
var OUTLET_KEY = "outlet";
var PAGE_PATH_KEY = "page_path";
var PAGE_TITLE_KEY = "page_title";
var SCREEN_CLASS_KEY = "screen_class";
var SCREEN_NAME_KEY = "screen_name";
var SCREEN_VIEW_EVENT = "screen_view";
var EVENT_ORIGIN_AUTO = "auto";
var SCREEN_INSTANCE_DELIMITER = "#";
var nextScreenInstanceID = Math.floor(Math.random() * (2 ** 32 - 1)) - 2 ** 31;
var knownScreenInstanceIDs = {};
var getScreenInstanceID = (params) => {
  const screenInstanceKey = [params[SCREEN_CLASS_KEY], params[OUTLET_KEY]].join(SCREEN_INSTANCE_DELIMITER);
  if (knownScreenInstanceIDs.hasOwnProperty(screenInstanceKey)) {
    return knownScreenInstanceIDs[screenInstanceKey];
  } else {
    const ret = nextScreenInstanceID++;
    knownScreenInstanceIDs[screenInstanceKey] = ret;
    return ret;
  }
};
var ɵscreenViewEvent = (router, title, componentFactoryResolver) => {
  const activationEndEvents = router.events.pipe(filter((e) => e instanceof ActivationEnd));
  return activationEndEvents.pipe(switchMap((activationEnd) => {
    const urlTree = router.parseUrl(router.url.replace(/(?:\().+(?:\))/g, (a) => a.replace("://", ":///")));
    const pagePath = urlTree.root.children[activationEnd.snapshot.outlet]?.toString() || "";
    const actualSnapshot = router.routerState.root.children.map((it) => it).find((it) => it.outlet === activationEnd.snapshot.outlet);
    if (!actualSnapshot) {
      return of(null);
    }
    let actualDeep = actualSnapshot;
    while (actualDeep.firstChild) {
      actualDeep = actualDeep.firstChild;
    }
    const screenName = actualDeep.pathFromRoot.map((s) => s.routeConfig?.path).filter((it) => it).join("/") || "/";
    const params = {
      [SCREEN_NAME_KEY]: screenName,
      [PAGE_PATH_KEY]: `/${pagePath}`,
      [FIREBASE_EVENT_ORIGIN_KEY]: EVENT_ORIGIN_AUTO,
      [FIREBASE_SCREEN_NAME_KEY]: screenName,
      [OUTLET_KEY]: activationEnd.snapshot.outlet
    };
    if (title) {
      params[PAGE_TITLE_KEY] = title.getTitle();
    }
    let component = actualSnapshot.component;
    if (component) {
      if (component === ɵEmptyOutletComponent) {
        let deepSnapshot = activationEnd.snapshot;
        while (deepSnapshot.firstChild) {
          deepSnapshot = deepSnapshot.firstChild;
        }
        component = deepSnapshot.component;
      }
    } else {
      component = activationEnd.snapshot.component;
    }
    if (typeof component === "string") {
      return of(__spreadProps(__spreadValues({}, params), {
        [SCREEN_CLASS_KEY]: component
      }));
    } else if (component) {
      const componentFactory = componentFactoryResolver.resolveComponentFactory(component);
      return of(__spreadProps(__spreadValues({}, params), {
        [SCREEN_CLASS_KEY]: componentFactory.selector
      }));
    }
    return of(null);
  }), filter((it) => !!it), map((params) => __spreadValues({
    [FIREBASE_SCREEN_CLASS_KEY]: params[SCREEN_CLASS_KEY],
    [FIREBASE_SCREEN_INSTANCE_ID_KEY]: getScreenInstanceID(params)
  }, params)), groupBy((it) => it[OUTLET_KEY]), mergeMap((it) => it.pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)), startWith(void 0), pairwise(), map(([prior, current]) => prior ? __spreadValues({
    [FIREBASE_PREVIOUS_SCREEN_CLASS_KEY]: prior[SCREEN_CLASS_KEY],
    [FIREBASE_PREVIOUS_SCREEN_NAME_KEY]: prior[SCREEN_NAME_KEY],
    [FIREBASE_PREVIOUS_SCREEN_INSTANCE_ID_KEY]: prior[FIREBASE_SCREEN_INSTANCE_ID_KEY]
  }, current) : current))));
};
var ScreenTrackingService = class _ScreenTrackingService {
  disposable;
  constructor(router, title, componentFactoryResolver, zone, userTrackingService, injector) {
    registerVersion("angularfire", VERSION.full, "screen-tracking");
    isSupported2().then(() => {
      const analytics = injector.get(Analytics);
      if (!router || !analytics) {
        return;
      }
      zone.runOutsideAngular(() => {
        this.disposable = ɵscreenViewEvent(router, title, componentFactoryResolver).pipe(switchMap((params) => __async(this, null, function* () {
          if (userTrackingService) {
            yield userTrackingService.initialized;
          }
          return logEvent2(analytics, SCREEN_VIEW_EVENT, params);
        }))).subscribe();
      });
    });
  }
  ngOnDestroy() {
    if (this.disposable) {
      this.disposable.unsubscribe();
    }
  }
  static ɵfac = function ScreenTrackingService_Factory(t) {
    return new (t || _ScreenTrackingService)(ɵɵinject(Router, 8), ɵɵinject(Title, 8), ɵɵinject(ComponentFactoryResolver$1), ɵɵinject(NgZone), ɵɵinject(UserTrackingService, 8), ɵɵinject(Injector));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ScreenTrackingService,
    factory: _ScreenTrackingService.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScreenTrackingService, [{
    type: Injectable
  }], () => [{
    type: Router,
    decorators: [{
      type: Optional
    }]
  }, {
    type: Title,
    decorators: [{
      type: Optional
    }]
  }, {
    type: ComponentFactoryResolver$1
  }, {
    type: NgZone
  }, {
    type: UserTrackingService,
    decorators: [{
      type: Optional
    }]
  }, {
    type: Injector
  }], null);
})();
var PROVIDED_ANALYTICS_INSTANCES = new InjectionToken("angularfire2.analytics-instances");
function defaultAnalyticsInstanceFactory(provided, defaultApp) {
  if (!isAnalyticsSupportedFactory.sync()) {
    return null;
  }
  const defaultAnalytics = ɵgetDefaultInstanceOf(ANALYTICS_PROVIDER_NAME, provided, defaultApp);
  return defaultAnalytics && new Analytics(defaultAnalytics);
}
function analyticsInstanceFactory(fn) {
  return (zone, injector) => {
    if (!isAnalyticsSupportedFactory.sync()) {
      return null;
    }
    const analytics = zone.runOutsideAngular(() => fn(injector));
    return new Analytics(analytics);
  };
}
var ANALYTICS_INSTANCES_PROVIDER = {
  provide: AnalyticsInstances,
  deps: [[new Optional(), PROVIDED_ANALYTICS_INSTANCES]]
};
var DEFAULT_ANALYTICS_INSTANCE_PROVIDER = {
  provide: Analytics,
  useFactory: defaultAnalyticsInstanceFactory,
  deps: [[new Optional(), PROVIDED_ANALYTICS_INSTANCES], FirebaseApp]
};
var AnalyticsModule = class _AnalyticsModule {
  constructor(_screenTrackingService, _userTrackingService) {
    registerVersion("angularfire", VERSION.full, "analytics");
  }
  static ɵfac = function AnalyticsModule_Factory(t) {
    return new (t || _AnalyticsModule)(ɵɵinject(ScreenTrackingService, 8), ɵɵinject(UserTrackingService, 8));
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _AnalyticsModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [DEFAULT_ANALYTICS_INSTANCE_PROVIDER, ANALYTICS_INSTANCES_PROVIDER, {
      provide: APP_INITIALIZER,
      useValue: isAnalyticsSupportedFactory.async,
      multi: true
    }]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AnalyticsModule, [{
    type: NgModule,
    args: [{
      providers: [DEFAULT_ANALYTICS_INSTANCE_PROVIDER, ANALYTICS_INSTANCES_PROVIDER, {
        provide: APP_INITIALIZER,
        useValue: isAnalyticsSupportedFactory.async,
        multi: true
      }]
    }]
  }], () => [{
    type: ScreenTrackingService,
    decorators: [{
      type: Optional
    }]
  }, {
    type: UserTrackingService,
    decorators: [{
      type: Optional
    }]
  }], null);
})();
function provideAnalytics(fn, ...deps) {
  return {
    ngModule: AnalyticsModule,
    providers: [{
      provide: PROVIDED_ANALYTICS_INSTANCES,
      useFactory: analyticsInstanceFactory(fn),
      multi: true,
      deps: [NgZone, Injector, ɵAngularFireSchedulers, FirebaseApps, ...deps]
    }]
  };
}
export {
  Analytics,
  AnalyticsInstances,
  AnalyticsModule,
  ScreenTrackingService,
  UserTrackingService,
  analyticInstance$,
  getAnalytics2 as getAnalytics,
  getGoogleAnalyticsClientId2 as getGoogleAnalyticsClientId,
  initializeAnalytics2 as initializeAnalytics,
  isSupported2 as isSupported,
  logEvent2 as logEvent,
  provideAnalytics,
  setAnalyticsCollectionEnabled2 as setAnalyticsCollectionEnabled,
  setConsent2 as setConsent,
  setCurrentScreen2 as setCurrentScreen,
  setDefaultEventParameters2 as setDefaultEventParameters,
  setUserId2 as setUserId,
  setUserProperties2 as setUserProperties,
  settings2 as settings,
  ɵscreenViewEvent
};
/*! Bundled license information:

@firebase/analytics/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
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
//# sourceMappingURL=@angular_fire_analytics.js.map
