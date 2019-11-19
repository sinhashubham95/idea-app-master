// import propTypes from 'prop-types';
import React, { Component } from 'react';
import HTML from 'react-native-render-html';

import LottieToggle from 'components/base/animation/LottieToggle';
import ListItemAttachment from 'components/ListItemAttachment';
import IdeaCommentResponse from 'components/IdeaCommentResponse';
import withOrientation from 'providers/withOrientation';

export default withOrientation(class IdeaComment extends Component {
    static displayName = 'IdeaComment';

    static propTypes = {
        comment: propTypes.shape({
            id: propTypes.string,
            comment: propTypes.string,
            liked_by: propTypes.array,
            is_deleted: propTypes.bool,
        }),
        ideaId: propTypes.string,
        onReply: propTypes.func,
        onShowReplies: propTypes.func,
        commentsSaving: propTypes.bool,
        onOpenAttachmentError: propTypes.func,
        onEdit: propTypes.func,
        onLike: propTypes.func,
        onUnlike: propTypes.func,
        isTablet: propTypes.bool,
    };

    state = {
    };

    showReplies = () => {
        this.setState({ showReplies: true });
    }

    onShowReplies = () => {
        if (this.props.onShowReplies) this.props.onShowReplies(!this.state.showReplies);
        this.setState({ showReplies: !this.state.showReplies });
    }

    onReply = () => {
        if (!this.state.showReplies) this.setState({ showReplies: true });
        if (this.props.onReply) this.props.onReply();
    }

    onOpenAttachment = (url, filename) => {
        Utils.openAttachment(url, filename)
            .catch(e => this.props.onOpenAttachmentError(e));
    }

    onDelete = () => {
        Alert.alert(localizedStrings.deleteComment, `${localizedStrings.deleteCommentMsg} ${localizedStrings.deleteParentComment}`,
            [
                {
                    text: localizedStrings.no,
                    style: 'cancel',
                },
                {
                    text: localizedStrings.yes,
                    onPress: () => {
                        const { ideaId, comment: { id } } = this.props;
                        AppActions.deleteComment(ideaId, id);
                    },
                },
            ]);
    }

    render() {
        const {
            props: {
                commentsSaving,
                comment: { id, comment, creator, responses, created, is_mine, attachments, liked_by, is_deleted },
                onEdit,
                onOpenAttachmentError,
                isTablet,
                onLike,
                onUnlike,
                ideaId,
            },
            state: { showReplies },
        } = this;
        const liked = !!_.find(liked_by, by => by.id === AccountStore.getUser().id);
        return (
            <View style={[Styles.commentInputContainer, Styles.pt10, Styles.pb10]}>
                <Container>
                    <Row>
                        <Column style={{ flex: 1 }}>
                            <Flex>
                                <Row>

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
                                                  tagsStyles={{ p: Styles.chatText }}
                                                  html={comment}
                                                />
                                            ) : <Text style={Styles.deletedComment}>{localizedStrings.commentDelete}</Text> : null}
                                        </Row>
                                    </Flex>


                                </Row>
                            </Flex>
                            {is_deleted ? null : _.map(attachments, attachment => <ListItemAttachment key={attachment.id} attachment={attachment} onOpenAttachment={this.onOpenAttachment} />)}
                            <FormGroup pb0>
                                <Row>
                                    <Text style={Styles.chatTextMuted}>{moment.unix(created).format('MMM Do h:mma')}</Text>
                                    {responses.length ? (
                                        <TouchableOpacity onPress={this.onShowReplies} style={Styles.chatTextButton}>
                                            <Text style={[Styles.chatTextMuted]}>{showReplies ? localizedStrings.showReplies : localizedStrings.hideReplies}</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                    {!Utils.isOfflineId(id) && !is_deleted ? (
                                        <TouchableOpacity onPress={this.onReply} style={[Styles.chatTextButton]}>
                                            <Text style={[Styles.chatUserName]}>{localizedStrings.reply}</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                    {is_mine && !is_deleted ? (
                                        <TouchableOpacity onPress={() => onEdit(this.props.comment)} style={[Styles.chatTextButton]}>
                                            <Text style={[Styles.chatUserName]}>{localizedStrings.edit}</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                    {is_mine && !is_deleted ? (
                                        <TouchableOpacity onPress={this.onDelete} style={[Styles.chatTextButton]}>
                                            <Text style={[Styles.chatUserName]}>{localizedStrings.delete}</Text>
                                        </TouchableOpacity>
                                    ) : null}


                                    {isTablet
                                        ? !Utils.isOfflineId(id) && !is_deleted ? (
                                            <TouchableOpacity
                                              style={[Styles.commentLikeButton, Styles.pb5]}
                                              onPress={!liked ? () => this.props.onLike(id, null) : () => this.props.onUnlike(id, null)}
                                            >
                                                <FontAwesome5
                                                  name="thumbs-up"
                                                  solid={liked} size={20}
                                                  color={liked ? 'black' : pallette.greyMid}
                                                />
                                            </TouchableOpacity>
                                        ) : null

                                        : null

                                    }

                                </Row>
                            </FormGroup>
                        </Column>

                        {isTablet ? null

                            : !Utils.isOfflineId(id) && !is_deleted ? (
                                <TouchableOpacity style={Styles.commentLikeButton} onPress={!liked ? () => this.props.onLike(id, null) : () => this.props.onUnlike(id, null)}>
                                    <FontAwesome5
                                      name="thumbs-up"
                                      solid={liked} size={isTablet ? 25 : 14}
                                      color={liked ? 'black' : pallette.greyMid}
                                    />
                                </TouchableOpacity>
                            ) : null

                        }

                    </Row>
                    {showReplies ? (
                        <FlatList
                          data={responses}
                          inverted
                          style={Styles.pb10}
                          keyExtractor={item => item.id}
                          extraData={commentsSaving}
                          renderItem={({ item: response }) => (
                              <IdeaCommentResponse
                                response={response}
                                ideaId={ideaId}
                                parentId={id}
                                onEdit={onEdit}
                                onOpenAttachmentError={onOpenAttachmentError}
                                onLike={onLike}
                                onUnlike={onUnlike}
                              />
                          )}
                        />
                    ) : null}
                </Container>
            </View>
        );
    }
});
