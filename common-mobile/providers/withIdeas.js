import { Component } from 'react';
import IdeasStore from '../stores/ideas-store';

export default (WrappedComponent) => {
    class withIdeas extends Component {
        static displayName = 'withIdeas';

        static propTypes = {
        }

        state = {
            isLoading: IdeasStore.isLoading,
            isSaving: IdeasStore.isSaving,
            ideas: IdeasStore.getIdeas(),
            ideasSearch: IdeasStore.getSearch(),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(IdeasStore, 'change', () => {
                this.setState({
                    isLoading: IdeasStore.isLoading,
                    isSaving: IdeasStore.isSaving,
                    ideas: IdeasStore.getIdeas(),
                    ideasSearch: IdeasStore.getSearch(),
                    error: IdeasStore.error,
                });
            });

            this.listenTo(IdeasStore, 'loaded', () => {
                if (this.wrappedComponent.onIdeasLoaded) this.wrappedComponent.onIdeasLoaded();
            });

            this.listenTo(IdeasStore, 'saved', () => {
                if (this.wrappedComponent.onIdeasSaved) this.wrappedComponent.onIdeasSaved(IdeasStore.savedIdea);
            });

            this.listenTo(IdeasStore, 'problem', () => {
                this.setState({
                    isLoading: IdeasStore.isLoading,
                    isSaving: IdeasStore.isSaving,
                    error: IdeasStore.error,
                });
                if (this.wrappedComponent.onError) this.wrappedComponent.onError(IdeasStore.error);
            });

            this.listenTo(IdeasStore, 'team-requested', () => {
                if (this.wrappedComponent.onTeamRequested) this.wrappedComponent.onTeamRequested();
            });
        }

        hasMore = () => IdeasStore.hasMoreIdeas();

        onNetworkChange = (isOnline) => {
            if (this.wrappedComponent.onNetworkChange) this.wrappedComponent.onNetworkChange(isOnline);
        }

        render() {
            const {
                state: { isLoading, isSaving, ideas, ideasSearch, error },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  error={error}
                  ideasLoading={isLoading}
                  ideasSaving={isSaving}
                  ideas={ideas}
                  ideasSearch={ideasSearch}
                  hasMoreIdeas={this.hasMore}
                />
            );
        }
    }

    return withIdeas;
};
