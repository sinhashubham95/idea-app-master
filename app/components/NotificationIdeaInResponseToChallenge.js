import { PureComponent } from 'react';

export default class extends PureComponent {
  static displayName = 'NotificationIdeaInResponseToChallenge';

  static propTypes = {
      first: propTypes.bool,
      notification: propTypes.shape({
          thumbnail: propTypes.string,
          displayName: propTypes.string,
          ideaId: propTypes.string,
          ideaName: propTypes.string,
          challengeId: propTypes.string,
          challengeName: propTypes.string,
      }),
      goToIdea: propTypes.func,
      unread: propTypes.bool,
  }

  render() {
      const { props: { first, notification: { thumbnail, displayName, ideaId, ideaName, challengeId, challengeName, message }, goToIdea, unread } } = this;
      return (
          <TouchableOpacity onPress={() => goToIdea(ideaId)}>
              <Row style={[unread ? Styles.notificationListItemUnread : Styles.notificationListItem, first ? Styles.notificationListItemFirst : {}]}>
                  <View>
                      {thumbnail ? (
                          <FastImage source={{ uri: thumbnail, borderRadius: Styles.avatarPlaceholder.borderRadius }} style={Styles.avatarPlaceholder} />
                      ) : (
                          <View style={Styles.avatarPlaceholder}>
                              <Text style={Styles.avatarInitial}>{displayName ? displayName[0].toUpperCase() : ''}</Text>
                          </View>
                      )}
                  </View>

                  <Flex>
                      <Row style={Styles.pr10}>
                          <Text style={Styles.notificationDisplayName}>{displayName}</Text>
                          <Text style={Styles.notiificationText}>
                              {message}
                              <Text style={{ fontWeight: 'bold' }}>{`${challengeName}: ${ideaName}`}</Text>
                          </Text>
                      </Row>
                  </Flex>
              </Row>
          </TouchableOpacity>
      );
  }
}