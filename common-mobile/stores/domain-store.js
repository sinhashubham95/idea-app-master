import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'domain',
    model: {},
    getDomainConfig() {
        return store.model;
    },
    isSAMLEnabled() {
        return store.model && store.model.has_saml_config && store.model.saml_config.enabled;
    },
    getSAMLLoginButtonText() {
        return store.model && store.model.has_saml_config && store.model.saml_config.login_button_text;
    },
    showLoginForm() {
        return store.model && store.model.show_login_form;
    },
    getBrandingConfig() {
        return store.model.appearance_config || {};
    },
    getDomain() {
        return store.model && store.model.domain;
    },
    getStatusMappings() {
        return _.get(store.model, `status_mappings.${AccountStore.getLanguageCode()}`);
    },
    getBaseImageUrl() {
        return store.model && store.model.base_image_url;
    },
    getAPIEndpoint() {
        return store.model && store.model.api_endpoint;
    },
});

const controller = {
    getDomain: (domain) => {
        store.loading();
        data.get(`${Project.dataCenterApi}company/${domain}/data_center`)
            .then(({ data: { api_endpoint } }) => {
                store.model = { api_endpoint };
                Project.api = `${api_endpoint}/api/v${Project.apiVersion}/`;
                AsyncStorage.setItem('last-domain', domain);
                if (domain.indexOf('ping.qa.ukwest.wazoku.com') !== -1) domain = `${domain.substr(0, domain.indexOf('.'))}.wazoku.com`;
                return data.get(`${Project.api}company/${domain}`);
            })
            .then(({ data: res }) => {
                store.model = Object.assign({}, store.model, res);
                store.model.domain = domain;
                Project.api = `${store.model.api_endpoint}/api/v${Project.apiVersion}/`;
                AsyncStorage.setItem('domain', JSON.stringify(store.model));
                if (res.language && res.language.code) setLanguage(res.language.code);
                store.loaded();
            })
            .catch(e => API.ajaxHandler(store, e));
    },
    refresh: () => {
        const domain = store.getDomain();
        if (!domain || !data.token) return;
        let api_endpoint = store.getAPIEndpoint();
        if (!api_endpoint) api_endpoint = Project.api; // Fallback for people already logged in prior to data centre support
        store.loading();
        data.get(`${Project.api}company/${domain}`)
            .then((res) => {
                store.model = res.data;
                store.model.domain = domain;
                store.model.api_endpoint = api_endpoint;
                AsyncStorage.setItem('domain', JSON.stringify(store.model));
                store.loaded();
            })
            .catch(e => API.ajaxHandler(store, e));
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.GET_DOMAIN:
            controller.getDomain(action.domain);
            break;
        case Actions.LOGOUT:
            store.model = {};
            break;
        case Actions.ACTIVE:
        case Actions.REFRESH_DOMAIN:
            controller.refresh();
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
