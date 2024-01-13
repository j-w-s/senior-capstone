import {
  Component,
  Deferred,
  ErrorFactory,
  Logger,
  _getProvider,
  _registerComponent,
  base64,
  calculateBackoffMillis,
  getApp,
  getGlobal,
  getModularInstance,
  isIndexedDBAvailable,
  issuedAtTime,
  registerVersion,
  uuidv4
} from "./chunk-HHEXDI44.js";
import {
  __async
} from "./chunk-EQU7RARR.js";

// node_modules/@firebase/app-check/dist/esm/index.esm2017.js
var APP_CHECK_STATES = /* @__PURE__ */ new Map();
var DEFAULT_STATE = {
  activated: false,
  tokenObservers: []
};
var DEBUG_STATE = {
  initialized: false,
  enabled: false
};
function getStateReference(app) {
  return APP_CHECK_STATES.get(app) || Object.assign({}, DEFAULT_STATE);
}
function setInitialState(app, state) {
  APP_CHECK_STATES.set(app, state);
  return APP_CHECK_STATES.get(app);
}
function getDebugState() {
  return DEBUG_STATE;
}
var BASE_ENDPOINT = "https://content-firebaseappcheck.googleapis.com/v1";
var EXCHANGE_RECAPTCHA_TOKEN_METHOD = "exchangeRecaptchaV3Token";
var EXCHANGE_RECAPTCHA_ENTERPRISE_TOKEN_METHOD = "exchangeRecaptchaEnterpriseToken";
var EXCHANGE_DEBUG_TOKEN_METHOD = "exchangeDebugToken";
var TOKEN_REFRESH_TIME = {
  /**
   * The offset time before token natural expiration to run the refresh.
   * This is currently 5 minutes.
   */
  OFFSET_DURATION: 5 * 60 * 1e3,
  /**
   * This is the first retrial wait after an error. This is currently
   * 30 seconds.
   */
  RETRIAL_MIN_WAIT: 30 * 1e3,
  /**
   * This is the maximum retrial wait, currently 16 minutes.
   */
  RETRIAL_MAX_WAIT: 16 * 60 * 1e3
};
var ONE_DAY = 24 * 60 * 60 * 1e3;
var Refresher = class {
  constructor(operation, retryPolicy, getWaitDuration, lowerBound, upperBound) {
    this.operation = operation;
    this.retryPolicy = retryPolicy;
    this.getWaitDuration = getWaitDuration;
    this.lowerBound = lowerBound;
    this.upperBound = upperBound;
    this.pending = null;
    this.nextErrorWaitInterval = lowerBound;
    if (lowerBound > upperBound) {
      throw new Error("Proactive refresh lower bound greater than upper bound!");
    }
  }
  start() {
    this.nextErrorWaitInterval = this.lowerBound;
    this.process(true).catch(() => {
    });
  }
  stop() {
    if (this.pending) {
      this.pending.reject("cancelled");
      this.pending = null;
    }
  }
  isRunning() {
    return !!this.pending;
  }
  process(hasSucceeded) {
    return __async(this, null, function* () {
      this.stop();
      try {
        this.pending = new Deferred();
        this.pending.promise.catch((_e) => {
        });
        yield sleep(this.getNextRun(hasSucceeded));
        this.pending.resolve();
        yield this.pending.promise;
        this.pending = new Deferred();
        this.pending.promise.catch((_e) => {
        });
        yield this.operation();
        this.pending.resolve();
        yield this.pending.promise;
        this.process(true).catch(() => {
        });
      } catch (error) {
        if (this.retryPolicy(error)) {
          this.process(false).catch(() => {
          });
        } else {
          this.stop();
        }
      }
    });
  }
  getNextRun(hasSucceeded) {
    if (hasSucceeded) {
      this.nextErrorWaitInterval = this.lowerBound;
      return this.getWaitDuration();
    } else {
      const currentErrorWaitInterval = this.nextErrorWaitInterval;
      this.nextErrorWaitInterval *= 2;
      if (this.nextErrorWaitInterval > this.upperBound) {
        this.nextErrorWaitInterval = this.upperBound;
      }
      return currentErrorWaitInterval;
    }
  }
};
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
var ERRORS = {
  [
    "already-initialized"
    /* AppCheckError.ALREADY_INITIALIZED */
  ]: "You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.",
  [
    "use-before-activation"
    /* AppCheckError.USE_BEFORE_ACTIVATION */
  ]: "App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.",
  [
    "fetch-network-error"
    /* AppCheckError.FETCH_NETWORK_ERROR */
  ]: "Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.",
  [
    "fetch-parse-error"
    /* AppCheckError.FETCH_PARSE_ERROR */
  ]: "Fetch client could not parse response. Original error: {$originalErrorMessage}.",
  [
    "fetch-status-error"
    /* AppCheckError.FETCH_STATUS_ERROR */
  ]: "Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.",
  [
    "storage-open"
    /* AppCheckError.STORAGE_OPEN */
  ]: "Error thrown when opening storage. Original error: {$originalErrorMessage}.",
  [
    "storage-get"
    /* AppCheckError.STORAGE_GET */
  ]: "Error thrown when reading from storage. Original error: {$originalErrorMessage}.",
  [
    "storage-set"
    /* AppCheckError.STORAGE_WRITE */
  ]: "Error thrown when writing to storage. Original error: {$originalErrorMessage}.",
  [
    "recaptcha-error"
    /* AppCheckError.RECAPTCHA_ERROR */
  ]: "ReCAPTCHA error.",
  [
    "throttled"
    /* AppCheckError.THROTTLED */
  ]: `Requests throttled due to {$httpStatus} error. Attempts allowed again after {$time}`
};
var ERROR_FACTORY = new ErrorFactory("appCheck", "AppCheck", ERRORS);
function getRecaptcha(isEnterprise = false) {
  var _a;
  if (isEnterprise) {
    return (_a = self.grecaptcha) === null || _a === void 0 ? void 0 : _a.enterprise;
  }
  return self.grecaptcha;
}
function ensureActivated(app) {
  if (!getStateReference(app).activated) {
    throw ERROR_FACTORY.create("use-before-activation", {
      appName: app.name
    });
  }
}
function getDurationString(durationInMillis) {
  const totalSeconds = Math.round(durationInMillis / 1e3);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds - days * 3600 * 24) / 3600);
  const minutes = Math.floor((totalSeconds - days * 3600 * 24 - hours * 3600) / 60);
  const seconds = totalSeconds - days * 3600 * 24 - hours * 3600 - minutes * 60;
  let result = "";
  if (days) {
    result += pad(days) + "d:";
  }
  if (hours) {
    result += pad(hours) + "h:";
  }
  result += pad(minutes) + "m:" + pad(seconds) + "s";
  return result;
}
function pad(value) {
  if (value === 0) {
    return "00";
  }
  return value >= 10 ? value.toString() : "0" + value;
}
function exchangeToken(_0, _1) {
  return __async(this, arguments, function* ({ url, body }, heartbeatServiceProvider) {
    const headers = {
      "Content-Type": "application/json"
    };
    const heartbeatService = heartbeatServiceProvider.getImmediate({
      optional: true
    });
    if (heartbeatService) {
      const heartbeatsHeader = yield heartbeatService.getHeartbeatsHeader();
      if (heartbeatsHeader) {
        headers["X-Firebase-Client"] = heartbeatsHeader;
      }
    }
    const options = {
      method: "POST",
      body: JSON.stringify(body),
      headers
    };
    let response;
    try {
      response = yield fetch(url, options);
    } catch (originalError) {
      throw ERROR_FACTORY.create("fetch-network-error", {
        originalErrorMessage: originalError === null || originalError === void 0 ? void 0 : originalError.message
      });
    }
    if (response.status !== 200) {
      throw ERROR_FACTORY.create("fetch-status-error", {
        httpStatus: response.status
      });
    }
    let responseBody;
    try {
      responseBody = yield response.json();
    } catch (originalError) {
      throw ERROR_FACTORY.create("fetch-parse-error", {
        originalErrorMessage: originalError === null || originalError === void 0 ? void 0 : originalError.message
      });
    }
    const match = responseBody.ttl.match(/^([\d.]+)(s)$/);
    if (!match || !match[2] || isNaN(Number(match[1]))) {
      throw ERROR_FACTORY.create("fetch-parse-error", {
        originalErrorMessage: `ttl field (timeToLive) is not in standard Protobuf Duration format: ${responseBody.ttl}`
      });
    }
    const timeToLiveAsNumber = Number(match[1]) * 1e3;
    const now = Date.now();
    return {
      token: responseBody.token,
      expireTimeMillis: now + timeToLiveAsNumber,
      issuedAtTimeMillis: now
    };
  });
}
function getExchangeRecaptchaV3TokenRequest(app, reCAPTCHAToken) {
  const { projectId, appId, apiKey } = app.options;
  return {
    url: `${BASE_ENDPOINT}/projects/${projectId}/apps/${appId}:${EXCHANGE_RECAPTCHA_TOKEN_METHOD}?key=${apiKey}`,
    body: {
      "recaptcha_v3_token": reCAPTCHAToken
    }
  };
}
function getExchangeRecaptchaEnterpriseTokenRequest(app, reCAPTCHAToken) {
  const { projectId, appId, apiKey } = app.options;
  return {
    url: `${BASE_ENDPOINT}/projects/${projectId}/apps/${appId}:${EXCHANGE_RECAPTCHA_ENTERPRISE_TOKEN_METHOD}?key=${apiKey}`,
    body: {
      "recaptcha_enterprise_token": reCAPTCHAToken
    }
  };
}
function getExchangeDebugTokenRequest(app, debugToken) {
  const { projectId, appId, apiKey } = app.options;
  return {
    url: `${BASE_ENDPOINT}/projects/${projectId}/apps/${appId}:${EXCHANGE_DEBUG_TOKEN_METHOD}?key=${apiKey}`,
    body: {
      // eslint-disable-next-line
      debug_token: debugToken
    }
  };
}
var DB_NAME = "firebase-app-check-database";
var DB_VERSION = 1;
var STORE_NAME = "firebase-app-check-store";
var DEBUG_TOKEN_KEY = "debug-token";
var dbPromise = null;
function getDBPromise() {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        var _a;
        reject(ERROR_FACTORY.create("storage-open", {
          originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
        }));
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        switch (event.oldVersion) {
          case 0:
            db.createObjectStore(STORE_NAME, {
              keyPath: "compositeKey"
            });
        }
      };
    } catch (e) {
      reject(ERROR_FACTORY.create("storage-open", {
        originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
      }));
    }
  });
  return dbPromise;
}
function readTokenFromIndexedDB(app) {
  return read(computeKey(app));
}
function writeTokenToIndexedDB(app, token) {
  return write(computeKey(app), token);
}
function writeDebugTokenToIndexedDB(token) {
  return write(DEBUG_TOKEN_KEY, token);
}
function readDebugTokenFromIndexedDB() {
  return read(DEBUG_TOKEN_KEY);
}
function write(key, value) {
  return __async(this, null, function* () {
    const db = yield getDBPromise();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      compositeKey: key,
      value
    });
    return new Promise((resolve, reject) => {
      request.onsuccess = (_event) => {
        resolve();
      };
      transaction.onerror = (event) => {
        var _a;
        reject(ERROR_FACTORY.create("storage-set", {
          originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
        }));
      };
    });
  });
}
function read(key) {
  return __async(this, null, function* () {
    const db = yield getDBPromise();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          resolve(result.value);
        } else {
          resolve(void 0);
        }
      };
      transaction.onerror = (event) => {
        var _a;
        reject(ERROR_FACTORY.create("storage-get", {
          originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
        }));
      };
    });
  });
}
function computeKey(app) {
  return `${app.options.appId}-${app.name}`;
}
var logger = new Logger("@firebase/app-check");
function readTokenFromStorage(app) {
  return __async(this, null, function* () {
    if (isIndexedDBAvailable()) {
      let token = void 0;
      try {
        token = yield readTokenFromIndexedDB(app);
      } catch (e) {
        logger.warn(`Failed to read token from IndexedDB. Error: ${e}`);
      }
      return token;
    }
    return void 0;
  });
}
function writeTokenToStorage(app, token) {
  if (isIndexedDBAvailable()) {
    return writeTokenToIndexedDB(app, token).catch((e) => {
      logger.warn(`Failed to write token to IndexedDB. Error: ${e}`);
    });
  }
  return Promise.resolve();
}
function readOrCreateDebugTokenFromStorage() {
  return __async(this, null, function* () {
    let existingDebugToken = void 0;
    try {
      existingDebugToken = yield readDebugTokenFromIndexedDB();
    } catch (_e) {
    }
    if (!existingDebugToken) {
      const newToken = uuidv4();
      writeDebugTokenToIndexedDB(newToken).catch((e) => logger.warn(`Failed to persist debug token to IndexedDB. Error: ${e}`));
      return newToken;
    } else {
      return existingDebugToken;
    }
  });
}
function isDebugMode() {
  const debugState = getDebugState();
  return debugState.enabled;
}
function getDebugToken() {
  return __async(this, null, function* () {
    const state = getDebugState();
    if (state.enabled && state.token) {
      return state.token.promise;
    } else {
      throw Error(`
            Can't get debug token in production mode.
        `);
    }
  });
}
function initializeDebugMode() {
  const globals = getGlobal();
  const debugState = getDebugState();
  debugState.initialized = true;
  if (typeof globals.FIREBASE_APPCHECK_DEBUG_TOKEN !== "string" && globals.FIREBASE_APPCHECK_DEBUG_TOKEN !== true) {
    return;
  }
  debugState.enabled = true;
  const deferredToken = new Deferred();
  debugState.token = deferredToken;
  if (typeof globals.FIREBASE_APPCHECK_DEBUG_TOKEN === "string") {
    deferredToken.resolve(globals.FIREBASE_APPCHECK_DEBUG_TOKEN);
  } else {
    deferredToken.resolve(readOrCreateDebugTokenFromStorage());
  }
}
var defaultTokenErrorData = { error: "UNKNOWN_ERROR" };
function formatDummyToken(tokenErrorData) {
  return base64.encodeString(
    JSON.stringify(tokenErrorData),
    /* webSafe= */
    false
  );
}
function getToken$2(appCheck, forceRefresh = false) {
  return __async(this, null, function* () {
    const app = appCheck.app;
    ensureActivated(app);
    const state = getStateReference(app);
    let token = state.token;
    let error = void 0;
    if (token && !isValid(token)) {
      state.token = void 0;
      token = void 0;
    }
    if (!token) {
      const cachedToken = yield state.cachedTokenPromise;
      if (cachedToken) {
        if (isValid(cachedToken)) {
          token = cachedToken;
        } else {
          yield writeTokenToStorage(app, void 0);
        }
      }
    }
    if (!forceRefresh && token && isValid(token)) {
      return {
        token: token.token
      };
    }
    let shouldCallListeners = false;
    if (isDebugMode()) {
      if (!state.exchangeTokenPromise) {
        state.exchangeTokenPromise = exchangeToken(getExchangeDebugTokenRequest(app, yield getDebugToken()), appCheck.heartbeatServiceProvider).finally(() => {
          state.exchangeTokenPromise = void 0;
        });
        shouldCallListeners = true;
      }
      const tokenFromDebugExchange = yield state.exchangeTokenPromise;
      yield writeTokenToStorage(app, tokenFromDebugExchange);
      state.token = tokenFromDebugExchange;
      return { token: tokenFromDebugExchange.token };
    }
    try {
      if (!state.exchangeTokenPromise) {
        state.exchangeTokenPromise = state.provider.getToken().finally(() => {
          state.exchangeTokenPromise = void 0;
        });
        shouldCallListeners = true;
      }
      token = yield getStateReference(app).exchangeTokenPromise;
    } catch (e) {
      if (e.code === `appCheck/${"throttled"}`) {
        logger.warn(e.message);
      } else {
        logger.error(e);
      }
      error = e;
    }
    let interopTokenResult;
    if (!token) {
      interopTokenResult = makeDummyTokenResult(error);
    } else if (error) {
      if (isValid(token)) {
        interopTokenResult = {
          token: token.token,
          internalError: error
        };
      } else {
        interopTokenResult = makeDummyTokenResult(error);
      }
    } else {
      interopTokenResult = {
        token: token.token
      };
      state.token = token;
      yield writeTokenToStorage(app, token);
    }
    if (shouldCallListeners) {
      notifyTokenListeners(app, interopTokenResult);
    }
    return interopTokenResult;
  });
}
function getLimitedUseToken$1(appCheck) {
  return __async(this, null, function* () {
    const app = appCheck.app;
    ensureActivated(app);
    const { provider } = getStateReference(app);
    if (isDebugMode()) {
      const debugToken = yield getDebugToken();
      const { token } = yield exchangeToken(getExchangeDebugTokenRequest(app, debugToken), appCheck.heartbeatServiceProvider);
      return { token };
    } else {
      const { token } = yield provider.getToken();
      return { token };
    }
  });
}
function addTokenListener(appCheck, type, listener, onError) {
  const { app } = appCheck;
  const state = getStateReference(app);
  const tokenObserver = {
    next: listener,
    error: onError,
    type
  };
  state.tokenObservers = [...state.tokenObservers, tokenObserver];
  if (state.token && isValid(state.token)) {
    const validToken = state.token;
    Promise.resolve().then(() => {
      listener({ token: validToken.token });
      initTokenRefresher(appCheck);
    }).catch(() => {
    });
  }
  void state.cachedTokenPromise.then(() => initTokenRefresher(appCheck));
}
function removeTokenListener(app, listener) {
  const state = getStateReference(app);
  const newObservers = state.tokenObservers.filter((tokenObserver) => tokenObserver.next !== listener);
  if (newObservers.length === 0 && state.tokenRefresher && state.tokenRefresher.isRunning()) {
    state.tokenRefresher.stop();
  }
  state.tokenObservers = newObservers;
}
function initTokenRefresher(appCheck) {
  const { app } = appCheck;
  const state = getStateReference(app);
  let refresher = state.tokenRefresher;
  if (!refresher) {
    refresher = createTokenRefresher(appCheck);
    state.tokenRefresher = refresher;
  }
  if (!refresher.isRunning() && state.isTokenAutoRefreshEnabled) {
    refresher.start();
  }
}
function createTokenRefresher(appCheck) {
  const { app } = appCheck;
  return new Refresher(
    // Keep in mind when this fails for any reason other than the ones
    // for which we should retry, it will effectively stop the proactive refresh.
    () => __async(this, null, function* () {
      const state = getStateReference(app);
      let result;
      if (!state.token) {
        result = yield getToken$2(appCheck);
      } else {
        result = yield getToken$2(appCheck, true);
      }
      if (result.error) {
        throw result.error;
      }
      if (result.internalError) {
        throw result.internalError;
      }
    }),
    () => {
      return true;
    },
    () => {
      const state = getStateReference(app);
      if (state.token) {
        let nextRefreshTimeMillis = state.token.issuedAtTimeMillis + (state.token.expireTimeMillis - state.token.issuedAtTimeMillis) * 0.5 + 5 * 60 * 1e3;
        const latestAllowableRefresh = state.token.expireTimeMillis - 5 * 60 * 1e3;
        nextRefreshTimeMillis = Math.min(nextRefreshTimeMillis, latestAllowableRefresh);
        return Math.max(0, nextRefreshTimeMillis - Date.now());
      } else {
        return 0;
      }
    },
    TOKEN_REFRESH_TIME.RETRIAL_MIN_WAIT,
    TOKEN_REFRESH_TIME.RETRIAL_MAX_WAIT
  );
}
function notifyTokenListeners(app, token) {
  const observers = getStateReference(app).tokenObservers;
  for (const observer of observers) {
    try {
      if (observer.type === "EXTERNAL" && token.error != null) {
        observer.error(token.error);
      } else {
        observer.next(token);
      }
    } catch (e) {
    }
  }
}
function isValid(token) {
  return token.expireTimeMillis - Date.now() > 0;
}
function makeDummyTokenResult(error) {
  return {
    token: formatDummyToken(defaultTokenErrorData),
    error
  };
}
var AppCheckService = class {
  constructor(app, heartbeatServiceProvider) {
    this.app = app;
    this.heartbeatServiceProvider = heartbeatServiceProvider;
  }
  _delete() {
    const { tokenObservers } = getStateReference(this.app);
    for (const tokenObserver of tokenObservers) {
      removeTokenListener(this.app, tokenObserver.next);
    }
    return Promise.resolve();
  }
};
function factory(app, heartbeatServiceProvider) {
  return new AppCheckService(app, heartbeatServiceProvider);
}
function internalFactory(appCheck) {
  return {
    getToken: (forceRefresh) => getToken$2(appCheck, forceRefresh),
    getLimitedUseToken: () => getLimitedUseToken$1(appCheck),
    addTokenListener: (listener) => addTokenListener(appCheck, "INTERNAL", listener),
    removeTokenListener: (listener) => removeTokenListener(appCheck.app, listener)
  };
}
var name = "@firebase/app-check";
var version = "0.8.1";
var RECAPTCHA_URL = "https://www.google.com/recaptcha/api.js";
var RECAPTCHA_ENTERPRISE_URL = "https://www.google.com/recaptcha/enterprise.js";
function initializeV3(app, siteKey) {
  const initialized = new Deferred();
  const state = getStateReference(app);
  state.reCAPTCHAState = { initialized };
  const divId = makeDiv(app);
  const grecaptcha = getRecaptcha(false);
  if (!grecaptcha) {
    loadReCAPTCHAV3Script(() => {
      const grecaptcha2 = getRecaptcha(false);
      if (!grecaptcha2) {
        throw new Error("no recaptcha");
      }
      queueWidgetRender(app, siteKey, grecaptcha2, divId, initialized);
    });
  } else {
    queueWidgetRender(app, siteKey, grecaptcha, divId, initialized);
  }
  return initialized.promise;
}
function initializeEnterprise(app, siteKey) {
  const initialized = new Deferred();
  const state = getStateReference(app);
  state.reCAPTCHAState = { initialized };
  const divId = makeDiv(app);
  const grecaptcha = getRecaptcha(true);
  if (!grecaptcha) {
    loadReCAPTCHAEnterpriseScript(() => {
      const grecaptcha2 = getRecaptcha(true);
      if (!grecaptcha2) {
        throw new Error("no recaptcha");
      }
      queueWidgetRender(app, siteKey, grecaptcha2, divId, initialized);
    });
  } else {
    queueWidgetRender(app, siteKey, grecaptcha, divId, initialized);
  }
  return initialized.promise;
}
function queueWidgetRender(app, siteKey, grecaptcha, container, initialized) {
  grecaptcha.ready(() => {
    renderInvisibleWidget(app, siteKey, grecaptcha, container);
    initialized.resolve(grecaptcha);
  });
}
function makeDiv(app) {
  const divId = `fire_app_check_${app.name}`;
  const invisibleDiv = document.createElement("div");
  invisibleDiv.id = divId;
  invisibleDiv.style.display = "none";
  document.body.appendChild(invisibleDiv);
  return divId;
}
function getToken$1(app) {
  return __async(this, null, function* () {
    ensureActivated(app);
    const reCAPTCHAState = getStateReference(app).reCAPTCHAState;
    const recaptcha = yield reCAPTCHAState.initialized.promise;
    return new Promise((resolve, _reject) => {
      const reCAPTCHAState2 = getStateReference(app).reCAPTCHAState;
      recaptcha.ready(() => {
        resolve(
          // widgetId is guaranteed to be available if reCAPTCHAState.initialized.promise resolved.
          recaptcha.execute(reCAPTCHAState2.widgetId, {
            action: "fire_app_check"
          })
        );
      });
    });
  });
}
function renderInvisibleWidget(app, siteKey, grecaptcha, container) {
  const widgetId = grecaptcha.render(container, {
    sitekey: siteKey,
    size: "invisible",
    // Success callback - set state
    callback: () => {
      getStateReference(app).reCAPTCHAState.succeeded = true;
    },
    // Failure callback - set state
    "error-callback": () => {
      getStateReference(app).reCAPTCHAState.succeeded = false;
    }
  });
  const state = getStateReference(app);
  state.reCAPTCHAState = Object.assign(Object.assign({}, state.reCAPTCHAState), {
    // state.reCAPTCHAState is set in the initialize()
    widgetId
  });
}
function loadReCAPTCHAV3Script(onload) {
  const script = document.createElement("script");
  script.src = RECAPTCHA_URL;
  script.onload = onload;
  document.head.appendChild(script);
}
function loadReCAPTCHAEnterpriseScript(onload) {
  const script = document.createElement("script");
  script.src = RECAPTCHA_ENTERPRISE_URL;
  script.onload = onload;
  document.head.appendChild(script);
}
var ReCaptchaV3Provider = class _ReCaptchaV3Provider {
  /**
   * Create a ReCaptchaV3Provider instance.
   * @param siteKey - ReCAPTCHA V3 siteKey.
   */
  constructor(_siteKey) {
    this._siteKey = _siteKey;
    this._throttleData = null;
  }
  /**
   * Returns an App Check token.
   * @internal
   */
  getToken() {
    return __async(this, null, function* () {
      var _a, _b, _c;
      throwIfThrottled(this._throttleData);
      const attestedClaimsToken = yield getToken$1(this._app).catch((_e) => {
        throw ERROR_FACTORY.create(
          "recaptcha-error"
          /* AppCheckError.RECAPTCHA_ERROR */
        );
      });
      if (!((_a = getStateReference(this._app).reCAPTCHAState) === null || _a === void 0 ? void 0 : _a.succeeded)) {
        throw ERROR_FACTORY.create(
          "recaptcha-error"
          /* AppCheckError.RECAPTCHA_ERROR */
        );
      }
      let result;
      try {
        result = yield exchangeToken(getExchangeRecaptchaV3TokenRequest(this._app, attestedClaimsToken), this._heartbeatServiceProvider);
      } catch (e) {
        if ((_b = e.code) === null || _b === void 0 ? void 0 : _b.includes(
          "fetch-status-error"
          /* AppCheckError.FETCH_STATUS_ERROR */
        )) {
          this._throttleData = setBackoff(Number((_c = e.customData) === null || _c === void 0 ? void 0 : _c.httpStatus), this._throttleData);
          throw ERROR_FACTORY.create("throttled", {
            time: getDurationString(this._throttleData.allowRequestsAfter - Date.now()),
            httpStatus: this._throttleData.httpStatus
          });
        } else {
          throw e;
        }
      }
      this._throttleData = null;
      return result;
    });
  }
  /**
   * @internal
   */
  initialize(app) {
    this._app = app;
    this._heartbeatServiceProvider = _getProvider(app, "heartbeat");
    initializeV3(app, this._siteKey).catch(() => {
    });
  }
  /**
   * @internal
   */
  isEqual(otherProvider) {
    if (otherProvider instanceof _ReCaptchaV3Provider) {
      return this._siteKey === otherProvider._siteKey;
    } else {
      return false;
    }
  }
};
var ReCaptchaEnterpriseProvider = class _ReCaptchaEnterpriseProvider {
  /**
   * Create a ReCaptchaEnterpriseProvider instance.
   * @param siteKey - reCAPTCHA Enterprise score-based site key.
   */
  constructor(_siteKey) {
    this._siteKey = _siteKey;
    this._throttleData = null;
  }
  /**
   * Returns an App Check token.
   * @internal
   */
  getToken() {
    return __async(this, null, function* () {
      var _a, _b, _c;
      throwIfThrottled(this._throttleData);
      const attestedClaimsToken = yield getToken$1(this._app).catch((_e) => {
        throw ERROR_FACTORY.create(
          "recaptcha-error"
          /* AppCheckError.RECAPTCHA_ERROR */
        );
      });
      if (!((_a = getStateReference(this._app).reCAPTCHAState) === null || _a === void 0 ? void 0 : _a.succeeded)) {
        throw ERROR_FACTORY.create(
          "recaptcha-error"
          /* AppCheckError.RECAPTCHA_ERROR */
        );
      }
      let result;
      try {
        result = yield exchangeToken(getExchangeRecaptchaEnterpriseTokenRequest(this._app, attestedClaimsToken), this._heartbeatServiceProvider);
      } catch (e) {
        if ((_b = e.code) === null || _b === void 0 ? void 0 : _b.includes(
          "fetch-status-error"
          /* AppCheckError.FETCH_STATUS_ERROR */
        )) {
          this._throttleData = setBackoff(Number((_c = e.customData) === null || _c === void 0 ? void 0 : _c.httpStatus), this._throttleData);
          throw ERROR_FACTORY.create("throttled", {
            time: getDurationString(this._throttleData.allowRequestsAfter - Date.now()),
            httpStatus: this._throttleData.httpStatus
          });
        } else {
          throw e;
        }
      }
      this._throttleData = null;
      return result;
    });
  }
  /**
   * @internal
   */
  initialize(app) {
    this._app = app;
    this._heartbeatServiceProvider = _getProvider(app, "heartbeat");
    initializeEnterprise(app, this._siteKey).catch(() => {
    });
  }
  /**
   * @internal
   */
  isEqual(otherProvider) {
    if (otherProvider instanceof _ReCaptchaEnterpriseProvider) {
      return this._siteKey === otherProvider._siteKey;
    } else {
      return false;
    }
  }
};
var CustomProvider = class _CustomProvider {
  constructor(_customProviderOptions) {
    this._customProviderOptions = _customProviderOptions;
  }
  /**
   * @internal
   */
  getToken() {
    return __async(this, null, function* () {
      const customToken = yield this._customProviderOptions.getToken();
      const issuedAtTimeSeconds = issuedAtTime(customToken.token);
      const issuedAtTimeMillis = issuedAtTimeSeconds !== null && issuedAtTimeSeconds < Date.now() && issuedAtTimeSeconds > 0 ? issuedAtTimeSeconds * 1e3 : Date.now();
      return Object.assign(Object.assign({}, customToken), { issuedAtTimeMillis });
    });
  }
  /**
   * @internal
   */
  initialize(app) {
    this._app = app;
  }
  /**
   * @internal
   */
  isEqual(otherProvider) {
    if (otherProvider instanceof _CustomProvider) {
      return this._customProviderOptions.getToken.toString() === otherProvider._customProviderOptions.getToken.toString();
    } else {
      return false;
    }
  }
};
function setBackoff(httpStatus, throttleData) {
  if (httpStatus === 404 || httpStatus === 403) {
    return {
      backoffCount: 1,
      allowRequestsAfter: Date.now() + ONE_DAY,
      httpStatus
    };
  } else {
    const backoffCount = throttleData ? throttleData.backoffCount : 0;
    const backoffMillis = calculateBackoffMillis(backoffCount, 1e3, 2);
    return {
      backoffCount: backoffCount + 1,
      allowRequestsAfter: Date.now() + backoffMillis,
      httpStatus
    };
  }
}
function throwIfThrottled(throttleData) {
  if (throttleData) {
    if (Date.now() - throttleData.allowRequestsAfter <= 0) {
      throw ERROR_FACTORY.create("throttled", {
        time: getDurationString(throttleData.allowRequestsAfter - Date.now()),
        httpStatus: throttleData.httpStatus
      });
    }
  }
}
function initializeAppCheck(app = getApp(), options) {
  app = getModularInstance(app);
  const provider = _getProvider(app, "app-check");
  if (!getDebugState().initialized) {
    initializeDebugMode();
  }
  if (isDebugMode()) {
    void getDebugToken().then((token) => (
      // Not using logger because I don't think we ever want this accidentally hidden.
      console.log(`App Check debug token: ${token}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`)
    ));
  }
  if (provider.isInitialized()) {
    const existingInstance = provider.getImmediate();
    const initialOptions = provider.getOptions();
    if (initialOptions.isTokenAutoRefreshEnabled === options.isTokenAutoRefreshEnabled && initialOptions.provider.isEqual(options.provider)) {
      return existingInstance;
    } else {
      throw ERROR_FACTORY.create("already-initialized", {
        appName: app.name
      });
    }
  }
  const appCheck = provider.initialize({ options });
  _activate(app, options.provider, options.isTokenAutoRefreshEnabled);
  if (getStateReference(app).isTokenAutoRefreshEnabled) {
    addTokenListener(appCheck, "INTERNAL", () => {
    });
  }
  return appCheck;
}
function _activate(app, provider, isTokenAutoRefreshEnabled) {
  const state = setInitialState(app, Object.assign({}, DEFAULT_STATE));
  state.activated = true;
  state.provider = provider;
  state.cachedTokenPromise = readTokenFromStorage(app).then((cachedToken) => {
    if (cachedToken && isValid(cachedToken)) {
      state.token = cachedToken;
      notifyTokenListeners(app, { token: cachedToken.token });
    }
    return cachedToken;
  });
  state.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled === void 0 ? app.automaticDataCollectionEnabled : isTokenAutoRefreshEnabled;
  state.provider.initialize(app);
}
function setTokenAutoRefreshEnabled(appCheckInstance, isTokenAutoRefreshEnabled) {
  const app = appCheckInstance.app;
  const state = getStateReference(app);
  if (state.tokenRefresher) {
    if (isTokenAutoRefreshEnabled === true) {
      state.tokenRefresher.start();
    } else {
      state.tokenRefresher.stop();
    }
  }
  state.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled;
}
function getToken(appCheckInstance, forceRefresh) {
  return __async(this, null, function* () {
    const result = yield getToken$2(appCheckInstance, forceRefresh);
    if (result.error) {
      throw result.error;
    }
    return { token: result.token };
  });
}
function getLimitedUseToken(appCheckInstance) {
  return getLimitedUseToken$1(appCheckInstance);
}
function onTokenChanged(appCheckInstance, onNextOrObserver, onError, onCompletion) {
  let nextFn = () => {
  };
  let errorFn = () => {
  };
  if (onNextOrObserver.next != null) {
    nextFn = onNextOrObserver.next.bind(onNextOrObserver);
  } else {
    nextFn = onNextOrObserver;
  }
  if (onNextOrObserver.error != null) {
    errorFn = onNextOrObserver.error.bind(onNextOrObserver);
  } else if (onError) {
    errorFn = onError;
  }
  addTokenListener(appCheckInstance, "EXTERNAL", nextFn, errorFn);
  return () => removeTokenListener(appCheckInstance.app, nextFn);
}
var APP_CHECK_NAME = "app-check";
var APP_CHECK_NAME_INTERNAL = "app-check-internal";
function registerAppCheck() {
  _registerComponent(new Component(
    APP_CHECK_NAME,
    (container) => {
      const app = container.getProvider("app").getImmediate();
      const heartbeatServiceProvider = container.getProvider("heartbeat");
      return factory(app, heartbeatServiceProvider);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ).setInstanceCreatedCallback((container, _identifier, _appcheckService) => {
    container.getProvider(APP_CHECK_NAME_INTERNAL).initialize();
  }));
  _registerComponent(new Component(
    APP_CHECK_NAME_INTERNAL,
    (container) => {
      const appCheck = container.getProvider("app-check").getImmediate();
      return internalFactory(appCheck);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ));
  registerVersion(name, version);
}
registerAppCheck();

export {
  ReCaptchaV3Provider,
  ReCaptchaEnterpriseProvider,
  CustomProvider,
  initializeAppCheck,
  setTokenAutoRefreshEnabled,
  getToken,
  getLimitedUseToken,
  onTokenChanged
};
/*! Bundled license information:

@firebase/app-check/dist/esm/index.esm2017.js:
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
*/
//# sourceMappingURL=chunk-3PP5LNKO.js.map
