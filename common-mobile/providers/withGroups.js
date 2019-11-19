import { Component } from 'react';
import GroupsStore from '../stores/groups-store';

export default (WrappedComponent) => {
    class withGroups extends Component {
        static displayName = 'withGroups';

        static propTypes = {
        }

        state = {
            isLoading: GroupsStore.isLoading,
            searchResults: GroupsStore.getSearchResults(),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(GroupsStore, 'change', () => {
                this.setState({
                    isLoading: GroupsStore.isLoading,
                    searchResults: GroupsStore.getSearchResults(),
                    error: GroupsStore.error,
                });
            });

            this.listenTo(GroupsStore, 'loaded', () => {
                if (this.wrappedComponent.onGroupsLoaded) this.wrappedComponent.onGroupsLoaded();
            });

            this.listenTo(GroupsStore, 'problem', () => {
                this.setState({
                    isLoading: GroupsStore.isLoading,
                    error: GroupsStore.error,
                });
                if (this.wrappedComponent.onError) this.wrappedComponent.onError(GroupsStore.error);
            });
        }

        onError = (error) => {
            if (this.wrappedComponent.onError) this.wrappedComponent.onError(error);
        }

        render() {
            const {
                state: { isLoading, searchResults, error },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  groupsError={error}
                  groupsLoading={isLoading}
                  groupSearchResults={searchResults}
                />
            );
        }
    }

    return withGroups;
};
