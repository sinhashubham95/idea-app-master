import SQLite from 'react-native-sqlite-storage';
import FastImage from 'react-native-fast-image';

import BaseStore from './base/_store';
import data from './base/_data';

import DomainStore from './domain-store';

SQLite.enablePromise(true);

const store = Object.assign({}, BaseStore, {
    id: 'account',
    getUser() {
        return store.model;
    },
    isActive() {
        return store.model && store.model.is_active;
    },
    getLanguageCode() {
        return _.get(store.model, 'language.code') || 'en-GB';
    },
    getUserId() {
        return store.model && store.model.id;
    },
});

const controller = {
    register: (domain, formData) => {
        store.formDataError = '';
        store.saving();
        data.post(`${Project.api}authorization/register`, { domain, form_data: JSON.stringify(formData) })
            .then(({ data: res }) => {
                store.saved(res.id);
            })
            .catch(e => API.ajaxHandler(store, e));
    },
    setToken: (token) => {
        data.setToken(token);
    },
    login: ({ email: username, domain, password }) => {
        store.loading();
        let token;
        data.post(`${Project.api}authorization/app/login`, { username, domain, password })
            .then(({ data: res }) => {
                token = res && res.token;
                controller.setToken(token);
                return data.get(`${Project.api}users/by-email/${username}`);
            })
            .then(({ data: res }) => SecuredStorage.init(password)
                .then(() => {
                    res.token = token;
                    controller.onLogin(res);
                    SecuredStorage.setItem('user', res);
                    store.loaded();
                }))
            .catch(e => API.ajaxHandler(store, e));
    },

    ssoLogin: (userId, ssoToken) => {
        store.loading();
        let token;
        data.get(`${Project.api}authorization/sso/${DomainStore.getDomainConfig().domain}/user/${userId}/token/${ssoToken}`)
            .then(({ data: res }) => {
                token = res && res.token;
                controller.setToken(token);
                return data.get(`${Project.api}users/${userId}`);
            })
            .then(({ data: res }) => SecuredStorage.init(ssoToken)
                .then(() => {
                    res.token = token;
                    controller.onLogin(res);
                    SecuredStorage.setItem('user', res);
                    store.loaded();
                }))
            .catch(e => API.ajaxHandler(store, e));
    },

    onLogin(res) {
        store.model = res;
        if (res.language && res.language.code) setLanguage(res.language.code);
        controller.setToken(res && res.token);
    },

    setUser(user) {
        if (user) {
            controller.onLogin(user);
            store.loaded();
        } else {
            data.setToken(null);
            store.model = null;
            store.error = null;
            store.trigger('logout');
        }
    },

    resendActivationCode: (domain, username) => {
        store.trigger('resendingActivationCode');
        data.post(`${Project.api}authorization/pending_code/send`, { domain, username })
            .then(() => {
                store.trigger('resentActivationCode');
            })
            .catch(e => API.ajaxHandler(store, e));
    },

    logout: () => {
        data.post(`${Project.api}authorization/app/logout`)
            .then(controller.onLogout)
            .catch((e) => {
                if (e.status === 401) {
                    controller.onLogout();
                }
            });
    },

    onLogout: async () => {
        controller.setUser(null);
        try {
            const keys = await AsyncStorage.getAllKeys();
            await AsyncStorage.multiRemove(_.without(keys, 'last-domain'));
            await SecuredStorage.clear();
            FastImage.clearDiskCache();
            Project.api = Project.dataCenterApi;
        } catch (e) {
            console.log('error clearing async storage', e);
        }
        SQLite.deleteDatabase('custom-fields.db')
            .then(() => console.log('SQLite database deleted successfully'))
            .catch((e) => {
                if (e === 'The database does not exist on that path') return;
                console.log('Failed to delete SQLite db', e);
            });
    },

    refresh: () => {
        if (!store.model) return;
        store.loading();
        data.get(`${Project.api}users/${store.model.id}`)
            .then(({ data: res }) => {
                res.token = store.model.token;
                store.model = res;
                SecuredStorage.setItem('user', res);
                if (res.language && res.language.code) setLanguage(res.language.code);
                store.loaded();
            })
            .catch(e => API.ajaxHandler(store, e));
    },

};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.SET_USER:
            controller.setUser(action.user);
            break;
        case Actions.LOGOUT:
            controller.logout();
            break;
        case Actions.REGISTER:
            controller.register(action.domain, action.details);
            break;
        case Actions.LOGIN:
            controller.login(action.details);
            break;
        case Actions.SET_TOKEN:
            controller.setToken(action.token);
            break;
        case Actions.RESEND_ACTIVATION_CODE:
            controller.resendActivationCode(action.domain, action.username);
            break;
        case Actions.SSO_LOGIN:
            controller.ssoLogin(action.userId, action.token);
            break;
        case Actions.ACTIVE:
        case Actions.REFRESH_USER:
            controller.refresh();
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
