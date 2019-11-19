// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

import NotificationOfflineError from './NotificationOfflineError';
import NotificationAddTeamMember from './NotificationAddTeamMember';
import NotificationNewShare from './NotificationNewShare';
import NotificationIdeaVoted from './NotificationIdeaVoted';
import NotificationCommentsNew from './NotificationCommentsNew';
import NotificationCommentsLiked from './NotificationCommentsLiked';
import NotificationCommentsMentioned from './NotificationCommentsMentioned';
import NotificationIdeaInResponseToChallenge from './NotificationIdeaInResponseToChallenge';
import NotificationIdeaMovedReviewReviewer from './NotificationIdeaMovedReviewReviewer';
import NotificationTeamMemberRequest from './NotificationTeamMemberRequest';
import NotificationTeamMemberRequestAccepted from './NotificationTeamMemberRequestAccepted';
import NotificationIdeaMoveOn from './NotificationIdeaMoveOn';
import NotificationOutcomeReviewYesFollower from './NotificationOutcomeReviewYesFollower';
import NotificationNewBadge from './NotificationNewBadge';
import NotificationIdeaMovedReviewCreator from './NotificationIdeaMovedReviewCreator';

export default class NotificationListItem extends PureComponent {
    static displayName = 'NotificationListItem';

    static propTypes = {
        notification: propTypes.shape({
            type: propTypes.string.isRequired,
        }),
    };

    render() {
        const { props: { notification: { type } } } = this;
        switch (type) {
            case 'IdeaVoted':
                return <NotificationIdeaVoted {...this.props} />;
            case 'CommentsNew':
                return <NotificationCommentsNew {...this.props} />;
            case 'CommentsLiked':
                return <NotificationCommentsLiked {...this.props} />;
            case 'CommentsMentioned':
                return <NotificationCommentsMentioned {...this.props} />;
            case 'IdeaInResponseToChallenge':
                return <NotificationIdeaInResponseToChallenge {...this.props} />;
            case 'IdeaMovedReviewReviewer':
                return <NotificationIdeaMovedReviewReviewer {...this.props} />;
            case 'OfflineError':
                return <NotificationOfflineError {...this.props} />;
            case 'NewShare':
                return <NotificationNewShare {...this.props} />;
            case 'AddTeamMember':
                return <NotificationAddTeamMember {...this.props} />;
            case 'TeamMemberRequest':
                return <NotificationTeamMemberRequest {...this.props} />;
            case 'TeamMemberRequestAccepted':
                return <NotificationTeamMemberRequestAccepted {...this.props} />;
            case 'IdeaMoveOn':
                return <NotificationIdeaMoveOn {...this.props} />;
            case 'OutcomeReviewYesFollower':
                return <NotificationOutcomeReviewYesFollower {...this.props} />;
            case 'NewBadge':
                return <NotificationNewBadge {...this.props} />;
            case 'IdeaMovedReviewCreator':
                return <NotificationIdeaMovedReviewCreator {...this.props} />;
            default:
                return null;
        }
    }
}