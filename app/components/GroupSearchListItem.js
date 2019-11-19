// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class GroupSearchListItem extends PureComponent {
    static displayName = 'GroupSearchListItem';

    static propTypes = {
        group: propTypes.object,
        onGroupSelected: propTypes.func,
    };

    render() {
        const { props: { onGroupSelected, group: { name } } } = this;
        return (
            <Flex>
                <View style={[Styles.pb5, Styles.pt5]}>
                    <TouchableOpacity onPress={onGroupSelected}>
                        <Container>
                            <Row>
                                <View style={Styles.mr10}>
                                    <FontAwesome5 name="users" size={35} color={pallette.greyDark} />
                                </View>

                                <Flex>
                                    <Row style={Styles.pr10}>
                                        <Text>{name}</Text>
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