import React, { Component } from 'react';

import data from 'stores/base/_data';
import { ButtonPrimary, ButtonTertiary, ButtonAlt } from 'components/base/forms/Button';
import ErrorAlert from 'components/ErrorAlert';
import withNetwork from 'providers/withNetwork';
import withOrientation from 'providers/withOrientation';

export default withOrientation(withNetwork(class extends Component {
  static displayName = 'SearchChallengeModal';

  static propTypes = {
      componentId: propTypes.string,
      challenge: propTypes.object,
      onDone: propTypes.func.isRequired,
      isOffline: propTypes.bool,
      filter: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
  }

  state = {
      challenges: ChallengesStore.model,
      isLoading: !this.props.isOffline,
  };

  endpoint = `${Project.api}challenges?include=${Constants.include.challenges}&publish_in_mobile_app=true`;

  componentWillMount() {
      if (this.props.challenge) {
          this.setState({ selected: this.props.challenge });
      }
  }

  componentDidMount() {
      if (this.props.isOffline) return;
      data.get(this.endpoint)
          .then(({ data: res, page: { next } }) => {
              this.setState({ challenges: _.sortBy(_.unionBy(res, this.state.challenges, 'id'), challenge => -challenge.created), isLoading: false, hasMore: next });
          })
          .catch((e) => {
              Utils.handleErrorFromAPI(e, localizedStrings.unableToGetChallenges).then(error => this.setState({ error }));
          });
  }

  onDone = () => {
      if (!this.props.isOffline && this.props.filter) AppActions.filterIdeasByChallenge(this.state.selected);
      this.props.onDone(this.state.selected);
      Navigation.dismissModal(this.props.componentId);
  }

  onClear = () => {
      if (!this.props.isOffline) AppActions.filterIdeasByChallenge(null);
      if (this.props.onDone) this.props.onDone(null);
      Navigation.dismissModal(this.props.componentId);
  }

  onChallengeSelected = (challenge) => {
      this.setState({ selected: challenge });
  }

  onTextSearch = (text) => {
      this.setState({ search: text, isLoading: true });
      this.onSearch(text);
  }

  onSearch = _.throttle((text) => {
      data.get(this.endpoint, { q: text })
          .then(({ data: res, page: { next } }) => {
              this.setState({ challenges: res, isLoading: false, hasMore: next });
          })
          .catch((e) => {
              Utils.handleErrorFromAPI(e, localizedStrings.problemCompletingSearch).then(error => this.setState({ errorOnSearch: error }));
          });
  }, 1000);

  onEndReached = () => {
      if (this.props.isOffline || !this.state.hasMore) return;
      data.get(this.state.hasMore)
          .then(({ data: res, page: { next } }) => {
              this.setState({ challenges: _.sortBy(_.unionBy(res, this.state.challenges, 'id'), challenge => -challenge.created), isLoading: false, hasMore: next });
          })
          .catch((e) => {
              Utils.handleErrorFromAPI(e, localizedStrings.problemMoreResults).then(error => this.setState({ errorOnSearch: error, hasMore: null }));
          });
  }

  render() {
      const { state: { challenges, isLoading, selected, search, error, errorOnSearch }, props: { isOffline, DeviceWidth, DeviceHeight } } = this;
      return (
          <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
              <Container style={{ flex: 1 }}>
                  {isOffline ? (
                      <FormGroup style={[Styles.pt20, { marginHorizontal: styleVariables.paddingBase }]}>
                          <Fade autostart value={1} style={Styles.errorWrapper}>
                              <Text style={Styles.errorText}>
                                  {localizedStrings.searchOffline}
                              </Text>
                          </Fade>
                      </FormGroup>
                  ) : (
                      <FormGroup pt20>
                          <ION name="ios-search" size={30} style={Styles.searchInputIcon} />
                          <TextInput
                            placeholder={localizedStrings.search}
                            value={search}
                            onChangeText={this.onTextSearch}
                            style={Styles.searchInputText}
                            editable={!isOffline}
                          />
                          {isLoading ? <Loader containerStyle={Styles.searchInputLoader} /> : null}
                      </FormGroup>
                  )}
                  <ErrorAlert error={errorOnSearch} />
                  {error ? (
                      <FormGroup>
                          <Fade autostart value={1} style={Styles.errorWrapper}>
                              <Text style={Styles.errorText}>
                                  {error === 'Network request failed' ? Constants.errors.NETWORK_REQUEST_FAILED : error}
                              </Text>
                          </Fade>
                      </FormGroup>
                  ) : null}
                  <FlatList
                    style={{ flex: 1 }}
                    data={challenges}
                    renderItem={({ item: challenge }) => (
                        <ListItem
                          key={challenge.id} style={Styles.listItem} onPress={() => this.onChallengeSelected(challenge)}
                          disabled={isLoading}
                        >
                            <Text style={Styles.listItemText}>{challenge.name}</Text>
                            {selected && selected.id === challenge.id ? (
                                <FontAwesome5
                                  style={[Styles.listIcon]}
                                  name="check"
                                />
                            ) : null}
                        </ListItem>
                    )}
                    extraData={this.state}
                    keyExtractor={item => item.id}
                    onEndReached={this.onEndReached}
                    ListEmptyComponent={<H2 style={Styles.textCenter}>{localizedStrings.noResultsFound}</H2>}
                  />

                  <FormGroup pb20>
                      {this.props.challenge && this.props.filter ? (
                          <React.Fragment>
                              <FormGroup pb0>
                                  <Row>
                                      <Flex>
                                          <ButtonPrimary onPress={this.onDone}>{localizedStrings.done}</ButtonPrimary>
                                      </Flex>
                                  </Row>
                              </FormGroup>
                              <FormGroup pb0>
                                  <Row>
                                      <Flex>
                                          <ButtonTertiary onPress={() => Navigation.dismissModal(this.props.componentId)}>{localizedStrings.cancel}</ButtonTertiary>
                                      </Flex>
                                  </Row>
                              </FormGroup>
                              <FormGroup pb0>
                                  <Row>
                                      <Flex>
                                          <ButtonAlt textStyle={{ color: pallette.wazokuDanger }} onPress={this.onClear}>{localizedStrings.clear}</ButtonAlt>
                                      </Flex>
                                  </Row>
                              </FormGroup>
                          </React.Fragment>
                      ) : (
                          <Row>
                              <Flex>
                                  <ButtonPrimary style={Styles.mr5} onPress={this.onDone}>{localizedStrings.done}</ButtonPrimary>
                              </Flex>
                              <Flex>
                                  <ButtonTertiary style={Styles.ml5} onPress={() => Navigation.dismissModal(this.props.componentId)}>{localizedStrings.cancel}</ButtonTertiary>
                              </Flex>
                          </Row>
                      )}
                  </FormGroup>
              </Container>
          </Flex>
      );
  }
}));
