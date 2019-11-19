import propTypes from 'prop-types';
import { WebView } from 'react-native-webview';

import withOrientation from 'providers/withOrientation';
import withAccount from 'providers/withAccount';

const Url = require('url-parse');

const SSOLoginModal = withOrientation(withAccount(class extends React.PureComponent {
    static displayName = 'WebModal'

    static propTypes = {
        componentId: propTypes.string,
        uri: propTypes.string.isRequired,
        onError: propTypes.func,
        DeviceWidth: propTypes.number,
        DeviceHeight: propTypes.number,
    }

    onNavigatorEvent(event) { // todo
        if (event.id === 'close' || event.id === 'back') {
            Navigation.dismissModal(this.props.componentId);
        } else {
            this.refs.webview.goBack();
        }
    }

    onShouldStartLoadWithRequest = (request) => {
        if (request.url.indexOf('wazoku://') !== -1) {
            // Get the token and user id
            const url = new Url(request.url);
            const parts = url.pathname.split('/');
            if (parts.length < 7) {
                Navigation.dismissModal(this.props.componentId);
                if (this.props.onError) this.props.onError(localizedStrings.sorrySomethingWentWrong);
                return;
            }
            const userId = parts[4];
            const token = parts[6];
            if (!token || !userId) {
                Navigation.dismissModal(this.props.componentId);
                if (this.props.onError) this.props.onError(localizedStrings.sorrySomethingWentWrong);
                return;
            }
            AppActions.ssoLogin(userId, token);
            this.setState({ loggingIn: true });
            return false;
        }
        return true;
    }

    onError = (e) => {
        const code = e.nativeEvent.code;
        setTimeout(() => {
            Navigation.dismissModal(this.props.componentId);
            switch (code) {
                case -2: // Internet disconnected
                    if (this.props.onError) this.props.onError(Constants.errors.NETWORK_REQUEST_FAILED);
                    break;
                default:
                    if (this.props.onError) this.props.onError(localizedStrings.sorrySomethingWentWrong);
            }
        }, 250);
    }

    onLogin = () => {
        Navigation.dismissModal(this.props.componentId);
    }

    render() {
        const { DeviceWidth, DeviceHeight } = this.props;
        return (
            <Flex style={{ width: DeviceWidth, height: DeviceHeight }}>
                <WebView
                  onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                  ref="webview"
                  style={{ flex: 1 }}
                  source={{ uri: this.props.uri }}
                  scalesPageToFit
                  cacheEnabled={false}
                  useWebKit
                  incognito
                  onError={this.onError}
                  startInLoadingState
                  renderError={() => <Flex style={Styles.centeredContainer}><Loader /></Flex>}
                  renderLoading={() => <Flex style={Styles.centeredContainer}><Loader /></Flex>}
                />
            </Flex>
        );
    }
}));

export default SSOLoginModal;
