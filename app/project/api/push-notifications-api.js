import firebase from 'react-native-firebase';

const FCM = firebase.messaging();
const Notifications = firebase.notifications();
const PushManager = class {
    static token = null;

    static onNotification = null;


    getInitialNotification = () => Notifications.getInitialNotification();

    subscribe = (topic) => {
        console.log(`Subscribed to${topic}`);
        return FCM.subscribeToTopic(topic);
    }

    unsubscribe = topic => FCM.unsubscribeFromTopic(topic);

    stop = () => {
        this.token = null;
        if (this.notificationOpenedListener) this.notificationOpenedListener();
    }; // remove old listener

    init = (onNotification, silent) => {
        this.onNotification = onNotification;

        // We are not using data only notifications
        // if (!this.notificationListener) {
        //     FCM.onMessage((notification) => {
        //         if (this.notificationListener) {
        //             this.notificationListener(notification);
        //         }
        //         notification.finish();
        //     });
        // }

        if (!this.notificationOpenedListener) {
            this.notificationOpenedListener = Notifications.onNotificationOpened((notificationOpen) => {
                // console.log('onNotificationOpened', notificationOpen);
                if (!notificationOpen.notification.data) return;
                routes.handlePushNotification(notificationOpen.notification.data);
            });
        }

        // this.notificationListener = (notification) => {
        //     // Callback if notification is valid

        //     if (notification._notificationType == 'will_present_notification') return; // these notifications are duplicate and pointless

        //     this.onNotification && this.onNotification(Object.assign({}, notification, { fromClick: notification._notificationType == 'notification_response' }));
        // };

        if (this.token) {
            return Promise.resolve(this.token);
        }

        return new Promise((resolve, reject) => {
            const prom = Platform.OS === 'ios' && !silent ? FCM.requestPermission() : Promise.resolve();
            if (!silent) {
                FCM.requestPermission(); // for iOS
            }

            prom.then(() => {
                FCM.getToken().then((token) => {
                    if (token) {
                        this.token = token;
                        resolve(this.token);
                    }
                    // store fcm token in your server
                });
            }).catch(e => reject(e));


            this.refreshTokenListener = FCM.onTokenRefresh((token) => {
                if (token) {
                    this.token = token;
                    resolve(this.token);
                }
                // fcm token may not be available on first load, catch it here
            });
        });
    }
};
module.exports = new PushManager();
