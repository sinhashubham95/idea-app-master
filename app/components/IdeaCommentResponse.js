// import propTypes from 'prop-types';
import React, { Component } from 'react';
import HTML from 'react-native-render-html';

import LottieToggle from 'components/base/animation/LottieToggle';
import ListItemAttachment from 'components/ListItemAttachment';
import withOrientation from 'providers/withOrientation';

export default withOrientation(class IdeaCommentResponse extends Component {
    static displayName = 'IdeaCommentResponse';

    static propTypes = {
        response: propTypes.shape({
            id: propTypes.string,
            comment: propTypes.string,
            liked_by: propTypes.array,
            is_deleted: propTypes.bool,
        }),
        ideaId: propTypes.string,
        parentId: propTypes.string,
        onOpenAttachmentError: propTypes.func,
        onEdit: propTypes.func,
        onLike: propTypes.func,
        onUnlike: propTypes.func,
        isTablet: propTypes.bool,
    };

    state = {
    };

    onOpenAttachment = (url, filename) => {
        Utils.openAttachment(url, filename)
            .catch(e => this.props.onOpenAttachmentError(e));
    }

    onDelete = () => {
        Alert.alert(localizedStrings.deleteComment, localizedStrings.deleteCommentMsg,
            [
                {
                    text: localizedStrings.no,
                    style: 'cancel',
                },
                {
                    text: localizedStrings.yes,
                    onPress: () => {
                        const { ideaId, response: { id }, parentId } = this.props;
                        AppActions.deleteComment(ideaId, id, parentId);
                    },
                },
            ]);
    }

    render() {
        const {
            props: {
                response: { id, comment, creator, created, is_mine, attachments, liked_by, is_deleted },
                onEdit,
                parentId,
                isTablet,
            },
        } = this;
        const liked = !!_.find(liked_by, by => by.id === AccountStore.getUser().id);
        return (
            <FormGroup pb5 pt5>
                <Row>
                    <Column style={{ flex: 1 }}>
                        <Row style={{ marginLeft: 20 }}>
                            {creator.image ? (
                                <FastImage source={{ uri: creator.image, ...Styles.avatarPlaceholder }} style={[Styles.avatarPlaceholder]} />
                            ) : (
                                <View style={Styles.avatarPlaceholder}>
                                    <Text style={Styles.avatarInitial}>{(creator.first_name || creator.display_name)[0].toUpperCase()}</Text>
                                </View>
                            )}
                            <Flex>
                                <Row>
                                    <Text style={Styles.chatUserName}>{creator.first_name || creator.display_name}</Text>
                                    {comment ? !is_deleted ? (
                                        <HTML
                                          key={id}
                                          tagsStyles={{ p: Styles.cardParagraphNoPad }}
                                          html={comment}
                                        />
                                    ) : <Text style={Styles.deletedComment}>{comment}</Text> : null}
                                </Row>
                            </Flex>

                        </Row>
                        {_.map(attachments, attachment => (
                            <Row style={{ marginLeft: 20 }}>
                                <ListItemAttachment key={attachment.id} attachment={attachment} onOpenAttachment={this.onOpenAttachment} />
                            </Row>
                        ))}
                        <FormGroup pb0 style={{ marginLeft: 20 }}>
                            <Row>
                                <Text style={Styles.chatTextMuted}>{moment.unix(created).format('MMM Do h:mma')}</Text>
                                {is_mine && !is_deleted ? (
                                    <TouchableOpacity onPress={() => onEdit(this.props.response)} style={[Styles.chatTextButton]}>
                                        <Text style={[Styles.chatUserName]}>{localizedStrings.edit}</Text>
                                    </TouchableOpacity>
                                ) : null}
                                {is_mine && !is_deleted ? (
                                    <TouchableOpacity onPress={this.onDelete} style={[Styles.chatTextButton]}>
                                        <Text style={[Styles.chatUserName]}>{localizedStrings.delete}</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </Row>
                        </FormGroup>
                    </Column>
                    {!Utils.isOfflineId(id) && !is_deleted ? (
                        <TouchableOpacity onPress={!liked ? () => this.props.onLike(id, parentId) : () => this.props.onUnlike(id, parentId)}>
                            <FontAwesome5
                              name="thumbs-up"
                              solid={liked} size={isTablet ? 25 : 14}
                              color={liked ? 'black' : pallette.greyMid}
                            />
                        </TouchableOpacity>
                    ) : null}
                </Row>
            </FormGroup>
        );
    }
});
