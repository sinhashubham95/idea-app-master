import { Component } from 'react';
import IdeaCommentsStore from '../stores/idea-comments-store';

export default (WrappedComponent) => {
    class withIdeaComments extends Component {
        static displayName = 'withIdeaComments';

        static propTypes = {
        }

        state = {
            isLoading: IdeaCommentsStore.isLoading,
            isSaving: IdeaCommentsStore.isSaving,
            comments: IdeaCommentsStore.getComments(this.props.ideaId),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(IdeaCommentsStore, 'change', () => {
                this.setState({
                    isLoading: IdeaCommentsStore.isLoading,
                    isSaving: IdeaCommentsStore.isSaving,
                    comments: IdeaCommentsStore.getComments(this.props.ideaId),
                    error: IdeaCommentsStore.error,
                });
            });

            this.listenTo(IdeaCommentsStore, 'loaded', () => {
                if (this.wrappedComponent.onIdeaCommentsLoaded) this.wrappedComponent.onIdeaCommentsLoaded();
            });

            this.listenTo(IdeaCommentsStore, 'saved', () => {
                if (this.wrappedComponent.onIdeaCommentsSaved) this.wrappedComponent.onIdeaCommentsSaved();
            });

            this.listenTo(IdeaCommentsStore, 'problem', () => {
                this.setState({
                    isLoading: IdeaCommentsStore.isLoading,
                    isSaving: IdeaCommentsStore.isSaving,
                    error: IdeaCommentsStore.error,
                });
                if (this.wrappedComponent.onError) this.wrappedComponent.onError(IdeaCommentsStore.error);
            });
        }

        componentWillReceiveProps(newProps) {
            if (newProps.ideaId !== this.props.ideaId) {
                AppActions.getIdeaComments(newProps.ideaId);
            }
        }

        hasMore = () => IdeaCommentsStore.hasMoreComments(this.props.ideaId)

        render() {
            const {
                state: { isLoading, isSaving, comments, error },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  error={error}
                  commentsLoading={isLoading}
                  commentsSaving={isSaving}
                  comments={comments}
                  hasMoreComments={this.hasMore}
                />
            );
        }
    }

    return withIdeaComments;
};
