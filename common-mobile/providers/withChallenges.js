import { Component } from 'react';
import ChallengesStore from '../stores/challenges-store';

export default (WrappedComponent) => {
    class withChallenges extends Component {
        static displayName = 'withChallenges';

        static propTypes = {
        }

        state = {
            isLoading: ChallengesStore.isLoading,
            challenges: ChallengesStore.getChallenges(),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(ChallengesStore, 'change', () => {
                this.setState({
                    isLoading: ChallengesStore.isLoading,
                    challenges: ChallengesStore.getChallenges(),
                    error: ChallengesStore.error,
                });
            });

            this.listenTo(ChallengesStore, 'loaded', () => {
                if (this.wrappedComponent.onChallengesLoaded) this.wrappedComponent.onChallengesLoaded();
            });

            this.listenTo(ChallengesStore, 'problem', () => {
                this.setState({
                    isLoading: ChallengesStore.isLoading,
                    error: ChallengesStore.error,
                });
                if (this.wrappedComponent.onError) this.wrappedComponent.onError(ChallengesStore.error);
            });
        }

        hasMore = () => ChallengesStore.hasMoreChallenges();

        render() {
            const {
                state: { isLoading, challenges, error },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  error={error}
                  challengesLoading={isLoading}
                  challenges={challenges}
                  hasMoreChallenges={this.hasMore}
                />
            );
        }
    }

    return withChallenges;
};
