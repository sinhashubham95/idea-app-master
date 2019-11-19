// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class Anchor extends PureComponent {
    static displayName = 'Anchor';

    static propTypes = {
        disabled: propTypes.bool,
        onPress: propTypes.func,
    };

    render() {
        const { props } = this;
        return (
            <Text {...props} style={[Styles.anchor, props.disabled ? { color: pallette.wazokuLightGrey } : {}, props.style]} onPress={props.disabled ? undefined : props.onPress}>
                {props.children}
            </Text>
        );
    }
}