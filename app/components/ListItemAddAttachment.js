// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class ListItemAddAttachment extends PureComponent {
    static displayName = 'ListItemAddAttachment';

    static propTypes = {
        onPress: propTypes.func,
        text: propTypes.string,
        disabled: propTypes.bool,
        style: propTypes.object,
    };

    render() {
        const { props: { onPress, text, disabled, style } } = this;
        const content = (
            <Row style={style || {}}>
                <FontAwesome5 style={Styles.listIconNavy} name="plus-circle" />
                <Text style={Styles.listIconTextNavy}>{text || localizedStrings.addAttachment}</Text>
            </Row>
        );
        return !disabled ? (
            <TouchableOpacity onPress={onPress}>
                {content}
            </TouchableOpacity>
        ) : (
            <View>
                {content}
            </View>
        );
    }
}