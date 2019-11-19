import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'idea-comments',
    model: {},
    hasMore: {},
    getComments(id) {
        const userId = AccountStore.getUser().id;
        return store.model && store.model[id] && _.map(store.model[id], (comment) => {
            comment.responses = _.map(comment.responses, response => ({ ...response, is_mine: response.creator.id === userId }));
            return { ...comment, is_mine: comment.creator.id === userId };
        });
    },
    hasMoreComments(id) {
        return store.hasMore[id] && !store.isLoading;
    },
    getComment(ideaId, id, parentId) {
        const comment = _.find(store.model[ideaId], { id: parentId || id });
        if (!parentId) return comment;
        return comment && _.find(comment.responses, { id });
    },
    syncOfflineComment(ideaId, offlineId, parentId) {
        store.saving();
        const offlineComment = _.cloneDeep(store.getComment(ideaId, offlineId, parentId));
        return data.post(`${Project.api}ideas/${ideaId}/comments?include=${Constants.include.comments}`, Object.assign({}, parentId ? { parent_id: parentId } : {}, { comment: offlineComment.comment, idea_id: ideaId, mentions: offlineComment.mentions }))
            .then(({ data: res }) => {
                res.is_mine = true;
                store.replaceOfflineComment(ideaId, offlineId, parentId, res);
                let attachmentsPromise = Promise.resolve();
                if (offlineComment.attachments.length) {
                    const attachments = _.map(offlineComment.attachments, attachment => ({ uri: attachment.url, name: attachment.filename, type: attachment.type }));
                    attachmentsPromise = store.uploadAndSaveAttachments(ideaId, res.id, parentId, attachments)
                        .catch(e => Utils.handleErrorFromAPI(e, localizedStrings.unexpectedError)
                            .then((err) => {
                                console.log('Error uploading attachments', e);
                                store.attachmentsError = err;
                            }));
                }
                return attachmentsPromise;
            })
            .catch((e) => {
                store.deleteOfflineComment(ideaId, offlineId, parentId);
                store.goneABitWest();
                return Promise.reject(e);
            });
    },
    replaceOfflineComment(ideaId, offlineId, parentId, comment) {
        const index = _.findIndex(store.model[ideaId], { id: parentId || offlineId });
        if (index !== -1) {
            if (parentId) {
                const responseIndex = _.findIndex(store.model[ideaId][index].responses, { offlineId });
                if (responseIndex !== -1) {
                    store.model[ideaId][index].responses[responseIndex] = comment;
                }
            } else {
                if (store.model[ideaId][index].responses.length) {
                    comment.responses = store.model[ideaId][index].responses.slice(0);
                }
                store.model[ideaId][index] = comment;
            }
            SecuredStorage.setItem('idea-comments', store.model);
            store.saved();
        }
    },
    deleteOfflineComment(ideaId, offlineId, parentId) {
        const index = _.findIndex(store.model[ideaId], { id: parentId || offlineId });
        if (index !== -1) {
            if (parentId) {
                const responseIndex = _.findIndex(store.model[ideaId][index].responses, { offlineId });
                if (responseIndex !== -1) {
                    store.model[ideaId][index].responses.splice(responseIndex, 1);
                }
            } else {
                store.model[ideaId].splice(index, 1);
            }
            SecuredStorage.setItem('idea-comments', store.model);
            store.saved();
        }
    },
    uploadAndSaveAttachments(ideaId, commentId, parentId, attachments) {
        return Utils.uploadAttachments(attachments)
            .then((res) => {
                if (res) {
                    return controller.saveAttachmentsToComment(res, ideaId, commentId, parentId);
                }
            });
    },
    updateOfflineIdeaId(offlineId, ideaId) {
        if (!store.model[offlineId]) return;
        store.model[ideaId] = _.cloneDeep(store.model[offlineId]);
        delete store.model[offlineId];
    },
    syncUpdateComment(ideaId, id, comment, parentId, mentions) {
        return controller.updateComment(ideaId, id, comment, parentId, mentions);
    },
    updateCommentOffline(ideaId, id, comment, parentId, mentions) {
        const commentIndex = _.findIndex(store.model[ideaId], { id: parentId || id });
        if (parentId) {
            const responseIndex = _.findIndex(store.model[ideaId][commentIndex].responses, { id });
            store.model[ideaId][commentIndex].responses[responseIndex].comment = comment;
            store.model[ideaId][commentIndex].responses[responseIndex].mentions = mentions;
        } else {
            store.model[ideaId][commentIndex].comment = comment;
            store.model[ideaId][commentIndex].mentions = mentions;
        }
        store.savedComment = store.model[ideaId][commentIndex];
        SecuredStorage.setItem('idea-comments', store.model);
        setTimeout(() => store.saved(), 50);
    },
    likeCommentOffline(ideaId, id, parentId) {
        const index = _.findIndex(store.model[ideaId], { id: parentId || id });
        if (parentId) {
            const responseIndex = _.findIndex(store.model[ideaId][index].responses, { id });
            store.model[ideaId][index].responses[responseIndex] = { ...store.model[ideaId][index].responses[responseIndex], liked_by: store.model[ideaId][index].responses[responseIndex].liked_by.concat([AccountStore.getUser()]) };
        } else {
            store.model[ideaId][index].liked_by = store.model[ideaId][index].liked_by.concat([AccountStore.getUser()]);
        }
        SecuredStorage.setItem('idea-comments', store.model);
        setTimeout(() => store.saved(), 50);
    },
    unlikeCommentOffline(ideaId, id, parentId) {
        const index = _.findIndex(store.model[ideaId], { id: parentId || id });
        if (parentId) {
            const responseIndex = _.findIndex(store.model[ideaId][index].responses, { id });
            store.model[ideaId][index].responses[responseIndex] = { ...store.model[ideaId][index].responses[responseIndex], liked_by: _.filter(store.model[ideaId][index].responses[responseIndex].liked_by, by => by.id !== AccountStore.getUser().id) };
        } else {
            store.model[ideaId][index].liked_by = _.filter(store.model[ideaId][index].liked_by, by => by.id !== AccountStore.getUser().id);
        }
        SecuredStorage.setItem('idea-comments', store.model);
        setTimeout(() => store.saved(), 50);
    },
    syncLikeComment(ideaId, id, parentId) {
        return controller.likeComment(ideaId, id, parentId);
    },
    syncUnlikeComment(ideaId, id, parentId) {
        return controller.unlikeComment(ideaId, id, parentId);
    },
    deleteCommentOffline(ideaId, id, parentId) {
        const index = _.findIndex(store.model[ideaId], { id: parentId || id });
        if (parentId) {
            const responseIndex = _.findIndex(store.model[ideaId][index].responses, { id });
            store.model[ideaId][index].responses[responseIndex] = { ...store.model[ideaId][index].responses[responseIndex], is_deleted: true, comment: localizedStrings.commentDelete };
        } else {
            store.model[ideaId][index] = { ...store.model[ideaId][index], is_deleted: true, comment: localizedStrings.commentDelete };
            _.each(store.model[ideaId][index].responses, (response) => {
                response.is_deleted = true;
                response.comment = localizedStrings.commentDelete;
            });
        }
        SecuredStorage.setItem('idea-comments', store.model);
        setTimeout(() => store.saved(), 50);
    },
    syncDeleteComment(ideaId, id) {
        return controller.deleteComment(ideaId, id);
    },
});

const controller = {
    getComments: (id) => {
        store.loading();
        data.get(`${Project.api}ideas/${id}/comments?include=${Constants.include.comments}`)
            .then((res) => {
                _.each(res.data, (comment) => {
                    comment.responses = _.sortBy(comment.responses, response => -response.created);
                });
                store.model[id] = _.sortBy(_.unionBy(res.data, store.model[id] || [], 'id'), comment => -comment.created);
                SecuredStorage.setItem('idea-comments', store.model);
                store.hasMore[id] = res.page.next;
                store.loaded();
            })
            .catch(e => API.ajaxHandler(store, e));
    },
    addComment: (ideaId, parentId, comment, attachments, mentions) => {
        store.attachmentsError = '';
        store.saving();
        if (NetworkStore.isOffline()) {
            controller.addOfflineComment(ideaId, parentId, comment, attachments, mentions);
            return;
        }
        let newCommentId;
        data.post(`${Project.api}ideas/${ideaId}/comments?include=${Constants.include.comments}`, Object.assign({}, parentId ? { parent_id: parentId } : {}, { comment, idea_id: ideaId, mentions, with_mentions: true }))
            .then(({ data: res }) => {
                newCommentId = res.id;
                const commentToAdd = Object.assign({}, res, { is_mine: true });
                if (parentId) {
                    _.find(store.model[ideaId], { id: parentId }).responses.unshift(commentToAdd);
                } else {
                    store.model[ideaId].unshift(commentToAdd);
                }

                IdeasStore.incrementCommentCount(ideaId);
                MyIdeasStore.incrementCommentCount(ideaId);
                OfflineIdeasStore.incrementCommentCount(ideaId);

                SecuredStorage.setItem('idea-comments', store.model);
                if (!attachments || !attachments.length) {
                    store.saved();
                    return Promise.resolve();
                }
                return Utils.uploadAttachments(attachments)
                    .catch(e => Utils.handleErrorFromAPI(e, localizedStrings.unexpectedError)
                        .then((err) => {
                            console.log('Error uploading attachments', e);
                            store.attachmentsError = err;
                            store.saved();
                        }));
            })
            .then((res) => {
                if (res) {
                    return controller.saveAttachmentsToComment(res, ideaId, newCommentId, parentId);
                }
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    controller.addOfflineComment(ideaId, parentId, comment, attachments, mentions);
                    return;
                }
                API.ajaxHandler(store, e);
            });
    },
    getMoreComments: (id) => {
        store.loading();
        data.get(store.hasMore[id])
            .then((res) => {
                _.each(res.data, (comment) => {
                    comment.responses = _.sortBy(comment.responses, response => -response.created);
                });
                store.model[id] = _.sortBy(_.unionBy(res.data, store.model[id] || [], 'id'), comment => -comment.created);
                SecuredStorage.setItem('idea-comments', store.model);
                store.hasMore[id] = res.page.next;
                store.loaded();
            })
            .catch((e) => {
                store.hasMore[id] = false;
                // @TODO silently drop the page.not_found error_code error
                API.ajaxHandler(store, e);
            });
    },
    saveAttachmentsToComment: (res, ideaId, commentId, parentId) => Promise.all(_.map(res, ({ data: { url, filename } }) => data.post(`${Project.api}ideas/${ideaId}/comments/${commentId}/attachments`, {
        url,
        filename,
    })))
        .then((newAttachments) => {
            _.each(newAttachments, ({ data: newAttachment }) => {
                if (parentId) {
                    _.find(store.model[ideaId], { id: parentId }).responses[0].attachments.push(newAttachment);
                } else {
                    store.model[ideaId][0].attachments.push(newAttachment);
                }
            });
            store.saved();
        })
        .catch(e => Utils.handleErrorFromAPI(e, localizedStrings.unexpectedError)
            .then((err) => {
                console.log('Error uploading attachments', e);
                store.attachmentsError = err;
                store.saved();
            })),
    addOfflineComment: (ideaId, parentId, comment, attachments, mentions) => {
        store.saving();
        const newCommentId = Utils.generateOfflineId();
        const creator = AccountStore.getUser();
        const res = {
            id: newCommentId,
            creator,
            liked_by: [],
            last_edited: null,
            is_deleted: false,
            comment,
            created: moment().unix(),
            is_advisor_comment: false,
            attachments: [],
            is_mine: true,
            mentions,
        };
        if (!parentId) {
            res.responses = [];
        }
        if (attachments && attachments.length) {
            res.attachments = _.map(attachments, attachment => ({
                id: Utils.generateOfflineId(),
                filename: attachment.name,
                url: attachment.uri,
                type: attachment.type,
            }));
        }
        if (!store.model[ideaId]) store.model[ideaId] = [];
        if (parentId) {
            const index = _.findIndex(store.model[ideaId], { id: parentId });
            if (index === -1) {
                store.goneABitWest();
                return;
            }
            store.model[ideaId][index].responses.unshift(res);
        } else {
            store.model[ideaId].unshift(res);
        }
        SecuredStorage.setItem('idea-comments', store.model);
        setTimeout(() => store.saved(), 50);

        // Increment the idea's number of comments
        IdeasStore.incrementCommentCount(ideaId);
        MyIdeasStore.incrementCommentCount(ideaId);
        OfflineIdeasStore.incrementCommentCount(ideaId);

        // Add to offline queue
        AppActions.addOfflineAction('ADD_COMMENT', { offlineId: newCommentId, groupId: ideaId, parentId });
    },
    updateComment(ideaId, id, comment, parentId, mentions) {
        store.attachmentsError = '';
        store.saving();

        if (Utils.isOfflineId(id)) {
            store.updateCommentOffline(ideaId, id, comment, parentId, mentions);
            return;
        }

        if (NetworkStore.isOffline()) {
            store.updateCommentOffline(ideaId, id, comment, parentId, mentions);
            AppActions.addOfflineAction('UPDATE_COMMENT', { id, parentId, groupId: ideaId, comment, mentions });
            return;
        }

        return data.put(`${Project.api}ideas/${ideaId}/comments/${id}?include=${Constants.include.comments}`, { comment, mentions, with_mentions: true })
            .then(({ data: res }) => {
                const index = _.findIndex(store.model[ideaId], { id: parentId || id });
                if (parentId) {
                    const responseIndex = _.findIndex(store.model[ideaId][index].responses, { id });
                    store.model[ideaId][index].responses[responseIndex] = Object.assign({ is_mine: true }, store.model[ideaId][index].responses[responseIndex], res);
                } else {
                    store.model[ideaId][index] = Object.assign({ is_mine: true }, store.model[ideaId][index], res);
                }
                store.savedComment = store.model[ideaId][index];
                SecuredStorage.setItem('idea-comments', store.model);
                store.saved();
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    AppActions.addOfflineAction('UPDATE_COMMENT', { id, parentId, groupId: ideaId, comment });
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    likeComment(ideaId, id, parentId) {
        store.saving();

        if (Utils.isOfflineId(id)) {
            store.likeCommentOffline(ideaId, id, parentId);
            return;
        }

        if (NetworkStore.isOffline()) {
            store.likeCommentOffline(ideaId, id, parentId);
            AppActions.addOfflineAction('LIKE_COMMENT', { id, parentId, groupId: ideaId });
            return;
        }

        return data.post(`${Project.api}ideas/${ideaId}/comments/${id}/like`)
            .then(() => {
                // Use the offline helper as it does exactly what is needed
                store.likeCommentOffline(ideaId, id, parentId);
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    AppActions.addOfflineAction('LIKE_COMMENT', { id, parentId, groupId: ideaId });
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    unlikeComment(ideaId, id, parentId) {
        store.saving();

        if (Utils.isOfflineId(id)) {
            store.unlikeCommentOffline(ideaId, id, parentId);
            return;
        }

        if (NetworkStore.isOffline()) {
            store.unlikeCommentOffline(ideaId, id, parentId);
            AppActions.addOfflineAction('UNLIKE_COMMENT', { id, parentId, groupId: ideaId });
            return;
        }

        return data.delete(`${Project.api}ideas/${ideaId}/comments/${id}/like`)
            .then(() => {
                // Use the offline helper as it does exactly what is needed
                store.unlikeCommentOffline(ideaId, id, parentId);
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    AppActions.addOfflineAction('UNLIKE_COMMENT', { id, parentId, groupId: ideaId });
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    deleteComment(ideaId, id, parentId) {
        store.saving();

        if (Utils.isOfflineId(id)) {
            store.deleteCommentOffline(ideaId, id, parentId);
            return;
        }

        if (NetworkStore.isOffline()) {
            store.deleteCommentOffline(ideaId, id, parentId);
            AppActions.addOfflineAction('DELETE_COMMENT', { id, groupId: ideaId });
            return;
        }

        return data.delete(`${Project.api}ideas/${ideaId}/comments/${id}`)
            .then(() => {
                // Use the offline helper as it does exactly what is needed
                store.deleteCommentOffline(ideaId, id, parentId);
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    AppActions.addOfflineAction('DELETE_COMMENT', { id, groupId: ideaId });
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.GET_IDEA_COMMENTS:
            controller.getComments(action.id);
            break;
        case Actions.ADD_COMMENT:
            controller.addComment(action.ideaId, action.parentId, action.comment, action.attachments, action.mentions);
            break;
        case Actions.GET_MORE_IDEA_COMMENTS:
            controller.getMoreComments(action.id);
            break;
        case Actions.UPDATE_COMMENT:
            controller.updateComment(action.ideaId, action.id, action.comment, action.parentId, action.mentions);
            break;
        case Actions.LIKE_COMMENT:
            controller.likeComment(action.ideaId, action.id, action.parentId);
            break;
        case Actions.UNLIKE_COMMENT:
            controller.unlikeComment(action.ideaId, action.id, action.parentId);
            break;
        case Actions.LOGOUT:
            store.model = {};
            store.hasMore = {};
            break;
        case Actions.DELETE_COMMENT:
            controller.deleteComment(action.ideaId, action.id, action.parentId);
            break;
        case Actions.DATA:
            if (action.data['idea-comments']) store.model = action.data['idea-comments'];
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
