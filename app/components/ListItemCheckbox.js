import propTypes from 'prop-types';
import React, { PureComponent } from 'react';

export default class ListItemCheckbox extends PureComponent {
    static displayName = 'ListItemCheckbox';

    static propTypes = {
        isSelected: propTypes.bool,
        item: propTypes.string.isRequired,
        toggleItem: propTypes.func.isRequired,
        disabled: propTypes.bool,
    };

    render() {
        const { props: { item, isSelected, toggleItem, disabled } } = this;
        return (
            <ListItem style={[this.props.isSelected]} onPress={toggleItem} disabled={disabled}>
                <Row style={Styles.pb5}>
                    <Checkbox value={isSelected} style={Styles.mr5} />
                    <Flex>
                        <Text style={[Styles.paragraphLight, this.props.isSelected && Styles.paragraphLight, Styles.mb0]}>{item}</Text>
                    </Flex>
                </Row>
            </ListItem>
        );
    }
}

const styles = StyleSheet.create({

});
