import { NativeModules, PixelRatio } from 'react-native';

import { Platform, Dimensions } from 'react-native';

const em = require('../base/style_pxToEm');


const tabHeight = (() => {
    const isIphoneX = () => {
        let dimensions;
        if (Platform.OS !== 'ios') {
            return false;
        }
        if (Platform.isPad || Platform.isTVOS) {
            return false;
        }
        dimensions = Dimensions.get('window');
        if (dimensions.height === 812 || dimensions.width === 812) { // Checks for iPhone X in portrait or landscape
            return true;
        }
        if (dimensions.height === 896 || dimensions.width === 896) {
            return true;
        }
        return false;
    };

    if (isIphoneX()) {
        return 84; // iPhone X
    } if (Platform.OS == 'ios') {
        return 50; // Other iPhones
    }
    return 56; // Android
})();

window.pallette = Object.assign({}, window.pallette, {
    buttonPrimary: 'rgba(46,56,77,1)',
    buttonSecondary: 'rgba(163,216,105,1)',
    error: '#D63649',
    errorTranslucent: 'rgba(221,75,57,0.7)',
    backgroundAlt: 'rgba(245,245,245,1)',

    // brand colours
    wazokuNavy: '#003F5D',
    wazokuBlue: '#60ADDF',
    wazokuLightGrey: '#B0BAC9',
    wazokuDanger: 'rgba(214,54,73,0.9)',

    textDark: '#2E384D',
    greyLight: '#BFC5D2',
    greyMid: '#9F9F9F',
    greyDark: '#6F6F6F',
    greyDarkest: '#3A3A3A',
    backgroundGrey: '#F5F5F5',
    inputBorderLight: '#E0E7FF',
    inputBackground: 'rgba(224, 231, 255, 0.20)',
    ideaListBorderColor: 'rgba(46,91,255,0.1)',
    statusIndicatorColourApproved: '#33AC2E',
    statusIndicatorColourCompleted: '#BCCF00',
    statusIndicatorColourConcept: '#60ADDF',
    statusIndicatorColourConsultation: '#4343FF',
    statusIndicatorColourInDevelopment: '#8798AD',
    statusIndicatorColourInReview: '#003F5D',
    statusIndicatorMoved: '#EEF3F5',
    statusIndicatorColourOnHold: '#F7C137',
    statusIndicatorColourRejected: '#D63649',
});

window.colour = Object.assign({}, window.colour, {
    danger: '#c84d38',
});

window.styleVariables = Object.assign({}, window.styleVariables, {

}, require('./style_platform_variables'));
