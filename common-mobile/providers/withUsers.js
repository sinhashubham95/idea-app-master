import { Component } from 'react';
import UsersStore from '../stores/users-store';

export default (WrappedComponent) => {
    class withUsers extends Component {
        static displayName = 'withUsers';

        static propTypes = {
        }

        state = {
            isLoading: UsersStore.isLoading,
            searchResults: UsersStore.getSearchResults(),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(UsersStore, 'change', () => {
                this.setState({
                    isLoading: UsersStore.isLoading,
                    searchResults: UsersStore.getSearchResults(),
                    error: UsersStore.error,
                });
            });

            this.listenTo(UsersStore, 'loaded', () => {
                if (this.wrappedComponent.onUsersLoaded) this.wrappedComponent.onUsersLoaded();
            });

            this.listenTo(UsersStore, 'problem', () => {
                this.setState({
                    isLoading: UsersStore.isLoading,
                    error: UsersStore.error,
                });
                if (this.wrappedComponent.onError) this.wrappedComponent.onError(UsersStore.error);
            });
        }

        getUserByDisplayName = displayName => UsersStore.getUserByDisplayName(displayName)

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
                  usersError={error}
                  usersLoading={isLoading}
                  userSearchResults={searchResults}
                  getUserByDisplayName={this.getUserByDisplayName}
                />
            );
        }
    }

    return withUsers;
};
