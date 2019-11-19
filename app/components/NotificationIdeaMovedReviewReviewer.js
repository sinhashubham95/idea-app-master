import { PureComponent } from 'react';

export default class extends PureComponent {
  static displayName = 'NotificationIdeaMovedReviewReviewer';

  static propTypes = {
      first: propTypes.bool,
      notification: propTypes.shape({
          challengeId: propTypes.string,
          challengeName: propTypes.string,
      }),
      unread: propTypes.bool,
  }

  render() {
      const { props: { first, notification: { challengeId, challengeName, message }, unread } } = this;
      const user = AccountStore.getUser();
      return (
          <Row style={[unread ? Styles.notificationListItemUnread : Styles.notificationListItem, first ? Styles.notificationListItemFirst : {}]}>
              <View>
                  {user.thumbnail ? (
                      <FastImage source={{ uri: user.thumbnail, borderRadius: Styles.avatarPlaceholder.borderRadius }} style={Styles.avatarPlaceholder} />
                  ) : (
                      <View style={Styles.avatarPlaceholder}>
                          <Text style={Styles.avatarInitial}>{user.display_name ? user.display_name[0].toUpperCase() : ''}</Text>
                      </View>
                  )}
              </View>

              <Flex>
                  <Row style={Styles.pr10}>
                      <Text style={Styles.notiificationText}>
                          {message}
                          <Text style={{ fontWeight: 'bold' }}>{` ${challengeName}`}</Text>
                      </Text>
                  </Row>
              </Flex>
          </Row>
      );
  }
}