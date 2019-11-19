import React, { Component } from 'react';
import TagInput from 'react-native-tag-input';

import data from 'stores/base/_data';
import ErrorAlert from 'components/ErrorAlert';
import UserSearch from 'components/UserSearch';
import withOrientation from 'providers/withOrientation';

const ShareModal = class extends Component {
    static displayName = 'ShareModal';

    static propTypes = {
        type: propTypes.string,
        id: propTypes.string,
        DeviceWidth: propTypes.number,
        DeviceHeight: propTypes.number,
    };

    state = {
        message: '',
        search: '',
        users: [],
        groups: [],
    };

    onUserSelected = (user) => {
        const users = this.state.users;
        users.push(user);
        AppActions.clearUserSearch();
        AppActions.clearGroupSearch();
        this.setState({ users, searching: false, search: '' });
    }

    onGroupSelected = (group) => {
        const groups = this.state.groups;
        groups.push(group);
        AppActions.clearUserSearch();
        AppActions.clearGroupSearch();
        this.setState({ groups, searching: false, search: '' });
    }

    onSearchChangeText = (text) => {
        const state = { search: text };
        if (text.length) {
            AppActions.searchUsers(text);
            AppActions.searchGroups(text);
            if (!this.state.searching) {
                state.searching = true;
            }
        } else {
            AppActions.clearUserSearch();
            AppActions.clearGroupSearch();
            this.setState({ searching: false });
        }
        this.setState(state);
    }

    onSearchFocus = () => {
        const state = {};
        const search = this.state.search;
        if (search && search.length && !this.state.searching) {
            state.searching = true;
        }
        if (Platform.OS === 'android') {
            state.scrollDisabled = true;
        }
        if (_.keys(state).length > 0) this.setState(state);
    }

    onSearchBlur = () => {
        const state = {};
        if (this.state.searching) {
            state.searching = false;
        }
        if (Platform.OS === 'android') {
            state.scrollDisabled = false;
        }
        if (_.keys(state).length > 0) this.setState(state);
    }

    onTagsChange = (newResults) => {
        const { users, groups } = this.state;
        const results = users.concat(groups);
        // Get which user or group was removed
        const itemToDelete = _.differenceWith(results, newResults)[0];
        // Update the appropriate array
        if (itemToDelete.roles) {
            _.remove(users, user => user.id === itemToDelete.id);
            this.setState({ users });
        } else {
            _.remove(groups, group => group.id === itemToDelete.id);
            this.setState({ groups });
        }
    }

    canSave = () => {
        const { users, groups, message } = this.state;
        return (users.length || groups.length) && message.length;
    }

    share = () => {
        const { state: { users, groups, message }, props: { id, type } } = this;
        const group_names = _.map(groups, 'name');
        const user_emails = _.map(users, 'email');
        if (NetworkStore.isOffline()) {
            Navigation.dismissModal(this.props.componentId);
            AppActions.addOfflineAction('SHARE', { groupId: id, entityType: type, group_names, user_emails, message });
            return;
        }
        this.setState({ error: '', isSaving: true });
        data.post(`${Project.api}${type}/${id}/share`, { group_names, user_emails, message })
            .then(() => {
                Navigation.dismissModal(this.props.componentId);
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    AppActions.addOfflineAction('SHARE', { groupId: id, entityType: type, group_names, user_emails, message });
                    Navigation.dismissModal(this.props.componentId);
                    return;
                }
                this.setState({ isSaving: false });
                Utils.handleErrorFromAPI(e, localizedStrings.formatString(localizedStrings.shareFailed, type.substr(0, type.length - 1))).then(error => this.setState({ error }));
            });
    }

    onKeyboardDidHide = () => {
        if (this.state.searching) this.setState({ searching: false });
    }

    render() {
        const { message, isSaving, error, search, users, groups, searching, scrollDisabled } = this.state;
        const { DeviceWidth, DeviceHeight } = this.props;
        const results = users.concat(groups);
        return (
            <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
                <ErrorAlert error={error} />
                <KeyboardAwareScrollView
                  keyboardShouldPersistTaps="handled"
                  scrollEnabled={!scrollDisabled}
                  onKeyboardDidHide={this.onKeyboardDidHide}
                >
                    <Container style={{ flex: 1 }}>
                        <FormGroup>
                            <FormGroup>
                                <Text style={Styles.inputLabel}>{localizedStrings.to}</Text>
                            </FormGroup>
                            <TextInput
                              placeholder={localizedStrings.searchForUsersOrGroups}
                              onChangeText={text => this.onSearchChangeText(text)}
                              value={search}
                              onFocus={this.onSearchFocus}
                              onBlur={this.onSearchBlur}
                            />
                            {results && results.length ? (
                                <TagInput
                                  value={results}
                                  onChange={this.onTagsChange}
                                  labelExtractor={item => (item.roles ? item.display_name : item.name)}
                                  text=""
                                  onChangeText={() => {}}
                                  inputProps={{ placeholder: '' }}
                                  tagContainerStyle={Styles.tagContainer}
                                  tagTextStyle={Styles.tagText}
                                  textInputContainerStyle={[{ height: 60, marginBottom: 0, justifyContent: 'center' }]}
                                  textInputStyle={[Styles.textInput, { paddingVertical: 5 }]}
                                  flex
                                  hideInput
                                  tagCloseIcon={<FontAwesome5 style={{ marginLeft: 10 }} name="times" size={15} />}
                                />
                            ) : null}
                        </FormGroup>

                        {searching ? (
                            <UserSearch
                              onUserSelected={user => this.onUserSelected(user)} selected={users} appearBelowInput
                              onGroupSelected={group => this.onGroupSelected(group)} selectedGroups={groups}
                              searchGroups
                              onError={userSearchError => this.setState({ error: userSearchError })}
                            />
                        ) : null}

                        <FormGroup pb0>
                            <TextInput
                              placeholder={localizedStrings.message}
                              value={message}
                              onChangeText={text => this.setState({ message: text })}
                              multiline
                              numberOfLines={20}
                              style={{ height: DeviceHeight / 4 }}
                            />
                        </FormGroup>


                        <FormGroup style={Styles.mt10}>
                            <Row>
                                <Flex>
                                    <ButtonTertiary style={Styles.mr5} disabled={isSaving} onPress={() => Navigation.dismissModal(this.props.componentId)}>{localizedStrings.cancel}</ButtonTertiary>
                                </Flex>
                                <Flex>
                                    <ButtonPrimary style={Styles.ml5} disabled={isSaving || !this.canSave()} onPress={this.share}>{isSaving ? localizedStrings.sharing : localizedStrings.share}</ButtonPrimary>
                                </Flex>
                            </Row>
                        </FormGroup>
                    </Container>
                </KeyboardAwareScrollView>
            </Flex>
        );
    }
};

module.exports = withOrientation(ShareModal);
