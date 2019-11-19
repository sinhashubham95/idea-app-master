import _ from 'lodash';

import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'groups',
    model: [],
    searchResults: [],
    getSearchResults() {
        return store.searchResults;
    },
});

const controller = {
    searchGroups: _.throttle((query) => {
        store.loading();
        if (NetworkStore.isOffline()) {
            if (query) {
                store.searchResults = _.filter(store.model, ({ name }) => name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
            } else {
                store.searchResults = store.model;
            }
            setTimeout(() => store.loaded(), 50);
            return;
        }
        data.get(`${Project.api}groups?q=${query}`)
            .then(({ data: res }) => {
                store.model = _.unionBy(res, store.model, 'id');
                store.searchResults = res;
                SecuredStorage.setItem('groups', store.model);
                store.loaded();
            })
            .catch((e) => {
                API.ajaxHandler(store, e);
            });
    }, 500),
    clearSearch: () => {
        store.searchResults = [];
        store.saved();
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.SEARCH_GROUPS:
            controller.searchGroups(action.query);
            break;
        case Actions.CLEAR_GROUP_SEARCH:
            controller.clearSearch();
            break;
        case Actions.LOGOUT:
            store.model = {};
            store.searchResults = [];
            break;
        case Actions.DATA:
            if (action.data.groups) store.model = action.data.groups;
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
