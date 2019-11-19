module.exports = {
    //
    // Forms
    // --------------------------------------------------

    // Input

    formGroup: {
        paddingTop: styleVariables.paddingBase,
        paddingBottom: styleVariables.paddingBase,
    },

    input: {
        fontSize: styleVariables.fontSizeBase,
        flex: 1,
    },

    inputContainer: {
        justifyContent: 'center',
    },

    inputLarge: {
        fontSize: styleVariables.fontSizeInputLarge,
    },

    disabled: {
        opacity: styleVariables.disabledOpacity,
    },

    disabledText: {
        color: colour.disabledText,
    },

    // Checkboxes and radios

    radioText: {
        color: colour.radioText,
    },

    radioTextActive: {
        color: colour.radioTextActive,
    },

    radio: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
        borderWidth: 1 / PixelRatio.get(),
    },

    textInput: {
        height: styleVariables.inputHeight,
        fontSize: styleVariables.inputFontSizeBase,
        backgroundColor: colour.inputBackground,
        paddingLeft: styleVariables.gutterBase,
        borderColor: pallette.textLight,
        borderWidth: styleVariables.inputBorderWidth,
        borderRadius: 5,
    },

    inputLabel: {
        color: colour.label,
        fontSize: 16,
        textTransform: 'uppercase',
    },

    inputLabelFlat: {
        color: pallette.primary,
        fontSize: 12,
    },

    label: {
        color: styleVariables.text,
        marginBottom: styleVariables.gutterBase / 2,
    },

    inputAppendContainer: {
        position: 'relative',
    },

    inputAppend: {
        position: 'absolute',
        zIndex: 1,
        left: 0,
        top: 0,
        backgroundColor: 'transparent',
        height: 54,
        width: 54,
        alignItems: 'center',
        justifyContent: 'center',
    },

    inputIndent: {
        paddingLeft: 40,
    },

};
