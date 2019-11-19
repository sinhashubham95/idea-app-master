import { Component } from 'react';
import getIdeaDetailsActionItems from './IdeaDetailsActionItems';

export default class extends Component {
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

    state = {};

    render() {
        const { onEditIdea, onJoinTeam, onAddComment, userIsTeamMember, onLeaveTeam, is_team_enabled, team_request_pending } = this.props;
        const size = 56;
        const offset = size / 4;
        return (
            <View
              style={[styles.container,
                  this.state.active ? {
                      left: 0, top: 0, right: 0, bottom: 0,
                  } : {
                      right: offset,
                      bottom: global.bottomTabsHeight + offset,
                      width: size,
                      height: size,
                  }]}
            >
                <ActionButton
                  buttonColor={pallette.wazokuNavy} bgColor="rgba(0, 0, 0, 0.75)" hideShadow
                  offsetY={this.state.active ? global.bottomTabsHeight + offset : 0}
                  onPress={() => this.setState({ active: true })}
                  onReset={() => setTimeout(() => this.setState({ active: false }), 250)}
                  ref={c => this.actionButton = c}
                  offsetX={this.state.active ? offset : 0}
                  size={size}
                >
                    {getIdeaDetailsActionItems({ onEditIdea, onJoinTeam, onAddComment, userIsTeamMember, onLeaveTeam, is_team_enabled, team_request_pending })}
                </ActionButton>
            </View>
        );
    }
}

const styles = {
    container: {
        backgroundColor: 'transparent',
        position: 'absolute',
    },
};