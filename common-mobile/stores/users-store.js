import _ from 'lodash';

import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'users',
    model: [],
    searchResults: [],
    getSearchResults() {
        return store.searchResults;
    },
    getUserByDisplayName(display_name) {
        return _.find(store.model, { display_name });
    },
});

const controller = {
    searchUsers: _.throttle((query) => {
        store.loading();
        if (NetworkStore.isOffline()) {
            if (query) {
                store.searchResults = _.filter(store.model, ({ display_name }) => display_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
            } else {
                store.searchResults = store.model;
            }
            setTimeout(() => store.loaded(), 50);
            return;
        }
        data.get(`${Project.api}users?q=${query}&is_active=true`)
            .then(({ data: res }) => {
                store.model = _.unionBy(res, store.model, 'id');
                store.searchResults = res;
                SecuredStorage.setItem('users', store.model);
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
        case Actions.SEARCH_USERS:
            controller.searchUsers(action.query);
            break;
        case Actions.CLEAR_USER_SEARCH:
            controller.clearSearch();
            break;
        case Actions.LOGOUT:
            store.model = [];
            store.searchResults = [];
            break;
        case Actions.DATA:
            if (action.data.users) store.model = action.data.users;
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
