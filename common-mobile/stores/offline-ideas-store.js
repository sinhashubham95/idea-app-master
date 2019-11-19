import _ from 'lodash';
import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'offline-ideas',
    model: {},
    getIdeas() {
        return _.flatMap(store.model, ideas => ideas);
    },
    getIdeasByChallengeId(challengeId) {
        return store.model[challengeId];
    },
    updateIdea(idea, triggerSaved) {
        store.model[idea.challenge.id] = store.model[idea.challenge.id] || [];
        const index = _.findIndex(store.model[idea.challenge.id], { id: idea.id });
        if (index !== -1) {
            store.model[idea.challenge.id][index] = _.cloneDeep(idea);
        } else {
            store.model[idea.challenge.id].push(_.cloneDeep(idea));
            store.model[idea.challenge.id] = _.sortBy(store.model[idea.challenge.id], offlineIdea => -offlineIdea.created);
        }
        SecuredStorage.setItem('offline-ideas', store.model);
        if (triggerSaved) store.saved();
    },
    findIdea(id) {
        const idea = _.find(store.getIdeas(), { id });
        if (!idea) return null;
        return _.find(store.model[idea.challenge.id], { id });
    },
    getIdea(id) {
        return store.findIdea(id);
    },
    incrementCommentCount(id) {
        const idea = store.findIdea(id);
        if (!idea) return;
        const index = _.findIndex(store.model[idea.challenge.id], { id });
        if (index === -1) return;
        store.saving();
        store.model[idea.challenge.id][index] = { ...store.model[idea.challenge.id][index], num_comments: store.model[idea.challenge.id][index].num_comments + 1 };
        SecuredStorage.setItem('offline-ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
    followIdeaOffline(id, follow) {
        const idea = store.findIdea(id);
        if (!idea) return;
        store.saving();
        idea.is_following = follow;
        SecuredStorage.setItem('offline-ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
    rateIdeaOffline(id, optionId) {
        const idea = store.findIdea(id);
        if (!idea) return;
        store.saving();
        idea.user_rating_option_id = optionId;
        idea.rating_counts[optionId]++;
        SecuredStorage.setItem('offline-ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
    unrateIdeaOffline(id) {
        const idea = store.findIdea(id);
        if (!idea) return;
        store.saving();
        idea.rating_counts[idea.user_rating_option_id]--;
        idea.user_rating_option_id = null;
        SecuredStorage.setItem('offline-ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
    pushIdea(idea) {
        store.model[idea.challenge.id] = store.model[idea.challenge.id] || [];
        store.model[idea.challenge.id].push(idea);
        store.model[idea.challenge.id] = _.sortBy(store.model[idea.challenge.id], offlineIdea => -offlineIdea.created);
    },
    replaceOfflineIdea(offlineId, idea) {
        const index = _.findIndex(store.model[idea.challenge.id], { id: offlineId });
        if (index !== -1) {
            store.model[idea.challenge.id][index] = idea;
            SecuredStorage.setItem('offline-ideas', store.model);
        }
    },
    joinTeamOffline(id) {
        const idea = store.findIdea(id);
        if (!idea) return;
        store.saving();
        idea.team_request_pending = true;
        SecuredStorage.setItem('offline-ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
});

const controller = {
    getIdeas: challengeId => () => {
        store.loading();
        return data.get(`${Project.api}ideas?include=${Constants.include.ideas}&is_draft=false&publish_in_mobile_app=true&page_size=30`, {
            challenge_id: challengeId,
        })
            .then(({ data: res }) => {
                store.model[challengeId] = _.sortBy(_.unionBy(res, store.model[challengeId] || [], 'id'), idea => -idea.created);
                SecuredStorage.setItem('offline-ideas', store.model);
                store.loaded();
            })
            .catch((e) => {
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.LOGOUT:
            store.model = {};
            break;
        case Actions.GET_OFFLINE_IDEAS:
            AsyncStorage.getItem('last-offline-ideas-sync', (err, res) => {
                if (err || (res && moment(res).isAfter(moment().subtract(1, 'h')))) return;
                Utils.promiseSerial(_.map(action.challengeIds, id => controller.getIdeas(id)));
                AsyncStorage.setItem('last-offline-ideas-sync', moment().toISOString());
            });
            break;
        case Actions.DATA:
            if (action.data['offline-ideas']) store.model = action.data['offline-ideas'];
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
