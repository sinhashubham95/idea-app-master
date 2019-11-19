// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Anchor from './Anchor';

export default class IdeaListItem extends PureComponent {
    static displayName = 'IdeaListItem';

    static propTypes = {
        idea: propTypes.shape({
            serial_number: propTypes.string,
            name: propTypes.string,
        }),
        onView: propTypes.func,
    };

    render() {
        const { props: { idea: { serial_number, name }, onView } } = this;
        return (
            <Container>
                <TouchableOpacity onPress={onView} style={[Styles.mt5, Styles.ideaListItem]}>
                    <Row>
                        <Flex value={3}>
                            <Text style={[Styles.paragraph, Styles.mb0]}>ID:</Text>
                            <Text style={[Styles.paragraphLight]}>{serial_number}</Text>
                        </Flex>
                        <Flex value={7}>
                            <Text style={[Styles.paragraph, Styles.mb0]}>{name}</Text>
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
                </TouchableOpacity>
            </Container>
        );
    }
}