import React, { Component } from 'react';

import data from 'stores/base/_data';
import ErrorAlert from 'components/ErrorAlert';
import withOrientation from 'providers/withOrientation';

const ChangePasswordModal = class extends Component {
    static displayName = 'ChangePasswordModal';

    static propTypes = {
        DeviceWidth: propTypes.number,
        DeviceHeight: propTypes.number,
    };

    state = {
        oldPassword: '',
        password: '',
        confirmPassword: '',
        errors: {},
    };

    canSave = () => {
        const { password, confirmPassword, oldPassword } = this.state;
        return oldPassword && password && confirmPassword;
    }

    changePassword = () => {
        const { password, confirmPassword, oldPassword } = this.state;
        if (password !== confirmPassword) {
            this.setState({ errors: {} }, () => {
                this.setState({ errors: { password: Constants.errors.PASSWORD_MATCH }, password: '', confirmPassword: '' });
                this.passwordInput.focus();
            });
            return;
        }

        this.setState({ errors: {}, isSaving: true });
        data.post(`${Project.api}authorization/change_password`, { domain: DomainStore.getDomain(), new_password: password, old_password: oldPassword, username: AccountStore.getUser().email })
            .then(() => {
                Navigation.dismissModal(this.props.componentId);
            })
            .catch((e) => {
                this.setState({ oldPassword: '', password: '', confirmPassword: '', isSaving: false });
                this.oldPasswordInput.focus();
                Utils.handleErrorFromAPI(e, localizedStrings.changePasswordFailed).then(error => this.setState({ errors: { oldPassword: error } }));
            });
    }

    render() {
        const { oldPassword, password, confirmPassword, isSaving, errors } = this.state;
        const { DeviceWidth, DeviceHeight } = this.props;
        return (
            <Flex style={[Styles.body, { DeviceWidth, DeviceHeight }]}>
                <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
                    <Container style={{ flex: 1 }}>

                        <FormGroup pb0>
                            <TextInput
                              title={localizedStrings.currentPassword}
                              ref={c => this.oldPasswordInput = c}
                              secureTextEntry
                              value={oldPassword}
                              onChangeText={text => this.setState({ oldPassword: text })}
                            />
                        </FormGroup>
                        {errors.oldPassword ? <Text style={Styles.fieldError}>{errors.oldPassword}</Text> : null}

                        <FormGroup pb0>
                            <TextInput
                              title={localizedStrings.newPassword}
                              ref={c => this.passwordInput = c}
                              secureTextEntry
                              value={password}
                              onChangeText={text => this.setState({ password: text })}
                              placeholder={localizedStrings.passwordRequirements}
                            />
                        </FormGroup>
                        {errors.password ? <Text style={Styles.fieldError}>{errors.password}</Text> : null}

                        <FormGroup>
                            <TextInput
                              title={localizedStrings.confirmNewPassword}
                              secureTextEntry
                              value={confirmPassword}
                              onChangeText={text => this.setState({ confirmPassword: text })}
                              placeholder={localizedStrings.required}
                            />
                        </FormGroup>

                        <FormGroup style={Styles.mt10}>
                            <Row>
                                <Flex>
                                    <ButtonTertiary style={Styles.mr5} disabled={isSaving} onPress={() => Navigation.dismissModal(this.props.componentId)}>{localizedStrings.cancel}</ButtonTertiary>
                                </Flex>
                                <Flex>
                                    <ButtonPrimary style={Styles.ml5} disabled={isSaving || !this.canSave()} onPress={this.changePassword}>{isSaving ? localizedStrings.changing : localizedStrings.change}</ButtonPrimary>
                                </Flex>
                            </Row>
                        </FormGroup>
                    </Container>
                </KeyboardAwareScrollView>
            </Flex>
        );
    }
};

module.exports = withOrientation(ChangePasswordModal);
