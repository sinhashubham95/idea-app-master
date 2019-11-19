// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class SearchFilterButton extends PureComponent {
    static displayName = 'SearchFilterButton';

    static propTypes = {
        name: propTypes.string,
        onPress: propTypes.func,
        active: propTypes.node,
        disabled: propTypes.bool,
    };

    static defaultProps = {
        disabled: false,
    }

    render() {
        const { props: { name, onPress, active, disabled } } = this;
        return (
            <TouchableOpacity style={[Styles.filterButton, active ? Styles.filterButtonActive : {}]} onPress={onPress} disabled={disabled}>
                <Row style={{ flexWrap: 'nowrap' }}>
                    {active || <Text style={[Styles.filterButtonText, active ? Styles.filterButtonActiveText : {}]}>{name || ''}</Text>}
                    <FontAwesome5 style={[Styles.filterButtonIcon, active ? Styles.filterButtonActiveText : {}]} color={pallette.greyDark} name="caret-down" />
                </Row>
            </TouchableOpacity>
        );
    }
}