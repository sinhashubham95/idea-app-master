/**
 * Created by kylejohnson on 28/01/2017.
 */
import React, { Component } from 'react';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { ButtonPrimary, ButtonSecondary, ButtonTertiary } from '../components/base/forms/Button';
import SearchFilterButton from '../components/SearchFilterButton';
import Anchor from '../components/Anchor';
import ChallengeCard from '../components/ChallengeCard';
import IdeaListItem from '../components/IdeaListItem';
import ListItemAttachment from '../components/ListItemAttachment';
import ErrorAlert from '../components/ErrorAlert';
import SelectInput from '../components/SelectInput';
import ListItemCheckbox from '../components/ListItemCheckbox';
import ProfileButton from '../components/ProfileButton';
import ListItemAddAttachment from '../components/ListItemAddAttachment';
import NotificationListItem from '../components/NotificationListItem';

// import RadioButton from '../components/RadioButton';


const radio_props = [
    { label: 'param1', value: 0 },
    { label: 'param2', value: 1 },
];

const exampleChallenge = {

    'created': 1554225902.0,
    'modified': 1554226185.0,
    'name': 'Make any pair of trainers into hover trainers',
    'description': '<p>This is a much shorter description of a challenge. This is a much shorter description of a challenge. Shorter.</p>\n',
    'id': '4646555306f64ee6851c030c8e6bb843',
    'image_url': null,
    'is_private': false,
    'stats': {
        'views': 7,
        'ideas_added': 1,
        'num_archived_ideas': 0,
        'creators': 1,
        'contributors': 3,
    },
    'num_visits': 7,
    'is_team_enabled': true,
    'custom_terms': null,
    'is_parallel': true,
    'is_spotlight_share_enabled': true,
    'is_yammer_share_enabled': false,
    'rating_system': {
        'id': 1,
        'name': 'Thumbs up/down',
        'is_active': true,
        'lowest_rating_first': false,
        'algorithm': 'popularity',
        'option_list': [
            {
                'id': 1,
                'name': 'Thumbs Up',
                'value': '1.00',
                'icon': 'fa-thumbs-o-up',
                'icon_color': '#000000',
                'selected_icon': 'fa-thumbs-up',
                'selected_icon_color': '#000000',
            },
            {
                'id': 2,
                'name': 'Thumbs Down',
                'value': '-1.00',
                'icon': 'fa-thumbs-o-down',
                'icon_color': '#000000',
                'selected_icon': 'fa-thumbs-down',
                'selected_icon_color': '#000000',
            },
        ],
    },

};

const MarkupScreen = class extends Component {
    static options(passProps) {
        return _.merge({}, global.navBarStyle, { topBar: { title: { text: 'Markup' } } });
    }

    static propTypes = {
        componentId: propTypes.string,
    };

    static displayName = 'MarkupScreen';

    state = {
        value: 0,
    }

    componentWillMount() {
        Navigation.events().bindComponent(this);
    }

    componentDidAppear() {
        API.trackPage('Markup Screen');
    }

    render() {
        return (
            <ScrollView style={Styles.body}>
                <Container>
                    <FormGroup>
                        <FormGroup pb0>
                            <H2>Typeography</H2>
                        </FormGroup>
                        <H1>Heading H1</H1>
                        <H2>Heading H2</H2>
                        <H3>Heading H3</H3>
                        <H4>Heading H4</H4>
                        <Text style={Styles.paragraph}>This is some body text.</Text>
                        <Text style={Styles.paragraphLight}>This is some lighter body text.</Text>
                        <Anchor>This is a Link</Anchor>
                        <ErrorAlert/>
                    </FormGroup>
                    <FormGroup>
                        <H2>Buttons</H2>
                        <FormGroup>
                            <ButtonPrimary>Primary</ButtonPrimary>
                        </FormGroup>
                        <FormGroup>
                            <ButtonSecondary>Secondary</ButtonSecondary>
                        </FormGroup>
                        <FormGroup>
                            <ButtonTertiary>Tertiary</ButtonTertiary>
                        </FormGroup>
                        <FormGroup>
                            <ButtonAlt textStyle={{color: pallette.wazokuDanger}}>Cancel</ButtonAlt>
                        </FormGroup>
                        <FormGroup>
                            <View style={{ width: DeviceWidth / 4 }}>
                                <SearchFilterButton name="Sort"/>
                            </View>
                        </FormGroup>
                        <ProfileButton/>
                    </FormGroup>
                    <FormGroup>
                        <H2>Forms</H2>
                        <FormGroup pt0>
                            <TextInput
                              title="Password"
                              placeholder="Your password"
                            />
                        </FormGroup>
                        <FormGroup>
                            <TextInput
                              title="Multiline Input"
                              placeholder="Add some more information"
                              multiline
                              numberOfLines={4}
                            />
                        </FormGroup>
                        <FormGroup pt0>
                            <SelectInput
                              placeholder="Challenge One"
                              value={this.state.selectValue}
                              onChange={selectValue => this.setState({ selectValue })}
                              labelKey="label" options={[{
                                  label: 'Challenge 12344566059999999999999999999',
                                  id: 1,
                              }, {
                                  label: 'Challenge 2',
                                  id: 1,
                              }]}
                              title="Select Input"
                            />
                        </FormGroup>
                        <FormGroup pt0>
                            <ListItemCheckbox
                              item="Checkbox Item text goes here"
                              isSelected={this.state.isCheckboxSelected}
                              toggleItem={() => this.setState({ isCheckboxSelected: !this.state.isCheckboxSelected })}
                            />
                        </FormGroup>
                        <FormGroup pt0>
                            <RadioForm
                              radio_props={radio_props}
                              initial={0}
                              buttonInnerColor={pallette.wazokuBlue}
                              buttonOuterSize={20}
                              buttonOuterColor={pallette.wazokuBlue}
                              buttonSize={10}
                              buttonColor={pallette.wazokuBlue}
                              onPress={(value) => { this.setState({ value }); }}
                              selectedButtonColor={pallette.wazokuBlue}
                              labelStyle={Styles.paragraphLight}
                            />
                        </FormGroup>
                    </FormGroup>
                    <FormGroup>
                        <H2>Cards</H2>
                        <ChallengeCard
                          key={exampleChallenge.id}
                          challenge={exampleChallenge}
                          onAddIdea={() => this.onAddIdea(exampleChallenge.id)}
                          onViewIdeas={() => this.onViewIdeas(exampleChallenge)}
                          onShareChallenge={() => this.onShareChallenge(exampleChallenge)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <H2>Lists</H2>
                        {/* <IdeaListItem/> */}
                        <ListItemAttachment attachment={{ filename: 'you_are_mate.pdf', url: 'www.wazoku.com' }}/>
                        <ListItemAddAttachment/>
                        
                    </FormGroup>
                </Container>
            </ScrollView>
        );
    }
};

module.exports = MarkupScreen;
