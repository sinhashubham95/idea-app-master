const AppActions = Object.assign({}, require('./base/_app-actions'), {
    getDomain(domain) {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_DOMAIN,
            domain,
        });
    },
    resendActivationCode(domain, username) {
        Dispatcher.handleViewAction({
            actionType: Actions.RESEND_ACTIVATION_CODE,
            domain,
            username,
        });
    },
    getChallenges() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_CHALLENGES,
        });
    },
    getMyIdeas() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_MY_IDEAS,
        });
    },
    getIdeas() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_IDEAS,
        });
    },
    getIdeaComments(id) {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_IDEA_COMMENTS,
            id,
        });
    },
    ssoLogin(userId, token) {
        Dispatcher.handleViewAction({
            actionType: Actions.SSO_LOGIN,
            userId,
            token,
        });
    },
    addComment(ideaId, parentId, comment, attachments, mentions) {
        Dispatcher.handleViewAction({
            actionType: Actions.ADD_COMMENT,
            ideaId,
            parentId,
            comment,
            attachments,
            mentions,
        });
    },
    getMoreIdeaComments(id) {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_MORE_IDEA_COMMENTS,
            id,
        });
    },
    refreshUser() {
        Dispatcher.handleViewAction({
            actionType: Actions.REFRESH_USER,
        });
    },
    refreshDomain() {
        Dispatcher.handleViewAction({
            actionType: Actions.REFRESH_DOMAIN,
        });
    },
    rateIdea(id, optionId) {
        Dispatcher.handleViewAction({
            actionType: Actions.RATE_IDEA,
            id,
            optionId: parseInt(optionId),
        });
    },
    unrateIdea(id) {
        Dispatcher.handleViewAction({
            actionType: Actions.UNRATE_IDEA,
            id,
        });
    },
    followIdea(id, follow) {
        Dispatcher.handleViewAction({
            actionType: Actions.FOLLOW_IDEA,
            id,
            follow,
        });
    },
    joinTeam(id) {
        Dispatcher.handleViewAction({
            actionType: Actions.JOIN_TEAM,
            id,
        });
    },
    leaveTeam(id) {
        Dispatcher.handleViewAction({
            actionType: Actions.LEAVE_TEAM,
            id,
        });
    },
    viewedChallenge(id) {
        Dispatcher.handleViewAction({
            actionType: Actions.VIEWED_CHALLENGE,
            id,
        });
    },
    sortIdeas(order) {
        Dispatcher.handleViewAction({
            actionType: Actions.SORT_IDEAS,
            order,
        });
    },
    filterIdeasByStatus(status) {
        Dispatcher.handleViewAction({
            actionType: Actions.FILTER_IDEAS_BY_STATUS,
            status,
        });
    },
    filterIdeasByChallenge(challenge) {
        Dispatcher.handleViewAction({
            actionType: Actions.FILTER_IDEAS_BY_CHALLENGE,
            challenge,
        });
    },
    searchIdeas(text) {
        Dispatcher.handleViewAction({
            actionType: Actions.SEARCH_IDEAS,
            text,
        });
    },
    resetIdeasSearch() {
        Dispatcher.handleViewAction({
            actionType: Actions.RESET_IDEAS_SEARCH,
        });
    },
    getMoreIdeas() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_MORE_IDEAS,
        });
    },
    getMoreChallenges() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_MORE_CHALLENGES,
        });
    },
    getChallengeForms(id) {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_CHALLENGE_FORMS,
            id,
        });
    },
    filterIdeasByStage(id) {
        Dispatcher.handleViewAction({
            actionType: Actions.FILTER_IDEAS_BY_STAGE,
            id,
        });
    },
    addIdea(challengeId, formData, attachments, isDraft, customFields, outcomevalues) {
        Dispatcher.handleViewAction({
            actionType: Actions.ADD_IDEA,
            challengeId,
            formData,
            attachments,
            isDraft,
            customFields,
            outcomevalues,
        });
    },
    getMoreMyIdeas() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_MORE_MY_IDEAS,
        });
    },
    getMoreMyDrafts() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_MORE_MY_DRAFTS,
        });
    },
    updateIdea(id, formData, attachments, publishDraft, customFields, outcomevalues) {
        Dispatcher.handleViewAction({
            actionType: Actions.UPDATE_IDEA,
            id,
            formData,
            attachments,
            publishDraft,
            customFields,
            outcomevalues,
        });
    },
    publishDraft(idea) {
        Dispatcher.handleViewAction({
            actionType: Actions.PUBLISH_DRAFT,
            idea,
        });
    },
    addOfflineAction(type, details) {
        Dispatcher.handleViewAction({
            actionType: Actions.ADD_OFFLINE_ACTION,
            type,
            details,
        });
    },
    updateComment(ideaId, id, comment, parentId, mentions) {
        Dispatcher.handleViewAction({
            actionType: Actions.UPDATE_COMMENT,
            ideaId,
            id,
            comment,
            parentId,
            mentions,
        });
    },
    getOfflineIdeas(challengeIds) {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_OFFLINE_IDEAS,
            challengeIds,
        });
    },
    deleteDraft(id) {
        Dispatcher.handleViewAction({
            actionType: Actions.DELETE_DRAFT,
            id,
        });
    },
    getNotifications() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_NOTIFICATIONS,
        });
    },
    getMoreNotifications() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_MORE_NOTIFICATIONS,
        });
    },
    searchUsers(query) {
        Dispatcher.handleViewAction({
            actionType: Actions.SEARCH_USERS,
            query,
        });
    },
    getTasks() {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_TASKS,
        });
    },
    markNotificationsAsRead() {
        Dispatcher.handleViewAction({
            actionType: Actions.MARK_NOTIFICATIONS_AS_READ,
        });
    },
    clearUserSearch() {
        Dispatcher.handleViewAction({
            actionType: Actions.CLEAR_USER_SEARCH,
        });
    },
    likeComment(ideaId, id, parentId) {
        Dispatcher.handleViewAction({
            actionType: Actions.LIKE_COMMENT,
            ideaId,
            id,
            parentId,
        });
    },
    unlikeComment(ideaId, id, parentId) {
        Dispatcher.handleViewAction({
            actionType: Actions.UNLIKE_COMMENT,
            ideaId,
            id,
            parentId,
        });
    },
    processOfflineActions() {
        Dispatcher.handleViewAction({
            actionType: Actions.PROCESS_OFFLINE_ACTIONS,
        });
    },
    addOfflineError(groupId, error) {
        Dispatcher.handleViewAction({
            actionType: Actions.ADD_OFFLINE_ERROR,
            groupId,
            error,
        });
    },
    resetUpdateCount() {
        Dispatcher.handleViewAction({
            actionType: Actions.RESET_UPDATE_COUNT,
        });
    },
    searchGroups(query) {
        Dispatcher.handleViewAction({
            actionType: Actions.SEARCH_GROUPS,
            query,
        });
    },
    clearGroupSearch() {
        Dispatcher.handleViewAction({
            actionType: Actions.CLEAR_GROUP_SEARCH,
        });
    },
    getChallengesForms(ids) {
        Dispatcher.handleViewAction({
            actionType: Actions.GET_CHALLENGES_FORMS,
            ids,
        });
    },
    deleteComment(ideaId, id, parentId) {
        Dispatcher.handleViewAction({
            actionType: Actions.DELETE_COMMENT,
            ideaId,
            id,
            parentId,
        });
    },
    data(data) {
        Dispatcher.handleViewAction({
            actionType: Actions.DATA,
            data,
        });
    },
    registerDeviceToken(token) {
        Dispatcher.handleViewAction({
            actionType: Actions.REGISTER_DEVICE_TOKEN,
            token,
        });
    },
});

export default AppActions;
window.AppActions = AppActions;
