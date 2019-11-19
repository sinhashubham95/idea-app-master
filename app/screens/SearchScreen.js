import React, { Component } from 'react';
import withOrientation from 'providers/withOrientation';
import withNetwork from 'providers/withNetwork';
import withIdeas from 'providers/withIdeas';
import ErrorAlert from 'components/ErrorAlert';
import IdeaCard from 'components/IdeaCard';
import SearchFilterButton from 'components/SearchFilterButton';

export default withOrientation(withNetwork(withIdeas(class extends Component {
  static displayName = 'SearchScreen';

  static propTypes = {
      componentId: propTypes.string,
      error: propTypes.string,
      ideas: propTypes.array,
      ideasLoading: propTypes.bool,
      ideasSaving: propTypes.bool,
      ideasSearch: propTypes.object,
      challenge: propTypes.object,
      reset: propTypes.bool,
      hasMoreIdeas: propTypes.func,
      isOffline: propTypes.bool,
      isTablet: propTypes.bool,
      isLandscape: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
  }

  state = {
      search: '',
      isOffline: this.props.isOffline,
  };

  componentWillMount() {
      if (this.props.reset) {
          if (!this.props.isOffline) {
              AppActions.resetIdeasSearch();
          } else {
              this.setState({
                  offlineFilterByChallenge: null,
                  offlineFilterByStatus: null,
                  offlineFilterByStage: null,
              });
          }
      } else {
          if (this.props.ideasSearch.query) {
              this.setState({ search: this.props.ideasSearch.query });
          }
          if (this.props.challenge) {
              if (!this.props.isOffline) {
                  AppActions.filterIdeasByChallenge(this.props.challenge);
              } else {
                  this.setState({ offlineFilterByChallenge: this.props.challenge });
              }
          }
      }
  }

  componentDidMount() {
      if (!this.props.isOffline && !this.props.challenge) {
          AppActions.getIdeas();
      }
  }

  onRefresh = () => {
      if (!this.props.isOffline) {
          AppActions.getIdeas();
      }
  }

  onSearch = (text) => {
      this.setState({ search: text });
      if (!this.state.isOffline) {
          AppActions.searchIdeas(text);
      }
  }

  onSort = () => {
      const { isOffline } = this.state;
      const options = _.map(Constants.sortBy, 'label').concat([localizedStrings.clear]);
      API.showOptions(localizedStrings.sort, options, true, false, true)
          .then((type) => {
              if (type == null) return;
              if (type === options.length - 2) {
                  if (!isOffline) {
                      AppActions.sortIdeas(null);
                  } else {
                      this.setState({ offlineSort: null });
                  }
                  return;
              }
              API.showOptions(localizedStrings.order, [localizedStrings.ascending, localizedStrings.descending])
                  .then((order) => {
                      if (order == null) return null;
                      if (!isOffline) {
                          AppActions.sortIdeas(`${order === 1 ? '-' : ''}${Constants.sortBy[type].field}`);
                      } else {
                          this.setState({ offlineSort: `${order === 1 ? '-' : ''}${Constants.sortBy[type].field}` });
                      }
                  });
          });
  }

  onFilterByChallenge = () => {
      const { isOffline, offlineFilterByChallenge } = this.state;
      const challenge = isOffline ? offlineFilterByChallenge : this.props.ideasSearch.challenge;
      Navigation.showModal(routes.filterByChallengeModal(challenge, (newChallenge) => {
          if (isOffline) {
              const state = { offlineFilterByChallenge: newChallenge };
              if (!newChallenge) state.offlineFilterByStage = null;
              this.setState(state);
          }
      }));
  }

  onFilterByStatus = () => {
      const statusMappings = DomainStore.getStatusMappings();
      const options = _.map(Constants.ideaStatus, status => (statusMappings && statusMappings[status] ? statusMappings[status] : status)).concat([localizedStrings.clear]);
      API.showOptions(localizedStrings.status, options, true, false, true)
          .then((index) => {
              if (index == null) return;
              if (index === options.length - 2) {
                  if (!this.state.isOffline) {
                      AppActions.filterIdeasByStatus(null);
                  } else {
                      this.setState({ offlineFilterByStatus: null });
                  }
                  return;
              }

              if (!this.state.isOffline) {
                  AppActions.filterIdeasByStatus(Constants.ideaStatus[index]);
              } else {
                  this.setState({ offlineFilterByStatus: Constants.ideaStatus[index] });
              }
          });
  }

  onFilterByStage = () => {
      const options = _.map(this.state.isOffline ? this.state.offlineFilterByChallenge.stages : this.props.ideasSearch.challenge.stages, 'name').concat([localizedStrings.clear]);
      API.showOptions(localizedStrings.stage, options, true, false, true)
          .then((index) => {
              if (index == null) return;
              if (index === options.length - 2) {
                  if (!this.state.isOffline) {
                      AppActions.filterIdeasByStage(null);
                  } else {
                      this.setState({ offlineFilterByStage: null });
                  }
                  return;
              }

              if (!this.state.isOffline) {
                  AppActions.filterIdeasByStage(_.find(this.props.ideasSearch.challenge.stages, { name: options[index] }).id);
              } else {
                  this.setState({ offlineFilterByStage: _.find(this.state.offlineFilterByChallenge.stages, { name: options[index] }).id });
              }
          });
  }

  getActiveSort = () => {
      const order = this.state.isOffline ? this.state.offlineSort : this.props.ideasSearch.order;
      if (!order) return null;

      const asc = order[0] !== '-';
      const field = asc ? order : order.substr(1);
      return (
          <Row>
              <Text style={[Styles.filterButtonText, Styles.filterButtonActiveText]}>{_.find(Constants.sortBy, { field }).label}</Text>
              <FontAwesome5 name={asc ? 'sort-amount-up' : 'sort-amount-down'} style={[Styles.filterButtonIcon, Styles.filterButtonActiveText]} />
          </Row>
      );
  }

  getActiveFilterByStatus = () => {
      const status = this.state.isOffline ? this.state.offlineFilterByStatus : this.props.ideasSearch.status;
      if (!status) return null;
      const statusMappings = DomainStore.getStatusMappings();

      return <Text style={[Styles.filterButtonText, Styles.filterButtonActiveText]}>{statusMappings ? statusMappings[status] : status}</Text>;
  }

  getActiveFilterByChallenge = () => {
      const challenge = this.state.isOffline ? this.state.offlineFilterByChallenge : this.props.ideasSearch.challenge;
      if (!challenge) return null;

      return <Text style={[Styles.filterButtonText, Styles.filterButtonActiveText, { maxWidth: 100 }]} numberOfLines={1}>{challenge.name}</Text>;
  }

  onEndReached = () => {
      if (this.props.isOffline || !this.props.hasMoreIdeas()) return;
      AppActions.getMoreIdeas();
  }

  getActiveFilterByStage = () => {
      const stage = this.state.isOffline ? this.state.offlineFilterByStage : this.props.ideasSearch.stage;
      if (!stage) return null;

      const stages = this.state.isOffline ? this.state.offlineFilterByChallenge.stages : this.props.ideasSearch.challenge.stages;
      return <Text style={[Styles.filterButtonText, Styles.filterButtonActiveText]}>{_.find(stages, { id: stage }).name}</Text>;
  }

  onNetworkChange = (isOffline) => {
      // Maintain existing filtering by challenge
      const { ideasSearch: { challenge } } = this.props;
      this.setState({
          isOffline,
          offlineFilterByChallenge: challenge,
      });
      if (!isOffline) {
          AppActions.getIdeas();
      }
  }

  render() {
      const {
          props: {
              componentId, ideasLoading, ideasSaving, ideasSearch, error, isTablet, isLandscape, DeviceWidth, DeviceHeight,
          },
          state: { search, offlineFilterByChallenge, isOffline, offlineSort, offlineFilterByStatus, offlineFilterByStage },
      } = this;
      const numColumns = isTablet ? isLandscape ? 3 : 2 : 1;
      let ideas = isOffline ? (offlineFilterByChallenge ? OfflineIdeasStore.getIdeasByChallengeId(offlineFilterByChallenge.id) : OfflineIdeasStore.getIdeas()) : this.props.ideas;
      if (isOffline) {
          ideas = Utils.orderIdeas(ideas, offlineSort);
          if (search) {
              ideas = _.filter(ideas, idea => idea.serial_number.indexOf(search) !== -1);
          }
          if (offlineFilterByStatus) {
              ideas = _.filter(ideas, idea => idea.status === offlineFilterByStatus);
          }
          if (offlineFilterByChallenge && offlineFilterByStage) {
              ideas = _.filter(ideas, idea => idea.current_stage.id === offlineFilterByStage);
          }
      }
      return (
          <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
              <ErrorAlert error={error} />

              {isOffline ? (
                  <FormGroup style={[Styles.pb0, { marginHorizontal: styleVariables.paddingBase }]}>
                      <Fade autostart value={1} style={Styles.errorWrapper}>
                          <Text style={Styles.errorText}>
                              {localizedStrings.ideasSearchOffline}
                          </Text>
                      </Fade>
                  </FormGroup>
              ) : null}
              <Container>
                  <FormGroup pt20>
                      <ION name="ios-search" size={30} style={Styles.searchInputIcon} />
                      <TextInput
                        placeholder={isOffline ? localizedStrings.searchByID : localizedStrings.search}
                        value={search}
                        onChangeText={this.onSearch}
                        style={Styles.searchInputText}
                      />
                  </FormGroup>
              </Container>

              <FormGroup pb20>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>

                      <Flex style={Styles.ml10}>
                          <SearchFilterButton
                            name={localizedStrings.sort} onPress={this.onSort} active={this.getActiveSort()}
                          />
                      </Flex>
                      <Flex style={Styles.ml10}>
                          <SearchFilterButton name={localizedStrings.challenge} onPress={this.onFilterByChallenge} active={this.getActiveFilterByChallenge()} />
                      </Flex>
                      <Flex style={Styles.ml10}>
                          <SearchFilterButton
                            name={localizedStrings.status} onPress={this.onFilterByStatus} active={this.getActiveFilterByStatus()}
                          />
                      </Flex>
                      {(isOffline ? offlineFilterByChallenge : ideasSearch.challenge) ? (
                          <Flex style={Styles.ml10}>
                              <SearchFilterButton
                                name={localizedStrings.stage} onPress={this.onFilterByStage} active={this.getActiveFilterByStage()}
                              />
                          </Flex>
                      ) : null}

                  </ScrollView>
              </FormGroup>

              <FlatList
                key={numColumns}
                style={{ flex: 1 }}
                data={numColumns > 1 ? Utils.padCards(numColumns, ideas) : ideas}
                renderItem={({ item: idea, index }) => {
                    if (idea.pad) {
                        return <Flex style={[{ flex: 1 }, Utils.getCardMargins(index, numColumns)]} />;
                    }
                    return (
                        <IdeaCard
                          key={idea.id} idea={idea}
                          style={Utils.getCardMargins(index, numColumns)}
                          isOffline={isOffline}
                          componentId={componentId}
                        />
                    );
                }}
                keyExtractor={item => item.id}
                refreshing={ideasLoading}
                onRefresh={this.onRefresh}
                onEndReached={this.onEndReached}
                numColumns={numColumns}
                ListEmptyComponent={(
                    <FormGroup pt5>
                        <H3 style={[Styles.textCenter]}>{ideasLoading ? '' : localizedStrings.ideasNotFound}</H3>
                    </FormGroup>
                )}
                extraData={ideasSaving}
              />

          </Flex>
      );
  }
})));
