// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

import withUsers from 'providers/withUsers';
import withGroups from 'providers/withGroups';
import UserSearchListItem from 'components/UserSearchListItem';
import GroupSearchListItem from 'components/GroupSearchListItem';


export default withGroups(withUsers(class UserSearchResults extends PureComponent {
    static displayName = 'UserSearchResults';

    static propTypes = {
        componentId: propTypes.string,
        userSearchResults: propTypes.array,
        groupSearchResults: propTypes.array,
        onUserMentionNoResults: propTypes.func,
        onUserSelected: propTypes.func,
        onGroupSelected: propTypes.func,
        selected: propTypes.array,
        selectedGroups: propTypes.array,
        overlay: propTypes.bool,
        onDismiss: propTypes.func,
        keyboardCoords: propTypes.object,
        appearBelowInput: propTypes.bool,
        searchGroups: propTypes.bool,
        onError: propTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            filteredResults: this.getFilteredResults(props),
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ filteredResults: this.getFilteredResults(nextProps) });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.filteredResults.length && !this.state.filteredResults.length) {
            if (this.props.onUserMentionNoResults) this.props.onUserMentionNoResults();
        }
    }

    getFilteredResults = (props) => {
        const { userSearchResults, selected, searchGroups, groupSearchResults, selectedGroups } = props;
        let filteredResults = _.filter(_.differenceWith(userSearchResults, selected, (res, user) => res.display_name === user.display_name), res => res.id !== AccountStore.getUser().id);
        if (searchGroups) {
            filteredResults = filteredResults.concat(_.differenceWith(groupSearchResults, selectedGroups, (res, group) => res.id === group.id));
        }
        return filteredResults;
    }

    onError = (error) => {
        if (this.props.onError) this.props.onError(error);
    }

    render() {
        const { props: { onUserSelected, onDismiss, overlay, appearBelowInput, onGroupSelected }, state: { filteredResults } } = this;
        const list = (
            <React.Fragment>
                <FlatList
                  data={filteredResults}
                  renderItem={({ item }) => {
                      if (item.roles) {
                          return <UserSearchListItem key={item.id} user={item} onUserSelected={() => onUserSelected(item)} />;
                      }
                      return <GroupSearchListItem key={item.id} group={item} onGroupSelected={() => onGroupSelected(item)} />;
                  }}
                  keyExtractor={item => item.id}
                  keyboardShouldPersistTaps="always"
                  nestedScrollEnabled
                  ListEmptyComponent={<Text style={Styles.mb10}>{localizedStrings.noResultsFound}</Text>}
                />
                {filteredResults.length > 4 ? (
                    <LinearGradient
                      style={{ position: 'absolute', bottom: 0, width: '100%', height: 20 }}
                      colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
                      pointerEvents="none"
                    />
                ) : null}
            </React.Fragment>
        );
        if (overlay) {
            if (Platform.OS === 'ios') {
                const keyboardHeight = (this.props.keyboardCoords ? this.props.keyboardCoords.height : 0);
                return filteredResults.length ? (
                    <View style={[Styles.userMentionsOuter, { bottom: keyboardHeight + 80, maxHeight: (DeviceHeight - keyboardHeight) - 140 }]}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onDismiss} />
                        <View style={Styles.userMentionsContainer}>
                            {list}
                        </View>
                    </View>
                ) : null;
            }
            return filteredResults.length ? (
                <View style={Styles.userMentionsOuter}>
                    <KeyboardAvoidingView
                      behavior="padding" enabled
                      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 160}
                    >
                        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onDismiss} />
                        <View style={Styles.userMentionsContainer}>
                            {list}
                        </View>
                    </KeyboardAvoidingView>
                </View>
            ) : null;
        }
        return (
            <View style={[Styles.userSearch, appearBelowInput ? { top: Platform.OS === 'android' ? 100 : 80 } : { bottom: 80 }]}>
                {list}
            </View>
        );
    }
}));
