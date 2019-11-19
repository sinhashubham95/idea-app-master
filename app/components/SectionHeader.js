// import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class SectionHeader extends PureComponent {
  static displayName = 'SectionHeader';

  static propTypes = {
    onPress: propTypes.func,
    text: propTypes.string,
    disabled: propTypes.bool,
    style: propTypes.object,
  };

  render() {
    const { props: { onPress, text, disabled, style, open } } = this;
    const content = (
      <Row style={style || {}}>
        {!open && (<FontAwesome5 style={Styles.listIconNavy} name="plus-circle" />)}
        {open && (<FontAwesome5 style={Styles.listIconNavy} name="minus-circle" />)}
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
