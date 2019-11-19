import React, { PureComponent } from 'react';

import Anchor from './Anchor';

export default class TaskListItem extends PureComponent {
    static displayName = 'TaskListItem';

    static propTypes = {
        task: propTypes.object.isRequired,
        group: propTypes.string.isRequired,
        goToIdea: propTypes.func,
        first: propTypes.bool,
    };

    renderIdeaTask = () => {
        const { props: { first, task: { created_by, entity: idea }, goToIdea } } = this;
        return (
            <Flex>
                <TouchableOpacity onPress={() => goToIdea(idea.id)}>
                    <Row style={[Styles.taskListItem, first ? Styles.taskListItemFirst : {}]}>
                        <View>
                            {created_by.thumbnail ? (
                                <FastImage source={{ uri: created_by.thumbnail }} style={Styles.avatarPlaceholder} />
                            ) : (
                                <View style={Styles.avatarPlaceholder}>
                                    <Text style={Styles.avatarInitial}>{created_by.display_name ? created_by.display_name[0].toUpperCase() : ''}</Text>
                                </View>
                            )}
                        </View>

                        <Flex>
                            <Row style={Styles.pr10}>
                                <Flex value={3}>
                                    <Text style={[Styles.paragraph, Styles.mb0]}>ID:</Text>
                                    <Text style={[Styles.paragraphLight]}>{idea.serial_number}</Text>
                                </Flex>
                                <Flex value={7}>
                                    <Text style={[Styles.paragraph, Styles.mb0]}>{idea.name}</Text>
                                </Flex>
                                <Flex value={2}>
                                    <Anchor style={{ alignSelf: 'flex-end' }}>
                                        <FontAwesome5
                                          name="chevron-right"
                                          color={pallette.wazokuBlue}
                                        />
                                    </Anchor>
                                </Flex>
                            </Row>
                        </Flex>
                    </Row>
                </TouchableOpacity>
            </Flex>
        );
    }

    render() {
        const { props: { group } } = this;
        switch (group) {
            case 'ideas_for_review':
            case 'ideas_still_in_development':
                return this.renderIdeaTask();
            default:
                return null;
        }
    }
}