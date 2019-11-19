import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'challenge-forms',
    model: {},
    getForms(id) {
        return store.model[id];
    },
    updateForms(id, res) {
        store.model[id] = res;
        SecuredStorage.setItem('challenge-forms', store.model);
    },
});

const controller = {
    getChallengeForms: (id, silent) => {
        if (!silent) store.loading();
        return data.get(`${Project.api}challenges/${id}/current_stage_forms?publish_in_mobile_app=true`)
            .then(({ data: res }) => {
                store.model[id] = res;
                SecuredStorage.setItem('challenge-forms', store.model);
                if (!silent) store.loaded();
            })
            .catch(e => API.ajaxHandler(store, e));
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.GET_CHALLENGE_FORMS:
            controller.getChallengeForms(action.id);
            break;
        case Actions.LOGOUT:
            store.model = {};
            break;
        case Actions.GET_CHALLENGES_FORMS:
            Utils.promiseSerial(_.map(action.ids, id => () => controller.getChallengeForms(id, true)));
            break;
        case Actions.DATA:
            if (action.data['challenge-forms']) store.model = action.data['challenge-forms'];
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
