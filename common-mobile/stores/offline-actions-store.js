import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'offline-actions',
    model: [],
    onNetworkChange: (isConnected) => {
        console.log('Offline actions onNetworkChange', isConnected);
        if (!store.isConnected && isConnected && !store.processing) {
            controller.processOfflineQueue();
        }
        store.isConnected = isConnected;
    },
});

const controller = {
    processOfflineQueue: () => {
        if (!store.model.length || !data.token) {
            Utils.checkCacheExpiry();
            return;
        }
        console.log('Processing offline queue', store.model);
        store.processing = true;
        Promise.all(_.map(store.model, ({ groupId, actions }) => {
            if (actions[0].type === 'ADD_IDEA') {
                // All actions past the first action rely on the initial creation succeeding
                return MyIdeasStore.syncOfflineIdea(groupId)
                    .then((newIdeaId) => {
                        groupId = newIdeaId; // Update the group id for all further actions
                        if (MyIdeasStore.attachmentsError) {
                            const idea = MyIdeasStore.getIdea(groupId);
                            AppActions.addOfflineError(groupId, `${localizedStrings.offlineSyncErrors} ${idea ? localizedStrings.formatString(localizedStrings.forIdea, idea.name) : ''}\n${localizedStrings.ideaAddedAttachmentsError}\n${MyIdeasStore.attachmentsError}\n`);
                        }
                        if (actions.length > 1) {
                            return Utils.promiseSerial(_.map(actions.slice(1), action => controller.processAction(groupId, action)))
                                .then(results => controller.handleActionResults(results, groupId));
                        }
                    })
                    .catch((e) => {
                        // TODO handle more type of failures
                        try {
                            if (e.json) {
                                e.json().then((error) => {
                                    if (error.error_code) {
                                        switch (error.error_code) {
                                            case 'permission_denied':
                                                // Idea submission is disabled or stage is closed (and we failed to save idea as a draft)
                                                return controller.handleActionResults([{ type: 'ADD_IDEA', result: new Error(localizedStrings.offlineSyncIdeaChallengeSubmissionsDisabled) }], groupId);
                                            case 'invalid_args':
                                                if (error.errors && error.errors.length) {
                                                    switch (error.errors[0]) {
                                                        case 'challenge_id.not_exists': // Challenge no longer exists
                                                            return controller.handleActionResults([{ type: 'ADD_IDEA', result: new Error(localizedStrings.offlineSyncIdeaChallengeNotFound) }], groupId);
                                                        default:
                                                    }
                                                }
                                                break;
                                            default:
                                        }
                                    }
                                });
                            }
                        } catch (err) {
                            console.log('Failed to parse error from syncing offline idea', err);
                        }
                    });
            }

            return Utils.promiseSerial(_.map(actions, action => controller.processAction(groupId, action)))
                .then(results => controller.handleActionResults(results, groupId));
        }))
            .then(() => {
                console.log('Finished processing');
                if (Utils.checkCacheExpiry()) return;
                if (_.find(store.model, ({ actions }) => _.find(actions, action => action.type === 'ADD_IDEA' || action.type === 'UPDATE_IDEA' || action.type === 'PUBLISH_DRAFT'))) {
                    AppActions.getIdeas();
                }
                store.model = [];
                SecuredStorage.removeItem('offline-actions');
                store.processing = false;
            });
    },
    processAction: (groupId, { type, offlineId, parentId, ...rest }) => () => {
        console.log('Processing offline action', groupId, JSON.stringify({ type, offlineId, parentId, ...rest }));
        const res = {
            type, offlineId, parentId, ...rest,
        };
        switch (type) {
            case 'ADD_COMMENT':
                res.result = IdeaCommentsStore.syncOfflineComment(groupId, offlineId, parentId)
                    .then((result) => {
                        if (IdeaCommentsStore.attachmentsError) {
                            const idea = Utils.findIdea(groupId);
                            AppActions.addOfflineError(groupId, `${localizedStrings.offlineSyncErrors} ${idea ? localizedStrings.formatString(localizedStrings.forIdea, idea.name) : ''}\n${localizedStrings.commentAddedAttachmentsError}\n${IdeaCommentsStore.attachmentsError}\n`);
                        }
                        return result;
                    });
                break;
            case 'UPDATE_COMMENT':
                res.result = IdeaCommentsStore.syncUpdateComment(groupId, rest.id, rest.comment, parentId, rest.mentions);
                break;
            case 'UPDATE_IDEA':
                res.result = MyIdeasStore.syncUpdateIdea(groupId, rest.formData, rest.newAttachments)
                    .then((result) => {
                        if (MyIdeasStore.attachmentsError) {
                            const idea = MyIdeasStore.getIdea(groupId);
                            AppActions.addOfflineError(groupId, `${localizedStrings.offlineSyncErrors} ${idea ? localizedStrings.formatString(localizedStrings.forIdea, idea.name) : ''}\n${localizedStrings.ideaUpdateAttachmentsError}\n${MyIdeasStore.attachmentsError}\n`);
                        }
                        return result;
                    });
                break;
            case 'FOLLOW_IDEA':
                res.result = IdeasStore.syncFollowIdea(groupId, rest.follow);
                break;
            case 'RATE_IDEA':
                res.result = IdeasStore.syncRateIdea(groupId, rest.optionId);
                break;
            case 'UNRATE_IDEA':
                res.result = IdeasStore.syncUnrateIdea(groupId);
                break;
            case 'PUBLISH_DRAFT':
                res.result = MyIdeasStore.syncPublishDraft(groupId);
                break;
            case 'DELETE_DRAFT':
                res.result = MyIdeasStore.syncDeleteDraft(groupId);
                break;
            case 'LIKE_COMMENT':
                res.result = IdeaCommentsStore.syncLikeComment(groupId, rest.id, parentId);
                break;
            case 'UNLIKE_COMMENT':
                res.result = IdeaCommentsStore.syncUnlikeComment(groupId, rest.id, parentId);
                break;
            case 'SHARE':
                res.result = data.post(`${Project.api}${rest.entityType}/${groupId}/share`, { group_names: rest.group_names, user_emails: rest.user_emails, message: rest.message });
                break;
            case 'DELETE_COMMENT':
                res.result = IdeaCommentsStore.syncDeleteComment(groupId, rest.id);
                break;
            case 'JOIN_TEAM':
                res.result = IdeasStore.syncJoinTeam(groupId);
                break;
            default:
        }
        return new Promise((resolve, reject) => {
            res.result.then(() => resolve(res)).catch((e) => {
                res.result = e;
                reject(res);
            });
        });
    },
    handleActionResults: (results, groupId) => {
        // Find errors in results
        const errors = _.filter(results, ({ result }) => result instanceof Error);
        if (errors.length) {
            console.log(`Got offline sync error(s) for ${groupId} - ${errors}`);
            const grouped = _.groupBy(errors, 'type');
            const idea = Utils.findIdea(groupId);
            let offlineError = `${localizedStrings.offlineSyncErrors} ${idea ? localizedStrings.formatString(localizedStrings.forIdea, idea.name) : ''}\n`;
            _.each(grouped, (groupedErrors, type) => {
                // TODO handle more type of failures
                switch (type) {
                    case 'ADD_IDEA':
                        offlineError += `${groupedErrors[0].result.message}\n`;
                        break;
                    case 'ADD_COMMENT':
                        offlineError += `${localizedStrings.failedAddComments}\n`;
                        break;
                    case 'UPDATE_COMMENT':
                        offlineError += `${localizedStrings.failedUpdateComments}\n`;
                        break;
                    case 'UPDATE_IDEA':
                        offlineError += `${localizedStrings.failedUpdateIdea}\n`;
                        break;
                    case 'FOLLOW_IDEA':
                        offlineError += `${localizedStrings.failedFollowIdea}\n`;
                        break;
                    case 'RATE_IDEA':
                        offlineError += `${localizedStrings.failedRateIdea}\n`;
                        break;
                    case 'UNRATE_IDEA':
                        offlineError += `${localizedStrings.failedUnrateIdea}\n`;
                        break;
                    case 'PUBLISH_DRAFT':
                        offlineError += `${localizedStrings.failedPublishDraft}\n`;
                        break;
                    case 'DELETE_DRAFT':
                        offlineError += `${localizedStrings.failedDeleteDraft}\n`;
                        break;
                    case 'LIKE_COMMENT':
                        offlineError += `${localizedStrings.failedLikeComments}\n`;
                        break;
                    case 'UNLIKE_COMMENT':
                        offlineError += `${localizedStrings.failedUnlikeComments}\n`;
                        break;
                    case 'SHARE':
                        offlineError += `${localizedStrings.formatString(localizedStrings.failedShare, groupedErrors[0].entityType === 'ideas' ? localizedStrings.idea.toLowerCase() : localizedStrings.challenge.toLowerCase())}\n`;
                        break;
                    case 'DELETE_COMMENT':
                        offlineError += `${localizedStrings.failedDeleteComments}\n`;
                        break;
                    default:
                }
            });
            if (offlineError.length) AppActions.addOfflineError(groupId, offlineError);
        }
        return Promise.resolve();
    },
    addAction: (type, { offlineId, groupId, parentId, ...rest }) => {
        let groupAction;
        switch (type) {
            case 'ADD_IDEA':
                store.model.push({ groupId: offlineId, actions: [{ type, offlineId }] });
                break;
            // Actions here are not unique to a group and can be added more than once
            case 'ADD_COMMENT':
            case 'UPDATE_COMMENT':
            case 'LIKE_COMMENT':
            case 'UNLIKE_COMMENT':
            case 'SHARE':
            case 'DELETE_COMMENT':
                groupAction = _.find(store.model, { groupId });
                if (!groupAction) {
                    store.model.push({ groupId, actions: [{ type, offlineId, parentId, ...rest }] });
                    break;
                }
                switch (type) {
                    case 'LIKE_COMMENT': {
                        const index = _.findIndex(groupAction.actions, { type: 'UNLIKE_COMMENT', parentId, id: rest.id });
                        if (index !== -1) {
                            groupAction.actions.splice(index, 1);
                        } else {
                            groupAction.actions.push({ type, offlineId, parentId, ...rest });
                        }
                        break;
                    }
                    case 'UNLIKE_COMMENT': {
                        const index = _.findIndex(groupAction.actions, { type: 'LIKE_COMMENT', parentId, id: rest.id });
                        if (index !== -1) {
                            groupAction.actions.splice(index, 1);
                        } else {
                            groupAction.actions.push({ type, offlineId, parentId, ...rest });
                        }
                        break;
                    }
                    default:
                        groupAction.actions.push({ type, offlineId, parentId, ...rest });
                }
                break;
            // Actions here are unique to a group and will overwrite an existing action of the same type
            case 'UPDATE_IDEA':
            case 'FOLLOW_IDEA':
            case 'RATE_IDEA':
            case 'UNRATE_IDEA':
            case 'PUBLISH_DRAFT':
            case 'DELETE_DRAFT':
            case 'JOIN_TEAM': {
                groupAction = _.find(store.model, { groupId });
                if (!groupAction) {
                    store.model.push({ groupId, actions: [{ type, offlineId, parentId, ...rest }] });
                    break;
                }
                let index = _.findIndex(groupAction.actions, { type });
                if (index !== -1) {
                    if (type === 'UPDATE_IDEA') {
                        // Only keep new attachments that are still attached to the idea (should be in form data).
                        const newAttachmentsToKeep = _.intersectionWith(groupAction.actions[index].newAttachments, rest.formData.attachments, (newAttachment, attachment) => newAttachment.uri === attachment.url);

                        if (rest.formData.banner_url) {
                            const newBannerAttachment = _.find(groupAction.actions[index].newAttachments, attachment => attachment.isBannerImage && attachment.uri === rest.formData.banner_url);
                            if (newBannerAttachment) newAttachmentsToKeep.push(newBannerAttachment);
                        }

                        if (rest.formData.cover_url) {
                            const newCoverAttachment = _.find(groupAction.actions[index].newAttachments, attachment => attachment.isCoverImage && attachment.uri === rest.formData.cover_url);
                            if (newCoverAttachment) newAttachmentsToKeep.push(newCoverAttachment);
                        }

                        // Create list of new attachments. Only the most recent change to banner/cover image is permitted
                        const newAttachments = _.uniqBy(_.uniqBy(_.unionWith(rest.newAttachments, newAttachmentsToKeep, (newAttachment, newAttachmentToKeep) => newAttachmentToKeep.uri === newAttachment.uri), attachment => attachment.isBannerImage || attachment.uri), attachment => attachment.isCoverImage || attachment.uri);

                        groupAction.actions[index] = { type, offlineId, parentId, ...rest, newAttachments };
                    } else {
                        groupAction.actions[index] = { type, offlineId, parentId, ...rest };
                    }
                } else if (type === 'UPDATE_IDEA') {
                    groupAction.actions.push({ type, offlineId, parentId, ...rest, newAttachments: _.cloneDeep(rest.newAttachments) });
                } else {
                    groupAction.actions.push({ type, offlineId, parentId, ...rest });
                }
                // Special handling
                switch (type) {
                    case 'RATE_IDEA':
                        index = _.findIndex(groupAction.actions, { type: 'UNRATE_IDEA' });
                        if (index !== -1) {
                            groupAction.actions.splice(index, 1);
                        }
                        break;
                    case 'UNRATE_IDEA':
                        index = _.findIndex(groupAction.actions, { type: 'RATE_IDEA' });
                        if (index !== -1) {
                            groupAction.actions.splice(index, 1);
                        }
                        break;
                    default:
                }
                break;
            }
            default:
                return;
        }
        console.log('Adding offline action', store.model);
        SecuredStorage.setItem('offline-actions', store.model);
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.ADD_OFFLINE_ACTION:
            controller.addAction(action.type, action.details);
            break;
        case Actions.LOGOUT:
            store.model = [];
            break;
        case Actions.PROCESS_OFFLINE_ACTIONS: {
            const res = SecuredStorage.storage && SecuredStorage.storage['offline-actions'];
            if (res) {
                store.model = res;
                if (!NetworkStore.isOffline() && !store.processing) {
                    controller.processOfflineQueue();
                }
            } else {
                Utils.checkCacheExpiry();
            }
            break;
        }
        default:
    }
});

controller.store = store;
module.exports = controller.store;

NetworkStore.subscribeListener(store.id, store.onNetworkChange);
