// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class UserSearchListItem extends PureComponent {
    static displayName = 'UserSearchListItem';

    static propTypes = {
        user: propTypes.object,
        onUserSelected: propTypes.func,
    };

    render() {
        const { props: { onUserSelected, user: { thumbnail, display_name } } } = this;
        return (
            <Flex>
                <View style={[Styles.pb5, Styles.pt5]}>
                    <TouchableOpacity onPress={onUserSelected}>
                        <Container>
                            <Row>
                                {thumbnail ? (
                                    <FastImage source={{ uri: thumbnail }} style={Styles.avatarPlaceholder} />
                                ) : (
                                    <View style={Styles.avatarPlaceholder}>
                                        <Text style={Styles.avatarInitial}>{(display_name)[0].toUpperCase()}</Text>
                                    </View>
                                )}

                                <Flex>
                                    <Row style={Styles.pr10}>
                                        <Text>{display_name}</Text>
                                    </Row>
                                </Flex>
                            </Row>
                        </Container>
                    </TouchableOpacity>
                </View>
            </Flex>
        );
    }
}