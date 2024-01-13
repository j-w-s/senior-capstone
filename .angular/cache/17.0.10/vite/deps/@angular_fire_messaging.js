import "./chunk-4YKDSQVU.js";
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
  InjectionToken,
  Injector,
  NgModule,
  NgZone,
  Optional,
  concatMap,
  distinct,
  from,
  setClassMetadata,
  timer,
  ɵɵdefineInjector,
  ɵɵdefineNgModule
} from "./chunk-UCPKFTR5.js";
import "./chunk-LHRTKJE6.js";
import {
  Component,
  ErrorFactory,
  _getProvider,
  _registerComponent,
  areCookiesEnabled,
  deleteDB,
  getApp,
  getModularInstance,
  isIndexedDBAvailable,
  openDB,
  registerVersion,
  validateIndexedDBOpenable
} from "./chunk-HHEXDI44.js";
import {
  __async
} from "./chunk-EQU7RARR.js";

// node_modules/@firebase/messaging/dist/esm/index.esm2017.js
var DEFAULT_SW_PATH = "/firebase-messaging-sw.js";
var DEFAULT_SW_SCOPE = "/firebase-cloud-messaging-push-scope";
var DEFAULT_VAPID_KEY = "BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4";
var ENDPOINT = "https://fcmregistrations.googleapis.com/v1";
var CONSOLE_CAMPAIGN_ID = "google.c.a.c_id";
var CONSOLE_CAMPAIGN_NAME = "google.c.a.c_l";
var CONSOLE_CAMPAIGN_TIME = "google.c.a.ts";
var CONSOLE_CAMPAIGN_ANALYTICS_ENABLED = "google.c.a.e";
var MessageType$1;
(function(MessageType2) {
  MessageType2[MessageType2["DATA_MESSAGE"] = 1] = "DATA_MESSAGE";
  MessageType2[MessageType2["DISPLAY_NOTIFICATION"] = 3] = "DISPLAY_NOTIFICATION";
})(MessageType$1 || (MessageType$1 = {}));
var MessageType;
(function(MessageType2) {
  MessageType2["PUSH_RECEIVED"] = "push-received";
  MessageType2["NOTIFICATION_CLICKED"] = "notification-clicked";
})(MessageType || (MessageType = {}));
function arrayToBase64(array) {
  const uint8Array = new Uint8Array(array);
  const base64String = btoa(String.fromCharCode(...uint8Array));
  return base64String.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function base64ToArray(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
var OLD_DB_NAME = "fcm_token_details_db";
var OLD_DB_VERSION = 5;
var OLD_OBJECT_STORE_NAME = "fcm_token_object_Store";
function migrateOldDatabase(senderId) {
  return __async(this, null, function* () {
    if ("databases" in indexedDB) {
      const databases = yield indexedDB.databases();
      const dbNames = databases.map((db2) => db2.name);
      if (!dbNames.includes(OLD_DB_NAME)) {
        return null;
      }
    }
    let tokenDetails = null;
    const db = yield openDB(OLD_DB_NAME, OLD_DB_VERSION, {
      upgrade: (db2, oldVersion, newVersion, upgradeTransaction) => __async(this, null, function* () {
        var _a;
        if (oldVersion < 2) {
          return;
        }
        if (!db2.objectStoreNames.contains(OLD_OBJECT_STORE_NAME)) {
          return;
        }
        const objectStore = upgradeTransaction.objectStore(OLD_OBJECT_STORE_NAME);
        const value = yield objectStore.index("fcmSenderId").get(senderId);
        yield objectStore.clear();
        if (!value) {
          return;
        }
        if (oldVersion === 2) {
          const oldDetails = value;
          if (!oldDetails.auth || !oldDetails.p256dh || !oldDetails.endpoint) {
            return;
          }
          tokenDetails = {
            token: oldDetails.fcmToken,
            createTime: (_a = oldDetails.createTime) !== null && _a !== void 0 ? _a : Date.now(),
            subscriptionOptions: {
              auth: oldDetails.auth,
              p256dh: oldDetails.p256dh,
              endpoint: oldDetails.endpoint,
              swScope: oldDetails.swScope,
              vapidKey: typeof oldDetails.vapidKey === "string" ? oldDetails.vapidKey : arrayToBase64(oldDetails.vapidKey)
            }
          };
        } else if (oldVersion === 3) {
          const oldDetails = value;
          tokenDetails = {
            token: oldDetails.fcmToken,
            createTime: oldDetails.createTime,
            subscriptionOptions: {
              auth: arrayToBase64(oldDetails.auth),
              p256dh: arrayToBase64(oldDetails.p256dh),
              endpoint: oldDetails.endpoint,
              swScope: oldDetails.swScope,
              vapidKey: arrayToBase64(oldDetails.vapidKey)
            }
          };
        } else if (oldVersion === 4) {
          const oldDetails = value;
          tokenDetails = {
            token: oldDetails.fcmToken,
            createTime: oldDetails.createTime,
            subscriptionOptions: {
              auth: arrayToBase64(oldDetails.auth),
              p256dh: arrayToBase64(oldDetails.p256dh),
              endpoint: oldDetails.endpoint,
              swScope: oldDetails.swScope,
              vapidKey: arrayToBase64(oldDetails.vapidKey)
            }
          };
        }
      })
    });
    db.close();
    yield deleteDB(OLD_DB_NAME);
    yield deleteDB("fcm_vapid_details_db");
    yield deleteDB("undefined");
    return checkTokenDetails(tokenDetails) ? tokenDetails : null;
  });
}
function checkTokenDetails(tokenDetails) {
  if (!tokenDetails || !tokenDetails.subscriptionOptions) {
    return false;
  }
  const { subscriptionOptions } = tokenDetails;
  return typeof tokenDetails.createTime === "number" && tokenDetails.createTime > 0 && typeof tokenDetails.token === "string" && tokenDetails.token.length > 0 && typeof subscriptionOptions.auth === "string" && subscriptionOptions.auth.length > 0 && typeof subscriptionOptions.p256dh === "string" && subscriptionOptions.p256dh.length > 0 && typeof subscriptionOptions.endpoint === "string" && subscriptionOptions.endpoint.length > 0 && typeof subscriptionOptions.swScope === "string" && subscriptionOptions.swScope.length > 0 && typeof subscriptionOptions.vapidKey === "string" && subscriptionOptions.vapidKey.length > 0;
}
var DATABASE_NAME = "firebase-messaging-database";
var DATABASE_VERSION = 1;
var OBJECT_STORE_NAME = "firebase-messaging-store";
var dbPromise = null;
function getDbPromise() {
  if (!dbPromise) {
    dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade: (upgradeDb, oldVersion) => {
        switch (oldVersion) {
          case 0:
            upgradeDb.createObjectStore(OBJECT_STORE_NAME);
        }
      }
    });
  }
  return dbPromise;
}
function dbGet(firebaseDependencies) {
  return __async(this, null, function* () {
    const key = getKey(firebaseDependencies);
    const db = yield getDbPromise();
    const tokenDetails = yield db.transaction(OBJECT_STORE_NAME).objectStore(OBJECT_STORE_NAME).get(key);
    if (tokenDetails) {
      return tokenDetails;
    } else {
      const oldTokenDetails = yield migrateOldDatabase(firebaseDependencies.appConfig.senderId);
      if (oldTokenDetails) {
        yield dbSet(firebaseDependencies, oldTokenDetails);
        return oldTokenDetails;
      }
    }
  });
}
function dbSet(firebaseDependencies, tokenDetails) {
  return __async(this, null, function* () {
    const key = getKey(firebaseDependencies);
    const db = yield getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    yield tx.objectStore(OBJECT_STORE_NAME).put(tokenDetails, key);
    yield tx.done;
    return tokenDetails;
  });
}
function dbRemove(firebaseDependencies) {
  return __async(this, null, function* () {
    const key = getKey(firebaseDependencies);
    const db = yield getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, "readwrite");
    yield tx.objectStore(OBJECT_STORE_NAME).delete(key);
    yield tx.done;
  });
}
function getKey({ appConfig }) {
  return appConfig.appId;
}
var ERROR_MAP = {
  [
    "missing-app-config-values"
    /* ErrorCode.MISSING_APP_CONFIG_VALUES */
  ]: 'Missing App configuration value: "{$valueName}"',
  [
    "only-available-in-window"
    /* ErrorCode.AVAILABLE_IN_WINDOW */
  ]: "This method is available in a Window context.",
  [
    "only-available-in-sw"
    /* ErrorCode.AVAILABLE_IN_SW */
  ]: "This method is available in a service worker context.",
  [
    "permission-default"
    /* ErrorCode.PERMISSION_DEFAULT */
  ]: "The notification permission was not granted and dismissed instead.",
  [
    "permission-blocked"
    /* ErrorCode.PERMISSION_BLOCKED */
  ]: "The notification permission was not granted and blocked instead.",
  [
    "unsupported-browser"
    /* ErrorCode.UNSUPPORTED_BROWSER */
  ]: "This browser doesn't support the API's required to use the Firebase SDK.",
  [
    "indexed-db-unsupported"
    /* ErrorCode.INDEXED_DB_UNSUPPORTED */
  ]: "This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)",
  [
    "failed-service-worker-registration"
    /* ErrorCode.FAILED_DEFAULT_REGISTRATION */
  ]: "We are unable to register the default service worker. {$browserErrorMessage}",
  [
    "token-subscribe-failed"
    /* ErrorCode.TOKEN_SUBSCRIBE_FAILED */
  ]: "A problem occurred while subscribing the user to FCM: {$errorInfo}",
  [
    "token-subscribe-no-token"
    /* ErrorCode.TOKEN_SUBSCRIBE_NO_TOKEN */
  ]: "FCM returned no token when subscribing the user to push.",
  [
    "token-unsubscribe-failed"
    /* ErrorCode.TOKEN_UNSUBSCRIBE_FAILED */
  ]: "A problem occurred while unsubscribing the user from FCM: {$errorInfo}",
  [
    "token-update-failed"
    /* ErrorCode.TOKEN_UPDATE_FAILED */
  ]: "A problem occurred while updating the user from FCM: {$errorInfo}",
  [
    "token-update-no-token"
    /* ErrorCode.TOKEN_UPDATE_NO_TOKEN */
  ]: "FCM returned no token when updating the user to push.",
  [
    "use-sw-after-get-token"
    /* ErrorCode.USE_SW_AFTER_GET_TOKEN */
  ]: "The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.",
  [
    "invalid-sw-registration"
    /* ErrorCode.INVALID_SW_REGISTRATION */
  ]: "The input to useServiceWorker() must be a ServiceWorkerRegistration.",
  [
    "invalid-bg-handler"
    /* ErrorCode.INVALID_BG_HANDLER */
  ]: "The input to setBackgroundMessageHandler() must be a function.",
  [
    "invalid-vapid-key"
    /* ErrorCode.INVALID_VAPID_KEY */
  ]: "The public VAPID key must be a string.",
  [
    "use-vapid-key-after-get-token"
    /* ErrorCode.USE_VAPID_KEY_AFTER_GET_TOKEN */
  ]: "The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."
};
var ERROR_FACTORY = new ErrorFactory("messaging", "Messaging", ERROR_MAP);
function requestGetToken(firebaseDependencies, subscriptionOptions) {
  return __async(this, null, function* () {
    const headers = yield getHeaders(firebaseDependencies);
    const body = getBody(subscriptionOptions);
    const subscribeOptions = {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    };
    let responseData;
    try {
      const response = yield fetch(getEndpoint(firebaseDependencies.appConfig), subscribeOptions);
      responseData = yield response.json();
    } catch (err) {
      throw ERROR_FACTORY.create("token-subscribe-failed", {
        errorInfo: err === null || err === void 0 ? void 0 : err.toString()
      });
    }
    if (responseData.error) {
      const message = responseData.error.message;
      throw ERROR_FACTORY.create("token-subscribe-failed", {
        errorInfo: message
      });
    }
    if (!responseData.token) {
      throw ERROR_FACTORY.create(
        "token-subscribe-no-token"
        /* ErrorCode.TOKEN_SUBSCRIBE_NO_TOKEN */
      );
    }
    return responseData.token;
  });
}
function requestUpdateToken(firebaseDependencies, tokenDetails) {
  return __async(this, null, function* () {
    const headers = yield getHeaders(firebaseDependencies);
    const body = getBody(tokenDetails.subscriptionOptions);
    const updateOptions = {
      method: "PATCH",
      headers,
      body: JSON.stringify(body)
    };
    let responseData;
    try {
      const response = yield fetch(`${getEndpoint(firebaseDependencies.appConfig)}/${tokenDetails.token}`, updateOptions);
      responseData = yield response.json();
    } catch (err) {
      throw ERROR_FACTORY.create("token-update-failed", {
        errorInfo: err === null || err === void 0 ? void 0 : err.toString()
      });
    }
    if (responseData.error) {
      const message = responseData.error.message;
      throw ERROR_FACTORY.create("token-update-failed", {
        errorInfo: message
      });
    }
    if (!responseData.token) {
      throw ERROR_FACTORY.create(
        "token-update-no-token"
        /* ErrorCode.TOKEN_UPDATE_NO_TOKEN */
      );
    }
    return responseData.token;
  });
}
function requestDeleteToken(firebaseDependencies, token) {
  return __async(this, null, function* () {
    const headers = yield getHeaders(firebaseDependencies);
    const unsubscribeOptions = {
      method: "DELETE",
      headers
    };
    try {
      const response = yield fetch(`${getEndpoint(firebaseDependencies.appConfig)}/${token}`, unsubscribeOptions);
      const responseData = yield response.json();
      if (responseData.error) {
        const message = responseData.error.message;
        throw ERROR_FACTORY.create("token-unsubscribe-failed", {
          errorInfo: message
        });
      }
    } catch (err) {
      throw ERROR_FACTORY.create("token-unsubscribe-failed", {
        errorInfo: err === null || err === void 0 ? void 0 : err.toString()
      });
    }
  });
}
function getEndpoint({ projectId }) {
  return `${ENDPOINT}/projects/${projectId}/registrations`;
}
function getHeaders(_0) {
  return __async(this, arguments, function* ({ appConfig, installations }) {
    const authToken = yield installations.getToken();
    return new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-goog-api-key": appConfig.apiKey,
      "x-goog-firebase-installations-auth": `FIS ${authToken}`
    });
  });
}
function getBody({ p256dh, auth, endpoint, vapidKey }) {
  const body = {
    web: {
      endpoint,
      auth,
      p256dh
    }
  };
  if (vapidKey !== DEFAULT_VAPID_KEY) {
    body.web.applicationPubKey = vapidKey;
  }
  return body;
}
var TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1e3;
function getTokenInternal(messaging) {
  return __async(this, null, function* () {
    const pushSubscription = yield getPushSubscription(messaging.swRegistration, messaging.vapidKey);
    const subscriptionOptions = {
      vapidKey: messaging.vapidKey,
      swScope: messaging.swRegistration.scope,
      endpoint: pushSubscription.endpoint,
      auth: arrayToBase64(pushSubscription.getKey("auth")),
      p256dh: arrayToBase64(pushSubscription.getKey("p256dh"))
    };
    const tokenDetails = yield dbGet(messaging.firebaseDependencies);
    if (!tokenDetails) {
      return getNewToken(messaging.firebaseDependencies, subscriptionOptions);
    } else if (!isTokenValid(tokenDetails.subscriptionOptions, subscriptionOptions)) {
      try {
        yield requestDeleteToken(messaging.firebaseDependencies, tokenDetails.token);
      } catch (e) {
        console.warn(e);
      }
      return getNewToken(messaging.firebaseDependencies, subscriptionOptions);
    } else if (Date.now() >= tokenDetails.createTime + TOKEN_EXPIRATION_MS) {
      return updateToken(messaging, {
        token: tokenDetails.token,
        createTime: Date.now(),
        subscriptionOptions
      });
    } else {
      return tokenDetails.token;
    }
  });
}
function deleteTokenInternal(messaging) {
  return __async(this, null, function* () {
    const tokenDetails = yield dbGet(messaging.firebaseDependencies);
    if (tokenDetails) {
      yield requestDeleteToken(messaging.firebaseDependencies, tokenDetails.token);
      yield dbRemove(messaging.firebaseDependencies);
    }
    const pushSubscription = yield messaging.swRegistration.pushManager.getSubscription();
    if (pushSubscription) {
      return pushSubscription.unsubscribe();
    }
    return true;
  });
}
function updateToken(messaging, tokenDetails) {
  return __async(this, null, function* () {
    try {
      const updatedToken = yield requestUpdateToken(messaging.firebaseDependencies, tokenDetails);
      const updatedTokenDetails = Object.assign(Object.assign({}, tokenDetails), { token: updatedToken, createTime: Date.now() });
      yield dbSet(messaging.firebaseDependencies, updatedTokenDetails);
      return updatedToken;
    } catch (e) {
      yield deleteTokenInternal(messaging);
      throw e;
    }
  });
}
function getNewToken(firebaseDependencies, subscriptionOptions) {
  return __async(this, null, function* () {
    const token = yield requestGetToken(firebaseDependencies, subscriptionOptions);
    const tokenDetails = {
      token,
      createTime: Date.now(),
      subscriptionOptions
    };
    yield dbSet(firebaseDependencies, tokenDetails);
    return tokenDetails.token;
  });
}
function getPushSubscription(swRegistration, vapidKey) {
  return __async(this, null, function* () {
    const subscription = yield swRegistration.pushManager.getSubscription();
    if (subscription) {
      return subscription;
    }
    return swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      // Chrome <= 75 doesn't support base64-encoded VAPID key. For backward compatibility, VAPID key
      // submitted to pushManager#subscribe must be of type Uint8Array.
      applicationServerKey: base64ToArray(vapidKey)
    });
  });
}
function isTokenValid(dbOptions, currentOptions) {
  const isVapidKeyEqual = currentOptions.vapidKey === dbOptions.vapidKey;
  const isEndpointEqual = currentOptions.endpoint === dbOptions.endpoint;
  const isAuthEqual = currentOptions.auth === dbOptions.auth;
  const isP256dhEqual = currentOptions.p256dh === dbOptions.p256dh;
  return isVapidKeyEqual && isEndpointEqual && isAuthEqual && isP256dhEqual;
}
function externalizePayload(internalPayload) {
  const payload = {
    from: internalPayload.from,
    // eslint-disable-next-line camelcase
    collapseKey: internalPayload.collapse_key,
    // eslint-disable-next-line camelcase
    messageId: internalPayload.fcmMessageId
  };
  propagateNotificationPayload(payload, internalPayload);
  propagateDataPayload(payload, internalPayload);
  propagateFcmOptions(payload, internalPayload);
  return payload;
}
function propagateNotificationPayload(payload, messagePayloadInternal) {
  if (!messagePayloadInternal.notification) {
    return;
  }
  payload.notification = {};
  const title = messagePayloadInternal.notification.title;
  if (!!title) {
    payload.notification.title = title;
  }
  const body = messagePayloadInternal.notification.body;
  if (!!body) {
    payload.notification.body = body;
  }
  const image = messagePayloadInternal.notification.image;
  if (!!image) {
    payload.notification.image = image;
  }
  const icon = messagePayloadInternal.notification.icon;
  if (!!icon) {
    payload.notification.icon = icon;
  }
}
function propagateDataPayload(payload, messagePayloadInternal) {
  if (!messagePayloadInternal.data) {
    return;
  }
  payload.data = messagePayloadInternal.data;
}
function propagateFcmOptions(payload, messagePayloadInternal) {
  var _a, _b, _c, _d, _e;
  if (!messagePayloadInternal.fcmOptions && !((_a = messagePayloadInternal.notification) === null || _a === void 0 ? void 0 : _a.click_action)) {
    return;
  }
  payload.fcmOptions = {};
  const link = (_c = (_b = messagePayloadInternal.fcmOptions) === null || _b === void 0 ? void 0 : _b.link) !== null && _c !== void 0 ? _c : (_d = messagePayloadInternal.notification) === null || _d === void 0 ? void 0 : _d.click_action;
  if (!!link) {
    payload.fcmOptions.link = link;
  }
  const analyticsLabel = (_e = messagePayloadInternal.fcmOptions) === null || _e === void 0 ? void 0 : _e.analytics_label;
  if (!!analyticsLabel) {
    payload.fcmOptions.analyticsLabel = analyticsLabel;
  }
}
function isConsoleMessage(data) {
  return typeof data === "object" && !!data && CONSOLE_CAMPAIGN_ID in data;
}
_mergeStrings("hts/frbslgigp.ogepscmv/ieo/eaylg", "tp:/ieaeogn-agolai.o/1frlglgc/o");
_mergeStrings("AzSCbw63g1R0nCw85jG8", "Iaya3yLKwmgvh7cF0q4");
function _mergeStrings(s1, s2) {
  const resultArray = [];
  for (let i = 0; i < s1.length; i++) {
    resultArray.push(s1.charAt(i));
    if (i < s2.length) {
      resultArray.push(s2.charAt(i));
    }
  }
  return resultArray.join("");
}
function extractAppConfig(app) {
  if (!app || !app.options) {
    throw getMissingValueError("App Configuration Object");
  }
  if (!app.name) {
    throw getMissingValueError("App Name");
  }
  const configKeys = [
    "projectId",
    "apiKey",
    "appId",
    "messagingSenderId"
  ];
  const { options } = app;
  for (const keyName of configKeys) {
    if (!options[keyName]) {
      throw getMissingValueError(keyName);
    }
  }
  return {
    appName: app.name,
    projectId: options.projectId,
    apiKey: options.apiKey,
    appId: options.appId,
    senderId: options.messagingSenderId
  };
}
function getMissingValueError(valueName) {
  return ERROR_FACTORY.create("missing-app-config-values", {
    valueName
  });
}
var MessagingService = class {
  constructor(app, installations, analyticsProvider) {
    this.deliveryMetricsExportedToBigQueryEnabled = false;
    this.onBackgroundMessageHandler = null;
    this.onMessageHandler = null;
    this.logEvents = [];
    this.isLogServiceStarted = false;
    const appConfig = extractAppConfig(app);
    this.firebaseDependencies = {
      app,
      appConfig,
      installations,
      analyticsProvider
    };
  }
  _delete() {
    return Promise.resolve();
  }
};
function registerDefaultSw(messaging) {
  return __async(this, null, function* () {
    try {
      messaging.swRegistration = yield navigator.serviceWorker.register(DEFAULT_SW_PATH, {
        scope: DEFAULT_SW_SCOPE
      });
      messaging.swRegistration.update().catch(() => {
      });
    } catch (e) {
      throw ERROR_FACTORY.create("failed-service-worker-registration", {
        browserErrorMessage: e === null || e === void 0 ? void 0 : e.message
      });
    }
  });
}
function updateSwReg(messaging, swRegistration) {
  return __async(this, null, function* () {
    if (!swRegistration && !messaging.swRegistration) {
      yield registerDefaultSw(messaging);
    }
    if (!swRegistration && !!messaging.swRegistration) {
      return;
    }
    if (!(swRegistration instanceof ServiceWorkerRegistration)) {
      throw ERROR_FACTORY.create(
        "invalid-sw-registration"
        /* ErrorCode.INVALID_SW_REGISTRATION */
      );
    }
    messaging.swRegistration = swRegistration;
  });
}
function updateVapidKey(messaging, vapidKey) {
  return __async(this, null, function* () {
    if (!!vapidKey) {
      messaging.vapidKey = vapidKey;
    } else if (!messaging.vapidKey) {
      messaging.vapidKey = DEFAULT_VAPID_KEY;
    }
  });
}
function getToken$1(messaging, options) {
  return __async(this, null, function* () {
    if (!navigator) {
      throw ERROR_FACTORY.create(
        "only-available-in-window"
        /* ErrorCode.AVAILABLE_IN_WINDOW */
      );
    }
    if (Notification.permission === "default") {
      yield Notification.requestPermission();
    }
    if (Notification.permission !== "granted") {
      throw ERROR_FACTORY.create(
        "permission-blocked"
        /* ErrorCode.PERMISSION_BLOCKED */
      );
    }
    yield updateVapidKey(messaging, options === null || options === void 0 ? void 0 : options.vapidKey);
    yield updateSwReg(messaging, options === null || options === void 0 ? void 0 : options.serviceWorkerRegistration);
    return getTokenInternal(messaging);
  });
}
function logToScion(messaging, messageType, data) {
  return __async(this, null, function* () {
    const eventType = getEventType(messageType);
    const analytics = yield messaging.firebaseDependencies.analyticsProvider.get();
    analytics.logEvent(eventType, {
      /* eslint-disable camelcase */
      message_id: data[CONSOLE_CAMPAIGN_ID],
      message_name: data[CONSOLE_CAMPAIGN_NAME],
      message_time: data[CONSOLE_CAMPAIGN_TIME],
      message_device_time: Math.floor(Date.now() / 1e3)
      /* eslint-enable camelcase */
    });
  });
}
function getEventType(messageType) {
  switch (messageType) {
    case MessageType.NOTIFICATION_CLICKED:
      return "notification_open";
    case MessageType.PUSH_RECEIVED:
      return "notification_foreground";
    default:
      throw new Error();
  }
}
function messageEventListener(messaging, event) {
  return __async(this, null, function* () {
    const internalPayload = event.data;
    if (!internalPayload.isFirebaseMessaging) {
      return;
    }
    if (messaging.onMessageHandler && internalPayload.messageType === MessageType.PUSH_RECEIVED) {
      if (typeof messaging.onMessageHandler === "function") {
        messaging.onMessageHandler(externalizePayload(internalPayload));
      } else {
        messaging.onMessageHandler.next(externalizePayload(internalPayload));
      }
    }
    const dataPayload = internalPayload.data;
    if (isConsoleMessage(dataPayload) && dataPayload[CONSOLE_CAMPAIGN_ANALYTICS_ENABLED] === "1") {
      yield logToScion(messaging, internalPayload.messageType, dataPayload);
    }
  });
}
var name = "@firebase/messaging";
var version = "0.12.5";
var WindowMessagingFactory = (container) => {
  const messaging = new MessagingService(container.getProvider("app").getImmediate(), container.getProvider("installations-internal").getImmediate(), container.getProvider("analytics-internal"));
  navigator.serviceWorker.addEventListener("message", (e) => messageEventListener(messaging, e));
  return messaging;
};
var WindowMessagingInternalFactory = (container) => {
  const messaging = container.getProvider("messaging").getImmediate();
  const messagingInternal = {
    getToken: (options) => getToken$1(messaging, options)
  };
  return messagingInternal;
};
function registerMessagingInWindow() {
  _registerComponent(new Component(
    "messaging",
    WindowMessagingFactory,
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ));
  _registerComponent(new Component(
    "messaging-internal",
    WindowMessagingInternalFactory,
    "PRIVATE"
    /* ComponentType.PRIVATE */
  ));
  registerVersion(name, version);
  registerVersion(name, version, "esm2017");
}
function isWindowSupported() {
  return __async(this, null, function* () {
    try {
      yield validateIndexedDBOpenable();
    } catch (e) {
      return false;
    }
    return typeof window !== "undefined" && isIndexedDBAvailable() && areCookiesEnabled() && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && "fetch" in window && ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification") && PushSubscription.prototype.hasOwnProperty("getKey");
  });
}
function deleteToken$1(messaging) {
  return __async(this, null, function* () {
    if (!navigator) {
      throw ERROR_FACTORY.create(
        "only-available-in-window"
        /* ErrorCode.AVAILABLE_IN_WINDOW */
      );
    }
    if (!messaging.swRegistration) {
      yield registerDefaultSw(messaging);
    }
    return deleteTokenInternal(messaging);
  });
}
function onMessage$1(messaging, nextOrObserver) {
  if (!navigator) {
    throw ERROR_FACTORY.create(
      "only-available-in-window"
      /* ErrorCode.AVAILABLE_IN_WINDOW */
    );
  }
  messaging.onMessageHandler = nextOrObserver;
  return () => {
    messaging.onMessageHandler = null;
  };
}
function getMessagingInWindow(app = getApp()) {
  isWindowSupported().then((isSupported2) => {
    if (!isSupported2) {
      throw ERROR_FACTORY.create(
        "unsupported-browser"
        /* ErrorCode.UNSUPPORTED_BROWSER */
      );
    }
  }, (_) => {
    throw ERROR_FACTORY.create(
      "indexed-db-unsupported"
      /* ErrorCode.INDEXED_DB_UNSUPPORTED */
    );
  });
  return _getProvider(getModularInstance(app), "messaging").getImmediate();
}
function getToken(messaging, options) {
  return __async(this, null, function* () {
    messaging = getModularInstance(messaging);
    return getToken$1(messaging, options);
  });
}
function deleteToken(messaging) {
  messaging = getModularInstance(messaging);
  return deleteToken$1(messaging);
}
function onMessage(messaging, nextOrObserver) {
  messaging = getModularInstance(messaging);
  return onMessage$1(messaging, nextOrObserver);
}
registerMessagingInWindow();

// node_modules/@angular/fire/fesm2022/angular-fire-messaging.mjs
var Messaging = class {
  constructor(messaging) {
    return messaging;
  }
};
var MESSAGING_PROVIDER_NAME = "messaging";
var MessagingInstances = class {
  constructor() {
    return ɵgetAllInstancesOf(MESSAGING_PROVIDER_NAME);
  }
};
var messagingInstance$ = timer(0, 300).pipe(concatMap(() => from(ɵgetAllInstancesOf(MESSAGING_PROVIDER_NAME))), distinct());
var isMessagingSupportedPromiseSymbol = "__angularfire_symbol__messagingIsSupported";
var isMessagingSupportedValueSymbol = "__angularfire_symbol__messagingIsSupportedValue";
globalThis[isMessagingSupportedPromiseSymbol] ||= isWindowSupported().then((it) => globalThis[isMessagingSupportedValueSymbol] = it).catch(() => globalThis[isMessagingSupportedValueSymbol] = false);
var isMessagingSupportedFactory = {
  async: () => globalThis[isMessagingSupportedPromiseSymbol],
  sync: () => {
    const ret = globalThis[isMessagingSupportedValueSymbol];
    if (ret === void 0) {
      throw new Error(ɵisSupportedError("Messaging"));
    }
    return ret;
  }
};
var PROVIDED_MESSAGING_INSTANCES = new InjectionToken("angularfire2.messaging-instances");
function defaultMessagingInstanceFactory(provided, defaultApp) {
  if (!isMessagingSupportedFactory.sync()) {
    return null;
  }
  const defaultMessaging = ɵgetDefaultInstanceOf(MESSAGING_PROVIDER_NAME, provided, defaultApp);
  return defaultMessaging && new Messaging(defaultMessaging);
}
function messagingInstanceFactory(fn) {
  return (zone, injector) => {
    if (!isMessagingSupportedFactory.sync()) {
      return null;
    }
    const messaging = zone.runOutsideAngular(() => fn(injector));
    return new Messaging(messaging);
  };
}
var MESSAGING_INSTANCES_PROVIDER = {
  provide: MessagingInstances,
  deps: [[new Optional(), PROVIDED_MESSAGING_INSTANCES]]
};
var DEFAULT_MESSAGING_INSTANCE_PROVIDER = {
  provide: Messaging,
  useFactory: defaultMessagingInstanceFactory,
  deps: [[new Optional(), PROVIDED_MESSAGING_INSTANCES], FirebaseApp]
};
var MessagingModule = class _MessagingModule {
  constructor() {
    registerVersion("angularfire", VERSION.full, "fcm");
  }
  static ɵfac = function MessagingModule_Factory(t) {
    return new (t || _MessagingModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _MessagingModule
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [DEFAULT_MESSAGING_INSTANCE_PROVIDER, MESSAGING_INSTANCES_PROVIDER, {
      provide: APP_INITIALIZER,
      useValue: isMessagingSupportedFactory.async,
      multi: true
    }]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MessagingModule, [{
    type: NgModule,
    args: [{
      providers: [DEFAULT_MESSAGING_INSTANCE_PROVIDER, MESSAGING_INSTANCES_PROVIDER, {
        provide: APP_INITIALIZER,
        useValue: isMessagingSupportedFactory.async,
        multi: true
      }]
    }]
  }], () => [], null);
})();
function provideMessaging(fn, ...deps) {
  return {
    ngModule: MessagingModule,
    providers: [{
      provide: PROVIDED_MESSAGING_INSTANCES,
      useFactory: messagingInstanceFactory(fn),
      multi: true,
      deps: [NgZone, Injector, ɵAngularFireSchedulers, FirebaseApps, ...deps]
    }]
  };
}
var isSupported = isMessagingSupportedFactory.async;
var deleteToken2 = ɵzoneWrap(deleteToken, true);
var getMessaging = ɵzoneWrap(getMessagingInWindow, true);
var getToken2 = ɵzoneWrap(getToken, true);
var onMessage2 = ɵzoneWrap(onMessage, false);
export {
  Messaging,
  MessagingInstances,
  MessagingModule,
  deleteToken2 as deleteToken,
  getMessaging,
  getToken2 as getToken,
  isSupported,
  messagingInstance$,
  onMessage2 as onMessage,
  provideMessaging
};
/*! Bundled license information:

@firebase/messaging/dist/esm/index.esm2017.js:
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
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
   * in compliance with the License. You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software distributed under the License
   * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
   * or implied. See the License for the specific language governing permissions and limitations under
   * the License.
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
//# sourceMappingURL=@angular_fire_messaging.js.map
