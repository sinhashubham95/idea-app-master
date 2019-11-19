import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'tasks',
    model: [],
    getTasks() {
        return store.model;
    },
});

const controller = {
    getTasks: (hasMore) => {
        store.loading();
        data.get(hasMore || `${Project.api}tasks`)
            .then(({ data: res }) => {
                store.model = res;
                SecuredStorage.setItem('tasks', store.model);
                store.loaded();
            })
            .catch((e) => {
                store.hasMore = false;
                API.ajaxHandler(store, e);
            });
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.GET_TASKS:
            controller.getTasks();
            break;
        case Actions.LOGOUT:
            store.model = [];
            break;
        case Actions.DATA:
            if (action.data.tasks) store.model = action.data.tasks;
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
