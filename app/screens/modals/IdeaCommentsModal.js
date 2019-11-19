import { Component } from 'react';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';

import withOrientation from 'providers/withOrientation';
import withNetwork from 'providers/withNetwork';
import withIdeaComments from 'providers/withIdeaComments';
import withUsers from 'providers/withUsers';
import IdeaComment from 'components/IdeaComment';
import ErrorAlert from 'components/ErrorAlert';
import UserMentionTextInput from 'components/UserMentionTextInput';

const Url = require('url-parse');

export default withOrientation(withNetwork(withUsers(withIdeaComments(class extends Component {
  static displayName = 'IdeaCommentsModal';

  static propTypes = {
      componentId: propTypes.string,
      error: propTypes.string,
      comments: propTypes.array,
      ideaId: propTypes.string,
      ideaName: propTypes.string,
      commentsSaving: propTypes.bool,
      commentsLoading: propTypes.bool,
      hasMoreComments: propTypes.func,
      scrollToCommentId: propTypes.string,
      isOffline: propTypes.bool,
      DeviceWidth: propTypes.number,
      DeviceHeight: propTypes.number,
      getUserByDisplayName: propTypes.func,
  }

  state = {
      commentToSend: '',
      mentions: [],
  };

  commentRefs = {};

  onReply = (comment, index) => {
      this.setState({ replyComment: comment });
      this.input.clear();
      this.input.focus();
      setTimeout(() => this.commentsList.scrollToIndex({ index, viewPosition: 0 }), 250);
  }

  onShowReplies = (index, show) => {
      if (show) {
          setTimeout(() => this.commentsList.scrollToIndex({ index, viewPosition: 0 }), 250);
      }
  }

  onSend = () => {
      const { replyComment, editComment, commentToSend, files, mentions } = this.state;
      if (editComment) {
          const { comment, parentId } = editComment;
          AppActions.updateComment(this.props.ideaId, comment.id, commentToSend, comment.id !== parentId ? parentId : null, mentions);
      } else {
          AppActions.addComment(this.props.ideaId, replyComment ? replyComment.id : null, commentToSend, files, mentions);
      }
      this.input.updateFormattedText('');
      this.setState({ replyComment: null, editComment: null, commentToSend: '', files: [], mentions: [] });
  }

  onEndReached = () => {
      if (this.props.isOffline || !this.props.hasMoreComments()) return;
      AppActions.getMoreIdeaComments(this.props.ideaId);
  }

  onAttach = () => {
      const options = [localizedStrings.photo, localizedStrings.media, localizedStrings.document];
      API.showOptions(localizedStrings.addAttachment, options)
          .then((type) => {
              if (type == null) return;
              return Utils.attach(options[type]);
          })
          .then((res) => {
              if (!res) return;
              if (res.fileName) res.name = res.fileName;
              const files = this.state.files || [];
              files.push(res);
              this.setState({ files: _.uniqBy(files, 'uri') });
          })
          .catch((err) => {
              if (err.message === 'User canceled document picker') return; // Document picker cancellation
              if (err.message === 'User cancelled') return; // Image picker cancellation
              this.setState({ error: err.message });
              console.log(err);
          });
  }

  onDeleteAttachment = (index) => {
      const files = this.state.files;
      files.splice(index, 1);
      this.setState({ files });
  }

  onEdit = (comment, parentId, index) => {
      // Find existing mentions
      const regex = Utils.existingMentionRegex;
      let matched;
      let matches = [];
      // eslint-disable-next-line
      while (matched = regex.exec(comment.comment)) {
          matches.push(matched);
          if (regex.lastIndex === matched.index) {
              regex.lastIndex++;
          }
      }
      const mentions = [];
      let commentToSend = comment.comment;
      if (matches && matches.length) {
          _.each(matches, (match) => {
              const parsedUrl = new Url(match[1]);
              mentions.push({ display_name: match[2], id: _.last(parsedUrl.pathname.split('/')) });
              commentToSend = commentToSend.replace(match[0], `@${match[2]}:`);
          });
      }
      // Find offline mentions
      matches = commentToSend.match(Utils.mentionRegex);
      if (matches && matches.length) {
          _.each(matches, (match) => {
              const display_name = match.substr(1, match.length - 2);
              const user = this.props.getUserByDisplayName(display_name);
              if (!user) return;
              mentions.push({ display_name, id: user.id });
          });
      }
      commentToSend = commentToSend.replace(/<[^>]*>/g, '');
      this.input.updateFormattedText(commentToSend);
      this.setState({ editComment: { comment, parentId }, mentions, commentToSend });
      this.input.clear();
      this.input.focus();
      setTimeout(() => this.commentsList.scrollToIndex({ index, viewPosition: 0 }), 250);
  }

  cancelEdit = () => {
      this.input.updateFormattedText('');
      this.setState({ editComment: null, mentions: [] });
  }

  onChangeText = (text) => {
      const { userMentioning, commentToSend } = this.state;
      const lastAtIndex = text.lastIndexOf('@');
      if (_.last(text) === '@' && (text.length === 1 || _.nth(text, -2) === ' ')) {
          AppActions.searchUsers('');
          if (!this.state.userMentioning) {
              this.setState({ userMentioning: text.length });
              this.showUserMentionsOverlay();
          }
      } else if (userMentioning) {
          if (text.length < userMentioning) {
              this.setState({ userMentioning: false });
              Navigation.dismissOverlay('user-mentions');
          } else {
              AppActions.searchUsers(text.substr(lastAtIndex + 1));
          }
      } else if (lastAtIndex !== -1 && !text.substr(lastAtIndex + 1).match(/([:]|[ ])/g)) {
          // Much like Slack if we can detect that there is an @ followed by text and resume mentioning
          this.setState({ userMentioning: lastAtIndex + 1 });
          AppActions.searchUsers(text.substr(lastAtIndex + 1));
          this.showUserMentionsOverlay();
      }

      if (text.length < commentToSend.length && commentToSend.lastIndexOf('@') !== -1) {
          const mentionsFound = commentToSend.match(Utils.mentionRegex) || [];
          const newMentionsFound = text.match(Utils.mentionRegex) || [];
          if (mentionsFound.length > newMentionsFound.length) {
              this.setState({ mentions: this.state.mentions.slice(0, this.state.mentions.length - 1) });
          }
      }

      this.setState({ commentToSend: text });
  }

  showUserMentionsOverlay = () => {
      Navigation.showOverlay({
          component: {
              id: 'user-mentions',
              name: 'user-search',
              passProps: {
                  onUserSelected: this.onUserSelected,
                  onUserMentionNoResults: this.onUserMentionNoResults,
                  selected: this.state.mentions,
                  overlay: true,
                  keyboardCoords: this.state.keyboardCoords,
                  onDismiss: () => {
                      if (this.state.userMentioning) {
                          Navigation.dismissOverlay('user-mentions');
                          this.setState({ userMentioning: false });
                      }
                  },
              },
              options: {
                  overlay: {
                      interceptTouchOutside: true,
                  },
              },
          },
      });
  }

  onUserSelected = (user) => {
      const { commentToSend, mentions } = this.state;
      const mentionIndex = commentToSend.lastIndexOf('@');
      const text = `${commentToSend.substr(0, mentionIndex)}@${user.display_name}:`;
      mentions.push({ display_name: user.display_name, id: user.id });
      this.setState({ userMentioning: false, commentToSend: text, mentions });
      this.input.updateFormattedText(text);
      Navigation.dismissOverlay('user-mentions');
  }

  onUserMentionNoResults = () => {
      // Much like Slack if there has been a space since the last @ then we are considered to no longer be mentioning
      const { commentToSend } = this.state;
      if (commentToSend.substr(commentToSend.lastIndexOf('@') + 1).match(/([:]|[ ])/g) !== -1) {
          Navigation.dismissOverlay('user-mentions');
          this.setState({ userMentioning: false });
      }
  }

  shouldDisableUI = () => {
      const { state: { commentToSend }, props: { commentsSaving } } = this;
      return !commentToSend || commentsSaving;
  }

  onKeyboardDidHide = () => {
      const state = { keyboardCoords: null };
      if (this.state.userMentioning) {
          Navigation.dismissOverlay('user-mentions');
          state.userMentioning = false;
      }
      this.setState(state);
  }

  onKeyboardDidShow = (e) => {
      this.setState({ keyboardCoords: e.endCoordinates });
  }

  scrollToComment = (id) => {
      // TODO this won't be possible unless we have a fixed height on the IdeaComment component
      //   let isResponse;
      //   const index = _.findIndex(this.props.comments, (comment) => {
      //       if (comment.id === id) return true;
      //       isResponse = _.find(comment.responses, response => response.id === id);
      //       return isResponse;
      //   });
      //   if (index === -1) return;
      //   if (isResponse) this.commentRefs[this.props.comments[index].id].showReplies();
      //   setTimeout(() => this.commentsList.scrollToIndex({ index, viewPosition: 0 }), 250);
  }

  onIdeaCommentsSaved = () => {
      if (IdeaCommentsStore.attachmentsError) {
          console.log(IdeaCommentsStore.attachmentsError);
          Alert.alert(localizedStrings.error, `${localizedStrings.commentAttachmentsError} - ${IdeaCommentsStore.attachmentsError}`);
      }
  }

  componentDidMount() {
      if (Platform.OS === 'android') AndroidKeyboardAdjust.setAdjustResize();

      if (!this.props.isOffline) {
          AppActions.getIdeaComments(this.props.ideaId);
      }

      if (this.props.scrollToCommentId && this.props.comments && this.props.comments.length) {
          this.scrollToComment(this.props.scrollToCommentId);
      }

      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow);
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide);
  }

  componentDidUpdate(prevProps) {
      if (this.props.scrollToCommentId && prevProps.commentsLoading && !this.props.commentsLoading) {
          this.scrollToComment(this.props.scrollToCommentId);
      }
  }

  componentWillUnmount() {
      if (Platform.OS === 'android') AndroidKeyboardAdjust.setAdjustPan();
      Navigation.dismissOverlay('user-mentions').catch(() => {});
      this.keyboardDidShowListener.remove();
      this.keyboardDidHideListener.remove();
  }

  render() {
      const { props: { comments, commentsSaving, error, ideaName, ideaId, DeviceWidth, DeviceHeight }, state: { replyComment, editComment, files, error: stateError } } = this;
      return (
          <Flex style={[Styles.body, Styles.bodyAlt, { DeviceWidth, DeviceHeight }]}>
              <KeyboardAvoidingView
                style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null} enabled
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
              >
                  <FormGroup pt10>
                      <H4 style={Styles.textCenter}>{ideaName}</H4>
                  </FormGroup>
                  <ErrorAlert error={error} error2={stateError} />
                  <FlatList
                    data={comments}
                    extraData={commentsSaving}
                    keyExtractor={item => item.id}
                    renderItem={({ item: comment, index }) => (
                        <IdeaComment
                          key={comment.id} comment={comment} onReply={() => this.onReply(comment, index)}
                          ideaId={ideaId}
                          onEdit={commentToEdit => this.onEdit(commentToEdit, comment.id, index)}
                          onShowReplies={show => this.onShowReplies(index, show)} commentsSaving={commentsSaving}
                          onOpenAttachmentError={e => this.setState({ error: e.message })}
                          onLike={(id, parentId) => AppActions.likeComment(ideaId, id, parentId)}
                          onUnlike={(id, parentId) => AppActions.unlikeComment(ideaId, id, parentId)}
                          ref={c => this.commentRefs[comment.id] = c}
                        />
                    )}
                    inverted
                    onEndReached={this.onEndReached}
                    ref={c => this.commentsList = c}
                    keyboardShouldPersistTaps="handled"
                  />
                  <FormGroup pt10 pb20 style={Styles.commentInputContainer}>
                      <Container>
                          {files ? _.map(files, (file, index) => (
                              <Row key={file.uri} style={Styles.mb10}>
                                  <Flex><Text style={[Styles.textLight]}>{`${file.name}`}</Text></Flex>
                                  <TouchableOpacity style={{ padding: 5 }} onPress={() => this.onDeleteAttachment(index)}>
                                      <ION name="md-close" size={15} />
                                  </TouchableOpacity>
                              </Row>
                          )) : null}
                          {replyComment ? (
                              <Row style={Styles.pb10}>
                                  <Flex><Text style={[Styles.textLight]}>{`${localizedStrings.replyingTo} ${replyComment.creator.first_name || replyComment.creator.display_name}`}</Text></Flex>
                                  <TouchableOpacity onPress={() => this.setState({ replyComment: null })}>
                                      <ION name="md-close" size={15} />
                                  </TouchableOpacity>
                              </Row>
                          ) : null}
                          {editComment ? (
                              <Row style={Styles.pb10}>
                                  <Flex><Text style={[Styles.textLight]}>{localizedStrings.editingComment}</Text></Flex>
                                  <TouchableOpacity onPress={this.cancelEdit}>
                                      <ION name="md-close" size={15} />
                                  </TouchableOpacity>
                              </Row>
                          ) : null}
                          <Row>
                              <Flex value={1} style={{ alignItems: 'center' }}>
                                  <TouchableOpacity style={[Styles.mr5, { color: pallette.wazokuLightGrey }]} disabled={commentsSaving} onPress={this.onAttach}>
                                      <FontAwesome5 name="paperclip" size={22} color={commentsSaving ? 'rgba(0, 0, 0, 0.5)' : pallette.wazokuLightGrey} />
                                  </TouchableOpacity>
                              </Flex>
                              <Flex value={11}>
                                  <UserMentionTextInput
                                    placeholder={localizedStrings.typeComment}
                                    ref={c => this.input = c}
                                    onBlur={this.onBlur}
                                    onChangeText={this.onChangeText}
                                    multiline
                                    style={{ paddingRight: 30 }}
                                  />
                              </Flex>
                              <TouchableOpacity style={[Styles.pl5, Styles.commentSendButton]} disabled={this.shouldDisableUI()} onPress={this.onSend}>
                                  <FontAwesome5 name="paper-plane" size={22} color={this.shouldDisableUI() ? 'rgba(0, 0, 0, 0.5)' : pallette.wazokuNavy} />
                              </TouchableOpacity>
                          </Row>
                      </Container>
                  </FormGroup>
              </KeyboardAvoidingView>
          </Flex>
      );
  }
}))));
