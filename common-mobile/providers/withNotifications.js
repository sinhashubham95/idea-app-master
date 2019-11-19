import { Component } from 'react';
import NotificationsStore from '../stores/notifications-store';

export default (WrappedComponent) => {
    class withNotifications extends Component {
        static displayName = 'withNotifications';

        static propTypes = {
        }

        state = {
            isLoading: NotificationsStore.isLoading,
            notifications: NotificationsStore.getNotifications(),
            updateCount: NotificationsStore.getUpdateCount(),
            offlineErrors: NotificationsStore.getOfflineErrors(),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(NotificationsStore, 'change', () => {
                this.setState({
                    isLoading: NotificationsStore.isLoading,
                    notifications: NotificationsStore.getNotifications(),
                    updateCount: NotificationsStore.getUpdateCount(),
                    offlineErrors: NotificationsStore.getOfflineErrors(),
                    error: NotificationsStore.error,
                });
            });

            this.listenTo(NotificationsStore, 'loaded', () => {
                if (this.wrappedComponent.onNotificationsLoaded) this.wrappedComponent.onNotificationsLoaded();
            });

            this.listenTo(NotificationsStore, 'saved', () => {
                if (this.wrappedComponent.onNotificationsSaved) this.wrappedComponent.onNotificationsSaved();
            });

            this.listenTo(NotificationsStore, 'problem', () => {
                this.setState({
                    isLoading: NotificationsStore.isLoading,
                    error: NotificationsStore.error,
                });
                if (this.wrappedComponent.onError) this.wrappedComponent.onError(NotificationsStore.error);
            });
        }

        hasMore = () => NotificationsStore.hasMoreNotifications();

        render() {
            const {
                state: { isLoading, notifications, updateCount, offlineErrors, error },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  error={error}
                  notificationsLoading={isLoading}
                  notifications={notifications}
                  hasMoreNotifications={this.hasMore}
                  notificationsUpdateCount={updateCount}
                  offlineErrors={offlineErrors}
                />
            );
        }
    }

    return withNotifications;
};
