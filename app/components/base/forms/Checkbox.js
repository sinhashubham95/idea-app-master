import React, { PureComponent } from 'react';
import propTypes from 'prop-types';

module.exports = class extends PureComponent {
    static displayName = 'Checkbox';

    static propTypes = {
        value: propTypes.bool,
        toggle: propTypes.func,
        disabled: propTypes.bool,
        style: propTypes.object,
    };

    render() {
        const { value, toggle, disabled, style } = this.props;
        const content = (
            <View>
                <FontAwesome5 name={`${value ? 'check-' : ''}square`} size={22} color={value ? pallette.wazokuBlue : pallette.wazokuLightGrey} />
            </View>
        );
        return toggle ? (
            <TouchableOpacity onPress={toggle} disabled={disabled} style={style || {}}>
                {content}
            </TouchableOpacity>
        ) : (
            <View style={style || {}}>
                {content}
            </View>
        );
    }
};
