import { PureComponent } from 'react';
import getIdeaDetailsActionItems from './IdeaDetailsActionItems';

export default class extends PureComponent {
    static displayName = 'IdeaDetailsActionButton';

    static propTypes = {
        onEditIdea: propTypes.func,
        onJoinTeam: propTypes.func,
        onAddComment: propTypes.func,
        userIsTeamMember: propTypes.bool,
        onLeaveTeam: propTypes.func,
        is_team_enabled: propTypes.bool,
        team_request_pending: propTypes.bool,
    };

    render() {
        const { onEditIdea, onJoinTeam, onAddComment, userIsTeamMember, onLeaveTeam, is_team_enabled, team_request_pending } = this.props;
        const size = 56;
        const offset = size / 4;
        return (
            <ActionButton
              buttonColor={pallette.wazokuNavy} bgColor="rgba(0, 0, 0, 0.75)" hideShadow
              offsetY={global.bottomTabsHeight + offset}
              offsetX={offset}
              size={size}
            >
                {getIdeaDetailsActionItems({ onEditIdea, onJoinTeam, onAddComment, userIsTeamMember, onLeaveTeam, is_team_enabled, team_request_pending })}
            </ActionButton>
        );
    }
}
