module.exports = {
    inputLabel: {
        color: pallette.wazokuLightGrey,
        fontSize: styleVariables.fontSizeLabel,
        fontFamily: 'ProximaNova-Regular',
        letterSpacing: 1.1,
        textAlign: 'left',
    },
    textInput: {
        borderColor: pallette.inputBorderLight,
        backgroundColor: pallette.inputBackground,
        fontSize: styleVariables.fontSizeParagraph,
        fontFamily: 'ProximaNova-Regular',
        letterSpacing: 2,
        textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    textInputSuffix: {
        fontSize: styleVariables.fontSizeParagraph,
        fontFamily: 'ProximaNova-Regular',
        letterSpacing: 2,
        marginLeft: 5,
    },
    errorWrapper: {
        backgroundColor: pallette.wazokuDanger,
        padding: styleVariables.paddingBase,
        borderRadius: styleVariables.borderRadiusDefault,
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
    },
    commentInputContainer: {
        borderTopWidth: 1,
        borderTopColor: pallette.ideaListBorderColor,
        backgroundColor: 'white',
    },
    commentSendButton: {
        position: 'absolute',
        right: 10,
    },
    commentAttachmentIcon: {
        color: pallette.listIconTextMidGrey,
    },
    commentLikeButton: {
        marginLeft: 10,
    },
    errorHeader: {
        backgroundColor: pallette.error,
        flex: 1,
        height: 50,
        justifyContent: 'center',
    },
    errorHeaderText: {
        color: 'white',
        fontFamily: 'ProximaNova-Bold',
        textAlign: 'center',
    },

    selectInput: {
        height: styleVariables.inputHeight,
        backgroundColor: 'white',
        borderColor: pallette.inputBorderLight,
        fontFamily: 'ProximaNova-Regular',
        letterSpacing: 2,
        borderRadius: styleVariables.borderRadiusDefault,
        borderWidth: 1,
        paddingLeft: styleVariables.gutterBase * 1,
        paddingRight: styleVariables.gutterBase * 1,
    },

    selectInputText: {
        color: pallette.textDark,
        fontSize: styleVariables.fontSizeParagraph,
        fontFamily: 'ProximaNova-Regular',
        letterSpacing: 1.1,
    },

    selectInputPlaceholder: {
        color: pallette.wazokuLightGrey,
        fontSize: styleVariables.fontSizeParagraph,
        fontFamily: 'ProximaNova-Regular',
        letterSpacing: 1.1,
    },

    searchInputIcon: {
        position: 'absolute',
        top: 40,
        left: 10,
        color: pallette.greyMid,
    },

    searchInputText: {
        paddingLeft: 40,
    },

    searchInputLoader: {
        position: 'absolute',
        top: 40,
        right: 0,
    },

    fieldError: {
        color: pallette.error,
        marginTop: 5,
    },
    lightboxContainer: {
        paddingLeft: 20,
        paddingTop: 40,
        paddingRight: 20,
        paddingBottom: 20,
    },
    tagContainer: {
        height: 40,
        marginRight: 5,
        backgroundColor: '#F9FBFD',
        borderRadius: 50,
    },
    tagText: {
        fontSize: styleVariables.fontSizeParagraph,
        fontFamily: 'ProximaNova-Regular',
        letterSpacing: 1.2,
        color: '#333333',
    },
    tabBarText: {
        fontFamily: 'ProximaNova-Bold',
        textTransform: 'uppercase',
    },
};