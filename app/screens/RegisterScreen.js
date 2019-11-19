import { Component } from 'react';
import AutoHeightImage from 'react-native-auto-height-image';
import RadioForm from 'react-native-simple-radio-button';
import CKEditor5 from 'react-native-ckeditor5';
import TagInput from 'react-native-tag-input';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import {
    ScrollIntoView, // enhanced View container
    wrapScrollViewConfigured, // complex wrapper, takes a config
} from 'react-native-scroll-into-view';


import data from 'stores/base/_data';
import withDomain from 'providers/withDomain';
import withAccount from 'providers/withAccount';
import withOrientation from 'providers/withOrientation';

import Anchor from 'components/Anchor';
import ErrorAlert from 'components/ErrorAlert';
import SelectInput from 'components/SelectInput';
import Checkbox from 'components/base/forms/Checkbox';

let scrollViewRef;

const ScrollIntoViewScrollView = wrapScrollViewConfigured({
    refPropName: 'innerRef',
    getScrollViewNode: ref => scrollViewRef = ref,
})(KeyboardAwareScrollView);

export default withOrientation(withDomain(withAccount(class extends Component {
  static displayName = 'RegisterScreen';

  static propTypes = {
      error: propTypes.string,
      componentId: propTypes.string,
      register: propTypes.func,
      accountSaving: propTypes.bool,
      domainConfig: propTypes.object,
      isTablet: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
  }

  fields = {};

  scrollRefs = {};

  state = {
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      isLoading: true,
      keywords: [],
      errors: {},
  };

  componentDidMount() {
      data.get(`${Project.api}forms/form_user_registration?domain=${this.props.domainConfig.domain}`)
          .then(({ data: res }) => {
              this.setState({ questions: res.questions, isLoading: false });
          })
          .catch((e) => {
              console.log('Unable to load custom registration fields', e);
              this.setState({ isLoading: false, error: true });
          });

      if (Platform.OS === 'android') {
          // On Android adjustPan causes major rendering issues on the ckeditor webview when scrolling it into view
          AndroidKeyboardAdjust.setAdjustResize();
      }
  }

  componentWillUnmount() {
      if (Platform.OS === 'android') {
          AndroidKeyboardAdjust.setAdjustPan();
      }
  }

  onKeywordsChange = (id, text) => {
      const lastTyped = text.charAt(text.length - 1);
      const parseWhen = [',', ' ', '\n'];
      const textStateKey = `${id}_text`;

      if (parseWhen.indexOf(lastTyped) > -1) {
          if (!this.state[textStateKey]) {
              this.setState({ [textStateKey]: '' });
              return;
          }
          if (lastTyped === ' ' && text.charAt(text.length - 2) !== ',') { // Handle keyboards that insert a space after commas
              this.setState({ [textStateKey]: text });
              return;
          }
          this.setState({
              [id]: [...(this.state[id] || []), this.state[textStateKey].toUpperCase()],
              [textStateKey]: '',
          });
      } else {
          this.setState({ [textStateKey]: text });
      }
  }

onDecimalChange = (id, text) => {
    this.setState({ [id]: text ? text.match(/^\d+\.?\d*$/g) ? text : this.state[id] || '' : '' });
}

  onRichTextAreaFocus = (id) => {
      if (Platform.OS === 'ios') {
          // iOS does not recognise when CKEditor input has been selected and the keyboard brought up, scroll it into view manually
          this.scroll.props.scrollIntoView(this.fields[id], {
              getScrollPosition: (parentLayout, childLayout, contentOffset) => ({
                  x: 0,
                  y: Math.max(0, childLayout.y - parentLayout.y + contentOffset.y - (DeviceHeight / 4)),
                  animated: true,
              }),
          });
      } else {
          // Android cannot scroll webviews within a scrollview that exceeds device height, temporarily disable scrolling on the whole modal while CKEditor has focus
          this.setState({ scrollDisabled: true, focusedId: id });
      }
  }

  onRichTextAreaBlur = () => {
      if (Platform.OS === 'android') {
          // Re-enable scrolling on the entire modal
          this.setState({ scrollDisabled: false });
      }
  }

  onKeyboardDidHide = () => {
      if (Platform.OS === 'android' && this.state.scrollDisabled) {
          // Force blur on ckeditor5
          this.fields[this.state.focusedId].blur();
      }
      if (this.state.userSearching) this.setState({ userSearching: false });
  }

  onFormDataError = (json) => {
      if (json) {
          const formDataErrors = JSON.parse(json);
          if (formDataErrors.length) {
              const errors = {};
              let firstHandledId;
              _.each(formDataErrors, (error) => {
                  // TODO handle more error types
                  const [id, type] = error.split('.');
                  switch (type) {
                      case 'required':
                          if (!firstHandledId) firstHandledId = id;
                          errors[id] = Constants.errors.FIELD_IS_REQUIRED;
                          break;
                      case 'user_already_exists':
                          if (!firstHandledId) firstHandledId = id;
                          errors[id] = Constants.errors['email.user_already_exists'];
                          break;
                      default:
                  }
              });
              this.setState({ errors });
              if (firstHandledId) {
                  this.scrollRefs[firstHandledId].scrollIntoView();
                  if (this.fields[firstHandledId].focus) this.fields[firstHandledId].focus();
              }
          }
      }
  }

  formIsValid = () => {
      const { password, confirmPassword, questions } = this.state;
      if (!questions || !questions.length || !password || !confirmPassword) return false;
      if (password.length < 8) return false;

      return true;
  }

  register = () => {
      // Iterate through all questions and validate
      const { password, confirmPassword } = this.state;
      if (password !== confirmPassword) {
          this.setState({ password: '', confirmPassword: '', errors: { password: Constants.errors.PASSWORD_MATCH } });
          this.fields.password.focus();
          setTimeout(this.scrollRefs.password.scrollIntoView, 250);
          return;
      }
      const errors = {};
      const formData = { password, confirmPassword };
      const isValid = _.every(this.state.questions, ({ required, type, id, regex }) => {
          switch (type) {
              case 'Text':
              case 'TextArea':
              case 'Decimal':
              case 'Select':
              case 'Radio':
              case 'Checkbox':
                  if (id === 'email' && !Utils.isValidEmail(this.state[id])) {
                      errors[id] = Constants.errors.EMAIL_IS_INVALID;
                      break;
                  }
                  if (type === 'Text' && regex && regex.length && !(this.state[id] || '').match(regex[0])) {
                      errors[id] = regex[1];
                      break;
                  }
                  if (this.state[id]) {
                      switch (type) {
                          case 'Select':
                              formData[id] = this.state[id][0];
                              break;
                          default:
                              formData[id] = this.state[id];
                              break;
                      }
                      if (type === 'Text' || type === 'TextArea' || type === 'Decimal') {
                          this.fields[id].blur();
                      }
                      return true;
                  }
                  if (!required) {
                      if (type === 'Text' || type === 'TextArea' || type === 'Decimal') {
                          this.fields[id].blur();
                      }
                      return true;
                  }
                  errors[id] = Constants.errors.FIELD_IS_REQUIRED;
                  break;
              case 'Keywords':
                  if (this.state[id] && this.state[id].length) {
                      formData[id] = this.state[id];
                      return true;
                  }
                  if (!required) {
                      return true;
                  }
                  errors[id] = type === 'Keywords' ? localizedStrings.keywordsAtLeastOne : localizedStrings.attachmentsAtLeastOne;
                  break;
              default:
                  return true; // Ignore unsupported fields to allow for error
          }
          this.setState({ errors });
          if (this.scrollRefs[id]) this.scrollRefs[id].scrollIntoView();
          if (this.fields[id].focus) this.fields[id].focus();
          return false;
      });
      if (!isValid) return;
      this.props.register(this.props.domainConfig.domain, formData);
  }

  onSave = () => {
      Navigation.pop(this.props.componentId);
      Alert.alert(localizedStrings.registrationSuccessfulTitle, localizedStrings.registrationSuccessfulMsg);
  }

  renderQuestions = questions => _.map(questions, (question) => {
      const { type, id, placeholder, label, required, max_length, disabled, options, parent, parent_value } = question;
      const { errors } = this.state;
      if (parent_value === true && !this.state[parent]) {
          return null;
      }
      if (parent_value && parent_value !== true) {
          const parentQuestion = _.find(questions, q => q.id === parent);
          if (!parentQuestion) return null;
          switch (parentQuestion.type) {
              case 'Radio':
                  if (parent_value === this.state[parent]) break;
                  return null;
              case 'Select':
                  if (parent_value === _.get(this.state[parent], '0')) break;
                  return null;
              default:
                  console.log(`WARNING not handling ${parentQuestion.type} parent field`);
                  return null;
          }
      }
      switch (type) {
          case 'Text': {
              if (id === 'email') {
                  return (
                      <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                          <FormGroup pb0>
                              <TextInput
                                ref={c => this.fields[id] = c}
                                title={label ? `${label}${required ? ' *' : ''}` : null}
                                value={this.state[id]}
                                autoCapitalize="none"
                                autoComplete="email"
                                keyboardType="email-address"
                                editable={!disabled}
                                onChangeText={text => this.setState({ [id]: text })}
                                placeholder={localizedStrings.enterValidEmail}
                              />
                              {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                          </FormGroup>
                      </ScrollIntoView>
                  );
              }
              return (
                  <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                      <FormGroup pb0>
                          <TextInput
                            ref={c => this.fields[id] = c}
                            title={label ? `${label}${required ? ' *' : ''}` : null}
                            placeholder={placeholder}
                            maxLength={max_length || undefined}
                            editable={!disabled}
                            value={this.state[id]}
                            onChangeText={text => this.setState({ [id]: text })}
                            multiline
                          />
                          {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                      </FormGroup>
                  </ScrollIntoView>
              );
          }

          case 'RichTextArea':
              return (
                  <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                      <FormGroup pb0>
                          <Flex key={id} style={{ height: 250 }}>
                              {label ? (
                                  <FormGroup>
                                      <Text style={Styles.inputLabel}>{`${label}${required ? ' *' : ''}`}</Text>
                                  </FormGroup>
                              ) : null}
                              <CKEditor5
                                ref={c => this.fields[id] = c}
                                initialData={this.state[id]}
                                onChange={value => this.setState({ [id]: value })}
                                editorConfig={{ toolbar: ['bold', 'italic', 'underline', 'bulletedList', 'numberedList', '|', 'undo', 'redo'] }}
                                onFocus={() => this.onRichTextAreaFocus(id)}
                                onBlur={this.onRichTextAreaBlur}
                                disableTooltips
                                height={150}
                                androidHardwareAccelerationDisabled
                              />
                          </Flex>
                          {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                      </FormGroup>
                  </ScrollIntoView>
              );
          case 'Keywords':
              return (
                  <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                      <FormGroup pb0>
                          {label ? (
                              <FormGroup>
                                  <Text style={Styles.inputLabel}>{`${label}${required ? ' *' : ''}`}</Text>
                              </FormGroup>
                          ) : null}
                          <TagInput
                            ref={c => this.fields[id] = c}
                            key={id}
                            value={this.state[id] || []}
                            onChange={keywords => this.setState({ [id]: keywords })}
                            labelExtractor={keyword => keyword}
                            text={this.state[`${id}_text`] || ''}
                            onChangeText={text => this.onKeywordsChange(id, text)}
                            inputProps={{ placeholder: localizedStrings.enterKeyword, multiline: true }}
                            tagContainerStyle={Styles.tagContainer}
                            tagTextStyle={Styles.tagText}
                            textInputContainerStyle={[{ height: 60, marginBottom: 0, justifyContent: 'center' }]}
                            textInputStyle={[Styles.textInput, { paddingVertical: 5 }]}
                            flex
                            editable={!disabled}
                            inputDefaultWidth={130}
                            tagCloseIcon={<FontAwesome5 style={{ marginLeft: 10 }} name="times" size={15} />}
                          />
                          {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                      </FormGroup>
                  </ScrollIntoView>
              );
          case 'TextArea':
              return (
                  <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                      <FormGroup pb0>
                          <TextInput
                            ref={c => this.fields[id] = c}
                            title={label ? `${label}${required ? ' *' : ''}` : null}
                            placeholder={placeholder}
                            maxLength={max_length || undefined}
                            editable={!disabled}
                            multiline
                            numberOfLines={20}
                            value={this.state[id]}
                            onChangeText={text => this.setState({ [id]: text })}
                          />
                          {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                      </FormGroup>
                  </ScrollIntoView>
              );
          case 'DescriptiveText':
              return <Text key={id} style={[Styles.paragraph, { marginBottom: 0 }]}>{label}</Text>;
          case 'Decimal':
              return (
                  <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                      <FormGroup pb0>
                          <TextInput
                            ref={c => this.fields[id] = c}
                            title={label ? `${label}${required ? ' *' : ''}` : null}
                            placeholder={placeholder}
                            editable={!disabled}
                            onChangeText={text => this.onDecimalChange(id, text)}
                            value={this.state[id]}
                          />
                          {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                      </FormGroup>
                  </ScrollIntoView>
              );
          case 'Select':
              return (
                  <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                      <FormGroup pb0>
                          <SelectInput
                            ref={c => this.fields[id] = c}
                            onChange={value => this.setState({ [id]: value })}
                            value={this.state[id]}
                            placeholder={!options[0][0] ? options[0][1] : placeholder}
                            labelKey={1} options={!options[0][0] ? options.slice(1) : options}
                            title={label ? `${label}${required ? ' *' : ''}` : ''}
                            disabled={disabled}
                          />
                          {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                      </FormGroup>
                  </ScrollIntoView>
              );
          case 'Radio':
              return (
                  <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                      <FormGroup pb0>
                          {label ? (
                              <FormGroup>
                                  <Text style={Styles.inputLabel} ref={c => this.fields[id] = c}>{`${label}${required ? ' *' : ''}`}</Text>
                              </FormGroup>
                          ) : null}
                          <RadioForm
                            radio_props={_.map(options, ([value, valueLabel]) => ({ label: valueLabel, value }))}
                            initial={this.state[id] ? _.findIndex(options, ([value]) => value === this.state[id]) : -1}
                            buttonOuterSize={20}
                            buttonSize={10}
                            buttonColor={pallette.wazokuLightGrey}
                            onPress={(value) => { this.setState({ [id]: value }); }}
                            selectedButtonColor={pallette.wazokuBlue}
                            labelStyle={Styles.paragraphLight}
                            disabled={disabled}
                          />
                          {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                      </FormGroup>
                  </ScrollIntoView>
              );
          case 'Checkbox':
              return (
                  <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                      <FormGroup pb0>
                          {label ? (
                              <FormGroup>
                                  <Text style={Styles.inputLabel} ref={c => this.fields[id] = c}>{`${label}${required ? ' *' : ''}`}</Text>
                              </FormGroup>
                          ) : null}
                          <Checkbox
                            value={this.state[id]}
                            toggle={() => this.setState({ [id]: true })}
                            disabled={disabled}
                          />
                          {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                      </FormGroup>
                  </ScrollIntoView>
              );
          default:
              //   console.log(`Question type ${type} is not supported`);
              return null;
      }
  })

  render() {
      const {
          state: { password, confirmPassword, error: stateError, isLoading, questions, scrollDisabled, errors },
          props: { error, componentId, accountSaving, isTablet, DeviceWidth, domainConfig: { appearance_config: { general_logo_url } }, DeviceHeight },
      } = this;
      return (
          <Flex style={[Styles.body, { width: DeviceWidth, height: DeviceHeight }]}>
              <ErrorAlert error={error === 'Network request failed' ? Constants.errors.NETWORK_REQUEST_FAILED : error} />
              <ScrollIntoViewScrollView
                keyboardShouldPersistTaps="handled"
                scrollEnabled={!scrollDisabled}
                onKeyboardDidHide={this.onKeyboardDidHide}
              >
                  <Container style={isTablet ? { width: DeviceWidth / 2, alignSelf: 'center' } : null}>

                      <FormGroup pt20 pb20>
                          <AutoHeightImage
                            source={general_logo_url ? { uri: general_logo_url } : require('../images/wazoku_idea_spotlight_logo2x.png')}
                            style={Styles.brandOrganisationImage}
                            width={isTablet ? DeviceWidth * 0.3 : DeviceWidth * 0.4}
                          />
                      </FormGroup>

                      {stateError ? (
                          <FormGroup style={[Styles.pb0, { marginHorizontal: styleVariables.paddingBase }]}>
                              <Fade autostart value={1} style={Styles.errorWrapper}>
                                  <Text style={Styles.errorText}>
                                      {localizedStrings.unableToGetRegistrationForm}
                                  </Text>
                              </Fade>
                          </FormGroup>
                      ) : null}

                      {isLoading ? <Flex style={Styles.centeredContainer}><Loader /></Flex> : questions && questions.length ? (
                          <React.Fragment>
                              {this.renderQuestions(questions)}
                              <ScrollIntoView ref={ref => this.scrollRefs.password = ref}>
                                  <FormGroup pb0>
                                      <TextInput
                                        title={localizedStrings.password}
                                        ref={c => this.fields.password = c}
                                        secureTextEntry
                                        value={password}
                                        onChangeText={text => this.setState({ password: text })}
                                        placeholder={localizedStrings.passwordRequirements}
                                      />
                                  </FormGroup>
                                  {errors.password ? <Text style={Styles.fieldError}>{errors.password}</Text> : null}
                              </ScrollIntoView>

                              <FormGroup>
                                  <TextInput
                                    title={localizedStrings.confirmPassword}
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={text => this.setState({ confirmPassword: text })}
                                    placeholder={localizedStrings.required}
                                  />
                              </FormGroup>
                          </React.Fragment>
                      ) : null}

                      <FormGroup>
                          <ButtonPrimary onPress={this.register} disabled={accountSaving || !this.formIsValid()}>{!accountSaving ? localizedStrings.register : localizedStrings.registering}</ButtonPrimary>
                      </FormGroup>

                      <FormGroup>
                          <Anchor style={Styles.textCenter} onPress={() => Navigation.pop(componentId)}>{localizedStrings.alreadyRegistered}</Anchor>
                      </FormGroup>

                  </Container>
              </ScrollIntoViewScrollView>
          </Flex>
      );
  }
})));
