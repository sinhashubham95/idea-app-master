// propTypes: value: OptionalNumber
import React, { PureComponent } from 'react';

export default class Flex extends PureComponent {
    render() {
        return (
            <View
              {...this.props}
              style={[this.props.style, { flex: this.props.value }, this.props.space && { justifyContent: 'space-between' }]}
              testID={this.props.testID}
            >
                {this.props.children}
            </View>
        );
    }
}

Flex.defaultProps = {
    value: 1,
};

Flex.propTypes = {
    value: OptionalNumber,
    children: OptionalElement,
    style: React.PropTypes.any,
    testID: OptionalString,
};
