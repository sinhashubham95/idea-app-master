import React, { Component } from 'react';
import Toast from 'react-native-easy-toast';

import LottieToggle from 'components/base/animation/LottieToggle';
import withOrientation from 'providers/withOrientation';
import withIdeas from 'providers/withIdeas';
import withMyIdeas from 'providers/withMyIdeas';
import withOfflineIdeas from 'providers/withOfflineIdeas';
import ErrorAlert from 'components/ErrorAlert';
import IdeaDetails from 'components/IdeaDetails';

export default withOrientation(withOfflineIdeas(withMyIdeas(withIdeas(class extends Component {
  static displayName = 'IdeaDetailsScreen';

  static propTypes = {
      componentId: propTypes.string,
      error: propTypes.string,
      ideaId: propTypes.string,
      myIdea: propTypes.bool,
      ideas: propTypes.array,
      myIdeas: propTypes.array,
      ideasSaving: propTypes.bool,
      myIdeasSaving: propTypes.bool,
      offlineIdea: propTypes.bool,
      offlineIdeas: propTypes.array,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
      isTablet: propTypes.bool,
  }

  state = {
  };

  componentDidMount() {
      Navigation.events().bindComponent(this);
      ES6Component(this);
      this.listenTo(MyIdeasStore, 'offline-idea-synced', ({ offlineId, id }) => {
          if (this.props.ideaId !== offlineId) return;
          const idea = _.find(this.props.myIdeas, { id });
          Navigation.dismissOverlay('idea-details-action-button').then(() => this.showOverlay(idea));
          this.setState({ ideaId: id });
      });
  }

  onOpenAttachment = (url, filename) => {
      Utils.openAttachment(url, filename)
          .catch(e => this.setState({ openAttachmentError: e.message }));
  }

  showOverlay = (idea) => {
      const { id, challenge: { is_team_enabled, id: challengeId }, team, name, team_request_pending } = idea;
      Navigation.showOverlay({
          component: {
              id: 'idea-details-action-button',
              name: 'idea-details-action-button',
              options: {
                  overlay: {
                      interceptTouchOutside: false,
                  },
              },
              passProps: {
                  userIsTeamMember: !!_.find(team.users, { id: AccountStore.getUser().id }),
                  is_team_enabled,
                  team_request_pending,
                  onEditIdea: () => Navigation.showModal(routes.editIdeaModal(challengeId, idea)),
                  onJoinTeam: () => AppActions.joinTeam(id),
                  onAddComment: () => Navigation.showModal(routes.ideaCommentsModal(id, name)),
                  onLeaveTeam: () => AppActions.leaveTeam(id),
              },
          },
      });
  }

  onTeamRequested = () => {
      this.refs.toast.show(localizedStrings.teamRequestSent);
      const { ideaId, myIdea, myIdeas, offlineIdea, offlineIdeas } = this.props;
      const ideas = offlineIdea ? offlineIdeas : myIdea ? myIdeas : this.props.ideas;
      const idea = _.find(ideas, { id: this.state.ideaId || ideaId });
      Navigation.dismissOverlay('idea-details-action-button').then(() => this.showOverlay(idea));
  }

  async componentDidAppear() {
      if (!global.bottomTabsHeight) {
          const constants = await Navigation.constants();
          global.bottomTabsHeight = constants.bottomTabsHeight;
      }
      const { ideaId, myIdea, myIdeas, offlineIdea, offlineIdeas } = this.props;
      const ideas = offlineIdea ? offlineIdeas : myIdea ? myIdeas : this.props.ideas;
      const idea = _.find(ideas, { id: this.state.ideaId || ideaId });
      this.showOverlay(idea);
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidDisappear() {
      Navigation.dismissOverlay('idea-details-action-button');
  }

  render() {
      const { props: {
          ideaId,
          ideasSaving,
          myIdea,
          myIdeas,
          myIdeasSaving,
          error,
          offlineIdea,
          offlineIdeas,
          DeviceWidth,
          DeviceHeight,
          isTablet,
      }, state: {
          openAttachmentError,
      } } = this;
      const ideas = offlineIdea ? offlineIdeas : myIdea ? myIdeas : this.props.ideas;
      const idea = _.find(ideas, { id: this.state.ideaId || ideaId });
      if (!idea) return null; // TODO do something better here i.e. show error
      const {
          id, name, rating_counts, creator, banner_url,
          user_rating_option_id, summary, attachments,
          num_comments, challenge, is_draft, is_following,
          team,
      } = idea;

      // Process rating system
      const optionIdList = _.keys(rating_counts);
      let ratingSystem;
      if (optionIdList.length === 5) {
          ratingSystem = 'star';
      } else if (optionIdList.length === 2) {
          ratingSystem = 'thumbs';
      } else {
          ratingSystem = 'none';
      }
      let rating;
      if (ratingSystem !== 'none') {
          rating = user_rating_option_id ? optionIdList.indexOf(user_rating_option_id.toString()) + 1 : 0;
      }

      const optionId = user_rating_option_id ? user_rating_option_id.toString() : null;

      return (
          <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
              <ErrorAlert error={error} error2={openAttachmentError} />
              <FastImage
                source={banner_url ? { uri: Utils.getSafeImageUrl(banner_url) } : undefined}
                style={{ height: 240, width: DeviceWidth, position: 'relative', backgroundColor: pallette.greyLight }}
                resizeMode={FastImage.resizeMode.cover}
              >
                  <Flex style={{ height: '100%', backgroundColor: 'rgba(58,58,58,0.2)' }}>
                      <Flex style={[Styles.ideaHeaderContent, { justifyContent: 'flex-end', height: '100%' }]}>
                          <Container>

                              <H1 style={Styles.h1White}>
                                  {name}
                              </H1>
                              <FormGroup>
                                  <Row>
                                      <Flex>
                                          <Row>
                                              {creator.thumbnail ? (
                                                  <FastImage
                                                    source={{ uri: creator.thumbnail, ...Styles.profileImageNav }} style={Styles.profileImageNav} resizeMode={FastImage.resizeMode.cover}
                                                  />
                                              ) : (
                                                  <View style={[Styles.avatarPlaceholderNav, Styles.profileImageNavAndroid]}>
                                                      <Text style={Styles.avatarInitialNav}>{creator.first_name || creator.display_name ? (creator.first_name || creator.display_name)[0].toUpperCase() : ''}</Text>
                                                  </View>
                                              )}
                                              <Column>
                                                  <Text style={[Styles.heroText, Styles.ml5]}>{creator.first_name || creator.display_name}</Text>
                                              </Column>
                                          </Row>
                                      </Flex>
                                      <View>
                                          {ratingSystem === 'star' ? (
                                              <Row>
                                                  <TouchableOpacity onPress={optionId === optionIdList[0] ? () => AppActions.unrateIdea(id) : () => AppActions.rateIdea(id, optionIdList[0])} disabled={ideasSaving || myIdeasSaving}>
                                                      <LottieToggle
                                                        source={require('../animations/star-white.json')}
                                                        value={rating > 0}
                                                        style={Styles.heroIconAnimation}
                                                        duration={300}
                                                      />
                                                  </TouchableOpacity>
                                                  <TouchableOpacity onPress={optionId === optionIdList[1] ? () => AppActions.unrateIdea(id) : () => AppActions.rateIdea(id, optionIdList[1])} disabled={ideasSaving || myIdeasSaving}>
                                                      <LottieToggle
                                                        source={require('../animations/star-white.json')}
                                                        value={rating > 1}
                                                        style={Styles.heroIconAnimation}
                                                        duration={300}
                                                      />
                                                  </TouchableOpacity>
                                                  <TouchableOpacity onPress={optionId === optionIdList[2] ? () => AppActions.unrateIdea(id) : () => AppActions.rateIdea(id, optionIdList[2])} disabled={ideasSaving || myIdeasSaving}>
                                                      <LottieToggle
                                                        source={require('../animations/star-white.json')}
                                                        value={rating > 2}
                                                        style={Styles.heroIconAnimation}
                                                        duration={300}
                                                      />
                                                  </TouchableOpacity>
                                                  <TouchableOpacity onPress={optionId === optionIdList[3] ? () => AppActions.unrateIdea(id) : () => AppActions.rateIdea(id, optionIdList[3])} disabled={ideasSaving || myIdeasSaving}>
                                                      <LottieToggle
                                                        source={require('../animations/star-white.json')}
                                                        value={rating > 3}
                                                        style={Styles.heroIconAnimation}
                                                        duration={300}
                                                      />
                                                  </TouchableOpacity>
                                                  <TouchableOpacity onPress={optionId === optionIdList[4] ? () => AppActions.unrateIdea(id) : () => AppActions.rateIdea(id, optionIdList[4])} disabled={ideasSaving || myIdeasSaving}>
                                                      <LottieToggle
                                                        source={require('../animations/star-white.json')}
                                                        value={rating > 4}
                                                        style={Styles.heroIconAnimation}
                                                        duration={300}
                                                      />
                                                  </TouchableOpacity>
                                              </Row>
                                          ) : ratingSystem === 'thumbs' ? (
                                              <Row>
                                                  <TouchableOpacity onPress={optionId === optionIdList[0] ? () => AppActions.unrateIdea(id) : () => AppActions.rateIdea(id, optionIdList[0])} disabled={ideasSaving || myIdeasSaving}>
                                                      <FontAwesome5
                                                        style={[Styles.heroIcon, Styles.heroThumbIcon]} name="thumbs-up"
                                                        solid={rating === 1}
                                                      />
                                                  </TouchableOpacity>
                                                  <TouchableOpacity onPress={optionId === optionIdList[1] ? () => AppActions.unrateIdea(id) : () => AppActions.rateIdea(id, optionIdList[1])} disabled={ideasSaving || myIdeasSaving}>
                                                      <FontAwesome5
                                                        style={[Styles.heroIcon, Styles.heroThumbIcon]} name="thumbs-down"
                                                        solid={rating === 2}
                                                      />
                                                  </TouchableOpacity>
                                              </Row>
                                          ) : null}
                                      </View>
                                  </Row>
                              </FormGroup>
                          </Container>
                      </Flex>
                  </Flex>
              </FastImage>
              <Container>
                  <FormGroup>
                      {isTablet
                          ? (
                              <Row>
                                  <Flex>
                                      <Row>
                                          <View style={Styles.pr20}>
                                              <TouchableOpacity onPress={() => Navigation.showModal(routes.ideaCommentsModal(id, name))}>
                                                  <Row>
                                                      <FontAwesome5 style={Styles.listIconGrey} color={pallette.greyDark} name="comment" />
                                                      <Text style={Styles.cardfooterItem}>{num_comments}</Text>
                                                  </Row>
                                              </TouchableOpacity>
                                          </View>
                                          <View style={Styles.pr20}>
                                              <TouchableOpacity onPress={() => Navigation.showModal(routes.shareModal('ideas', id))}>
                                                  <Row>
                                                      <FontAwesome5 style={Styles.listIconGrey} color={pallette.greyDark} name="share-alt" />
                                                      <Text style={Styles.cardfooterItem}>{localizedStrings.share.toUpperCase()}</Text>
                                                  </Row>
                                              </TouchableOpacity>
                                          </View>
                                          <View style={Styles.pr20}>
                                              <TouchableOpacity onPress={() => AppActions.followIdea(id, !is_following)}>
                                                  <Row>
                                                      <FontAwesome5
                                                        style={Styles.listIconGrey} color={pallette.greyDark}
                                                        name="star"
                                                        solid={is_following}
                                                      />
                                                      <Text style={Styles.cardfooterItem}>{is_following ? localizedStrings.following : localizedStrings.follow}</Text>
                                                  </Row>
                                              </TouchableOpacity>
                                          </View>
                                      </Row>

                                  </Flex>

                                  {(creator.id === AccountStore.getUser().id || !!_.find(team.users, { id: AccountStore.getUser().id })) ? (
                                      <Flex style={[{ alignSelf: 'flex-end' }, Styles.pr5]}>
                                          <TouchableOpacity onPress={() => Navigation.showModal(routes.editIdeaModal(challenge.id, idea))}>
                                              <Row>
                                                  <FontAwesome5 style={Styles.listIconGrey} color={pallette.greyDark} name="edit" />
                                                  <Text style={Styles.cardfooterItem}>{localizedStrings.edit.toUpperCase()}</Text>
                                              </Row>
                                          </TouchableOpacity>
                                      </Flex>
                                  ) : null}

                              </Row>
                          )

                          : (
                              <Row>
                                  <Flex value={2}>
                                      <TouchableOpacity onPress={() => Navigation.showModal(routes.ideaCommentsModal(id, name))}>
                                          <Row>
                                              <FontAwesome5 style={Styles.listIconGrey} color={pallette.greyDark} name="comment" />
                                              <Text style={Styles.cardfooterItem}>{num_comments}</Text>
                                          </Row>
                                      </TouchableOpacity>
                                  </Flex>
                                  <Flex value={2}>
                                      <TouchableOpacity onPress={() => Navigation.showModal(routes.shareModal('ideas', id))}>
                                          <Row>
                                              <FontAwesome5 style={Styles.listIconGrey} color={pallette.greyDark} name="share-alt" />
                                              <Text style={Styles.cardfooterItem}>{localizedStrings.share.toUpperCase()}</Text>
                                          </Row>
                                      </TouchableOpacity>
                                  </Flex>
                                  <Flex value={3}>
                                      <TouchableOpacity onPress={() => AppActions.followIdea(id, !is_following)}>
                                          <Row>
                                              <FontAwesome5
                                                style={Styles.listIconGrey} color={pallette.greyDark}
                                                name="star"
                                                solid={is_following}
                                              />
                                              <Text style={Styles.cardfooterItem}>{is_following ? localizedStrings.following : localizedStrings.follow}</Text>
                                          </Row>
                                      </TouchableOpacity>
                                  </Flex>
                                  {(creator.id === AccountStore.getUser().id || !!_.find(team.users, { id: AccountStore.getUser().id })) ? (
                                      <Flex value={2}>
                                          <TouchableOpacity onPress={() => Navigation.showModal(routes.editIdeaModal(challenge.id, idea))}>
                                              <Row>
                                                  <FontAwesome5 style={Styles.listIconGrey} color={pallette.greyDark} name="edit" />
                                                  <Text style={Styles.cardfooterItem}>{localizedStrings.edit.toUpperCase()}</Text>
                                              </Row>
                                          </TouchableOpacity>
                                      </Flex>
                                  ) : null}
                              </Row>
                          )

                      }
                  </FormGroup>
              </Container>
              <FormGroup style={[Styles.container, { flex: 1 }]}>
                  <IdeaDetails idea={_.cloneDeep(idea)} challengeId={idea.challenge.id} isTablet={this.props.isTablet} />
              </FormGroup>
              <Toast
                ref="toast"
                position="top"
                style={{ backgroundColor: pallette.buttonSecondary }}
                textStyle={{ fontFamily: 'ProximaNova-Bold', color: 'white', fontSize: styleVariables.fontSizeParagraph }}
              />
          </Flex>
      );
  }
}))));
