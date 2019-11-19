import React, { Component } from 'react';

import data from 'stores/base/_data';
import Lightbox from 'components/base/Lightbox';
import ErrorAlert from 'components/ErrorAlert';

const ForgotPassword = class extends Component {
    static displayName = 'ForgotPassword';

    static propTypes = {
        dismiss: propTypes.func,
        isTablet: propTypes.bool,
        DeviceWidth: propTypes.number,
    };

    state = {
        email: '',
    };

    sendPasswordReset = () => {
        const { email } = this.state;
        this.setState({ error: '', isSaving: true });
        data.post(`${Project.api}authorization/forgotten_password/send`, { domain: DomainStore.getDomain(), username: email })
            .then(() => {
                setTimeout(() => {
                    Navigation.dismissOverlay(this.props.componentId);
                    Alert.alert(localizedStrings.passwordResetRequestSent, localizedStrings.passwordResetRequestSentMsg);
                }, 1500);
            })
            .catch((e) => {
                this.setState({ isSaving: false });
                this.emailInput.focus();
                Utils.handleErrorFromAPI(e, localizedStrings.passwordResetRequestError).then(error => this.setState({ error }));
            });
    }

    render() {
        const { dismiss, isTablet, DeviceWidth } = this.props;
        const { email, isSaving, error } = this.state;
        return (
            <KeyboardAvoidingView
              behavior="padding" enabled
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 160}
            >
                <ViewOverflow style={[Styles.lightbox, isTablet ? { width: DeviceWidth * 0.4 } : { width: DeviceWidth - 40 }]}>
                    <View style={[{ alignSelf: 'stretch' }]}>
                        <FormGroup style={Styles.lightboxContainer}>
                            <H1 style={Styles.textCenter}>{localizedStrings.forgotPassword}</H1>
                            <FormGroup>
                                <TextInput
                                  ref={c => this.emailInput = c}
                                  title={localizedStrings.emailAddress}
                                  value={email}
                                  autoCapitalize="none"
                                  autoComplete="email"
                                  keyboardType="email-address"
                                  onChangeText={text => this.setState({ email: text })}
                                  placeholder={localizedStrings.yourEmailAddress}
                                />
                            </FormGroup>

                            <ErrorAlert error={error} />

                            <FormGroup style={Styles.mt10}>
                                <Row>
                                    <Flex>
                                        <ButtonTertiary style={Styles.mr5} disabled={isSaving} onPress={dismiss}>{localizedStrings.cancel}</ButtonTertiary>
                                    </Flex>
                                    <Flex>
                                        <ButtonPrimary style={Styles.ml5} disabled={isSaving || !Utils.isValidEmail(email)} onPress={this.sendPasswordReset}>{isSaving ? localizedStrings.sending : localizedStrings.confirm}</ButtonPrimary>
                                    </Flex>
                                </Row>
                            </FormGroup>
                        </FormGroup>
                    </View>
                </ViewOverflow>
            </KeyboardAvoidingView>
        );
    }
};

module.exports = Lightbox(ForgotPassword);
