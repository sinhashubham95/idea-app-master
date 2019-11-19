import React, { PureComponent } from 'react';

const AnimatedInput = Animated.createAnimatedComponent(ReactNative.TextInput);

const UserMentionTextInput = class extends PureComponent {
    static displayName = 'UserMentionTextInput'

    state = {
        formattedText: '',
    }

    componentWillMount() {
        this.animation = new Animated.Value(0.0001);
    }

    clear = () => {
        this.input._component.clear();
    };

    blur = () => {
        this.input._component.blur();
    };

    focus = () => {
        this.input._component.focus();
    };

    onFocus = () => {
        Animated.timing(this.animation, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true, // <-- Add this
            easing: Animations.standard,
        }).start();
        if (this.props.onFocus) this.props.onFocus();
    };

    onBlur = () => {
        Animated.timing(this.animation, {
            toValue: 0.0001,
            duration: 300,
            useNativeDriver: true, // <-- Add this
            easing: Easing.cubic,
        }).start();
        if (this.props.onBlur) this.props.onBlur();
    };

    onChangeText = (text) => {
        this.updateFormattedText(text);
        if (this.props.onChangeText) this.props.onChangeText(text);
    }

    updateFormattedText = (text) => {
        const retLines = text.split('\n');
        const formattedText = [];
        _.each(retLines, (retLine, index) => {
            const mentions = retLine.match(Utils.mentionRegex);
            if (mentions) {
                const chunks = retLine.split(Utils.mentionSplitRegex);
                _.each(chunks, (chunk) => {
                    if (chunk.match(Utils.mentionRegex)) {
                        const mention = (
                            <Text key={chunk} style={styles.textMention}>
                                {chunk}
                            </Text>
                        );
                        formattedText.push(mention);
                    } else {
                        formattedText.push(chunk);
                    }
                });
            } else {
                formattedText.push(retLine);
            }
            if (index !== retLines.length - 1) formattedText.push('\n');
        });
        this.setState({ formattedText });
    }

    render() {
        const { formattedText } = this.state;
        return (
            <View>
                <AnimatedInput
                  {...this.props}
                  onFocus={this.onFocus}
                  onBlur={this.onBlur}
                  onChangeText={this.onChangeText}
                  style={[Styles.textInput, Styles.textInputAndroid, this.props.suffix ? { textAlign: 'center' } : {}, this.props.style]}
                  testID={this.props.testID}
                  ref={c => this.input = c}
                >
                    {formattedText}
                </AnimatedInput>
            </View>
        );
    }
};

UserMentionTextInput.propTypes = {
    value: OptionalString,
    placeholder: OptionalString,
    editable: OptionalBool,
    multiline: OptionalBool,
    maxLines: OptionalNumber,
    minLines: OptionalNumber,
    mask: OptionalString,
    onChangeText: OptionalFunc,
    height: OptionalNumber,
    style: React.PropTypes.any,
    secureTextInput: OptionalBool,
    disabled: OptionalBool,
    keyboardType: OptionalString,
    onSubmit: OptionalFunc,
    onFocus: OptionalFunc,
    textStyle: oneOfType([OptionalObject, OptionalNumber]),
    testID: OptionalString,
};

const styles = StyleSheet.create({
    textMention: {
        backgroundColor: 'rgba(0, 150, 255, .5)',
        fontFamily: 'ProximaNova-Regular',
        fontSize: styleVariables.fontSizeParagraph,
        letterSpacing: 2,
    },
});


export default UserMentionTextInput;
