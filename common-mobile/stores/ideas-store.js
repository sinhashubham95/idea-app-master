import _ from 'lodash';
import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'ideas',
    model: [],
    search: {},
    hasMore: false,
    getIdeas() {
        return store.model;
    },
    getSearch() {
        return store.search;
    },
    hasMoreIdeas() {
        return store.hasMore && !store.isLoading;
    },
    updateIdea(idea, triggerSaved) {
        const index = _.findIndex(store.model, { id: idea.id });
        if (index !== -1) {
            store.model[index] = _.cloneDeep(idea);
            SecuredStorage.setItem('ideas', store.model);
            if (triggerSaved) store.saved();
        }
    },
    getIdea(id) {
        return _.find(store.model, { id });
    },
    incrementCommentCount(id) {
        const index = _.findIndex(store.model, { id });
        if (index === -1) return;
        store.saving();
        store.model[index] = { ...store.model[index], num_comments: store.model[index].num_comments + 1 };
        SecuredStorage.setItem('ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
    followIdeaOffline(id, follow) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.model[index].is_following = follow;
            SecuredStorage.setItem('ideas', store.model);
        }
        MyIdeasStore.followIdeaOffline(id, follow);
        OfflineIdeasStore.followIdeaOffline(id, follow);
        AppActions.addOfflineAction('FOLLOW_IDEA', { groupId: id, follow });
        setTimeout(() => store.saved(), 50);
    },
    syncFollowIdea(id, follow) {
        return controller.followIdea(id, follow);
    },
    rateIdeaOffline(id, optionId) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.model[index].user_rating_option_id = optionId;
            store.model[index].rating_counts[optionId]++;
            SecuredStorage.setItem('ideas', store.model);
        }
        MyIdeasStore.rateIdeaOffline(id, optionId);
        OfflineIdeasStore.rateIdeaOffline(id, optionId);
        AppActions.addOfflineAction('RATE_IDEA', { groupId: id, optionId });
        setTimeout(() => store.saved(), 50);
    },
    syncRateIdea(id, optionId) {
        return controller.rateIdea(id, optionId);
    },
    unrateIdeaOffline(id) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.model[index].rating_counts[store.model[index].user_rating_option_id]--;
            store.model[index].user_rating_option_id = null;
            SecuredStorage.setItem('ideas', store.model);
        }
        MyIdeasStore.unrateIdeaOffline(id);
        OfflineIdeasStore.unrateIdeaOffline(id);
        AppActions.addOfflineAction('UNRATE_IDEA', { groupId: id });
        setTimeout(() => store.saved(), 50);
    },
    syncUnrateIdea(id) {
        return controller.unrateIdea(id);
    },
    joinTeamOffline(id) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.model[index].team_request_pending = true;
            SecuredStorage.setItem('ideas', store.model);
        }
        MyIdeasStore.joinTeamOffline(id);
        OfflineIdeasStore.joinTeamOffline(id);
        AppActions.addOfflineAction('JOIN_TEAM', { groupId: id });
        setTimeout(() => {
            store.saved();
            store.trigger('team-requested');
        }, 50);
    },
    syncJoinTeam(id) {
        return controller.joinTeam(id, true);
    },
});

const controller = {
    getIdeas: () => {
        store.loading();
        const query = {};
        if (store.search.order) query.order = store.search.order;
        if (store.search.status) query.status = store.search.status;
        if (store.search.challenge) query.challenge_id = store.search.challenge.id;
        if (store.search.query) query.q = store.search.query;
        if (store.search.stage) query.stage_id = store.search.stage;
        return data.get(`${Project.api}ideas?include=${Constants.include.ideas}&is_draft=false&publish_in_mobile_app=true`, query)
            .then(({ data: res, page: { next } }) => {
                store.model = res;
                SecuredStorage.setItem('ideas', store.model);
                _.each(res, idea => OfflineIdeasStore.updateIdea(idea));
                store.hasMore = next;
                store.loaded();
            })
            .catch((e) => {
                if (e.status === 400) {
                    try {
                        if (e.json) {
                            e.json().then(({ errors }) => {
                                if (errors && errors.length && errors[0] === 'challenge_id.not_exists') {
                                    store.search.challenge = null;
                                    store.search.stage = null;
                                    SecuredStorage.setItem('ideas-search', store.search);
                                    controller.getIdeas();
                                }
                            });
                        }
                    } catch (err) {
                        // Do nothing
                    }
                }
                store.hasMore = false;
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    getMoreIdeas: () => {
        store.loading();
        return data.get(store.hasMore)
            .then(({ data: res, page: { next } }) => {
                store.model = _.unionBy(res, store.model, 'id');
                store.model = Utils.orderIdeas(store.model, store.search.order);
                SecuredStorage.setItem('ideas', store.model);
                _.each(res, idea => OfflineIdeasStore.updateIdea(idea));
                store.hasMore = next;
                store.loaded();
            })
            .catch((e) => {
                store.hasMore = false;
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    rateIdea: (id, optionId) => {
        store.saving();
        if (NetworkStore.isOffline()) {
            store.rateIdeaOffline(id, optionId);
            return;
        }
        return data.post(`${Project.api}ideas/${id}/rating`, { option_id: optionId })
            .then(() => data.get(`${Project.api}ideas/${id}?include=${Constants.include.ideas}`))
            .then(({ data: res }) => {
                const index = _.findIndex(store.model, { id });
                if (index !== -1) {
                    store.model[index] = res;
                    SecuredStorage.setItem('ideas', store.model);
                }
                MyIdeasStore.updateMyIdea(res);
                OfflineIdeasStore.updateIdea(res);
                store.saved();
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    store.rateIdeaOffline(id, optionId);
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    unrateIdea: (id) => {
        store.saving();
        if (NetworkStore.isOffline()) {
            store.unrateIdeaOffline(id);
            return;
        }
        return data.delete(`${Project.api}ideas/${id}/rating`)
            .then(() => data.get(`${Project.api}ideas/${id}?include=${Constants.include.ideas}`))
            .then(({ data: res }) => {
                const index = _.findIndex(store.model, { id });
                if (index !== -1) {
                    store.model[index] = res;
                    SecuredStorage.setItem('ideas', store.model);
                }
                MyIdeasStore.updateMyIdea(res);
                OfflineIdeasStore.updateIdea(res);
                store.saved();
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    store.unrateIdeaOffline(id);
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    followIdea: (id, follow) => {
        store.saving();
        if (NetworkStore.isOffline()) {
            store.followIdeaOffline(id, follow);
            return;
        }
        return data.put(`${Project.api}ideas/${id}/follow`, { follow })
            .then(() => data.get(`${Project.api}ideas/${id}?include=${Constants.include.ideas}`))
            .then(({ data: res }) => {
                const index = _.findIndex(store.model, { id });
                if (index !== -1) {
                    store.model[index] = res;
                    SecuredStorage.setItem('ideas', store.model);
                }
                MyIdeasStore.updateMyIdea(res);
                OfflineIdeasStore.updateIdea(res);
                store.saved();
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    store.followIdeaOffline(id, follow);
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    joinTeam: (id, silent) => {
        store.saving();
        if (NetworkStore.isOffline()) {
            store.joinTeamOffline(id);
            return;
        }
        return data.post(`${Project.api}ideas/${id}/team-request`)
            .then(() => data.get(`${Project.api}ideas/${id}?include=${Constants.include.ideas}`))
            .then(({ data: res }) => {
                const index = _.findIndex(store.model, { id });
                if (index !== -1) {
                    store.model[index] = res;
                    SecuredStorage.setItem('ideas', store.model);
                }
                MyIdeasStore.updateMyIdea(res);
                OfflineIdeasStore.updateIdea(res);
                store.saved();
                if (!silent) store.trigger('team-requested');
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    store.joinTeamOffline(id);
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    leaveTeam: (id) => {
        store.saving();
        return data.delete(`${Project.api}ideas/${id}/team/${AccountStore.getUser().id}`)
            .then(() => data.get(`${Project.api}ideas/${id}?include=${Constants.include.ideas}`))
            .then(({ data: res }) => {
                const index = _.findIndex(store.model, { id });
                if (index !== -1) {
                    store.model[index] = res;
                    SecuredStorage.setItem('ideas', store.model);
                }
                MyIdeasStore.updateMyIdea(res);
                OfflineIdeasStore.updateIdea(res);
                store.saved();
            })
            .catch(e => API.ajaxHandler(store, e));
    },
    sortIdeas: (order) => {
        const prevOrder = store.search.order;
        store.search.order = order;
        controller.getIdeas()
            .then(() => {
                SecuredStorage.setItem('ideas-search', store.search);
            })
            .catch(() => {
                store.search.order = prevOrder;
                store.loaded();
            });
    },
    filterIdeasByStatus: (status) => {
        const prevStatus = store.search.status;
        store.search.status = status;
        controller.getIdeas()
            .then(() => {
                SecuredStorage.setItem('ideas-search', store.search);
            })
            .catch(() => {
                store.search.status = prevStatus;
                store.loaded();
            });
    },
    filterIdeasByChallenge: (challenge) => {
        const prevChallenge = store.search.challenge;
        const prevStage = store.search.stage;
        store.search.challenge = challenge;
        store.search.stage = null;
        controller.getIdeas()
            .then(() => {
                SecuredStorage.setItem('ideas-search', store.search);
            })
            .catch(() => {
                store.search.challenge = prevChallenge;
                store.search.stage = prevStage;
                store.loaded();
            });
    },
    searchIdeas: _.throttle((text) => {
        const prevQuery = store.search.query;
        store.search.query = text;
        controller.getIdeas()
            .then(() => {
                SecuredStorage.setItem('ideas-search', store.search);
            })
            .catch(() => {
                store.search.query = prevQuery;
                store.loaded();
            });
    }, 1000),
    resetIdeasSearch: () => {
        const prevSearch = store.search;
        store.search = {};
        controller.getIdeas()
            .then(() => {
                SecuredStorage.setItem('ideas-search', store.search);
            })
            .catch(() => {
                store.search = prevSearch;
                store.loaded();
            });
    },
    filterIdeasByStage: (id) => {
        const prevStage = store.search.stage;
        store.search.stage = id;
        controller.getIdeas()
            .then(() => {
                SecuredStorage.setItem('ideas-search', store.search);
            })
            .catch(() => {
                store.search.stage = prevStage;
                store.loaded();
            });
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.GET_IDEAS:
            controller.getIdeas();
            break;
        case Actions.RATE_IDEA:
            controller.rateIdea(action.id, action.optionId);
            break;
        case Actions.UNRATE_IDEA:
            controller.unrateIdea(action.id);
            break;
        case Actions.FOLLOW_IDEA:
            controller.followIdea(action.id, action.follow);
            break;
        case Actions.JOIN_TEAM:
            controller.joinTeam(action.id);
            break;
        case Actions.LEAVE_TEAM:
            controller.leaveTeam(action.id);
            break;
        case Actions.LOGOUT:
            store.model = [];
            store.search = {};
            store.hasMore = false;
            break;
        case Actions.SORT_IDEAS:
            controller.sortIdeas(action.order);
            break;
        case Actions.FILTER_IDEAS_BY_STATUS:
            controller.filterIdeasByStatus(action.status);
            break;
        case Actions.FILTER_IDEAS_BY_CHALLENGE:
            controller.filterIdeasByChallenge(action.challenge);
            break;
        case Actions.SEARCH_IDEAS:
            controller.searchIdeas(action.text);
            break;
        case Actions.RESET_IDEAS_SEARCH:
            controller.resetIdeasSearch();
            break;
        case Actions.GET_MORE_IDEAS:
            controller.getMoreIdeas();
            break;
        case Actions.FILTER_IDEAS_BY_STAGE:
            controller.filterIdeasByStage(action.id);
            break;
        case Actions.DATA:
            if (action.data.ideas) store.model = action.data.ideas;
            if (action.data['ideas-search']) store.search = action.data['ideas-search'];
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
