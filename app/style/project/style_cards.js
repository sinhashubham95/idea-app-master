module.exports = {
    challengeCard: {
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#4C4C4C',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: pallette.greyLight,
        flex: 1,
    },
    challengeCardBody: {
        padding: styleVariables.paddingBase,
        flex: 1,
    },
    challengeCardImage: {
        width: 70,
        height: 70,
        borderRadius: 4,
        marginRight: styleVariables.paddingBase,
    },
    challengeCardTitle: {
        fontFamily: 'ProximaNova-Bold',
        fontSize: styleVariables.fontSizeParagraph,
        color: pallette.wazokuNavy,
    },
    challengeCardMetaText: {
        color: '#BCBCBC',
        fontFamily: 'ProximaNova-Regular',
        fontSize: styleVariables.fontSizeParagraph,
    },
    cardParagraph: {
        paddingTop: styleVariables.paddingBase,
        fontFamily: 'ProximaNova-Regular',
        color: pallette.greyDarkest,
        lineHeight: 15,
    },
    cardParagraphNoPad: {
        paddingTop: 0,
        fontFamily: 'ProximaNova-Regular',
        color: pallette.greyDarkest,
    },
    cardAnchorText: {
        backgroundColor: 'transparent',
        fontSize: 15,
    },
    challengeCardFooter: {
        backgroundColor: '#F7F7F7',
        paddingLeft: styleVariables.paddingBase,
        paddingRight: styleVariables.paddingBase,
        paddingTop: styleVariables.paddingBase * 1.5,
        paddingBottom: styleVariables.paddingBase * 1.5,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },

    cardfooterItem: {
        color: pallette.greyDark,
        fontFamily: 'ProximaNova-Regular',
        letterSpacing: 1.1,
        fontSize: 11,
        paddingLeft: I18nManager.isRTL ? 5 : 0,
    },
    ideaCard: {
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#4C4C4C',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: pallette.greyLight,
        flex: 1,
    },
    ideaCardBody: {
        padding: styleVariables.paddingBase,
        flex: 1,
    },
    ideaCardImage: {
        width: 70,
        height: 70,
        borderRadius: 4,
        marginRight: styleVariables.paddingBase,
    },
    ideaCardTitle: {
        fontFamily: 'ProximaNova-Bold',
        fontSize: styleVariables.fontSizeParagraph,
        color: pallette.wazokuNavy,
    },
    ideaCardFooter: {
        backgroundColor: '#F7F7F7',
        paddingLeft: styleVariables.paddingBase,
        paddingRight: styleVariables.paddingBase,
        paddingTop: styleVariables.paddingBase * 1.5,
        paddingBottom: styleVariables.paddingBase * 1.5,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },

    ideaCardTabletPortrait: {
        backgroundColor: 'red',
    },

    ideaCardTabletLandscape: {
        backgroundColor: 'blue',
    },

    ideaCardStarIcon: {
        fontSize: 15,
        color: pallette.wazokuNavy,
    },
    ideaCardThumbsIcon: {
        fontSize: 15,
        color: pallette.wazokuNavy,
        marginRight: 10,
    },
    ideaCardCommentIcon: {
        fontSize: 15,
        color: pallette.greyDark,
        marginRight: 10,
    },
    ideaCardThumbsNumber: {
        marginRight: 10,
    },
    ideaCardCommentNumber: {

    },
    ideaCardMetaText: {
        fontFamily: 'ProximaNova-Regular',
        textAlign: 'left',
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        color: '#BCBCBC',
        fontSize: 12,
    },
    ideaCardIDMetaText: {
        color: '#8798AD',
        fontFamily: 'ProximaNova-Regular',
        fontSize: styleVariables.fontSizeParagraph,
    },
};