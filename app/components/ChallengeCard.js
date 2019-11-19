// import propTypes from 'prop-types';
import React, { Component } from 'react';

import HTMLTruncator from './HTMLTruncator';
import HTML from './IdeaDetails';

export default class ChallengeCard extends Component {
    static displayName = 'ChallengeCard';

    static propTypes = {
        challenge: propTypes.object,
        style: propTypes.object,
    };

    state = {
        showFullDescription: false,
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState)) return true;

        const nextChallenge = nextProps.challenge;
        const { challenge } = this.props;
        if (nextChallenge.name !== challenge.name || nextChallenge.description !== challenge.description
            || nextChallenge.cover_url !== challenge.cover_url || !_.isEqual(nextChallenge.stats, challenge.stats)) {
            return true;
        }

        return false;
    }

    onLayoutDescription = (e) => {
        if (!this.state.descriptionHeight) {
            this.setState({ descriptionHeight: e.nativeEvent.layout.height });
        }
    }

    onAddIdea = () => {
        const { challenge } = this.props;
        AppActions.viewedChallenge(challenge.id);
        Navigation.showModal(routes.addIdeaModal(challenge));
    }

    onViewIdeas = () => {
        const { challenge } = this.props;
        AppActions.viewedChallenge(challenge.id);
        routes.goToSearchTab({ challenge });
    }

    onShareChallenge = () => {
        Navigation.showModal(routes.shareModal('challenges', this.props.challenge.id));
    }

    render() {
        const {
            state: { showFullDescription, descriptionHeight },
            props: {
                challenge: { name, description, cover_url, stats: { ideas_added, views } },
            },
        } = this;
        return (
            <Flex style={[Styles.challengeCard, Styles.mb10, this.props.style]}>
                <Flex style={Styles.challengeCardBody}>
                    <Row>
                        <FastImage
                          source={cover_url ? { uri: Utils.getSafeImageUrl(cover_url) } : require('../images/challenge-placeholder.png')}
                          style={Styles.challengeCardImage}
                        />
                        <Flex>
                            <Text style={Styles.challengeCardTitle}>{name}</Text>
                            <Text style={[Styles.challengeCardMetaText, Styles.mt5]}>
                                {`${ideas_added} ${localizedStrings.ideas} | ${views} ${localizedStrings.views}`}
                            </Text>
                        </Flex>
                    </Row>
                    {description ? (
                        <HTMLTruncator
                          onLayout={this.onLayoutDescription}
                          html={description}
                          showAll={showFullDescription}
                          htmlHeight={descriptionHeight}
                          toggleAll={show => this.setState({ showFullDescription: show })}
                        />
                    ) : null}
                </Flex>
                <Row style={Styles.challengeCardFooter}>
                    <Flex>
                        <TouchableOpacity onPress={this.onAddIdea}>
                            <Row>
                                <Flex value={2}>
                                    <FontAwesome5 color={pallette.greyDark} name="plus" />
                                </Flex>
                                <Flex value={10}>
                                    <Text style={Styles.cardfooterItem}>{localizedStrings.addIdea.toUpperCase()}</Text>
                                </Flex>
                            </Row>
                        </TouchableOpacity>
                    </Flex>
                    <Flex>
                        <TouchableOpacity onPress={this.onViewIdeas}>
                            <Row>
                                <Flex value={2}>
                                    <FontAwesome5 color={pallette.greyDark} name="eye" />
                                </Flex>
                                <Flex value={10}>
                                    <Text style={Styles.cardfooterItem}>{localizedStrings.viewIdeas}</Text>
                                </Flex>
                            </Row>
                        </TouchableOpacity>
                    </Flex>
                    <Flex>
                        <TouchableOpacity onPress={this.onShareChallenge}>
                            <Row>
                                <Flex value={2}>
                                    <FontAwesome5 color={pallette.greyDark} name="share-alt" />
                                </Flex>
                                <Flex value={10}>
                                    <Text style={Styles.cardfooterItem}>{localizedStrings.share.toUpperCase()}</Text>
                                </Flex>
                            </Row>
                        </TouchableOpacity>
                    </Flex>
                </Row>

            </Flex>
        );
    }
}