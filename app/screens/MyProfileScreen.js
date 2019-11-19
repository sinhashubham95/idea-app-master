import { Component } from 'react';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import withOrientation from 'providers/withOrientation';
import withNetwork from 'providers/withNetwork';
import withDomain from 'providers/withDomain';
import withAccount from 'providers/withAccount';
import withMyIdeas from 'providers/withMyIdeas';
import ErrorAlert from 'components/ErrorAlert';
import Anchor from 'components/Anchor';
import SearchFilterButton from 'components/SearchFilterButton';
import IdeaListItem from 'components/IdeaListItem';
import { ButtonTertiary } from 'components/base/forms/Button';

export default withOrientation(withNetwork(withDomain(withAccount(withMyIdeas(class extends Component {
  static displayName = 'MyProfileScreen';

  static propTypes = {
      componentId: propTypes.string,
      user: propTypes.object,
      error: propTypes.string,
      domainConfig: propTypes.object,
      publishedIdeas: propTypes.array,
      drafts: propTypes.array,
      hasMoreMyIdeas: propTypes.func,
      hasMoreMyDrafts: propTypes.func,
      myIdeasLoading: propTypes.bool,
      isOffline: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
  }

  state = {
  };

  componentDidMount() {
      if (!this.props.isOffline) {
          AppActions.getMyIdeas();
      }
  }

  onViewIdea = (ideaId) => {
      Navigation.push(this.props.componentId, routes.ideaDetailsScreen(ideaId, true));
  }

  onEditDraft = (challengeId, idea) => {
      Navigation.showModal(routes.editIdeaModal(challengeId, idea));
  }

  onSignOut = () => {
      Alert.alert(localizedStrings.signOut, localizedStrings.signOutMsg,
          [
              {
                  text: localizedStrings.no,
                  style: 'cancel',
              },
              {
                  text: localizedStrings.yes,
                  onPress: routes.logout,
              },
          ]);
  }

  onChangePassword = () => {
      Navigation.showModal(routes.changePasswordModal());
  }

  onRefresh = () => {
      if (!this.props.isOffline) {
          AppActions.getMyIdeas();
      }
  }

  onDraftsEndReached = () => {
      if (!this.props.hasMoreMyDrafts() || this.props.isOffline) return;
      AppActions.getMoreMyDrafts();
  }

  onIdeasEndReached = () => {
      if (!this.props.hasMoreMyIdeas() || this.props.isOffline) return;
      AppActions.getMoreMyIdeas();
  }

  onSettings = () => {
      const options = [localizedStrings.changePassword];
      if (!this.props.isOffline) {
          options.push(localizedStrings.signOut);
      }
      API.showOptions(localizedStrings.actions, options)
          .then((res) => {
              if (res == null) return;
              switch (options[res]) {
                  case localizedStrings.changePassword:
                      this.onChangePassword(); break;
                  case localizedStrings.signOut:
                      this.onSignOut(); break;
                  default:
              }
          });
  }

  render() {
      const { props: {
          user,
          domainConfig: { name },
          publishedIdeas,
          drafts,
          myIdeasLoading,
          hasMoreMyIdeas,
          hasMoreMyDrafts,
          error,
          DeviceWidth,
          DeviceHeight,
      } } = this;
      return (
          <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
              <ErrorAlert error={error} />
              <Container>
                  <FormGroup pb0>
                      <Row>
                          <View>
                              {user && user.image ? (
                                  <FastImage
                                    source={{ uri: user.image }}
                                    style={[Styles.profileImageLarge]}
                                    resizeMode={FastImage.resizeMode.cover}
                                  />
                              ) : (
                                  <View style={Styles.avatarPlaceholderLarge}>
                                      <Text style={Styles.avatarInitialLarge}>{user ? (user.first_name || user.display_name)[0].toUpperCase() : ''}</Text>
                                  </View>
                              )}
                          </View>
                          <Flex style={Styles.ml10}>
                              <H3 style={Styles.mb0}>{user ? user.display_name.split(' ')[0] : ''}</H3>
                              <Text style={[Styles.paragraphLight]}>{name}</Text>
                          </Flex>
                      </Row>
                  </FormGroup>
                  <TouchableOpacity style={Styles.myProfileSettingsButton} onPress={this.onSettings}>
                      <FontAwesome name="cog" color={pallette.wazokuNavy} size={30} />
                  </TouchableOpacity>
              </Container>
              <FormGroup style={{ flex: 1 }}>

                  <ScrollableTabView
                    tabBarTextStyle={Styles.tabBarText}
                    tabBarActiveTextColor={pallette.wazokuBlue}
                    tabBarUnderlineStyle={{ backgroundColor: pallette.wazokuBlue }}
                    tabBarInactiveTextColor={pallette.greyMid}
                    initialPage={1}
                  >
                      <FlatList
                        tabLabel={localizedStrings.drafts}
                        style={{ flex: 1 }}
                        data={drafts.length ? drafts : hasMoreMyDrafts() ? [{ loadingMore: true }] : []}
                        renderItem={({ item: idea }) => {
                            if (idea.loadingMore) return <Loader />;
                            return (
                                <IdeaListItem
                                  key={idea.id} idea={idea}
                                  onView={() => this.onEditDraft(idea.challenge.id, idea)}
                                />
                            );
                        }}
                        keyExtractor={item => item.id}
                        refreshing={myIdeasLoading}
                        onRefresh={this.onRefresh}
                        onEndReached={this.onDraftsEndReached}
                      />
                      <FlatList
                        tabLabel={localizedStrings.ideas.toUpperCase()}
                        style={{ flex: 1 }}
                        data={publishedIdeas.length ? publishedIdeas : hasMoreMyIdeas() ? [{ loadingMore: true }] : []}
                        renderItem={({ item: idea }) => {
                            if (idea.loadingMore) return <Loader />;
                            return (
                                <IdeaListItem
                                  key={idea.id} idea={idea}
                                  onView={() => this.onViewIdea(idea.id)}
                                />
                            );
                        }}
                        keyExtractor={item => item.id}
                        refreshing={myIdeasLoading}
                        onRefresh={this.onRefresh}
                        onEndReached={this.onIdeasEndReached}
                      />
                  </ScrollableTabView>

              </FormGroup>
          </Flex>
      );
  }
})))));
