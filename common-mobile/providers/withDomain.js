import { Component } from 'react';
import DomainStore from '../stores/domain-store';

export default (WrappedComponent) => {
    class withDomain extends Component {
        static displayName = 'withDomain';

        state = {
            domainConfig: DomainStore.getDomainConfig(),
            domainLoading: DomainStore.isLoading,
        };

        componentDidMount() {
            ES6Component(this);
            this.listenTo(DomainStore, 'loaded', () => {
                if (this.wrappedComponent.onDomainLoaded) this.wrappedComponent.onDomainLoaded(DomainStore.getDomainConfig());
                this.setState({
                    domainConfig: DomainStore.getDomainConfig(),
                    domainLoading: false,
                });
            });
            this.listenTo(DomainStore, 'loading', () => {
                this.setState({ domainLoading: true });
            });
            this.listenTo(DomainStore, 'problem', () => {
                this.setState({ domainLoading: false, error: DomainStore.error });
            });
        }

        onDomainSignIn = (domain) => {
            this.setState({ error: '' });
            AppActions.getDomain(domain);
        }

        onLogin = () => {
            if (this.wrappedComponent.onLogin) this.wrappedComponent.onLogin();
        }

        onError = (error) => {
            this.setState({ error });
            if (this.wrappedComponent.onError) this.wrappedComponent.onError(error);
        }

        isSAMLEnabled = () => DomainStore.isSAMLEnabled()

        render() {
            const { state: { domainConfig, domainLoading, error } } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  domainConfig={domainConfig}
                  domainLoading={domainLoading}
                  onDomainSignIn={this.onDomainSignIn}
                  error={error}
                  isSAMLEnabled={this.isSAMLEnabled}
                />
            );
        }
    }

    return withDomain;
};