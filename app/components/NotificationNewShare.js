import { PureComponent } from 'react';

export default class extends PureComponent {
  static displayName = 'NotificationNewShare';

  static propTypes = {
      first: propTypes.bool,
      notification: propTypes.shape({
          thumbnail: propTypes.string,
          displayName: propTypes.string,
          entityId: propTypes.string,
          entityName: propTypes.string,
          entityType: propTypes.string,
          message: propTypes.string,
      }),
      unread: propTypes.bool,
      goToIdea: propTypes.func,
  }

  render() {
      const { props: { first, notification: { thumbnail, displayName, entityId, entityName, entityType, messageShared, messageWithYou, message }, unread, goToIdea } } = this;
      const content = (
          <Row style={[unread ? Styles.notificationListItemUnread : Styles.notificationListItem, first ? Styles.notificationListItemFirst : {}]}>
              <View>
                  {thumbnail ? (
                      <FastImage source={{ uri: thumbnail, ...Styles.avatarPlaceholder }} style={Styles.avatarPlaceholder} />
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
                          {messageShared}
                          <Text style={{ fontWeight: 'bold' }}>{entityName}</Text>
                          {messageWithYou ? `${messageWithYou} ${message}` : message}
                      </Text>
                  </Row>
              </Flex>
          </Row>
      );
      if (entityType === 'idea') {
          return (
              <TouchableOpacity onPress={() => goToIdea(entityId)}>
                  {content}
              </TouchableOpacity>
          );
      }
      return content;
  }
}