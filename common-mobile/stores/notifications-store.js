import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'notifications',
    model: [],
    offlineErrors: [],
    hasMore: false,
    getNotifications() {
        return store.model;
    },
    hasMoreNotifications() {
        return store.hasMore && !store.isLoading;
    },
    getUnreadCount() {
        return (store.model.length ? _.filter(store.model, ({ is_read }) => !is_read).length : 0)
            + (store.offlineErrors.length ? _.filter(store.offlineErrors, ({ is_read }) => !is_read).length : 0);
    },
    getUpdateCount() {
        return store.updateCount || 0;
    },
    getOfflineErrors() {
        return store.offlineErrors;
    },
});

const controller = {
    getNotifications: (hasMore) => {
        if (!data.token) return;
        store.loading();
        data.get(hasMore || `${Project.api}notifications?page_size=30`)
            .then(({ data: res, page: { next } }) => {
                res = _.reduce(res, (acc, { text, type, is_read }) => {
                    const parsed = Utils.parseNotification(type, text, is_read);
                    if (!parsed) return acc;
                    acc.push(parsed);
                    return acc;
                }, []);
                store.model = hasMore ? store.model.concat(res) : res;
                store.updateCount = 0;
                SecuredStorage.setItem('notifications', store.model);
                store.hasMore = next;
                store.loaded();
            })
            .catch((e) => {
                store.hasMore = false;
                API.ajaxHandler(store, e);
            });
    },
    markAsRead: () => {
        store.saving();
        if (store.offlineErrors.length) {
            _.each(store.offlineErrors, offlineError => offlineError.is_read = true);
            SecuredStorage.setItem('offline-errors', store.offlineErrors);
        }
        data.put(`${Project.api}notifications/mark-as-read`)
            .then(({ data: res }) => {
                _.each(store.model, notification => notification.is_read = true);
                store.updateCount = res.update_count;
                SecuredStorage.setItem('notifications', store.model);
                store.saved();
            })
            .catch(e => API.ajaxHandler(store, e));
    },
    addOfflineError: (groupId, error) => {
        store.saving();
        store.offlineErrors = store.offlineErrors.concat([{ type: 'OfflineError', error, groupId, is_read: false }]);
        SecuredStorage.setItem('offline-errors', store.offlineErrors);
        setTimeout(() => store.saved(), 50);
    },
    resetUpdateCount: () => {
        store.saving();
        store.updateCount = 0;
        setTimeout(() => store.saved(), 50);
    },
    registerDeviceToken: (token) => {
        if (!AccountStore.getUser()) return;
        data.post(`${Project.api}notifications/push-device-token`, {
            device_name: Platform.OS,
            user_id: AccountStore.getUserId(),
            value: token,
        }).catch(e => API.ajaxHandler(store, e));
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.GET_NOTIFICATIONS:
            controller.getNotifications();
            break;
        case Actions.GET_MORE_NOTIFICATIONS:
            controller.getNotifications(store.hasMore);
            break;
        case Actions.MARK_NOTIFICATIONS_AS_READ:
            controller.markAsRead();
            break;
        case Actions.ADD_OFFLINE_ERROR:
            controller.addOfflineError(action.groupId, action.error);
            break;
        case Actions.ACTIVE:
            controller.getNotifications();
            break;
        case Actions.RESET_UPDATE_COUNT:
            controller.resetUpdateCount();
            break;
        case Actions.LOGOUT:
            store.model = [];
            store.offlineErrors = [];
            break;
        case Actions.DATA: {
            const res = action.data;
            if (res.notifications) store.model = res.notifications;
            if (res['offline-errors']) store.offlineErrors = _.filter(res['offline-errors'], offlineError => !offlineError.is_read);
            break;
        }
        case Actions.REGISTER_DEVICE_TOKEN:
            controller.registerDeviceToken(action.token);
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
