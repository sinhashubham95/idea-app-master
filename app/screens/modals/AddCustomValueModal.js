import React, { Component } from 'react';
import SQLite from 'react-native-sqlite-storage';

import data from 'stores/base/_data';
import { ButtonPrimary, ButtonTertiary, ButtonSecondary } from 'components/base/forms/Button';
import ErrorAlert from 'components/ErrorAlert';
import Checkbox from 'components/base/forms/Checkbox';
import withNetwork from 'providers/withNetwork';
import withOrientation from 'providers/withOrientation';

SQLite.enablePromise(true);

const OFFLINE_DB_RESULTS_PAGESIZE = 100;

export default withOrientation(withNetwork(class extends Component {
  static displayName = 'AddCustomValue';

  static propTypes = {
      componentId: propTypes.string,
      selected: propTypes.object,
      fieldId: propTypes.string.isRequired,
      onDone: propTypes.func.isRequired,
      challengeId: propTypes.string.isRequired,
      isOffline: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
  }

  state = {
      isLoading: true,
      selected: this.props.selected || {},
  };

  endpoint = `${Project.api}forms/custom-field/${this.props.fieldId}/values?page_size=1000`;

  componentDidMount() {
      if (this.props.isOffline) {
          SQLite.openDatabase({ name: 'custom-fields.db', key: SecuredStorage.localStorageKey })
              .then((db) => {
                  this.db = db;
                  db.transaction((tx) => {
                      tx.executeSql(`SELECT * FROM "${this.props.fieldId}" WHERE visible_only_to_challenges LIKE '%${this.props.challengeId}%' LIMIT ${OFFLINE_DB_RESULTS_PAGESIZE}`, [], (tx, results) => {
                          console.log('Query completed');

                          // Get rows with Web SQL Database spec compliance.

                          const len = results.rows.length;
                          const values = [];
                          for (let i = 0; i < len; i++) {
                              const row = results.rows.item(i);
                              values.push({ id: row.id, value: JSON.parse(row.value), visible_only_to_challenges: JSON.parse(row.visible_only_to_challenges) });
                          }
                          this.setState({ values, isLoading: false, hasMore: OFFLINE_DB_RESULTS_PAGESIZE });
                      });
                  });
              })
              .catch((e) => {
                  this.setState({ error: localizedStrings.failedLoadingOfflineCustomValues, isLoading: false });
                  console.log('Error retrieving custom field values from database', e);
              });
          return;
      }
      data.get(this.endpoint)
          .then(({ data: res, page: { next } }) => {
              const values = this.filterResultsByChallenge(res);
              if (!values.length && next) {
                  this.loadMore(next);
                  return;
              }
              this.setState({ values, isLoading: false, hasMore: next });
          })
          .catch((e) => {
              console.log(e);
              Utils.handleErrorFromAPI(e, localizedStrings.unableToGetCustomValues).then(error => this.setState({ error }));
          });
  }

  componentWillUnmount() {
      if (this.db) this.db.close();
  }

  onDone = () => {
      this.props.onDone(this.state.selected);
      Navigation.dismissModal(this.props.componentId);
  }

  onValuePressed = (value) => {
      const selected = this.state.selected;
      if (!selected[value.id]) {
          selected[value.id] = value;
      } else {
          delete selected[value.id];
      }
      this.setState({ selected });
  }

  onTextSearch = (text) => {
      this.setState({ search: text, isLoading: true });
      this.onSearch(text);
  }

  onSearch = _.throttle((text) => {
      const { fieldId } = this.props;
      if (this.props.isOffline) {
          if (this.db) {
              this.db.readTransaction((tx) => {
                  tx.executeSql(`SELECT COUNT(*) FROM "${fieldId}" WHERE visible_only_to_challenges LIKE '%${this.props.challengeId}%'${text ? ` AND value LIKE '%${text}%'` : ''}`, [], (tx, countResults) => {
                      const count = countResults.rows.item(0)['COUNT(*)'];
                      tx.executeSql(`SELECT * FROM "${fieldId}" WHERE visible_only_to_challenges LIKE '%${this.props.challengeId}%'${text ? ` AND value LIKE '%${text}%' ` : ''}LIMIT ${OFFLINE_DB_RESULTS_PAGESIZE}`, [], (tx, results) => {
                          // Get rows with Web SQL Database spec compliance.

                          const len = results.rows.length;
                          const values = [];
                          for (let i = 0; i < len; i++) {
                              const row = results.rows.item(i);
                              values.push({ id: row.id, value: JSON.parse(row.value), visible_only_to_challenges: JSON.parse(row.visible_only_to_challenges) });
                          }

                          this.setState({ values, isLoading: false, hasMore: count > OFFLINE_DB_RESULTS_PAGESIZE ? OFFLINE_DB_RESULTS_PAGESIZE : false });
                      });
                  });
              });
          }
          return;
      }
      this.setState({ isLoading: true });
      data.get(this.endpoint, { q: text })
          .then(({ data: res, page: { next } }) => {
              const values = this.filterResultsByChallenge(res);
              if (!values.length && next) {
                  this.loadMore(next);
                  return;
              }
              this.setState({ values, isLoading: false, hasMore: next });
          })
          .catch((e) => {
              Utils.handleErrorFromAPI(e, localizedStrings.problemCompletingSearch).then(error => this.setState({ errorOnSearch: error }));
          });
  }, 1000);

  filterResultsByChallenge = res => _.filter(res, ({ visible_only_to_challenges }) => visible_only_to_challenges.indexOf(this.props.challengeId) !== -1)

  loadMore = (next) => {
      data.get(next)
          .then(({ data: res, page: { next: nextUrl } }) => {
              const values = this.filterResultsByChallenge(res);
              if (!values.length && nextUrl) {
                  this.loadMore(nextUrl);
                  return;
              }
              this.setState({ values: _.unionBy(values, this.state.values || [], 'id'), isLoading: false, hasMore: nextUrl });
          })
          .catch((e) => {
              Utils.handleErrorFromAPI(e, localizedStrings.problemMoreResults).then(error => this.setState({ errorOnSearch: error, hasMore: null }));
          });
  }

  onEndReached = () => {
      if (!this.state.hasMore || this.state.isLoading) return;
      const { fieldId } = this.props;
      if (this.props.isOffline) {
          if (this.db) {
              this.setState({ isLoading: true });
              this.db.readTransaction((tx) => {
                  tx.executeSql(`SELECT COUNT(*) FROM "${fieldId}" WHERE visible_only_to_challenges LIKE '%${this.props.challengeId}%'${this.state.search ? ` AND value LIKE '%${this.state.search}%' ` : ''}`, [], (tx, countResults) => {
                      const count = countResults.rows.item(0)['COUNT(*)'];
                      tx.executeSql(`SELECT * FROM "${fieldId}" WHERE visible_only_to_challenges LIKE '%${this.props.challengeId}%' ${this.state.search ? `AND value LIKE '%${this.state.search}%' ` : ''}LIMIT ${OFFLINE_DB_RESULTS_PAGESIZE} OFFSET ${this.state.hasMore}`, [], (tx, results) => {
                          console.log('Query completed');

                          // Get rows with Web SQL Database spec compliance.

                          const len = results.rows.length;
                          const values = [];
                          for (let i = 0; i < len; i++) {
                              const row = results.rows.item(i);
                              values.push({ id: row.id, value: JSON.parse(row.value), visible_only_to_challenges: JSON.parse(row.visible_only_to_challenges) });
                          }
                          this.setState({ values: _.unionBy(values, this.state.values, 'id'), isLoading: false, hasMore: count > this.state.hasMore + OFFLINE_DB_RESULTS_PAGESIZE ? this.state.hasMore + OFFLINE_DB_RESULTS_PAGESIZE : false });
                      });
                  });
              })
                  .catch((e) => {
                      console.log('Failed to grab more offline car parts', e);
                      this.setState({ errorOnSearch: localizedStrings.problemMoreResults, isLoading: false });
                  });
          }
          return;
      }
      this.setState({ isLoading: true });
      data.get(this.state.hasMore)
          .then(({ data: res, page: { next } }) => {
              this.setState({ values: _.unionBy(this.filterResultsByChallenge(res), this.state.values, 'id'), isLoading: false, hasMore: next });
          })
          .catch((e) => {
              Utils.handleErrorFromAPI(e, localizedStrings.problemMoreResults).then(error => this.setState({ errorOnSearch: error, hasMore: null }));
          });
  }

  render() {
      const { state: { values, isLoading, selected, search, error, errorOnSearch }, props: { DeviceWidth, DeviceHeight, isOffline } } = this;
      return (
          <Flex style={[Styles.body, { DeviceWidth, DeviceHeight }]}>
              <Container style={{ flex: 1 }}>
                  <FormGroup pt20>
                      <ION name="ios-search" size={30} style={Styles.searchInputIcon} />
                      <TextInput
                        placeholder={localizedStrings.filterResults}
                        value={search}
                        onChangeText={this.onTextSearch}
                        style={Styles.searchInputText}
                      />
                      {isLoading ? <Loader containerStyle={Styles.searchInputLoader} /> : null}
                  </FormGroup>
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
                  {values ? values.length ? (
                      <FlatList
                        style={{ flex: 1 }}
                        data={values}
                        renderItem={({ item: value }) => (
                            <ListItem
                              key={value.id.toString()} style={Styles.listItem} onPress={() => this.onValuePressed(value)}
                              disabled={isLoading}
                            >
                                <Checkbox style={{ marginRight: 10 }} value={!!selected[value.id]} />
                                {_.map(value.value, (row, index) => (
                                    <Flex key={index} value={index === 2 ? 4 : 1}><Text style={Styles.listItemText}>{row}</Text></Flex>
                                ))}
                            </ListItem>
                        )}
                        extraData={this.state}
                        keyExtractor={item => item.id.toString()}
                        onEndReached={this.onEndReached}
                      />
                  ) : <Text>{localizedStrings.noResultsFound}</Text> : null}

                  <FormGroup pb20>
                      <Row>
                          <Flex>
                              <ButtonTertiary style={Styles.mr5} onPress={() => Navigation.dismissModal(this.props.componentId)}>{localizedStrings.cancel}</ButtonTertiary>
                          </Flex>
                          <Flex>
                              <ButtonPrimary style={Styles.ml5} onPress={this.onDone} disabled={!_.keys(selected).length}>{localizedStrings.done}</ButtonPrimary>
                          </Flex>
                      </Row>
                  </FormGroup>
              </Container>
          </Flex>
      );
  }
}));
