export default ({ onEditIdea, onJoinTeam, onLeaveTeam, onAddComment, userIsTeamMember, is_team_enabled, team_request_pending }) => [
    <ActionButton.Item
      key="edit-idea" buttonColor="#5587AA" title={localizedStrings.editIdea}
      onPress={onEditIdea} textStyle={Styles.actionButtonText} textContainerStyle={Styles.actionButtonTextContainer}
      active={is_team_enabled && userIsTeamMember}
    >
        <FontAwesome5 name="pencil-alt" style={Styles.actionButtonIcon} />
    </ActionButton.Item>,
    <ActionButton.Item
      key="add-comment" buttonColor="#5587AA" title={localizedStrings.addComment}
      onPress={onAddComment} textStyle={Styles.actionButtonText} textContainerStyle={Styles.actionButtonTextContainer}
    >
        <FontAwesome5 name="comment" style={Styles.actionButtonIcon} solid />
    </ActionButton.Item>,
    <ActionButton.Item
      key="join-team" buttonColor="#5587AA" title={localizedStrings.joinTeam}
      onPress={onJoinTeam} textStyle={Styles.actionButtonText} textContainerStyle={Styles.actionButtonTextContainer}
      active={is_team_enabled && !userIsTeamMember && !team_request_pending}
    >
        <FontAwesome5 name="users" style={Styles.actionButtonIcon} />
    </ActionButton.Item>,
];
