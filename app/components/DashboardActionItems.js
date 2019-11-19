export default ({ challenges, onAddIdea }) => _.map(_.take(_.sortBy(challenges, challenge => (challenge.viewed ? -challenge.viewed : null)), 3).concat([{ id: 'add-idea' }]), (challenge) => {
    if (challenge.id !== 'add-idea') {
        return (
            <ActionButton.Item
              key={challenge.id} buttonColor="#9b59b6" title={challenge.name}
              onPress={() => onAddIdea(challenge)} textStyle={Styles.actionButtonText} textContainerStyle={Styles.actionButtonTextContainer}
              numberOfLines={1}
            >
                <FontAwesome5 name="pencil-alt" style={Styles.actionButtonIcon} />
            </ActionButton.Item>
        );
    }
    return (
        <ActionButton.Item
          key={challenge.id} buttonColor="#1abc9c" title={localizedStrings.addIdea}
          onPress={onAddIdea} textStyle={Styles.actionButtonText} textContainerStyle={Styles.actionButtonTextContainer}
        >
            <FontAwesome5 name="pencil-alt" style={Styles.actionButtonIcon} />
        </ActionButton.Item>
    );
});
