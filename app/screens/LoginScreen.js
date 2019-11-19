import { Component } from 'react';
import AutoHeightImage from 'react-native-auto-height-image';

import withDomain from 'providers/withDomain';
import withAccount from 'providers/withAccount';

import ErrorAlert from 'components/ErrorAlert';
import withOrientation from 'providers/withOrientation';
import Anchor from '../components/Anchor';

export default withOrientation(withDomain(withAccount(class extends Component {
  static displayName = 'LoginScreen';

  static propTypes = {
      error: propTypes.string,
      componentId: propTypes.string,
      login: propTypes.func,
      accountLoading: propTypes.bool,
      loginWithSSO: propTypes.func,
      domainConfig: propTypes.object,
      isSAMLEnabled: propTypes.func,
      isTablet: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
  }

  state = {
      email: '',
      password: '',
  };

  formIsValid = () => {
      const { email, password } = this.state;
      if (!email || !password) return false;

      return Utils.isValidEmail(email);
  }

  onLogin = () => {
      routes.goToDashboard();
  }

  onError = (error) => {
      if (error === 'username.pending') {
          Alert.alert(
              localizedStrings.accountNotActivatedTitle,
              localizedStrings.accountNotActivatedMsg,
              [
                  {
                      text: localizedStrings.noThanks,
                      style: 'cancel',
                  },
                  {
                      text: localizedStrings.yes,
                      onPress: () => AppActions.resendActivationCode(this.props.domainConfig.domain, this.state.email),
                  },
              ],
          );
      } else {
          this.scrollTimer = setTimeout(() => this.scrollView && this.scrollView.scrollToEnd({ animated: true }), 250);
      }
  }

  onForgotPassword = () => {
      Navigation.showOverlay(routes.forgotPasswordLightbox());
  }

  componentWillUnmount() {
      if (this.scrollTimer) clearTimeout(this.scrollTimer);
  }

  render() {
      const {
          state: { email, password },
          props: {
              error, componentId, login, accountLoading, loginWithSSO, isSAMLEnabled,
              domainConfig: { domain, appearance_config: { general_logo_url } },
              isTablet, DeviceWidth, DeviceHeight,
          },
      } = this;
      return (
          <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
              <KeyboardAwareScrollView ref={c => this.scrollView = c} keyboardShouldPersistTaps="handled">
                  <Container style={isTablet ? { width: DeviceWidth / 2, alignSelf: 'center' } : null}>
                      <FormGroup pt20 pb20>
                          <AutoHeightImage
                            source={general_logo_url ? { uri: general_logo_url } : require('../images/Idea_App_Logo_Colour_RGB.png')}
                            style={Styles.brandOrganisationImage}
                            width={isTablet ? DeviceWidth * 0.3 : DeviceWidth * 0.4}
                          />
                      </FormGroup>

                      {isSAMLEnabled() ? (
                          <React.Fragment>
                              <FormGroup>
                                  <ButtonSecondary onPress={() => loginWithSSO(domain)} disabled={accountLoading}>{localizedStrings.loginWithSSO}</ButtonSecondary>
                              </FormGroup>
                              <FormGroup>
                                  <Text style={[Styles.paragraph, Styles.textCenter, Styles.mb0]}>{localizedStrings.Or}</Text>
                              </FormGroup>
                          </React.Fragment>
                      ) : null}

                      <Text style={[Styles.textCenter, Styles.paragraphLight]}>{localizedStrings.loginWithEmail}</Text>

                      <FormGroup pb0>
                          <TextInput
                            title={localizedStrings.emailAddress}
                            value={email}
                            autoCapitalize="none"
                            autoComplete="email"
                            keyboardType="email-address"
                            onChangeText={text => this.setState({ email: text })}
                            placeholder={localizedStrings.yourEmailAddress}
                          />
                      </FormGroup>

                      <FormGroup>
                          <TextInput
                            title={localizedStrings.password}
                            secureTextEntry
                            value={password}
                            onChangeText={text => this.setState({ password: text })}
                            placeholder={localizedStrings.yourPassword}
                          />
                      </FormGroup>

                      <ErrorAlert error={error === 'Network request failed' ? Constants.errors.NETWORK_REQUEST_FAILED : error} />

                      <FormGroup>
                          <ButtonPrimary onPress={() => login({ email, password, domain })} disabled={accountLoading || !this.formIsValid()}>{!accountLoading ? localizedStrings.signIn : localizedStrings.signingIn}</ButtonPrimary>
                      </FormGroup>

                      <FormGroup>

                          <Anchor style={Styles.textCenter} onPress={() => Navigation.push(componentId, routes.registerScreen())}>{localizedStrings.registerForNewAccount}</Anchor>

                      </FormGroup>

                      <FormGroup>
                          <Text style={[Styles.textCenter, Styles.anchor]} onPress={this.onForgotPassword}>{`${localizedStrings.forgotPassword}?`}</Text>
                      </FormGroup>

                  </Container>
              </KeyboardAwareScrollView>
          </Flex>
      );
  }
})));
