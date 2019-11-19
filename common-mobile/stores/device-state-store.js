// eslint-disable-next-line
import { AppState } from 'react-native';
import BaseStore from './base/_store';

const SESSION_KEY = '__SESSION_TIMER__';
let currentState = true;
let interval = null;

const store = Object.assign({}, BaseStore, {
    id: 'device',
    model: { isActive: true },
    getLastSession() {
        return store.mode.lastSession;
    },
    getIsActive() {
        return store.mode.isActive;
    },
});

const checkSession = () => {
    if (!interval) {
        interval = setInterval(() => {
            AsyncStorage.setItem(SESSION_KEY, `${new Date().valueOf()}`);
        }, 1000);
    }
    return AsyncStorage.getItem(SESSION_KEY, (err, res) => {
        if (res) {
            store.model = Object.assign({}, store.model, {
                lastSession: new Date().valueOf() - parseInt(res),
            });
            store.changed();
        }
    });
};

checkSession();
// Calls back when app is in foreground with the date value of the last active session
AppState.addEventListener('change', (nextAppState) => {
    const isActive = nextAppState === 'active';
    if (currentState !== isActive) {
        currentState = isActive;
        store.model = Object.assign({}, store.model, { isActive });
        if (isActive) { // App is now active, callback with how long ago the last session was
            checkSession()
                .then(() => {
                    if (SecuredStorage.storage && SecuredStorage.storage['offline-actions'] && SecuredStorage.storage['offline-actions'].length) {
                        AppActions.processOfflineActions();
                    } else if (Utils.checkCacheExpiry()) {
                        return;
                    }
                    AppActions.active(store.model.lastSession);
                });
        } else { // App is inactive, stop recording session
            if (interval) {
                clearInterval(interval);
            }
            interval = null;
            store.changed();
            AppActions.inactive();
        }
    }
});

export default store;
