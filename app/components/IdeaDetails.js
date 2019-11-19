import { Component } from 'react';
import HTML from 'react-native-render-html';
import TagInput from 'react-native-tag-input';

import withChallengeForms from 'providers/withChallengeForms';
import ListItemAttachment from 'components/ListItemAttachment';
import data from "stores/base/_data";

export default withChallengeForms(class IdeaDetails extends Component {
    static displayName = 'IdeaDetails';

    static propTypes = {
        challengeId: propTypes.string,
        idea: propTypes.object,
        getForms: propTypes.func,
        forms: propTypes.object,
        formsLoading: propTypes.bool,
        formsError: propTypes.string,
        isTablet: propTypes.bool,
    }

    state = {
        isLoadingData: true,
    }

    componentDidMount() {
        this.props.getForms(this.props.challengeId);
        if (this.props.forms) {
            this.loadExistingData();
        }
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props.idea, prevProps.idea)) {
            this.loadExistingData();
        }
    }

    onOpenAttachment = (url, filename) => {
        Utils.openAttachment(url, filename)
            .catch(e => this.props.onOpenAttachmentError && this.props.onOpenAttachmentError(e));
    }

    getStateValues = async (questions) => {
        let state = {};
        const { data: ideaData, category, custom_fields, outcomevalues } = this.props.idea;
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
                case 'DescriptiveText':
                    state[id] = ideaData[id];
                    return resolve();
                case 'Select':
                    state[id] = _.find(options, option => option[0] === ideaData[id]);
                    return resolve();
                case 'IdeaCategory':
                    state[id] = category.name;
                    return resolve();
                case 'Media':
                    return resolve();
                case 'MultipleCheckbox':
                    state[id] = _.map(ideaData[id], key => ({ key, option: _.get(_.find(options, option => option[0] === key), '1') }));
                    return resolve();
                case 'UserSearch':
                    state[id] = _.map(ideaData[id], (member, email) => ({ display_name: member.name, id: member.couch_id, thumbnail: member.thumbnail, email }));
                    return resolve();
                case 'Custom':
                    state[id] = Object.assign({}, ..._.map(custom_fields[id], ({ id: valueId, value }) => ({ [valueId]: { id: valueId, value } })));
                    resolve();
                    break;
                case 'Outcome':
                    state[id] = outcomevalues && outcomevalues[id];
                    return resolve();
                default:
                    resolve();
            }
        })));
        return state;
    };

    loadExistingData = async () => {
        // Iterate through all current stage questions and add the data to state
        const state = await this.getStateValues(this.props.forms.questions);
        console.log('hello there', state);
        this.setState({ ...state, isLoadingData: false });
    };

    getQuestions = (questions) => {
      const res = [];
      _.map(questions, (question) => {
          const { fields, type } = question;
          if (type === 'Section') {
              const nest = this.getQuestions(fields);
              res.push(...nest);
              return;
          }
          res.push(question);
      });
      return res;
    };

    render() {
        const {
            state: { isLoadingData },
            props: { forms, formsLoading, formsError, idea, isTablet },
        } = this;

        if (formsLoading || isLoadingData) return <Flex style={Styles.centeredContainer}><Loader /></Flex>;
        if (formsError && !forms) {
            return (
                <FormGroup style={[Styles.pt20, { marginHorizontal: styleVariables.paddingBase }]}>
                    <Fade autostart value={1} style={Styles.errorWrapper}>
                        <Text style={Styles.errorText}>
                            {formsError}
                        </Text>
                    </Fade>
                </FormGroup>
            );
        }
        if (!forms || !forms.questions || !forms.questions.length) return null;
        const questions = this.getQuestions(forms.questions);
        if (!questions.length) return null;
        return (
            <ScrollView style={{ flex: 1 }}>
                {_.map(questions, (question) => {
                    const { type, id, label, options, parent, parent_value } = question;
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
                        case 'IdeaTitle':
                            return null;
                        case 'Text':
                        case 'TextArea':
                        case 'Decimal':
                        case 'DescriptiveText':
                        case 'IdeaCategory':
                            if (!this.state[id]) return null;
                            if (id === 'team_members_message') return null;
                            return (
                                <FormGroup key={id}>
                                    <H4 style={Styles.uppercase}>{label}</H4>
                                    <Text>{this.state[id]}</Text>
                                </FormGroup>
                            );
                        case 'RichTextArea':
                            if (!this.state[id]) return null;
                            return (
                                <FormGroup key={id}>
                                    <H4 style={Styles.uppercase}>{label}</H4>
                                    <HTML
                                      baseFontStyle={{ fontFamily: 'ProximaNova-Regular' }}
                                      html={this.state[id]}
                                    />
                                </FormGroup>
                            );
                        case 'Keywords':
                            if (!this.state[id]) return null;
                            return (
                                <FormGroup key={id}>
                                    <H4 style={Styles.uppercase}>{label}</H4>
                                    <TagInput
                                      value={this.state[id]}
                                      onChange={() => {}}
                                      labelExtractor={keyword => keyword}
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
                                      hideTagCloseIcon
                                    />
                                </FormGroup>
                            );
                        case 'Select':
                            if (!this.state[id]) return null;
                            return (
                                <FormGroup key={id}>
                                    <H4 style={Styles.uppercase}>{label}</H4>
                                    <Text>{this.state[id][1]}</Text>
                                </FormGroup>
                            );
                        case 'Radio': {
                            if (!this.state[id]) return null;
                            const choice = _.find(options, o => o[0] === this.state[id])[1];
                            return (
                                <FormGroup key={id}>
                                    <H4 style={Styles.uppercase}>{label}</H4>
                                    <Text>{choice}</Text>
                                </FormGroup>
                            );
                        }
                        case 'MultipleCheckbox':
                            if (!this.state[id]) return null;
                            return (
                                <FormGroup key={id}>
                                    <H4 style={Styles.uppercase}>{label}</H4>
                                    {_.map(this.state[id], ({ key, option }) => <Text key={key}>{option}</Text>)}
                                </FormGroup>
                            );
                        case 'Media':
                            if (!idea.attachments.length) return null;
                            return (
                                <React.Fragment>
                                    <H4 style={Styles.uppercase}>{localizedStrings.attachments}</H4>
                                    {_.map(idea.attachments, attachment => <ListItemAttachment key={attachment.id} attachment={attachment} onOpenAttachment={this.onOpenAttachment} />)}
                                </React.Fragment>
                            );
                        case 'Custom': {
                            return (
                                <FormGroup key={id}>
                                    <H4 style={Styles.uppercase}>{label}</H4>
                                    {_.map(this.state[id], ({ id: key, value }) => <Text key={key} style={Styles.customValueRow}>{value.join(' / ')}</Text>)}
                                </FormGroup>
                            );
                        }
                        case 'Outcome': {
                            if (!this.state[id]) return null;
                            const customField = _.find(forms.questions, q => q.id === question.custom_field);
                            if (!customField) return null; // todo: only supporting outcome fields that associate with custom field
                            const { config, outcomerows } = this.state[id];
                            switch (config.outcome_type) {
                                case 'Cost': {
                                    const totalField = <Text style={isTablet ? { textAlign: 'right' } : {}}>{`${question.icon}${(outcomerows && outcomerows.length) ? outcomerows.reduce((total, { field_values }) => total += (_.keys(field_values).length > 0 ? _.values(field_values).reduce((subtotal, field_value) => subtotal *= field_value || 0, 1) : 0), 0).toFixed(2) : '0.00'}`}</Text>;
                                    return (
                                        <FormGroup key={id}>
                                            <H4 style={Styles.uppercase}>{config.label}</H4>
                                            {isTablet ? (
                                                <Row style={Styles.outcomeRow}>
                                                    <Flex value={3}>
                                                        <Text>{customField.label || ''}</Text>
                                                    </Flex>
                                                    {_.map(question.calculation_fields, (field, index) => (
                                                        <Flex key={index}>
                                                            <Text style={field.type === 'currency' ? { textAlign: 'right' } : {}}>{field.label_translations[AccountStore.getLanguageCode()]}</Text>
                                                        </Flex>
                                                    ))}
                                                    <Flex>
                                                        <Text style={{ textAlign: 'right' }}>{localizedStrings.total}</Text>
                                                    </Flex>
                                                </Row>
                                            ) : null}
                                            {_.map(outcomerows, ({ value, field_values }, rowIndex) => {
                                                const customValue = _.find(this.state[customField.id], custom_field => custom_field.id === value);
                                                const valueField = <Text>{customValue.value.join(' / ')}</Text>;
                                                const calculationFields = _.map(field_values, (field_value, field_value_index) => {
                                                    let field;
                                                    switch (question.calculation_fields[field_value_index].type) {
                                                        case 'number':
                                                            field = <Text>{field_value}</Text>;
                                                            break;
                                                        case 'currency':
                                                            field = <Text style={isTablet ? { textAlign: 'right' } : {}}>{`${config.icon}${field_value.toFixed(2)}`}</Text>;
                                                            break;
                                                        default:
                                                            console.log('Unsupported Outcome calculation field type', question.calculation_fields[field_value_index].type);
                                                            return null;
                                                    }
                                                    return isTablet ? (
                                                        <Flex key={field_value_index}>
                                                            {field}
                                                        </Flex>
                                                    ) : (
                                                        <FormGroup key={field_value_index}>
                                                            <Flex style={Styles.pb5}>
                                                                <Text style={Styles.listItemText}>{`${question.calculation_fields[field_value_index].label_translations[AccountStore.getLanguageCode()]}:`}</Text>
                                                            </Flex>
                                                            <Flex>
                                                                {field}
                                                            </Flex>
                                                        </FormGroup>
                                                    );
                                                });
                                                const subtotalField = <Text style={isTablet ? { textAlign: 'right' } : {}}>{`${config.icon}${_.keys(field_values).length > 0 ? _.values(field_values).reduce((total, field_value) => total *= field_value || 0, 1).toFixed(2) : '0.00'}`}</Text>;
                                                return isTablet ? (
                                                    <Row key={rowIndex} style={Styles.outcomeRow}>
                                                        <Flex value={3}>
                                                            {valueField}
                                                        </Flex>
                                                        {calculationFields}
                                                        <Flex>
                                                            {subtotalField}
                                                        </Flex>
                                                    </Row>
                                                ) : (
                                                    <Column key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? '#efefef' : '#fff', padding: 5 }}>
                                                        <FormGroup>
                                                            <Flex style={Styles.pb5}>
                                                                <Text style={Styles.listItemText}>{`${customField.label || ''}:`}</Text>
                                                            </Flex>
                                                            <Flex>{valueField}</Flex>
                                                        </FormGroup>
                                                        {calculationFields}
                                                        <FormGroup>
                                                            <Flex style={Styles.pb5}>
                                                                <Text style={Styles.listItemText}>{`${localizedStrings.total}:`}</Text>
                                                            </Flex>
                                                            <Flex>{subtotalField}</Flex>
                                                        </FormGroup>
                                                    </Column>
                                                );
                                            })}
                                            {isTablet ? (
                                                <Row>
                                                    <Flex value={3}/>
                                                    <Flex/>
                                                    <Flex/>
                                                    <Flex>
                                                        <View style={{ alignSelf: 'flex-end', borderTopWidth: 2, borderTopColor: 'black', paddingTop: 10, width: '95%' }}>
                                                            {totalField}
                                                        </View>
                                                    </Flex>
                                                </Row>
                                            ) : (
                                                <FormGroup style={{ margin: 5, backgroundColor: outcomerows.length % 2 === 0 ? '#efefef' : '#fff', padding: 5 }}>
                                                    <Flex style={Styles.pb5}>
                                                        <Text style={Styles.listItemText}>{`${localizedStrings.total}:`}</Text>
                                                    </Flex>
                                                    <Flex>{totalField}</Flex>
                                                </FormGroup>
                                            )}
                                        </FormGroup>
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
                })}
                <View style={{ height: 75 }} />
                {/* FAB button spacer */}
            </ScrollView>
        );
    }
});
