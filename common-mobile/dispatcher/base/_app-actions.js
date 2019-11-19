module.exports = {

    connected() { // when the device comes online
        Dispatcher.handleViewAction({
            actionType: Actions.CONNECTED,
        });
    },
    disconnected() { // when the device goes offline
        Dispatcher.handleViewAction({
            actionType: Actions.DISCONNECTED,
            // todo: maybe store last online
        });
    },
    active() { // when the device comes online
        Dispatcher.handleViewAction({
            actionType: Actions.ACTIVE,
        });
    },
    inactive() { // when the app goes out of focus
        Dispatcher.handleViewAction({
            actionType: Actions.INACTIVE,
            // todo: maybe store last online
        });
    },
    refresh() { // force the app to refresh data
        Dispatcher.handleViewAction({
            actionType: Actions.REFRESH,
        });
    },
    registerNotifications(data) { // register for push notifications
        Dispatcher.handleViewAction({
            actionType: Actions.REGISTER_NOTIFICATIONS,
            data,
        });
    },
    setUser(user) { // set user model
        Dispatcher.handleViewAction({
            actionType: Actions.SET_USER,
            user,
        });
    },
    register(domain, details) { // register with optional invite referrer
        Dispatcher.handleViewAction({
            actionType: Actions.REGISTER,
            domain,
            details,
        });
    },
    login(details) { // login with any auth
        Dispatcher.handleViewAction({
            actionType: Actions.LOGIN,
            details,
        });
    },
    setToken(token) { // set user token
        Dispatcher.handleViewAction({
            actionType: Actions.SET_TOKEN,
            token,
        });
    },
    logout() {
        Dispatcher.handleViewAction({
            actionType: Actions.LOGOUT,
        });
    },
};
