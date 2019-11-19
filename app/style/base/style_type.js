require('./style_pxToEm');

module.exports = {


    //
    // Typography
    // --------------------------------------------------

    paragraph: {
        fontSize: styleVariables.fontSizeParagraph,
    },

    h1: {
        fontSize: styleVariables.fontSizeH1,
    },

    h2: {
        fontSize: styleVariables.fontSizeH2,
        marginBottom: styleVariables.paddingBase / 2,
    },

    h3: {
        fontSize: styleVariables.fontSizeH3,
        marginBottom: styleVariables.paddingBase / 2,
    },
    h4: {
        fontSize: styleVariables.fontSizeH4,
        marginBottom: styleVariables.paddingBase / 2,
    },

    text: {
        color: pallette.text,
        fontSize: em(2),
    },


    textLight: {
        color: colour.textLight,
    },

    textLightest: {
        color: colour.textLightest,
    },

    textCenter: {
        textAlign: 'center',
    },

    textBottom: {
        textAlignVertical: 'bottom',
    },

    icon: {
        fontSize: em(2),
    },

    p: {
        marginBottom: styleVariables.marginBaseVertical,
    },

    bold: {
        fontWeight: 'bold',
    },
    text: {
        backgroundColor: 'transparent',
        color: pallette.primaryLightest,
        fontSize: styleVariables.fontSizeBase,
        textAlign: 'left',
    },

    onboardingH1: {
        fontSize: 24,
        color: pallette.primaryDarkAlt,
        fontFamily: styleVariables.paragraphText,
    },

    paragraph: {
        marginBottom: styleVariables.marginBaseVertical,
        fontFamily: styleVariables.paragraphText,
        lineHeight: 28,
        fontSize: 18,
        color: pallette.primaryDark,
        // letterSpacing: 0.9
    },
    paragraphMutedItallic: {
        fontSize: 18,
        textAlign: 'center',
        color: pallette.primaryDarkAlt,
    },
    legalText: {
        lineHeight: 22,
        fontSize: 16,
        color: 'black',
    },
    legalTextSmall: {
        lineHeight: 22,
        fontSize: 14,
        color: pallette.primaryDark,
    },

    paragraphMuted: {
        marginBottom: styleVariables.marginBaseVertical,
        fontFamily: styleVariables.paragraphText,
        lineHeight: 25,
        fontSize: 16,
        opacity: 0.6,
        color: pallette.primaryDark,
    },
    paragraphMutedSmall: {
        marginBottom: styleVariables.marginBaseVertical,
        fontFamily: styleVariables.paragraphText,
        lineHeight: 25,
        fontSize: 14,
        opacity: 0.6,
        color: pallette.primaryDark,
    },

    textSmall: {
        fontSize: styleVariables.fontSizeSmall,
    },

    textFaint: {
        color: pallette.textFaint,
    },

    errorText: {
        color: pallette.error,
    },

    fontSizeHeading: {
        fontSize: styleVariables.fontSizeHeading,
        fontWeight: 'bold',
    },

    fontSizeSubHeading: {
        fontSize: styleVariables.fontSizesubheading,
        fontWeight: 'bold',
    },

    fontSizeSmall: {
        fontSize: styleVariables.fontSizeSmall,
    },

    sup: {
        fontSize: em(0.65),
    },

    anchor: {
        color: pallette.primaryDark,
        fontFamily: styleVariables.headerText,
        textDecorationLine: 'underline',
        letterSpacing: em(0.06),
        fontSize: em(0.86),
    },

};
