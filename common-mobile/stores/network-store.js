// eslint-disable-next-line
import NetInfo from "@react-native-community/netinfo";

const BaseStore = require('./base/_store');

const store = Object.assign({}, BaseStore, {
    id: 'network',
    isConnected: true,
    isAPIRunning: true,
    listeners: [],
    isOffline: () => !store.isConnected || !store.isAPIRunning,
    subscribeListener: (id, listener) => {
        store.listeners.push({ id, listener });
    },
    unsubscribeListener: (id) => {
        _.remove(store.listeners, { id });
    },
});

const handleIsConnected = (isConnected) => {
    if (isConnected !== store.isConnected) {
        store.isConnected = isConnected;
        if (store.listeners.length) {
            _.each(store.listeners, ({ listener }) => {
                listener(isConnected && store.isAPIRunning);
            });
        }
        if (!isConnected) {
            store.isAPIRunning = false;
        }
        store.changed();
        if (isConnected) {
            heartbeat();
            heartbeatInterval = setInterval(heartbeat, 10 * 1000);
            AppActions.connected(isConnected);
        } else {
            clearInterval(heartbeatInterval);
            AppActions.disconnected(isConnected);
        }
    }
};

const heartbeat = () => {
    fetch(`${Project.api.substr(0, Project.api.indexOf('/api/'))}`)
        .then((res) => {
            if (store.isAPIRunning !== res.ok) {
                store.isAPIRunning = res.ok;
                if (store.listeners.length) {
                    _.each(store.listeners, ({ listener }) => {
                        listener(true);
                    });
                }
                store.changed();
            }
        })
        .catch(() => {
            if (store.isAPIRunning !== false) {
                store.isAPIRunning = false;
                if (store.listeners.length) {
                    _.each(store.listeners, ({ listener }) => {
                        listener(false);
                    });
                }
                store.changed();
            }
        });
};

NetInfo.isConnected.addEventListener(
    'connectionChange',
    handleIsConnected,
);

heartbeat();
let heartbeatInterval = setInterval(heartbeat, 10 * 1000);

module.exports = store;
