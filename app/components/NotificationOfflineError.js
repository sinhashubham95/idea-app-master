import { PureComponent } from 'react';

export default class extends PureComponent {
  static displayName = 'NotificationOfflineError';

  static propTypes = {
      first: propTypes.bool,
      notification: propTypes.shape({
          error: propTypes.string,
      }),
  }

  render() {
      const { first, notification: { error } } = this.props;
      return (
          <Flex>
              <Row style={[Styles.notificationListItemUnread, first ? Styles.notificationListItemFirst : {}]}>
                  <View style={Styles.mr10}>
                      <FontAwesome5 name="exclamation-circle" size={48} color={pallette.error} />
                  </View>

                  <Flex>
                      <Row style={Styles.pr10}>
                          <Text style={Styles.notiificationText}>{error}</Text>
                      </Row>
                  </Flex>
              </Row>
          </Flex>
      );
  }
}