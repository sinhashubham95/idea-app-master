import { Component } from 'react';

import withNetwork from 'providers/withNetwork';
import withOrientation from 'providers/withOrientation';
import withNotifications from 'providers/withNotifications';
import NotificationListItem from 'components/NotificationListItem';

export default withOrientation(withNetwork(withNotifications(class extends Component {
    static displayName = 'NotificationsScreen';

    static propTypes = {
        componentId: propTypes.string,
        error: propTypes.string,
        isOffline: propTypes.bool,
        isTablet: propTypes.bool,
        isLandscape: propTypes.bool,
        notifications: propTypes.array,
        notificationsLoading: propTypes.bool,
        notificationsUpdateCount: propTypes.number,
        hasMoreNotifications: propTypes.func,
        offlineErrors: propTypes.array,
        DeviceWidth: propTypes.number,
        DeviceHeight: propTypes.number,
    }

    state = {
    };

    componentDidMount() {
        Navigation.events().bindComponent(this);

        if (!this.props.isOffline) {
            AppActions.getNotifications();
        }

        if (this.props.notifications.length) {
            this.setUnreadCountBadge();
        }
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.notifications, this.props.notifications) || prevProps.offlineErrors.length < this.props.offlineErrors.length) {
            if (global.selectedTabIndex === 2 && NotificationsStore.getUnreadCount() > 0) {
                AppActions.markNotificationsAsRead();
            } else if (global.selectedTabIndex !== 2) {
                this.setUnreadCountBadge();
            }
        }
    }

    setUnreadCountBadge = () => {
        const unreadCount = NotificationsStore.getUnreadCount();
        if (unreadCount > 0) {
            Navigation.mergeOptions(this.props.componentId, {
                bottomTab: {
                    badge: unreadCount.toString(),
                },
            });
        }
    }

    onNotificationsSaved = () => {
        Navigation.mergeOptions(this.props.componentId, {
            bottomTab: {
                badge: '',
            },
        });
    }

    onRefresh = () => {
        if (!this.props.isOffline) {
            AppActions.getNotifications();
        }
    }

    onEndReached = () => {
        if (!this.props.hasMoreNotifications() || this.props.isOffline) return;
        AppActions.getMoreNotifications();
    }

    render() {
        const { props: { notifications, notificationsLoading, notificationsUpdateCount, componentId, isOffline, offlineErrors, DeviceHeight, DeviceWidth } } = this;
        return (
            <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
                <Container>
                    <FormGroup>
                        <H1>{localizedStrings.notifications}</H1>
                    </FormGroup>
                </Container>
                <FlatList
                  style={{ flex: 1 }}
                  data={offlineErrors.concat(notifications)}
                  renderItem={({ item: notification, index }) => (
                      <NotificationListItem
                        key={index} notification={notification} goToIdea={ideaId => Utils.goToIdea(componentId, isOffline, ideaId)}
                        first={index === 0}
                        unread={index < offlineErrors.length + notificationsUpdateCount}
                      />
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  refreshing={notificationsLoading}
                  onRefresh={this.onRefresh}
                  onEndReached={this.onEndReached}
                  ListEmptyComponent={(
                      <FormGroup>
                          <H3 style={[Styles.textCenter]}>{localizedStrings.notificationsNotFound}</H3>
                      </FormGroup>
                )}
                />
            </Flex>
        );
    }
})));
