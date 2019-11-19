import { Component } from 'react';
import withNetwork from 'providers/withNetwork';
import ChallengeFormsStore from '../stores/challenge-forms-store';


export default (WrappedComponent) => {
    class withChallengeForms extends Component {
        static displayName = 'withChallengeForms';

        static propTypes = {
            challengeId: propTypes.string,
        }

        constructor(props) {
            super(props);
            this.state = {
                isLoading: ChallengeFormsStore.isLoading,
                forms: props.challengeId ? ChallengeFormsStore.getForms(props.challengeId) : undefined,
                challengeId: props.challengeId,
            };
        }

        componentDidMount() {
            ES6Component(this);

            this.listenTo(ChallengeFormsStore, 'change', () => {
                let error = ChallengeFormsStore.error;
                if (error === 'Network request failed' && ChallengeFormsStore.getForms(this.state.challengeId)) { // Silently drop offline error if we have the questions locally
                    error = '';
                }
                this.setState({
                    isLoading: ChallengeFormsStore.isLoading,
                    forms: ChallengeFormsStore.getForms(this.state.challengeId),
                    error,
                });
            });

            this.listenTo(ChallengeFormsStore, 'loaded', () => {
                if (this.wrappedComponent.onChallengeFormsLoaded) this.wrappedComponent.onChallengeFormsLoaded();
            });

            this.listenTo(ChallengeFormsStore, 'problem', () => {
                let error = ChallengeFormsStore.error;
                if (error === 'Network request failed') {
                    if (ChallengeFormsStore.getForms(this.state.challengeId)) {
                        error = ''; // Silently drop offline error if we have the questions locally
                    } else {
                        error = localizedStrings.challengeFormOfflineError;
                    }
                }
                this.setState({
                    isLoading: ChallengeFormsStore.isLoading,
                    error,
                });
                if (this.wrappedComponent.onChallengeFormsError) this.wrappedComponent.onChallengeFormsError(error);
            });
        }

        getForms = (id) => {
            if (!this.props.isOffline) {
                AppActions.getChallengeForms(id);
            }
            this.setState({ challengeId: id, forms: ChallengeFormsStore.getForms(id) });
        }

        onNetworkChange = (isOnline) => {
            if (this.wrappedComponent.onNetworkChange) this.wrappedComponent.onNetworkChange(isOnline);
        }

        render() {
            const {
                state: { isLoading, forms, error },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  formsError={error}
                  formsLoading={isLoading}
                  forms={forms}
                  getForms={this.getForms}
                />
            );
        }
    }

    return withNetwork(withChallengeForms);
};
