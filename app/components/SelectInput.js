import propTypes from 'prop-types';
import React, { PureComponent } from 'react';
// import UpDown from './svg/UpDown';

export default class SelectInput extends PureComponent {
    static displayName = 'SelectInput';

    static propTypes = {
        value: propTypes.string,
        placeholder: propTypes.string,
        style: propTypes.any,
        noTitleOnOptions: propTypes.bool,
    };

    onPress = () => {
        if (this.props.onPress) {
            this.props.onPress();
        } else {
            API.showOptions(!this.props.noTitleOnOptions ? this.props.placeholder : undefined, _.map(this.props.options, this.props.labelKey))
                .then((res) => {
                    this.props.onChange(this.props.options[res]);
                });
        }
    }

    render() {
        const {
            props: {
                isTablet,
            },
        } = this;

        return (
            <View>
                {this.props.title && (
                    <FormGroup>
                        <Text style={Styles.inputLabel}>{this.props.title}</Text>
                    </FormGroup>
                )}
                <TouchableOpacity
                  {...this.props}
                  activeOpacity={0.75}
                  onPress={this.onPress}
                  style={[Styles.selectInput, this.props.style]}
                  value={this.props.value}
                >

                    <Column style={{ flex: 1 }}>
                        <Row style={{ flex: 1 }} space>
                            <Flex value={11}>
                                <Text style={this.props.value ? Styles.selectInputText : Styles.selectInputPlaceholder}>
                                    {this.props.value ? this.props.labelKey ? this.props.value[this.props.labelKey] : this.props.value : this.props.placeholder}
                                </Text>
                            </Flex>
                            <Flex value={1}>
                                <FontAwesome5 name="caret-down" color={pallette.wazokuNavy} />
                            </Flex>
                        </Row>
                    </Column>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    FlatSelectInputLabel: {
        color: 'red',
        fontSize: 12,
    },

});

export const FlatSelectInput = props => <SelectInput {...props} style={[Styles.flatSelectInput, props.style]}/>;
