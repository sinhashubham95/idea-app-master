import { Component } from 'react';

import withOrientation from 'providers/withOrientation';
import withNetwork from 'providers/withNetwork';
import withChallenges from 'providers/withChallenges';
import syncCustomFields from '../../sync-custom-fields';
import ChallengeCard from '../components/ChallengeCard';
import ErrorAlert from '../components/ErrorAlert';

export default withOrientation(withNetwork(withChallenges(class extends Component {
  static displayName = 'DashboardScreen';

  static propTypes = {
      componentId: propTypes.string,
      challengesLoading: propTypes.bool,
      challenges: propTypes.array,
      error: propTypes.string,
      hasMoreChallenges: propTypes.func,
      isOffline: propTypes.bool,
      isTablet: propTypes.bool,
      isLandscape: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
  }

  state = {
  };

  componentDidMount() {
      Navigation.events().bindComponent(this);

      const domainConfig = DomainStore.getDomainConfig();
      if (domainConfig && domainConfig.cache_age) {
          AsyncStorage.getItem('cache-expiry', (err, res) => {
              if (!res) {
                  const cacheExpiry = moment().add(domainConfig.cache_age, 's').toISOString();
                  AsyncStorage.setItem('cache-expiry', cacheExpiry);
                  DomainStore.cacheExpiry = cacheExpiry;
              }
          });
      }

      if (!this.props.isOffline) {
          AppActions.getChallenges();
          syncCustomFields();

          API.push.init(this.onNotification).then((token) => {
              AppActions.registerDeviceToken(token);
          });

          API.push.getInitialNotification().then((notificationOpen) => {
              if (notificationOpen && notificationOpen.notification.data) {
                  routes.handlePushNotification(notificationOpen.notification.data);
              }
          });
      }
  }

  componentDidUpdate(prevProps) {
      if (prevProps.isOffline && !this.props.isOffline) {
          syncCustomFields();
      }
  }

  componentWillUnmount() {
      API.push.stop();
  }

  onRefresh = () => {
      if (!this.props.isOffline) {
          AppActions.getChallenges();
      }
  }

  onEndReached = () => {
      if (!this.props.hasMoreChallenges() || this.props.isOffline) return;
      AppActions.getMoreChallenges();
  }

  render() {
      const { props: { challengesLoading, challenges, error, isTablet, isLandscape, DeviceWidth, DeviceHeight } } = this;
      const numColumns = isTablet ? isLandscape ? 3 : 2 : 1;
      return (
          <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
              <ErrorAlert error={error} />
              <Container>
                  <FormGroup>
                      <H1 style={[Styles.h1]}>{localizedStrings.challenges}</H1>
                  </FormGroup>
              </Container>
              <FlatList
                key={numColumns}
                style={{ flex: 1 }}
                data={numColumns > 1 ? Utils.padCards(numColumns, challenges) : challenges}
                renderItem={({ item: challenge, index }) => {
                    if (challenge.pad) {
                        return <Flex style={[{ flex: 1 }, Utils.getCardMargins(index, numColumns)]} />;
                    }
                    return (
                        <ChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          style={Utils.getCardMargins(index, numColumns)}
                        />
                    );
                }}
                keyExtractor={item => item.id}
                refreshing={challengesLoading}
                onRefresh={this.onRefresh}
                onEndReached={this.onEndReached}
                numColumns={numColumns}
                extraData={challengesLoading}
              />
          </Flex>
      );
  }
})));
