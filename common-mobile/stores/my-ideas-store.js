import BaseStore from './base/_store';
import data from './base/_data';

const store = Object.assign({}, BaseStore, {
    id: 'my-ideas',
    model: [],
    moreDrafts: false,
    moreIdeas: false,
    getPublished() {
        return _.filter(store.model, idea => !idea.is_draft);
    },
    getIdeas() {
        return store.model;
    },
    getDrafts() {
        return _.filter(store.model, idea => idea.is_draft);
    },
    hasMoreDrafts() {
        return store.moreDrafts && !store.isLoading;
    },
    hasMoreIdeas() {
        return store.moreIdeas && !store.isLoading;
    },
    updateMyIdea(idea) {
        const index = _.findIndex(store.model, { id: idea.id });
        if (index !== -1) {
            store.saving();
            store.model[index] = _.cloneDeep(idea);
            SecuredStorage.setItem('my-ideas', store.model);
            setTimeout(() => store.saved(), 50);
        }
    },
    getIdea(id) {
        return _.find(store.model, { id });
    },
    syncOfflineIdea(offlineId) {
        store.attachmentsError = '';
        store.saving();
        let newIdeaId;
        const offlineIdea = _.cloneDeep(store.getIdea(offlineId));

        let challengePromise = Promise.resolve();
        let forceDraft = false;
        if (!offlineIdea.is_draft) {
            challengePromise = data.get(`${Project.api}challenges/${offlineIdea.challenge.id}?include=${Constants.include.challenges}`)
                .then(({ data: res }) => {
                    if (res.submit_idea_action !== 'enabled') {
                        offlineIdea.is_draft = true;
                        forceDraft = true;
                    }
                });
        }

        let uploadPromise = Promise.resolve();
        if (offlineIdea.bannerImage.length || offlineIdea.coverImage.length) {
            uploadPromise = Utils.uploadAttachments(offlineIdea.bannerImage.concat(offlineIdea.coverImage));
        }
        return challengePromise.then(() => uploadPromise)
            .then((res) => {
                if (res && res.length) {
                    if (res.length === 2) {
                        offlineIdea.data.banner_url = res[0].data.url;
                        offlineIdea.data.cover_url = res[1].data.url;
                    } else if (offlineIdea.bannerImage.length) {
                        offlineIdea.data.banner_url = res[0].data.url;
                    } else {
                        offlineIdea.data.cover_url = res[0].data.url;
                    }
                }
                return data.post(`${Project.api}ideas?include=${Constants.include.ideas}`, { challenge_id: offlineIdea.challenge.id, form_data: JSON.stringify(offlineIdea.data), is_draft: offlineIdea.is_draft });
            })
            .then(({ data: res }) => {
                if (forceDraft) AppActions.offlineError(localizedStrings.formatString(localizedStrings.ideaSavedAsDraftOnline, res.name));
                newIdeaId = res.id;
                store.replaceMyOfflineIdea(offlineId, res);
                IdeaCommentsStore.updateOfflineIdeaId(offlineId, res.id);
                OfflineIdeasStore.replaceOfflineIdea(offlineId, res);
                let attachmentsPromise = Promise.resolve();
                if (offlineIdea.attachments.length) {
                    const attachments = _.map(offlineIdea.attachments, attachment => ({ uri: attachment.url, name: attachment.filename, type: attachment.type }));
                    attachmentsPromise = store.uploadAndSaveAttachments(res.id, attachments);
                }
                return attachmentsPromise
                    .catch(e => Utils.handleErrorFromAPI(e, localizedStrings.unexpectedError)
                        .then((err) => {
                            console.log('Error uploading attachments', e);
                            store.attachmentsError = err;
                        }));
            })
            .then(() => newIdeaId)
            .catch((e) => {
                store.deleteMyOfflineIdea(offlineId);
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    uploadAndSaveAttachments(id, attachments) {
        return Utils.uploadAttachments(attachments)
            .then((res) => {
                if (res) {
                    return controller.saveAttachmentsToIdea(res, id);
                }
            });
    },
    replaceMyOfflineIdea(offlineId, idea) {
        const index = _.findIndex(store.model, { id: offlineId });
        if (index !== -1) {
            store.model[index] = idea;
            SecuredStorage.setItem('my-ideas', store.model);
        }
        store.saved();
        store.trigger('offline-idea-synced', { offlineId, id: idea.id });
    },
    deleteMyOfflineIdea(offlineId) {
        const index = _.findIndex(store.model, { id: offlineId });
        if (index !== -1) {
            store.model.splice(index, 1);
        }
    },
    incrementCommentCount(id) {
        const index = _.findIndex(store.model, { id });
        if (index === -1) return;
        store.saving();
        store.model[index] = { ...store.model[index], num_comments: store.model[index].num_comments + 1 };
        SecuredStorage.setItem('my-ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
    updateIdeaOffline(id, formData, newAttachments, publishDraft, customFields, outcomevalues) {
        const index = _.findIndex(store.model, { id });
        let idea;
        if (index === -1) {
            // Must be in one of the other stores
            idea = OfflineIdeasStore.getIdea(id);
            if (!idea) idea = IdeasStore.getIdea(id);
            if (!idea) {
                store.error = localizedStrings.unableToUpdateIdeaOffline;
                store.goneABitWest();
                return;
            }
            store.model.push(idea);
            idea = _.last(store.model);
            store.model = _.sortBy(store.model, myIdea => -myIdea.created);
        } else {
            idea = store.model[index];
        }
        if (formData.category != null && formData.category !== idea.category.id) {
            idea.category = _.find(ChallengesStore.getChallenge(idea.challenge.id).categories, { id: formData.category });
        }
        idea.data = formData;
        idea.custom_fields = customFields;
        idea.outcomevalues = outcomevalues;
        if (!idea.data.banner_url && idea.banner_url) {
            idea.banner_url = null;
        }
        if (!idea.data.cover_url && idea.cover_url) {
            idea.cover_url = null;
        }
        idea.attachments = formData.attachments || [];
        const bannerImage = _.filter(newAttachments, attachment => attachment.isBannerImage);
        const coverImage = _.filter(newAttachments, attachment => attachment.isCoverImage);
        if (bannerImage.length) {
            idea.bannerImage = bannerImage;
            idea.banner_url = bannerImage[0].uri;
        }
        if (coverImage.length) {
            idea.coverImage = coverImage;
            idea.cover_url = coverImage[0].uri;
        }
        const newAttachmentsFiltered = _.filter(newAttachments, attachment => !attachment.isBannerImage && !attachment.isCoverImage);
        if (newAttachmentsFiltered && newAttachmentsFiltered.length) {
            idea.attachments = idea.attachments.concat(_.map(newAttachmentsFiltered, attachment => ({
                id: Utils.generateOfflineId(),
                filename: attachment.name,
                url: attachment.uri,
                type: attachment.type,
            })));
        }
        if (publishDraft) {
            idea.is_draft = false;
        }
        store.savedIdea = idea;
        OfflineIdeasStore.updateIdea(idea, true);
        IdeasStore.updateIdea(idea, true);
        SecuredStorage.setItem('my-ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
    syncUpdateIdea(id, formData, newAttachments) {
        return controller.updateIdea(id, formData, newAttachments)
            .then(() => {
                if (store.attachmentsError) {
                    const idea = store.getIdea(id);
                    AppActions.addOfflineError(id, `${localizedStrings.offlineSyncErrors} ${idea ? localizedStrings.formatString(localizedStrings.forIdea, idea.name) : ''}\n${localizedStrings.ideaUpdateAttachmentsError}`);
                }
            });
    },
    followIdeaOffline(id, follow) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.saving();
            store.model[index].is_following = follow;
            SecuredStorage.setItem('my-ideas', store.model);
            setTimeout(() => store.saved(), 50);
        }
    },
    rateIdeaOffline(id, optionId) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.saving();
            store.model[index].user_rating_option_id = optionId;
            store.model[index].rating_counts[optionId]++;
            SecuredStorage.setItem('my-ideas', store.model);
            setTimeout(() => store.saved(), 50);
        }
    },
    unrateIdeaOffline(id) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.saving();
            store.model[index].rating_counts[store.model[index].user_rating_option_id]--;
            store.model[index].user_rating_option_id = null;
            SecuredStorage.setItem('my-ideas', store.model);
            setTimeout(() => store.saved(), 50);
        }
    },
    publishDraftOffline(id) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.model[index].is_draft = false;
        }
        store.savedIdea = store.model[index];
        SecuredStorage.setItem('my-ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
    syncPublishDraft(id) {
        const idea = _.find(store.model, { id });
        if (!idea) return Promise.reject(new Error(localizedStrings.unableToPublishDraft));
        return controller.publishDraft(idea);
    },
    deleteDraftOffline(id) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.model.splice(index, 1);
        }
        SecuredStorage.setItem('my-ideas', store.model);
        setTimeout(() => store.saved(), 50);
    },
    syncDeleteDraft(id) {
        return controller.deleteDraft(id);
    },
    pushIdea(idea) {
        store.model.push(idea);
        store.model = _.sortBy(store.model, myIdea => -myIdea.created);
    },
    joinTeamOffline(id) {
        const index = _.findIndex(store.model, { id });
        if (index !== -1) {
            store.saving();
            store.model[index].team_request_pending = true;
            SecuredStorage.setItem('my-ideas', store.model);
            setTimeout(() => store.saved(), 50);
        }
    },
});

const controller = {
    getIdeas: (hasMore, isDrafts) => {
        store.loading();
        let promise;
        if (!hasMore) {
            promise = Promise.all([data.get(`${Project.api}ideas?own_only=true&include=${Constants.include.ideas}&is_draft=true`), data.get(`${Project.api}ideas?own_only=true&include=${Constants.include.ideas}&is_draft=false`)]);
        } else {
            promise = Promise.all([data.get(hasMore)]);
        }
        promise.then(([res, ideasRes]) => {
            if (res && ideasRes) {
                // Both drafts and ideas
                const ideas = res.data.concat(ideasRes.data);
                store.model = _.sortBy(_.unionBy(ideas, store.model, 'id'), idea => -idea.created);
                SecuredStorage.setItem('my-ideas', store.model);
                store.moreDrafts = res.page.next;
                store.moreIdeas = ideasRes.page.next;
                store.loaded();
            } else {
                // Has more flow, could be either drafts or ideas
                store.model = _.sortBy(_.unionBy(res.data, store.model, 'id'), idea => -idea.created);
                SecuredStorage.setItem('my-ideas', store.model);
                if (isDrafts) {
                    store.moreDrafts = res.page.next;
                } else {
                    store.moreIdeas = res.page.next;
                }
                store.loaded();
            }
        })
            .catch((e) => {
                store.moreDrafts = false;
                store.moreIdeas = false;
                API.ajaxHandler(store, e);
            });
    },
    addIdea: (challengeId, formData, attachments, isDraft, customFields, outcomevalues) => {
        store.formDataError = '';
        store.attachmentsError = '';
        store.saving();
        let newIdeaId;
        if (NetworkStore.isOffline()) {
            controller.addOfflineIdea(challengeId, formData, attachments, isDraft, customFields, outcomevalues);
            return;
        }
        const bannerImage = _.filter(attachments, attachment => attachment.isBannerImage);
        const coverImage = _.filter(attachments, attachment => attachment.isCoverImage);
        let uploadPromise = Promise.resolve();
        if (bannerImage.length || coverImage.length) {
            uploadPromise = Utils.uploadAttachments(bannerImage.concat(coverImage));
        }
        uploadPromise
            .then((res) => {
                if (res && res.length) {
                    if (res.length === 2) {
                        formData.banner_url = res[0].data.url;
                        formData.cover_url = res[1].data.url;
                    } else if (bannerImage.length) {
                        formData.banner_url = res[0].data.url;
                    } else {
                        formData.cover_url = res[0].data.url;
                    }
                }
                return data.post(`${Project.api}ideas?include=${Constants.include.ideas}`, { challenge_id: challengeId, form_data: JSON.stringify(formData), is_draft: !!isDraft });
            })
            .then(({ data: res }) => {
                store.model.push(res);
                store.savedIdea = res;
                newIdeaId = res.id;
                SecuredStorage.setItem('my-ideas', store.model);
                _.remove(attachments, attachment => attachment.isBannerImage);
                _.remove(attachments, attachment => attachment.isCoverImage);
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
                    return controller.saveAttachmentsToIdea(res, newIdeaId, isDraft);
                }
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed' && !newIdeaId) {
                    controller.addOfflineIdea(challengeId, formData, attachments, isDraft, customFields, outcomevalues);
                    return;
                }
                API.ajaxHandler(store, e);
            });
    },
    updateIdea: (id, formData, newAttachments, publishDraft, customFields, outcomevalues) => {
        store.formDataError = '';
        store.attachmentsError = '';
        store.saving();

        if (Utils.isOfflineId(id)) {
            store.updateIdeaOffline(id, formData, newAttachments, publishDraft, customFields, outcomevalues);
            return;
        }

        if (NetworkStore.isOffline()) {
            store.updateIdeaOffline(id, formData, newAttachments, publishDraft, customFields, outcomevalues);
            AppActions.addOfflineAction('UPDATE_IDEA', { groupId: id, formData, newAttachments });
            if (publishDraft) {
                AppActions.addOfflineAction('PUBLISH_DRAFT', { groupId: id });
            }
            return;
        }

        const bannerImage = _.filter(newAttachments, attachment => attachment.isBannerImage);
        const coverImage = _.filter(newAttachments, attachment => attachment.isCoverImage);
        let uploadPromise = Promise.resolve();
        if (bannerImage.length || coverImage.length) {
            uploadPromise = Utils.uploadAttachments(bannerImage.concat(coverImage));
        }
        return uploadPromise
            .then((res) => {
                if (res && res.length) {
                    if (res.length === 2) {
                        formData.banner_url = res[0].data.url;
                        formData.cover_url = res[1].data.url;
                    } else if (bannerImage.length) {
                        formData.banner_url = res[0].data.url;
                    } else {
                        formData.cover_url = res[0].data.url;
                    }
                }
                return data.put(`${Project.api}ideas/${id}?include=${Constants.include.ideas}`, Object.assign({}, { form_data: JSON.stringify(formData) }, publishDraft ? { is_draft: false } : {}));
            })
            .then(({ data: res }) => {
                const index = _.findIndex(store.model, { id });
                // Might not exist in this store
                if (index !== -1) {
                    store.model[index] = res;
                } else {
                    store.model.push(res);
                    store.model = _.sortBy(store.model, myIdea => -myIdea.created);
                }
                store.savedIdea = res;
                SecuredStorage.setItem('my-ideas', store.model);
                _.remove(newAttachments, attachment => attachment.isBannerImage);
                _.remove(newAttachments, attachment => attachment.isCoverImage);
                if (newAttachments && newAttachments.length) {
                    return Utils.uploadAttachments(newAttachments)
                        .catch(e => Utils.handleErrorFromAPI(e, localizedStrings.unexpectedError)
                            .then((err) => {
                                console.log('Error uploading attachments', e);
                                store.attachmentsError = err;
                                store.saved();
                            }));
                }

                IdeasStore.updateIdea(res);
                OfflineIdeasStore.updateIdea(res);
                store.saved();
            })
            .then((res) => {
                if (res) {
                    return controller.saveAttachmentsToIdea(res, id);
                }
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    store.updateIdeaOffline(id, formData, newAttachments, publishDraft, customFields, outcomevalues);
                    AppActions.addOfflineAction('UPDATE_IDEA', { groupId: id, formData, newAttachments });
                    if (publishDraft) {
                        AppActions.addOfflineAction('PUBLISH_DRAFT', { groupId: id });
                    }
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    saveAttachmentsToIdea: (res, id) => Promise.all(_.map(res, ({ data: { url, filename } }) => data.post(`${Project.api}ideas/${id}/attachments`, {
        url,
        filename,
    })))
        .then((newAttachments) => {
            let idea = _.find(store.model, { id });
            if (!idea) {
                // If its not in this store it must be in the ideas store
                idea = IdeasStore.getIdea(id);
                if (!idea) {
                    // then it must be in the offline ideas store
                    idea = OfflineIdeasStore.getIdea(id);
                }
            }
            if (idea) {
                _.each(newAttachments, ({ data: newAttachment }) => {
                    idea.attachments.push(newAttachment);
                });
                store.savedIdea = idea;
                IdeasStore.updateIdea(idea);
                OfflineIdeasStore.updateIdea(idea);
            }
            store.saved();
        })
        .catch(e => Utils.handleErrorFromAPI(e, localizedStrings.unexpectedError)
            .then((err) => {
                console.log('Error uploading attachments', e);
                store.attachmentsError = err;
                store.saved();
            })),

    deleteAttachments: (id, attachments) => Promise.all(_.map(attachments, ({ id: attachmentId }) => data.delete(`${Project.api}ideas/${id}/attachments/${attachmentId}`)))
        .then(() => {
            const idea = _.find(store.model, { id });
            idea.attachments = _.differenceWith(idea.attachments, attachments, ({ id: attachmentId }, { id: idToDelete }) => attachmentId === idToDelete);
            store.savedIdea = idea;
            IdeasStore.updateIdea(idea);
            OfflineIdeasStore.updateIdea(idea);
            store.saved();
        }),
    publishDraft: (idea) => {
        store.saving();

        if (Utils.isOfflineId(idea.id)) {
            store.publishDraftOffline(idea.id);
            return;
        }

        if (NetworkStore.isOffline()) {
            store.publishDraftOffline(idea.id);
            AppActions.addOfflineAction('PUBLISH_DRAFT', { groupId: idea.id });
            return;
        }

        const formData = JSON.stringify({ ...idea.data, attachments: idea.attachments });
        return data.put(`${Project.api}ideas/${idea.id}?include=${Constants.include.ideas}`, { form_data: formData, is_draft: false })
            .then(({ data: res }) => {
                const index = _.findIndex(store.model, { id: idea.id });
                if (index !== -1) {
                    store.model[index] = res;
                }
                store.savedIdea = res;
                SecuredStorage.setItem('my-ideas', store.model);
                store.saved();
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    store.publishDraftOffline(idea.id);
                    AppActions.addOfflineAction('PUBLISH_DRAFT', { groupId: idea.id });
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    deleteDraft: (id) => {
        store.saving();

        if (Utils.isOfflineId(id)) {
            store.deleteDraftOffline(id);
            return;
        }

        if (NetworkStore.isOffline()) {
            store.deleteDraftOffline(id);
            AppActions.addOfflineAction('DELETE_DRAFT', { groupId: id });
            return;
        }

        return data.delete(`${Project.api}ideas/${id}`)
            .then(() => {
                const index = _.findIndex(store.model, { id });
                if (index !== -1) {
                    store.model.splice(index, 1);
                }
                SecuredStorage.setItem('my-ideas', store.model);
                store.saved();
            })
            .catch((e) => {
                if (e instanceof Error && e.message === 'Network request failed') {
                    store.deleteDraftOffline(id);
                    AppActions.addOfflineAction('DELETE_DRAFT', { groupId: id });
                    return;
                }
                API.ajaxHandler(store, e);
                return Promise.reject(e);
            });
    },
    addOfflineIdea: (challengeId, formData, attachments, isDraft, customFields, outcomevalues) => {
        store.saving();
        const newIdeaId = Utils.generateOfflineId();
        const questions = ChallengeFormsStore.getForms(challengeId).questions;
        const categoryQuestion = _.find(questions, { type: 'IdeaCategory' });
        const challenge = ChallengesStore.getChallenge(challengeId);
        const category = categoryQuestion ? _.find(challenge.categories, { id: formData[categoryQuestion.id] }) : null;
        const creator = AccountStore.getUser();
        const bannerImage = _.remove(attachments, attachment => attachment.isBannerImage);
        const coverImage = _.remove(attachments, attachment => attachment.isCoverImage);
        const res = {
            attachments: [],
            bannerImage,
            banner_url: bannerImage.length ? bannerImage[0].uri : null,
            category: category || null,
            challenge,
            coverImage,
            cover_url: coverImage.length ? coverImage[0].uri : null,
            created: moment().unix(),
            creator,
            custom_fields: customFields,
            data: formData,
            id: newIdeaId,
            image_url: null,
            is_draft: !!isDraft,
            is_following: true,
            modified: moment().unix(),
            name: formData.title,
            num_comments: 0,
            num_downvotes: 0,
            num_upvotes: 0,
            num_visits: 0,
            old_pdf: null,
            outcomevalues,
            rating_counts: challenge.rating_system && Object.assign({}, ..._.map(challenge.rating_system.option_list, ({ id }) => ({ [id]: 0 }))),
            review_decision: null,
            score: '0.000000000000000',
            serial_number: '-----',
            status: 'Concept', // TODO REVIEW
            summary: category ? category.name : '',
            team: {
                leaders: [creator.id],
                users: [creator],
            },
            user_can_see_rating_bar: false,
            user_rating_option_id: null,
            user_vote_action: 'disabled',
            vote_score: null,
        };
        if (attachments && attachments.length) {
            res.attachments = _.map(attachments, attachment => ({
                id: Utils.generateOfflineId(),
                filename: attachment.name,
                url: attachment.uri,
                type: attachment.type,
            }));
        }
        store.model.unshift(res);
        if (!isDraft) {
            OfflineIdeasStore.pushIdea(_.cloneDeep(res));
        }
        SecuredStorage.setItem('my-ideas', store.model);
        store.savedIdea = res;
        store.saved();
        // Add to offline queue
        AppActions.addOfflineAction('ADD_IDEA', { offlineId: newIdeaId });
    },
};

store.dispatcherIndex = Dispatcher.register(store, (payload) => {
    const action = payload.action; // this is our action from handleViewAction

    switch (action.actionType) {
        case Actions.GET_MY_IDEAS:
            controller.getIdeas();
            break;
        case Actions.ADD_IDEA:
            controller.addIdea(action.challengeId, action.formData, action.attachments, action.isDraft, action.customFields, action.outcomevalues);
            break;
        case Actions.GET_MORE_MY_DRAFTS:
            controller.getIdeas(store.moreDrafts, true);
            break;
        case Actions.GET_MORE_MY_IDEAS:
            controller.getIdeas(store.moreIdeas, false);
            break;
        case Actions.UPDATE_IDEA:
            controller.updateIdea(action.id, action.formData, action.attachments, action.publishDraft, action.customFields, action.outcomevalues);
            break;
        case Actions.PUBLISH_DRAFT:
            controller.publishDraft(action.idea);
            break;
        case Actions.DELETE_DRAFT:
            controller.deleteDraft(action.id);
            break;
        case Actions.LOGOUT:
            store.model = [];
            store.moreDrafts = false;
            store.moreIdeas = false;
            break;
        case Actions.DATA:
            if (action.data['my-ideas']) store.model = action.data['my-ideas'];
            break;
        default:
    }
});

controller.store = store;
module.exports = controller.store;
