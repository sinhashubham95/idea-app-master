import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'challenges',
    model: [],
    viewed: {},
    hasMore: false,
    getChallenges() {
        return store.model;
    },
    hasMoreChallenges() {
        return store.hasMore && !store.isLoading;
    },
    getChallenge(id) {
        return _.find(store.model, { id });
    },
});

const controller = {
    getChallenges: (hasMore) => {
        store.loading();
        data.get(hasMore || `${Project.api}challenges?include=${Constants.include.challenges}&publish_in_mobile_app=true`)
            .then(({ data: res, page: { next } }) => {
                // OK to always merge results here since there is no search/filtering across challenges on dashboard
                store.model = _.sortBy(hasMore ? _.unionBy(res, store.model, 'id') : res, challenge => -challenge.created);
                _.each(store.model, (challenge) => {
                    if (store.viewed[challenge.id]) challenge.viewed = store.viewed[challenge.id];
                });
                const resIds = _.map(res, 'id');
                AppActions.getOfflineIdeas(resIds); // Only get offline ideas for the most recent 10 challenges
                _.each(res, (challenge) => {
                    if (challenge.current_stage_forms) ChallengeFormsStore.updateForms(challenge.id, challenge.current_stage_forms);
                });
                SecuredStorage.setItem('challenges', store.model);
                store.hasMore = next;
                store.loaded();
            })
            .catch((e) => {
                store.hasMore = false;
                API.ajaxHandler(store, e);
            });
    },
    viewedChallenge: (id) => {
        const index = _.findIndex(store.model, { id });
        if (index === -1) return;

        store.model[index].viewed = moment()
            .valueOf();
        store.viewed[id] = store.model[index].viewed;
        SecuredStorage.setItem('challenges', store.model);
        SecuredStorage.setItem('challenges-viewed', store.viewed);
        store.loaded();
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.GET_CHALLENGES:
            controller.getChallenges();
            break;
        case Actions.VIEWED_CHALLENGE:
            controller.viewedChallenge(action.id);
            break;
        case Actions.LOGOUT:
            store.model = [];
            store.viewed = {};
            break;
        case Actions.GET_MORE_CHALLENGES:
            controller.getChallenges(store.hasMore);
            break;
        case Actions.DATA: {
            const res = action.data;
            if (res.challenges) store.model = res.challenges;
            if (res['challenges-viewed']) store.viewed = res['challenges-viewed'];
            break;
        }
        default:
    }
});

controller.store = store;
module.exports = controller.store;
