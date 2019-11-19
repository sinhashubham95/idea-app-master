import { PureComponent } from 'react';

export default class extends PureComponent {
  static displayName = 'NotificationOutcomeReviewYesFollower';

  static propTypes = {
      first: propTypes.bool,
      notification: propTypes.shape({
          ideaId: propTypes.string,
          ideaName: propTypes.string,
      }),
      goToIdea: propTypes.func,
      unread: propTypes.bool,
  }

  render() {
      const { props: { first, notification: { ideaId, ideaName, messageEnd }, goToIdea, unread } } = this;
      const user = AccountStore.getUser();
      return (
          <TouchableOpacity onPress={() => goToIdea(ideaId)}>
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
                              {`${localizedStrings.idea} `}
                              <Text style={{ fontWeight: 'bold' }}>{ideaName}</Text>
                              {messageEnd}
                          </Text>
                      </Row>
                  </Flex>
              </Row>
          </TouchableOpacity>
      );
  }
}