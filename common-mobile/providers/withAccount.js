import { Component } from 'react';
import AccountStore from '../stores/account-store';

const Url = require('url-parse');

export default (WrappedComponent) => {
    class withAccount extends Component {
        static displayName = 'withAccount';

        static propTypes = {
            children: propTypes.func,
            onLogin: propTypes.func,
            onLogout: propTypes.func,
            onSave: propTypes.func,
        }

        state = {
            isLoading: AccountStore.isLoading,
            user: AccountStore.getUser(),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(AccountStore, 'change', () => {
                this.setState({
                    isLoading: AccountStore.isLoading,
                    isSaving: AccountStore.isSaving,
                    user: AccountStore.getUser(),
                    error: AccountStore.error,
                });
            });

            this.listenTo(AccountStore, 'loaded', () => {
                if (this.wrappedComponent.onLogin) this.wrappedComponent.onLogin();
            });

            this.listenTo(AccountStore, 'saved', () => {
                if (this.wrappedComponent.onSave) this.wrappedComponent.onSave(AccountStore.savedId);
            });

            this.listenTo(AccountStore, 'logout', () => {
                this.setState({
                    isLoading: false,
                    isSaving: false,
                    user: AccountStore.getUser(),
                });
                if (this.wrappedComponent.onLogout) this.wrappedComponent.onLogout();
            });

            this.listenTo(AccountStore, 'problem', () => {
                this.setState({
                    isLoading: AccountStore.isLoading,
                    isSaving: AccountStore.isSaving,
                    error: AccountStore.error,
                });
                if (this.wrappedComponent.onError && AccountStore.error) this.wrappedComponent.onError(AccountStore.error);
                if (this.wrappedComponent.onFormDataError) this.wrappedComponent.onFormDataError(AccountStore.formDataError);
            });

            this.listenTo(AccountStore, 'resentActivationCode', () => {
                Alert.alert(localizedStrings.activationEmailResent, localizedStrings.activationEmailResentMsg);
            });
        }


        login = (details) => {
            this.setState({ error: '' });
            AppActions.login(details);
        };

        register = (domain, formData) => {
            this.setState({ error: '' });
            AppActions.register(domain, formData);
        };

        loginWithSSO = (domain) => {
            this.setState({ error: '' });
            const url = new Url(Project.api);
            Navigation.showModal(routes.ssoLoginModal(`https://${domain.substr(0, domain.indexOf('.'))}${url.hostname.substr(url.hostname.indexOf('.'))}/saml_ol/login?redirect_to=/api/v1/user/mobile/app-link-token/login`, this.onSSOError));
        }

        onSSOError = (error) => {
            this.setState({ error });
            if (this.wrappedComponent.onError) this.wrappedComponent.onError(error);
        }

        render() {
            const {
                state: { isLoading, isSaving, user, error },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  error={error}
                  accountLoading={isLoading}
                  accountSaving={isSaving}
                  user={user}
                  login={this.login}
                  loginWithSSO={this.loginWithSSO}
                  register={this.register}
                />
            );
        }
    }

    return withAccount;
};
