// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class ListItemAttachment extends PureComponent {
    static displayName = 'ListItemAttachment';

    static propTypes = {
        attachment: propTypes.object,
        onOpenAttachment: propTypes.func,
    };

    render() {
        const { props: { attachment: { filename, url }, onOpenAttachment } } = this;
        return (
            <FormGroup>
                <TouchableOpacity onPress={() => onOpenAttachment(url, filename)}>
                    <Row>
                        <FontAwesome5 style={Styles.listIconLightGrey} name="paperclip" />
                        <Flex><Text style={Styles.listIconTextMidGrey} numberOfLines={1}>{filename}</Text></Flex>
                    </Row>
                </TouchableOpacity>
            </FormGroup>
        );
    }
}