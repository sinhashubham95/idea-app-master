import { Component } from 'react';
import AutoHeightImage from 'react-native-auto-height-image';

import withDomain from 'providers/withDomain';
import withAccount from 'providers/withAccount';

import ErrorAlert from 'components/ErrorAlert';
import withOrientation from 'providers/withOrientation';

export default withOrientation(withAccount(withDomain(class extends Component {
  static displayName = 'DomainScreen';

  static propTypes = {
      componentId: propTypes.string,
      onDomainSignIn: propTypes.func,
      domainLoading: propTypes.bool,
      error: propTypes.string,
      loginWithSSO: propTypes.func,
      isTablet: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
      domainConfig: propTypes.object,
  }

  state = {
      domain: '',
  };

  componentWillMount() {
      if (!this.state.domain) {
          AsyncStorage.getItem('last-domain', (err, res) => {
              if (err || !res) return;
              this.setState({ domain: res });
          });
      }
  }

  componentDidMount() {
      if (global.showSecurityAlert) {
          Alert.alert('', 'Device security has been upgraded. You will need to log in again.');
      }
  }

  onDomainLoaded = (config) => {
      if (config.show_login_form) {
          Navigation.push(this.props.componentId, routes.loginScreen());
      } else {
          this.props.loginWithSSO(config.domain);
      }
  }

  onLogin = () => {
      if (!this.props.domainConfig.show_login_form) {
          routes.goToDashboard();
      }
  }

  render() {
      const { state: { domain }, props: { onDomainSignIn, domainLoading, error, isTablet, DeviceWidth, DeviceHeight } } = this;
      return (
          <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
              <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
                  <Container style={isTablet ? { maxWidth: DeviceWidth / 2, alignSelf: 'center' } : null}>
                      <FormGroup pb20 style={[Styles.textCenter, { marginTop: 50 }]}>
                          <AutoHeightImage
                            source={require('../images/Idea_App_Logo_Colour_RGB.png')}
                            style={Styles.brandOrganisationImage}
                            width={isTablet ? DeviceWidth * 0.3 : DeviceWidth * 0.4}
                          />
                      </FormGroup>

                      <Fade autostart value={1}>
                          <FormGroup>
                              <H1 style={[Styles.textCenter]}>{localizedStrings.whatDomainName}</H1>
                          </FormGroup>
                      </Fade>

                      <Fade autostart delay={250} value={1}>
                          <FormGroup>
                              <TextInput
                                title={localizedStrings.organisationDomain}
                                value={domain}
                                onChangeText={text => this.setState({ domain: text.trim().toLowerCase() })}
                                autoCapitalize="none"
                                autoCorrect={false}
                              />
                          </FormGroup>
                      </Fade>

                      <ErrorAlert error={error === 'Network request failed' ? Constants.errors.NETWORK_REQUEST_FAILED : error === 'Not found.' ? Constants.errors.DOMAIN_NOT_FOUND : error} />

                      <Fade autostart delay={500} value={1}>
                          <FormGroup>
                              <ButtonPrimary onPress={() => onDomainSignIn(domain)} disabled={!domain || domainLoading}>{!domainLoading ? localizedStrings.signIn : localizedStrings.signingIn}</ButtonPrimary>
                          </FormGroup>
                      </Fade>
                  </Container>
              </KeyboardAwareScrollView>
          </Flex>
      );
  }
})));
