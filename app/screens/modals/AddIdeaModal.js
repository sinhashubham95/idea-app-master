import React, { Component } from 'react';
import withOrientation from 'providers/withOrientation';

import CKEditor5 from 'react-native-ckeditor5';
import TagInput from 'react-native-tag-input';
import RadioForm from 'react-native-simple-radio-button';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import {
  ScrollIntoView, // enhanced View container
  wrapScrollViewConfigured, // complex wrapper, takes a config
} from 'react-native-scroll-into-view';
import Toast from 'react-native-easy-toast';

import data from 'stores/base/_data';
import ErrorAlert from 'components/ErrorAlert';
import ListItemCheckbox from 'components/ListItemCheckbox';
import withNetwork from 'providers/withNetwork';
import withMyIdeas from 'providers/withMyIdeas';
import withChallengeForms from 'providers/withChallengeForms';
import ListItemAddAttachment from 'components/ListItemAddAttachment';
import SectionHeader from 'components/SectionHeader';
import { ButtonPrimary, ButtonTertiary, ButtonSecondary } from 'components/base/forms/Button';
import SelectInput from 'components/SelectInput';
import UserSearch from 'components/UserSearch';
import Anchor from 'components/Anchor';

let scrollViewRef;

const ScrollIntoViewScrollView = wrapScrollViewConfigured({
  refPropName: 'innerRef',
  getScrollViewNode: ref => scrollViewRef = ref,
})(KeyboardAwareScrollView);

export default withOrientation(withNetwork(withChallengeForms(withMyIdeas(class extends Component {
  static displayName = 'AddIdeaModal';

  static propTypes = {
    componentId: propTypes.string,
    error: propTypes.string,
    edit: propTypes.bool,
    challenge: propTypes.object,
    challengeId: propTypes.string,
    idea: propTypes.object,
    forms: propTypes.shape({
      questions: propTypes.array,
    }),
    formsLoading: propTypes.bool,
    formsError: propTypes.string,
    getForms: propTypes.func,
    myIdeasSaving: propTypes.bool,
    DeviceWidth: propTypes.number,
    DeviceHeight: propTypes.number,
    showToast: propTypes.bool,
  }

  fields = {};

  scrollRefs = {};

  constructor(props) {
    super(props);
    this.state = {
      challenge: props.challenge || {},
      keywords: [],
      errors: {},
      isLoadingData: props.edit,
    };
  }

  componentDidMount() {
    if (this.props.challenge) {
      this.props.getForms(this.props.challenge.id);
    } else if (this.props.edit) {
      this.props.getForms(this.props.challengeId);
      if (this.props.forms) {
        this.loadExistingData();
      }
    }

    if (this.props.showToast) {
      this.refs.toast.show(localizedStrings.saved);
    }

    if (Platform.OS === 'android') {
      // On Android adjustPan causes major rendering issues on the ckeditor webview when scrolling it into view
      AndroidKeyboardAdjust.setAdjustResize();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.edit && !_.isEqual(prevProps.forms, this.props.forms)) {
      this.loadExistingData();
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      AndroidKeyboardAdjust.setAdjustPan();
    }
  }

  onNetworkChange = (isOnline) => {
    if (isOnline && !this.props.forms) {
      if (this.props.challenge) {
        this.props.getForms(this.props.challenge.id);
      } else if (this.props.edit) {
        this.props.getForms(this.props.challengeId);
        if (this.props.forms) {
          this.loadExistingData();
        }
      }
    }
  }

  getStateValues = async (questions) => {
    let state = {};
    const challenge = ChallengesStore.getChallenge(this.props.challengeId);
    const { data: ideaData, attachments, category, custom_fields, outcomevalues } = this.props.idea;
    await Promise.all(_.map(questions, ({ type, id, options, fields }) => new Promise((resolve) => {
      switch (type) {
        case 'Section':
          state[id] = ideaData[id];
          this.getStateValues(fields).then((currentState) => {
            state = Object.assign({}, state, currentState);
            resolve();
          });
          break;
        case 'IdeaTitle':
        case 'Text':
        case 'RichTextArea':
        case 'TextArea':
        case 'Decimal':
        case 'Keywords':
        case 'Radio':
          state[id] = ideaData[id];
          return resolve();
        case 'Select':
          state[id] = _.find(options, option => option[0] === ideaData[id]);
          return resolve();
        case 'IdeaCategory':
          state[id] = category;
          // We need the challenge in order to populate the idea categories field
          if (!challenge) {
            // Challenge is not available, try to get it (won't work offline obviously)
            data.get(`${Project.api}challenges/${this.props.challengeId}?include=categories`)
              .then(({ data: res }) => {
                state.challenge = res;
                resolve();
              })
              .catch((e) => {
                Utils.handleErrorFromAPI(e, localizedStrings.unableToGetChallengeCategories).then(error => this.setState({ error }));
                console.log('Unable to load IdeaCategory field', e);
                resolve();
              });
          } else {
            // Add challenge to state
            state.challenge = challenge;
            resolve();
          }
          return;
        case 'Media':
          state.existingAttachments = attachments;
          return resolve();
        case 'MultipleCheckbox':
          state[id] = Object.assign({}, ..._.map(ideaData[id], key => ({ [key]: true })));
          return resolve();
        case 'UserSearch':
          state[id] = _.map(ideaData[id], (member, email) => ({ display_name: member.name, id: member.couch_id, thumbnail: member.thumbnail, email }));
          return resolve();
        case 'Custom':
          state[id] = Object.assign({}, ..._.map(custom_fields[id], ({ id: valueId, ...rest }) => ({ [valueId]: { id: valueId, ...rest } })));
          return resolve();
        case 'Outcome': {
          // Convert all field values from number to string
          const outcomeData = _.cloneDeep(outcomevalues[id].outcomerows);
          _.each(outcomeData, ({ field_values }) => {
            _.each(field_values, (field_value, index) => field_values[index] = field_value.toString());
          });
          state[id] = outcomeData;
          return resolve();
        }
        default:
          resolve();
      }
    })));
    return state;
  };

  loadExistingData = async () => {
    // Get the challenge if we have it
    const challenge = ChallengesStore.getChallenge(this.props.challengeId);
    console.log('called, this is');
    // Iterate through all current stage questions and add the data to state
    const state = await this.getStateValues(this.props.forms.questions);
    console.log('hello there', state);
    this.setState({ ...state, isLoadingData: false });
  };

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
      if (this.scrollRefs[id]) this.scrollRefs[id].scrollIntoView();
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

  onAttachImage = (stateKey) => {
    const options = [localizedStrings.photo, localizedStrings.media];
    let desc;
    switch (stateKey) {
      case 'bannerImage':
        desc = localizedStrings.bannerImage.toLowerCase();
        break;
      case 'coverImage':
        desc = localizedStrings.cardImage.toLowerCase();
        break;
      default:
        return;
    }
    API.showOptions(`${localizedStrings.add} ${desc}`, options)
      .then((type) => {
        if (type == null) return;
        return Utils.attach(options[type]);
      })
      .then((res) => {
        if (!res) return;
        if (res.fileName) res.name = res.fileName;
        this.setState({ [stateKey]: res });
      })
      .catch((err) => {
        if (err.message === 'User cancelled') return; // Image picker cancellation
        this.setState({ error: err.message });
        console.log(err);
      });
  }

  onAttachMedia = (question) => {
    const options = [];
    if (question.images) {
      options.push(localizedStrings.photo);
      options.push(localizedStrings.media);
    }
    if (question.documents) options.push(localizedStrings.document);
    if (options.length === 0) {
      Alert.alert(localizedStrings.error, localizedStrings.attachMediaFailed);
      return;
    }
    let promise;
    if (options.length > 1) {
      promise = API.showOptions(localizedStrings.addAttachment, options);
    } else {
      promise = Promise.resolve(options[0]);
    }

    promise
      .then((type) => {
        if (type == null) return;
        return Utils.attach(options[type]);
      })
      .then((res) => {
        if (!res) return;
        if (res.fileName) res.name = res.fileName;
        const files = this.state[question.id] || [];
        files.push(res);
        this.setState({ [question.id]: _.uniqBy(files, 'uri') });
      })
      .catch((err) => {
        if (err.message === 'User canceled document picker') return; // Document picker cancellation
        if (err.message === 'User cancelled') return; // Image picker cancellation
        this.setState({ error: err.message });
        console.log(err);
      });
  }

  onDeleteAttachment = (id, index) => {
    const files = this.state[id];
    files.splice(index, 1);
    this.setState({ [id]: files });
  }

  onChallengeSelected = (challenge) => {
    this.props.getForms(challenge.id);
    this.setState({ challenge, errors: {} });
  }

  onMyIdeasSaved = (idea) => {
    if (this.state.publishing && !idea.is_draft) Navigation.push(global.selectedTabComponentId, routes.ideaDetailsScreen(idea.id, true));
    if (this.state.saving && idea.is_draft) {
      if (!this.props.edit) {
        Navigation.showModal(routes.editIdeaModal(this.state.challenge.id, idea, true))
          .then(() => Navigation.dismissModal(this.props.componentId));
        return;
      }
      this.setState({ saving: false });
      this.refs.toast.show(localizedStrings.saved);
    } else {
      Navigation.dismissModal(this.props.componentId);
    }
    if (MyIdeasStore.attachmentsError) {
      console.log(MyIdeasStore.attachmentsError);
      Alert.alert(localizedStrings.error, `${localizedStrings.ideaAttachmentsError} - ${MyIdeasStore.attachmentsError}`);
    }
  }

  onMarkAttachmentForDelete = (id) => {
    const attachments = this.state.existingAttachments;
    const index = _.findIndex(attachments, { id });
    attachments[index].willDelete = !attachments[index].willDelete;
    this.setState({ attachments });
  }

  onFormDataError = (json) => {
    if (json) {
      const formDataErrors = JSON.parse(json);
      if (formDataErrors.length) {
        const errors = {};
        let firstHandledId;
        _.each(formDataErrors, (error) => {
          // TODO handle more error types
          if (error.indexOf('required') !== -1) {
            const id = error.split('.')[0];
            if (!firstHandledId) firstHandledId = id;
            errors[id] = Constants.errors.FIELD_IS_REQUIRED;
          }
        });
        this.setState({ errors });
        if (firstHandledId) {
          // TODO handle scrolling to banner / cover image
          if (this.scrollRefs[firstHandledId]) this.scrollRefs[firstHandledId].scrollIntoView();
          if (this.fields[firstHandledId].focus) this.fields[firstHandledId].focus();
        }
      }
    }
  }

  onUserSearchChangeText = (id, text) => {
    const state = { [`${id}-search`]: text };
    if (text.length) {
      AppActions.searchUsers(text);
      if (!this.state.userSearching) {
        state.userSearching = true;
      }
    } else {
      AppActions.clearUserSearch();
      this.setState({ userSearching: false });
    }
    this.setState(state);
  }

  onUserSearchFocus = (id) => {
    const state = {};
    const userSearch = this.state[`${id}-search`];
    if (userSearch && userSearch.length && !this.state.userSearching) {
      state.userSearching = true;
    }
    if (Platform.OS === 'android') {
      state.scrollDisabled = true;
      state.focusedId = id;
    }
    if (_.keys(state).length > 0) this.setState(state);
  }

  onUserSearchBlur = () => {
    const state = {};
    if (this.state.userSearching) {
      state.userSearching = false;
    }
    if (Platform.OS === 'android') {
      state.scrollDisabled = false;
    }
    if (_.keys(state).length > 0) this.setState(state);
  }

  onUserSelected = (fieldId, user) => {
    const users = this.state[fieldId] || [];
    users.push(user);
    AppActions.clearUserSearch();
    this.setState({ [fieldId]: users, userSearching: false, [`${fieldId}-search`]: '' });
  }

  onAddCustomValue = (id) => {
    Navigation.showModal(routes.addCustomValueModal(id, this.state[id], this.props.challengeId || this.state.challenge.id, (selected) => {
      const state = {
        [id]: selected,
      };
      // Look for Outcome fields associated with this custom value field
      const outcomeFields = _.filter(this.props.forms.questions, question => question.type === 'Outcome' && question.custom_field === id);
      if (outcomeFields.length) {
        _.each(outcomeFields, (field) => {
          let outcomeData = _.cloneDeep(this.state[field.id]) || [];

          if (_.keys(selected).length === 0) {
            outcomeData = [];
          } else {
            // Remove any outcome field rows that are using a custom value that has been removed from selection
            const removed = _.difference(_.keys(this.state[id]), _.keys(selected));
            outcomeData = _.filter(outcomeData, row => removed.indexOf(row.value.toString()) === -1);

            // Add rows for any new custom values that have been added to the selection
            const added = _.difference(_.keys(selected), _.keys(this.state[id]));
            _.each(added, (valueId) => {
              this.createOutcomeRow(field, parseInt(valueId), outcomeData);
            });
          }

          state[field.id] = outcomeData;
        });
      }
      this.setState(state);
    }));
  }

  onRemoveCustomValue = (id, key) => {
    Alert.alert('', localizedStrings.removeValue,
      [
        {
          text: localizedStrings.no,
          style: 'cancel',
        },
        {
          text: localizedStrings.yes,
          onPress: () => {
            const selected = this.state[id];
            delete selected[key];

            const state = { selected };

            // Look for Outcome fields associated with this custom value field
            const outcomeFields = _.filter(this.props.forms.questions, question => question.type === 'Outcome' && question.custom_field === id);
            if (outcomeFields.length) {
              _.each(outcomeFields, (field) => {
                let outcomeData = _.cloneDeep(this.state[field.id]) || [];

                // Remove any outcome field rows that are using this custom value
                if (_.keys(selected).length === 0) {
                  outcomeData = [];
                } else {
                  outcomeData = _.filter(outcomeData, row => row.value.toString() !== key);
                }

                state[field.id] = outcomeData;
              });
            }

            this.setState(state);
          },
        },
      ]);
  }

  onOutcomeFieldChange = (id, text, index, field_value_index, type) => {
    const row = _.cloneDeep(this.state[id][index]);
    switch (type) {
      case 'number':
        row.field_values[field_value_index] = text ? text.match(/^\d+$/g) ? text : row.field_values[field_value_index] || '' : '';
        break;
      case 'currency': {
        const amount = text.substr(1);
        row.field_values[field_value_index] = amount ? amount.match(/^\d+\.?\d*$/g) ? amount : row.field_values[field_value_index] || '' : '';
        break;
      }
      default:
        row.field_values[field_value_index] = text;
        break;
    }
    this.state[id][index] = row;
    this.forceUpdate();
  }

  onOutcomeCustomFieldSelect = (id, index, customFieldId) => {
    Navigation.showModal(
      routes.selectModal(localizedStrings.selectValue, {
        items: this.state[customFieldId],
        filterItem: (customValue, search) => customValue.value.join('').toLowerCase().indexOf(search) !== -1,
        onChange: (value) => {
          if (!value) return;
          const row = _.cloneDeep(this.state[id][index]);
          row.value = value.id;
          this.state[id][index] = row;
          this.forceUpdate();
        },
        renderRow: (item, isSelected, toggleItem) => (
          <ListItem key={item.id} onPress={toggleItem}>
            <Text>{item.value}</Text>
            <Checkbox value={isSelected}/>
          </ListItem>
        ),
        isSelected: (item, value) => value && item.id === value.id,
        value: _.find(this.state[customFieldId], ({ id: valueId }) => valueId === this.state[id][index].value),
        required: true,
        keyExtractor: item => item.id.toString(),
      }),
    );
  }

  onAddOutcomeRow = (id) => {
    const question = _.find(this.props.forms.questions, q => q.id === id);
    const outcomeData = _.cloneDeep(this.state[id]) || [];
    this.createOutcomeRow(question, '', outcomeData);
    this.setState({ [id]: outcomeData });
  }

  createOutcomeRow = (question, value, outcomeData) => {
    const field_values = Object.assign({}, ..._.map(question.calculation_fields, (calculation_field, index) => {
      switch (calculation_field.type) {
        case 'number':
        case 'currency':
          return { [index]: '0' };
        default:
          console.log('Unsupported calculation field type', calculation_field.type);
          return { [index]: '' };
      }
    }));
    outcomeData.push({ value, field_values });
  }

  onRemoveOutcomeRow = (id, index) => {
    Alert.alert('', localizedStrings.removeValue,
      [
        {
          text: localizedStrings.no,
          style: 'cancel',
        },
        {
          text: localizedStrings.yes,
          onPress: () => {
            const outcomeData = _.cloneDeep(this.state[id]) || [];
            outcomeData.splice(index, 1);
            this.setState({ [id]: outcomeData });
          },
        },
      ]);
  }

  discardDraft = () => {
    Alert.alert(localizedStrings.discardDraftTitle, localizedStrings.discardDraftMsg,
      [
        {
          text: localizedStrings.no,
          style: 'cancel',
        },
        {
          text: localizedStrings.yes,
          onPress: () => {
            this.setState({ discarding: true });
            AppActions.deleteDraft(this.props.idea.id);
          },
        },
      ]);
  }

  canSave = () => {
    // Must have a selected challenge unless in edit mode
    if (!this.props.edit && !this.state.challenge) return false;

    // Must have a set of form fields
    if (this.props.formsLoading || !this.props.forms || !this.props.forms.questions) return false;

    // Must not be saving idea
    if (this.props.myIdeasSaving) return false;

    return true;
  }

  getQuestions = (questions) => {
    const res = [];
    _.map(questions, (question) => {
      const { parent_value, parent, fields, type } = question;
      if (parent_value === true && !this.state[parent]) {
        return;
      }
      if (parent_value && parent_value !== true) {
        const parentQuestion = _.find(this.props.forms.questions, q => q.id === parent);
        if (!parentQuestion) return;
        switch (parentQuestion.type) {
          case 'Radio':
            if (parent_value === this.state[parent]) break;
            return;
          case 'Select':
            if (parent_value === _.get(this.state[parent], '0')) break;
            return;
          default:
            console.log(`WARNING not handling ${parentQuestion.type} parent field`);
            return;
        }
      }
      if (type === 'Section') {
        const nest = this.getQuestions(fields);
        res.push(...nest);
        return;
      }
      res.push(question);
    });
    return res;
  };

  save = (isDraft) => {
    // Iterate through all questions and validate
    const errors = {};
    const formData = {};
    let attachments = [];
    const customFields = {};
    const outcomevalues = {};

    // Filter out questions for which the parent has not been filled out/selected
    const questions = this.getQuestions(this.props.forms.questions);

    const isValid = _.every(questions, (question) => {
      const { required, type, id, regex } = question;
      switch (type) {
        case 'IdeaTitle':
        case 'Text':
        case 'RichTextArea':
        case 'TextArea':
        case 'Decimal':
        case 'Select':
        case 'Radio':
        case 'IdeaCategory':
          if (id === 'team_members_message' && this.props.edit && !this.props.idea.is_draft) return true;
          if (type === 'Text' && regex && regex.length && !(this.state[id] || '').match(regex[0])) {
            errors[id] = regex[1];
            break;
          }
          if (this.state[id]) {
            switch (type) {
              case 'Select':
                formData[id] = this.state[id][0];
                break;
              case 'IdeaCategory':
                formData[id] = this.state[id].id;
                break;
              default:
                formData[id] = this.state[id];
                break;
            }
            if (this.fields[id] && (type === 'IdeaTitle' || type === 'Text' || type === 'TextArea' || type === 'Decimal')) {
              this.fields[id].blur();
            }
            return true;
          }
          if (!required || (isDraft && type !== 'IdeaTitle')) {
            if (this.fields[id] && (type === 'IdeaTitle' || type === 'Text' || type === 'TextArea' || type === 'Decimal')) {
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
          if (!required || isDraft) {
            return true;
          }
          errors[id] = localizedStrings.keywordsAtLeastOne;
          break;
        case 'Media':
          if (this.state.bannerImage) {
            attachments.push({ ...this.state.bannerImage, isBannerImage: true });
          } else if (this.props.edit && this.props.idea.banner_url && !this.state.removeBannerImage) {
            formData.banner_url = this.props.idea.banner_url;
          }
          if (this.state.coverImage) {
            attachments.push({ ...this.state.coverImage, isCoverImage: true });
          } else if (this.props.edit && this.props.idea.cover_url && !this.state.removeCoverImage) {
            formData.cover_url = this.props.idea.cover_url;
          }
          if (this.state[id] && this.state[id].length) {
            attachments = attachments.concat(this.state[id]);
            return true;
          }
          if (!required || isDraft) {
            return true;
          }
          if (!this.state.bannerImage && (!this.props.edit || this.state.removeBannerImage)) {
            errors.bannerCoverImage = localizedStrings.formatString(localizedStrings.mustAddImage, localizedStrings.banner);
          } else if (!this.state.coverImage && (!this.props.edit || this.state.removeCoverImage)) {
            errors.bannerCoverImage = localizedStrings.formatString(localizedStrings.mustAddImage, localizedStrings.card);
          } else {
            errors[id] = localizedStrings.attachmentsAtLeastOne;
          }
          break;
        case 'MultipleCheckbox':
          // TODO confirm - at least one checkbox must be checked if required?
          if (this.state[id]) {
            const checked = _.filter(_.keys(this.state[id]), key => this.state[id][key]);
            if (checked.length) {
              formData[id] = checked;
              return true;
            }
          }
          if (!required || isDraft) {
            return true;
          }
          errors[id] = localizedStrings.checkboxAtLeastOne;
          break;
        case 'UserSearch':
          if (this.state[id] && this.state[id].length) {
            formData[id] = {};
            _.each(this.state[id], (user) => {
              formData[id][user.email] = {
                couch_id: user.id,
                name: user.display_name,
                thumbnail: user.thumbnail,
                type: 'users',
              };
            });
            return true;
          }
          if (!required || isDraft) {
            return true;
          }
          errors[id] = localizedStrings.teamMemberAtLeastOne;
          break;
        case 'Custom':
          if (this.state[id]) {
            const checked = _.map(_.keys(this.state[id]), value => parseInt(value));
            if (checked.length) {
              formData[id] = checked;
              customFields[id] = _.map(this.state[id]);
              return true;
            }
          }
          if (!required || isDraft) {
            return true;
          }
          errors[id] = localizedStrings.customValueAtLeastOne;
          break;
        case 'Outcome':
          if (this.state[id] && this.state[id].length) {
            const outcomeIsValid = _.every(this.state[id], ({ value, field_values }) => {
              if (!value) {
                errors[id] = localizedStrings.fieldsMustBeCompleted;
                return false;
              }

              switch (question.outcome_type) {
                case 'Cost':
                  // todo: more validation?
                  if (!_.every(field_values, field_value => field_value)) {
                    errors[id] = localizedStrings.fieldsMustBeCompleted;
                    return false;
                  }
                  break;
                default:
                  console.log('Unsupported outcome field outcome type', question.outcome_type);
                  break;
              }

              return true;
            });
            if (!outcomeIsValid) break;
            // Parse all field values to numbers
            const outcomeData = _.cloneDeep(this.state[id]);
            _.each(outcomeData, ({ field_values }) => {
              _.each(field_values, (field_value, key) => field_values[key] = parseFloat(field_value));
            });
            outcomevalues[id] = {
              config: question,
              outcomerows: outcomeData,
            };
            formData[id] = outcomeData;
            return true;
          }
          if (!required || isDraft) {
            outcomevalues[id] = {
              config: question,
              outcomesrows: [],
            };
            return true;
          }
          errors[id] = localizedStrings.outcomeAtLeastOne;
          break;
        default:
          return true; // Ignore unsupported fields to allow for error
      }
      this.setState({ errors });
      if (errors.bannerCoverImage && this.scrollRefs.bannerCoverImage) this.scrollRefs.bannerCoverImage.scrollIntoView();
      if (this.scrollRefs[id]) this.scrollRefs[id].scrollIntoView();
      if (this.fields[id] && this.fields[id].focus) this.fields[id].focus();
      return false;
    });
    if (!isValid) return;
    console.log('form data here', formData);
    const state = { errors: {} };
    if (!this.props.edit) {
      if (!isDraft) {
        state.publishing = true;
      } else {
        state.saving = true;
      }
      this.setState(state, () => AppActions.addIdea(this.state.challenge.id, formData, attachments, isDraft, customFields, outcomevalues));
    } else {
      if (this.props.idea.is_draft && !isDraft) {
        state.publishing = true;
      } else {
        state.saving = true;
      }
      this.setState(state, () => {
        const { existingAttachments } = this.state;
        const attachmentsToKeep = _.differenceWith(this.props.idea.attachments, existingAttachments ? _.filter(existingAttachments, 'willDelete') : [], ({ id: attachmentId }, { id: idToDelete }) => attachmentId === idToDelete);
        if (attachmentsToKeep && attachmentsToKeep.length) {
          formData.attachments = attachmentsToKeep;
        }
        AppActions.updateIdea(this.props.idea.id, formData, attachments, state.publishing, customFields, outcomevalues);
      });
    }
  }

  renderQuestions = (questions) => {
    // Look for a Media question that supports images immediately
    const imageUploadQuestion = _.find(questions, question => question.type === 'Media' && question.images);
    const questionsToRender = [];
    if (imageUploadQuestion) {
      const { disabled } = imageUploadQuestion;
      const { errors } = this.state;
      questionsToRender.push((
        <ScrollIntoView key="bannerCoverImages" ref={ref => this.scrollRefs.bannerCoverImages = ref} onMount={false}>
          {!this.state.bannerImage ? (
            <ListItemAddAttachment
              onPress={() => this.onAttachImage('bannerImage')} disabled={disabled}
              style={Styles.mb5} text={`${this.props.edit && this.props.idea.banner_url && !this.state.removeBannerImage ? localizedStrings.change : localizedStrings.set} ${localizedStrings.bannerImage.toLowerCase()}`}
            />
          ) : (
            <Column>
              <Text>{localizedStrings.bannerImage}</Text>
              <Row style={Styles.pb5}>
                <Flex><Text style={[Styles.textLight]}>{`${this.state.bannerImage.name}`}</Text></Flex>
                <TouchableOpacity style={Styles.pl10} onPress={() => this.setState({ bannerImage: null })}>
                  <ION name="md-close" size={20} />
                </TouchableOpacity>
              </Row>
            </Column>
          )}
          {this.props.edit && this.props.idea.banner_url && !this.state.bannerImage ? (
            <Row style={Styles.pb5}>
              <Flex><Text style={[Styles.textLight]}>{`${this.props.idea.banner_url}`}</Text></Flex>
              <TouchableOpacity style={Styles.pl10} onPress={() => this.setState({ removeBannerImage: !this.state.removeBannerImage })}>
                {this.state.removeBannerImage ? <Text style={[Styles.textSmall]}>{localizedStrings.willBeDeleted}</Text> : <ION name="md-close" size={20} />}
              </TouchableOpacity>
            </Row>
          ) : null}
          {!this.state.coverImage ? (
            <ListItemAddAttachment
              onPress={() => this.onAttachImage('coverImage')} disabled={disabled}
              text={`${this.props.edit && this.props.idea.cover_url && !this.state.removeCoverImage ? localizedStrings.change : localizedStrings.set} ${localizedStrings.cardImage.toLowerCase()}`}
            />
          ) : (
            <Column>
              <Text>{localizedStrings.cardImage}</Text>
              <Row style={Styles.pb5}>
                <Flex><Text style={[Styles.textLight]}>{`${this.state.coverImage.name}`}</Text></Flex>
                <TouchableOpacity style={Styles.pl10} onPress={() => this.setState({ coverImage: null })}>
                  <ION name="md-close" size={20} />
                </TouchableOpacity>
              </Row>
            </Column>
          )}
          {this.props.edit && this.props.idea.cover_url && !this.state.coverImage ? (
            <Row style={Styles.pb5}>
              <Flex><Text style={[Styles.textLight]}>{`${this.props.idea.cover_url}`}</Text></Flex>
              <TouchableOpacity style={Styles.pl10} onPress={() => this.setState({ removeCoverImage: !this.state.removeCoverImage })}>
                {this.state.removeCoverImage ? <Text style={[Styles.textSmall]}>{localizedStrings.willBeDeleted}</Text> : <ION name="md-close" size={20} />}
              </TouchableOpacity>
            </Row>
          ) : null}
          {errors.bannerCoverImage ? <Text style={Styles.fieldError}>{errors.bannerCoverImage}</Text> : null}
        </ScrollIntoView>
      ));
    }
    return questionsToRender.concat(_.map(questions, (question) => {
      const { type, id, placeholder, default_open, label, fields, required, max_length, disabled, options, parent_value, parent } = question;
      const { challenge, errors, existingAttachments } = this.state;
      const { isTablet } = this.props;
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
        case 'Section':
          return (
            <Flex>
              <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                <FormGroup>
                  <SectionHeader
                    onPress={() => {
                      if ((this.state[id] === undefined && default_open) || this.state[id] === true) {
                        this.setState({[id]: false});
                      } else {
                        this.setState({[id]: true});
                      }
                    }} disabled={disabled}
                    open={(this.state[id] === undefined && default_open) || this.state[id] === true}
                    style={Styles.mb5} text={label}
                  />
                </FormGroup>
              </ScrollIntoView>
              {((this.state[id] === undefined && default_open) || this.state[id] === true) && this.renderQuestions(fields)}
            </Flex>
          );
        case 'IdeaTitle':
        case 'Text':
          return (
            <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
              <FormGroup>
                <TextInput
                  ref={c => this.fields[id] = c}
                  title={label ? `${label}${required ? ' *' : ''}` : null}
                  placeholder={placeholder}
                  maxLength={max_length || undefined}
                  editable={!disabled}
                  value={this.state[id]}
                  onChangeText={text => this.setState({ [id]: text.replace('\n', '') })}
                  multiline
                />
                {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
              </FormGroup>
            </ScrollIntoView>
          );
        case 'RichTextArea':
          return (
            <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
              <FormGroup>
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
              <FormGroup>
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
          if (id === 'team_members_message' && this.props.edit && !this.props.idea.is_draft) return null;
          return (
            <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
              <FormGroup>
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
              <FormGroup>
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
              <FormGroup style={isTablet ? { maxWidth: DeviceWidth / 2 } : null}>
                <SelectInput
                  ref={c => this.fields[id] = c}
                  onChange={value => this.setState({ [id]: value })}
                  value={this.state[id]}
                  placeholder={placeholder}
                  labelKey={1} options={options}
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
              <FormGroup>
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
        case 'MultipleCheckbox':
          return (
            <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
              <FormGroup>
                {label ? (
                  <FormGroup>
                    <Text style={Styles.inputLabel} ref={c => this.fields[id] = c}>{`${label}${required ? ' *' : ''}`}</Text>
                  </FormGroup>
                ) : null}
                {_.map(options, option => (
                  <ListItemCheckbox
                    key={option[0]}
                    item={option[1]}
                    isSelected={this.state[id] && this.state[id][option[0]]}
                    toggleItem={() => this.setState({ [id]: this.state[id] ? Object.assign({}, this.state[id], { [option[0]]: !this.state[id][option[0]] }) : { [option[0]]: true } })}
                    disabled={disabled}
                  />
                ))}
                {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
              </FormGroup>
            </ScrollIntoView>
          );
        case 'IdeaCategory':
          return (
            <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
              <FormGroup style={isTablet ? { maxWidth: DeviceWidth / 2 } : null}>
                <SelectInput
                  ref={c => this.fields[id] = c}
                  onChange={value => this.setState({ [id]: value })}
                  value={this.state[id]}
                  placeholder={localizedStrings.selectCategory}
                  labelKey="name" options={challenge ? challenge.categories : []}
                  title={label ? `${label}${required ? ' *' : ''}` : null}
                  disabled={disabled || !challenge || !challenge.categories}
                  noTitleOnOptions
                />
                {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
              </FormGroup>
            </ScrollIntoView>
          );
        case 'Media':
          if (!question.images && !question.documents) return null;
          return (
            <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
              <FormGroup>
                <ListItemAddAttachment
                  onPress={() => this.onAttachMedia(question)} ref={c => this.fields[id] = c} disabled={disabled}
                  style={Styles.mb5}
                />
                {existingAttachments ? _.map(existingAttachments, ({ id: attachmentId, filename, willDelete }) => (
                  <Row style={Styles.pb5} key={attachmentId}>
                    <Flex><Text style={[Styles.textLight]}>{`${filename}`}</Text></Flex>
                    <TouchableOpacity style={Styles.pl10} onPress={() => this.onMarkAttachmentForDelete(attachmentId)}>
                      {willDelete ? <Text style={[Styles.textSmall]}>{localizedStrings.willBeDeleted}</Text> : <ION name="md-close" size={20} />}
                    </TouchableOpacity>
                  </Row>
                )) : null}
                {this.state[id] && this.state[id].length ? _.map(this.state[id], (file, index) => (
                  <Row style={Styles.pb5} key={file.uri}>
                    <Flex><Text style={[Styles.textLight]}>{`${file.name}`}</Text></Flex>
                    <TouchableOpacity style={Styles.pl10} onPress={() => this.onDeleteAttachment(id, index)}>
                      <ION name="md-close" size={20} />
                    </TouchableOpacity>
                  </Row>
                )) : null}
                {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
              </FormGroup>
            </ScrollIntoView>
          );
        case 'UserSearch': {
          if (this.props.edit && !this.props.idea.is_draft) return null;
          const userSearch = this.state[`${id}-search`];
          // <ScrollIntoView> breaks the popup - touch doesnt work at all
          return (
            <FormGroup key={id}>
              {this.state.userSearching ? (
                <UserSearch
                  onUserSelected={user => this.onUserSelected(id, user)}
                  selected={this.state[id] || []}
                  onError={error => this.setState({ error })}
                />
              ) : null}
              {label ? <Text style={Styles.inputLabel}>{`${label}${required ? ' *' : ''}`}</Text> : null}
              {this.state[id] && this.state[id].length ? (
                <TagInput
                  ref={c => this.fields[`${id}-tags`] = c}
                  key={id}
                  value={this.state[id]}
                  onChange={users => this.setState({ [id]: users })}
                  labelExtractor={({ display_name }) => display_name}
                  text=""
                  onChangeText={() => {}}
                  inputProps={{ placeholder: '' }}
                  tagContainerStyle={Styles.tagContainer}
                  tagTextStyle={Styles.tagText}
                  textInputContainerStyle={[{ height: 60, marginBottom: 0, justifyContent: 'center' }]}
                  textInputStyle={[Styles.textInput, { paddingVertical: 5 }]}
                  flex
                  hideInput
                  tagCloseIcon={<FontAwesome5 style={{ marginLeft: 10 }} name="times" size={15} />}
                />
              ) : null}
              <TextInput
                ref={c => this.fields[id] = c}
                placeholder={placeholder}
                editable={!disabled}
                onChangeText={text => this.onUserSearchChangeText(id, text)}
                value={userSearch}
                onFocus={() => this.onUserSearchFocus(id)}
                onBlur={this.onUserSearchBlur}
              />
              {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
            </FormGroup>
          );
        }
        case 'Custom': {
          const selected = this.state[id] && _.keys(this.state[id]);
          return (
            <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
              <FormGroup>
                {label ? (
                  <FormGroup>
                    <Text style={Styles.inputLabel} ref={c => this.fields[id] = c}>{`${label}${required ? ' *' : ''}`}</Text>
                    <Anchor style={Styles.pt5} onPress={() => this.onAddCustomValue(id)}>{`+ ${localizedStrings.add}`}</Anchor>
                  </FormGroup>
                ) : null}
                {selected && selected.length ? _.map(this.state[id], (value, key) => (
                  <Row key={key} style={Styles.listItem}>
                    <Row style={{ flex: 1 }}>
                      {_.map(value.value, (row, index) => (
                        <Text key={index}>{row + (index !== value.value.length - 1 ? ' / ' : '')}</Text>
                      ))}
                    </Row>
                    <TouchableOpacity onPress={() => this.onRemoveCustomValue(id, key)}>
                      <FontAwesome5 name="trash" />
                    </TouchableOpacity>
                  </Row>
                )) : null}
                {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
              </FormGroup>
            </ScrollIntoView>
          );
        }
        case 'Outcome': {
          const customField = _.find(questions, q => q.id === question.custom_field);
          if (!customField) return null; // Only supporting outcomes that rely on a custom field for now
          switch (question.outcome_type) {
            case 'Cost': {
              const totalField = (
                <Text style={isTablet ? { textAlign: 'right', paddingRight: 20 } : {}}>{`${question.icon}${(this.state[id] && this.state[id].length) ? this.state[id].reduce((total, { field_values }) => total += (_.keys(field_values).length > 0 ? _.values(field_values).reduce((subtotal, field_value) => subtotal *= field_value || 0, 1) : 0), 0).toFixed(2) : '0.00'}`}</Text>
              );
              return (
                <ScrollIntoView key={id} ref={ref => this.scrollRefs[id] = ref} onMount={false}>
                  {label ? (
                    <FormGroup>
                      <Text style={Styles.inputLabel} ref={c => this.fields[id] = c}>{`${label}${required ? ' *' : ''}`}</Text>
                    </FormGroup>
                  ) : null}
                  {isTablet ? (
                    <Row>
                      <Flex value={3}>
                        <Text style={Styles.listItemText}>{customField.label || ''}</Text>
                      </Flex>
                      {_.map(question.calculation_fields, (field, index) => (
                        <Flex key={index}>
                          <Text style={Styles.listItemText}>{field.label_translations[AccountStore.getLanguageCode()]}</Text>
                        </Flex>
                      ))}
                      <Flex>
                        <Text style={[Styles.listItemText, { textAlign: 'right', paddingRight: 20 }]}>{localizedStrings.total}</Text>
                      </Flex>
                    </Row>
                  ) : null}
                  {_.map(this.state[id], ({ value, field_values }, index) => {
                    const valueField = (
                      <FormGroup pt5 pb5>
                        <TouchableOpacity onPress={() => this.onOutcomeCustomFieldSelect(id, index, customField.id)} style={Styles.selectInput}>
                          <Column style={{ flex: 1 }}>
                            <Row style={{ flex: 1 }} space>
                              <Flex value={11}>
                                <Text style={[Styles.selectInputText, Styles.textSmall]}>
                                  {value ? this.state[customField.id][value].value.join(' / ') : localizedStrings.selectAValue}
                                </Text>
                              </Flex>
                              <Flex value={1}>
                                <FontAwesome5 name="caret-down" color={pallette.wazokuNavy} />
                              </Flex>
                            </Row>
                          </Column>
                        </TouchableOpacity>
                      </FormGroup>
                    );
                    const calculationFields = _.map(field_values, (field_value, field_value_index) => {
                      let field;
                      switch (question.calculation_fields[field_value_index].type) {
                        case 'number':
                          field = (
                            <TextInput
                              style={[Styles.textSmall, { backgroundColor: 'white' }]}
                              editable={!disabled}
                              onChangeText={text => this.onOutcomeFieldChange(id, text, index, field_value_index, question.calculation_fields[field_value_index].type)}
                              value={field_value}
                            />
                          );
                          break;
                        case 'currency':
                          field = (
                            <TextInput
                              style={[Styles.textSmall, { backgroundColor: 'white' }]}
                              editable={!disabled}
                              onChangeText={text => this.onOutcomeFieldChange(id, text, index, field_value_index, question.calculation_fields[field_value_index].type)}
                              value={`${question.icon}${field_value}`}
                            />
                          );
                          break;
                        default:
                          console.log('Unsupported Outcome calculation field type', question.calculation_fields[field_value_index].type);
                          return null;
                      }
                      return isTablet ? (
                        <Flex key={field_value_index} style={Styles.mr5}>
                          <FormGroup pt5 pb5>
                            {field}
                          </FormGroup>
                        </Flex>
                      ) : (
                        <View key={field_value_index}>
                          <Flex>
                            <Text style={Styles.listItemText}>{`${question.calculation_fields[field_value_index].label_translations[AccountStore.getLanguageCode()]}:`}</Text>
                          </Flex>
                          <Flex>
                            <FormGroup pt5 pb5 style={{ maxWidth: '50%' }}>
                              {field}
                            </FormGroup>
                          </Flex>
                          <View style={{ padding: 10 }} />
                        </View>
                      );
                    });
                    const subtotalField = (
                      <FormGroup>
                        <Text style={[Styles.textSmall, isTablet ? { textAlign: 'right', paddingRight: 10 } : {}]}>{`${question.icon}${_.keys(field_values).length > 0 ? _.values(field_values).reduce((total, field_value) => total *= field_value || 0, 1).toFixed(2) : '0.00'}`}</Text>
                      </FormGroup>
                    );
                    return isTablet ? (
                      <Row key={index}>
                        <Flex value={3} style={Styles.mr5}>
                          {valueField}
                        </Flex>
                        {calculationFields}
                        <Flex>
                          {subtotalField}
                        </Flex>
                        <TouchableOpacity onPress={() => this.onRemoveOutcomeRow(id, index)}>
                          <FontAwesome5 name="trash" />
                        </TouchableOpacity>
                      </Row>
                    ) : (
                      <Column key={index} style={{ backgroundColor: index % 2 === 0 ? '#efefef' : '#fff', padding: 5 }}>
                        <Flex>
                          <Text style={Styles.listItemText}>{`${customField.label || ''}:`}</Text>
                        </Flex>
                        <Row style={[Styles.mt0, Styles.mb10]}>
                          <Flex>
                            {valueField}
                          </Flex>
                          <TouchableOpacity onPress={() => this.onRemoveOutcomeRow(id, index)} style={{ padding: 10 }}>
                            <FontAwesome5 name="trash" />
                          </TouchableOpacity>
                        </Row>
                        {calculationFields}
                        <View>
                          <Flex>
                            <Text style={Styles.listItemText}>{`${localizedStrings.total}:`}</Text>
                          </Flex>
                          <Flex value={4}>{subtotalField}</Flex>
                        </View>
                      </Column>
                    );
                  })}
                  {isTablet ? (
                    <Row>
                      <Flex value={3}><Anchor onPress={() => this.onAddOutcomeRow(id)} disabled={!this.state[customField.id] || !_.keys(this.state[customField.id]).length}>{`+ ${localizedStrings.add}`}</Anchor></Flex>
                      <Flex/>
                      <Flex/>
                      <Flex style={{ borderTopWidth: 2, borderTopColor: 'black', flex: 1, paddingTop: 10 }}>
                        {totalField}
                      </Flex>
                    </Row>
                  ) : (
                    <React.Fragment>
                      <Column style={{ margin: 5, backgroundColor: (this.state[id] ? this.state[id].length : 0) % 2 === 0 ? '#efefef' : '#fff', padding: 5 }}>
                        <Flex style={Styles.pb5}>
                          <Text style={Styles.listItemText}>{`${localizedStrings.total}:`}</Text>
                        </Flex>
                        <Flex>{totalField}</Flex>
                      </Column>
                      <Flex style={Styles.pt5}>
                        <Anchor onPress={() => this.onAddOutcomeRow(id)} disabled={!this.state[customField.id] || !_.keys(this.state[customField.id]).length}>{`+ ${localizedStrings.add}`}</Anchor>
                      </Flex>
                    </React.Fragment>
                  )}
                  {errors[id] ? <Text style={Styles.fieldError}>{errors[id]}</Text> : null}
                </ScrollIntoView>
              );
            }
            default:
              console.log('Unsupported outcome field outcome type', question.outcome_type);
              return null;
          }
        }
        case 'Documents':
        default:
          //   console.log(`Question type ${type} is not supported`);
          return null;
      }
    }));
  }

  render() {
    const {
      props: { edit, forms, formsLoading, isTablet, formsError, error, myIdeasSaving, DeviceWidth, DeviceHeight },
      state: { challenge, isLoadingData, error: stateError, discarding, saving, publishing, scrollDisabled } } = this;
    const publishButton = (
      <Flex>
        <ButtonPrimary style={isTablet ? Styles.mr10 : Styles.mb5} disabled={myIdeasSaving || !this.canSave()} onPress={() => this.save()}>{(myIdeasSaving && publishing) ? localizedStrings.publishing : localizedStrings.publish}</ButtonPrimary>
      </Flex>
    );
    const saveButton = (
      <Flex>
        <ButtonTertiary style={isTablet ? Styles.mr5 : Styles.mb5} disabled={myIdeasSaving || !this.canSave()} onPress={() => this.save(this.props.idea.is_draft)}>{(myIdeasSaving && saving) ? localizedStrings.saving : localizedStrings.save}</ButtonTertiary>
      </Flex>
    );
    const cancelButton = (

      <Flex>
        <ButtonAlt
          textStyle={{ color: pallette.wazokuDanger }} style={Styles.ml5} disabled={myIdeasSaving}
          onPress={() => Navigation.dismissModal(this.props.componentId)}
        >
          {localizedStrings.cancel}
        </ButtonAlt>
      </Flex>

    );
    const isDraftButtons = (
      <React.Fragment>
        {publishButton}
        {saveButton}
        <Flex>
          <ButtonAlt textStyle={{ color: pallette.wazokuDanger }} disabled={discarding || myIdeasSaving} onPress={this.discardDraft}>{(myIdeasSaving && discarding) ? localizedStrings.discarding : localizedStrings.discard}</ButtonAlt>
        </Flex>
      </React.Fragment>
    );
    return (
      <Flex style={[Styles.body, { DeviceWidth, DeviceHeight }]}>
        <ErrorAlert error={error} error2={stateError} error3={formsError} />
        <ScrollIntoViewScrollView
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!scrollDisabled}
          onKeyboardDidHide={this.onKeyboardDidHide}
        >
          <Container>
            {!edit ? (
              <FormGroup style={isTablet ? { width: DeviceWidth / 2 } : null}>
                <SelectInput
                  placeholder={localizedStrings.selectAChallenge}
                  value={challenge || ''}
                  labelKey="name"
                  onPress={() => Navigation.showModal(routes.searchChallengeModal(challenge, this.onChallengeSelected))}
                  title={localizedStrings.challenge}
                />
              </FormGroup>
            ) : null}
            {(formsLoading || isLoadingData) ? <Flex style={Styles.centeredContainer}><Loader /></Flex> : forms && forms.questions && forms.questions.length ? this.renderQuestions(forms.questions) : null}

            {!edit ? (
              <FormGroup pb10>
                <Row>
                  <Flex>
                    <ButtonTertiary
                      style={[isTablet ? Styles.mr5 : Styles.mb5, Styles.mr5]} disabled={myIdeasSaving || !this.canSave()} onPress={() => this.save(true)}
                    >
                      {(myIdeasSaving && saving) ? localizedStrings.saving : localizedStrings.saveAsDraft}

                    </ButtonTertiary>
                  </Flex>
                  {publishButton}
                </Row>
              </FormGroup>
            ) : (

              <FormGroup pb10>
                {isTablet ? (
                  <Row>
                    {this.props.idea.is_draft ? isDraftButtons : (
                      <React.Fragment>
                        {saveButton}
                        {cancelButton}
                      </React.Fragment>
                    )}
                  </Row>
                ) : this.props.idea.is_draft ? (
                  <React.Fragment>
                    {isDraftButtons}
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Row>
                      {saveButton}
                      {cancelButton}
                    </Row>
                  </React.Fragment>
                )}

              </FormGroup>
            )}

          </Container>
        </ScrollIntoViewScrollView>
        <Toast
          ref="toast"
          position="top"
          style={{ backgroundColor: pallette.buttonSecondary }}
          textStyle={{ fontFamily: 'ProximaNova-Bold', color: 'white', fontSize: styleVariables.fontSizeParagraph }}
        />
      </Flex>
    );
  }
}))));
