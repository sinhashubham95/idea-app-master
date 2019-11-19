import { Component } from 'react';
import MyIdeasStore from '../stores/my-ideas-store';

export default (WrappedComponent) => {
    class withMyIdeas extends Component {
        static displayName = 'withMyIdeas';

        static propTypes = {
        }

        state = {
            isLoading: MyIdeasStore.isLoading,
            isSaving: MyIdeasStore.isSaving,
            myIdeas: MyIdeasStore.getIdeas(),
            drafts: MyIdeasStore.getDrafts(),
            publishedIdeas: MyIdeasStore.getPublished(),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(MyIdeasStore, 'change', () => {
                this.setState({
                    isLoading: MyIdeasStore.isLoading,
                    isSaving: MyIdeasStore.isSaving,
                    myIdeas: MyIdeasStore.getIdeas(),
                    drafts: MyIdeasStore.getDrafts(),
                    publishedIdeas: MyIdeasStore.getPublished(),
                    error: MyIdeasStore.error,
                });
            });

            this.listenTo(MyIdeasStore, 'loaded', () => {
                if (this.wrappedComponent.onMyIdeasLoaded) this.wrappedComponent.onMyIdeasLoaded();
            });

            this.listenTo(MyIdeasStore, 'saved', () => {
                if (this.wrappedComponent.onMyIdeasSaved) this.wrappedComponent.onMyIdeasSaved(MyIdeasStore.savedIdea);
            });

            this.listenTo(MyIdeasStore, 'problem', () => {
                this.setState({
                    isLoading: MyIdeasStore.isLoading,
                    isSaving: MyIdeasStore.isSaving,
                    error: MyIdeasStore.error,
                });
                if (this.wrappedComponent.onError) this.wrappedComponent.onError(MyIdeasStore.error);
                if (this.wrappedComponent.onFormDataError) this.wrappedComponent.onFormDataError(MyIdeasStore.formDataError);
            });
        }

        hasMoreIdeas = () => MyIdeasStore.hasMoreIdeas();

        hasMoreDrafts = () => MyIdeasStore.hasMoreDrafts();

        onChallengeFormsError = (error) => {
            if (this.wrappedComponent.onChallengeFormsError) this.wrappedComponent.onChallengeFormsError(error);
        }

        onNetworkChange = (isOnline) => {
            if (this.wrappedComponent.onNetworkChange) this.wrappedComponent.onNetworkChange(isOnline);
        }

        render() {
            const {
                state: { isLoading, isSaving, myIdeas, drafts, publishedIdeas, error },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  error={error}
                  myIdeasLoading={isLoading}
                  myIdeasSaving={isSaving}
                  myIdeas={myIdeas}
                  publishedIdeas={publishedIdeas}
                  drafts={drafts}
                  hasMoreMyIdeas={this.hasMoreIdeas}
                  hasMoreMyDrafts={this.hasMoreDrafts}
                />
            );
        }
    }

    return withMyIdeas;
};
