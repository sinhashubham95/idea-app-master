// import propTypes from 'prop-types';
import React, { Component } from 'react';

import HTMLTruncator from './HTMLTruncator';

export default class IdeaCard extends Component {
    static displayName = 'IdeaCard';

    static propTypes = {
        componentId: propTypes.string,
        idea: propTypes.shape({
            id: propTypes.string,
            serial_number: propTypes.string,
            name: propTypes.string,
            summary: propTypes.string,
            num_comments: propTypes.number,
            challenge: propTypes.object,
        }),
        style: propTypes.object,
        isOffline: propTypes.bool,
    };

    state = {};

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState)) return true;

        const nextIdea = nextProps.idea;
        const { idea } = this.props;
        if (nextIdea.name !== idea.name || nextIdea.serial_number !== idea.serial_number || idea.summary !== nextIdea.summary
            || idea.num_comments !== nextIdea.num_comments || !_.isEqual(idea.rating_counts, nextIdea.rating_counts)
            || idea.is_following !== nextIdea.is_following || idea.challenge.name !== nextIdea.challenge.name
            || idea.cover_url !== nextIdea.cover_url || idea.status !== nextIdea.status) {
            return true;
        }

        return false;
    }

    onLayoutSummary = (e) => {
        if (!this.state.summaryHeight) {
            this.setState({ summaryHeight: e.nativeEvent.layout.height });
        }
    }

    onView = () => {
        Navigation.push(this.props.componentId, routes.ideaDetailsScreen(this.props.idea.id, false, this.props.isOffline));
    }

    onComments = () => {
        const { idea } = this.props;
        Navigation.showModal(routes.ideaCommentsModal(idea.id, idea.name));
    }

    onShare = () => {
        Navigation.showModal(routes.shareModal('ideas', this.props.idea.id));
    }

    render() {
        const {
            state: { showFullSummary, summaryHeight },
            props: {
                idea: {
                    id, serial_number, name, summary,
                    num_comments, rating_counts, challenge,
                    is_following, cover_url, status,
                },
            },
        } = this;

        let ratingSystem;
        let averageStarRating;
        let thumbRatingCounts;
        if (_.keys(rating_counts).length === 5) {
            // Calculate average star rating
            let totalRatingCount = 0;
            const totalRating = _.reduce(_.map(rating_counts), (total, ratingCount, index) => {
                totalRatingCount += ratingCount;
                total += ratingCount * (index + 1);
                return total;
            }, 0);
            averageStarRating = Math.round(totalRating / totalRatingCount);
            ratingSystem = 'star';
        } else if (_.keys(rating_counts).length === 2) {
            // Switch to thumb rating system
            ratingSystem = 'thumbs';
            thumbRatingCounts = _.map(rating_counts);
        } else {
            // No rating system
            ratingSystem = 'none';
        }

        const statusMappings = DomainStore.getStatusMappings();

        return (
            <Flex style={[Styles.ideaCard, Styles.mb10, this.props.style]}>
                <Flex style={Styles.ideaCardBody}>
                    <Row>
                        <FastImage
                          source={cover_url ? { uri: Utils.getSafeImageUrl(cover_url) } : require('../images/ideas-card-placeholder.png')}
                          style={Styles.ideaCardImage}
                        />
                        <Flex>
                            <Flex>
                                <Text style={Styles.ideaCardTitle}>{name}</Text>
                            </Flex>
                            <Row style={{ alignItems: 'flex-start' }}>
                                <Text style={[Styles.ideaCardIDMetaText, Styles.mr5]}>
                                    {`ID: ${serial_number}`}
                                </Text>
                                <Flex>
                                    <Column>
                                        <Text style={[Styles.ideaCardMetaText]} numberOfLines={1}>
                                            <Text style={{ color: pallette[`statusIndicatorColour${status}`] }}>●</Text>
                                            {' '}
                                            {statusMappings ? statusMappings[status] : status}
                                        </Text>
                                        <Text style={[Styles.ideaCardMetaText, Styles.mt5]} numberOfLines={1}>
                                            {`● ${challenge.name}`}
                                        </Text>
                                    </Column>
                                </Flex>
                            </Row>
                        </Flex>
                    </Row>
                    {summary ? (
                        <FormGroup pt10>
                            <HTMLTruncator
                              onLayout={this.onLayoutSummary}
                              html={summary}
                              showAll={showFullSummary}
                              htmlHeight={summaryHeight}
                              toggleAll={show => this.setState({ showFullSummary: show })}
                            />
                        </FormGroup>
                    ) : null}
                </Flex>
                <View>
                    <Row style={[Styles.pl10, Styles.pb10, Styles.pr10]}>

                        <Flex>
                            {ratingSystem === 'star' ? (
                                <Row>
                                    <FontAwesome5
                                      style={Styles.ideaCardStarIcon} color={pallette.greyDark} name="star"
                                      solid={averageStarRating > 0}
                                    />
                                    <FontAwesome5
                                      style={Styles.ideaCardStarIcon} color={pallette.greyDark} name="star"
                                      solid={averageStarRating > 1}
                                    />
                                    <FontAwesome5
                                      style={Styles.ideaCardStarIcon} color={pallette.greyDark} name="star"
                                      solid={averageStarRating > 2}
                                    />
                                    <FontAwesome5
                                      style={Styles.ideaCardStarIcon} color={pallette.greyDark} name="star"
                                      solid={averageStarRating > 3}
                                    />
                                    <FontAwesome5
                                      style={Styles.ideaCardStarIcon} color={pallette.greyDark} name="star"
                                      solid={averageStarRating > 4}
                                    />
                                </Row>
                            ) : ratingSystem === 'thumbs' ? (
                                <Row>
                                    <FontAwesome5 style={Styles.ideaCardThumbsIcon} color={pallette.greyDark} name="thumbs-up"/>
                                    <Text style={[Styles.cardParagraph, Styles.ideaCardThumbsNumber, Styles.pt0, Styles.pr5]}>{thumbRatingCounts[0]}</Text>
                                    <FontAwesome5 style={Styles.ideaCardThumbsIcon} color={pallette.greyDark} name="thumbs-down"/>
                                    <Text style={[Styles.cardParagraph, Styles.ideaCardThumbsNumber, Styles.pt0, Styles.pr5]}>{thumbRatingCounts[1]}</Text>
                                </Row>
                            ) : null}

                        </Flex>

                        <Flex style={{ alignSelf: 'flex-end' }}>
                            <TouchableOpacity onPress={this.onComments}>
                                <Row>
                                    <FontAwesome5 style={Styles.ideaCardCommentIcon} color={pallette.greyDark} name="comment" />
                                    <Text style={[Styles.cardParagraph, Styles.ideaCardCommentNumber, Styles.pt0, Styles.pr5]}>{num_comments}</Text>
                                </Row>
                            </TouchableOpacity>
                        </Flex>

                    </Row>
                </View>
                <Row style={Styles.ideaCardFooter}>
                    <Flex value={2}>
                        <TouchableOpacity onPress={this.onView}>
                            <Row>
                                <Flex value={2}>
                                    <FontAwesome5 color={pallette.greyDark} name="eye" />
                                </Flex>
                                <Flex value={10}>
                                    <Text style={Styles.cardfooterItem}>{localizedStrings.view}</Text>
                                </Flex>
                            </Row>
                        </TouchableOpacity>
                    </Flex>
                    <Flex value={3}>
                        <TouchableOpacity onPress={() => AppActions.followIdea(id, !is_following)}>
                            <Row>
                                <Flex value={2}>
                                    <FontAwesome5 color={pallette.greyDark} name="star" solid={is_following} />
                                </Flex>
                                <Flex value={10}>
                                    <Text style={Styles.cardfooterItem}>{is_following ? localizedStrings.following : localizedStrings.follow}</Text>
                                </Flex>
                            </Row>
                        </TouchableOpacity>
                    </Flex>
                    <Flex value={2}>
                        <TouchableOpacity onPress={this.onShare}>
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