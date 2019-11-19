import LocalizedStrings from 'react-native-localization';
import { I18nManager } from 'react-native';
import translations from './translations';

global.I18nManager = I18nManager;

const rtlDetect = require('rtl-detect');

global.localizedStrings = new LocalizedStrings(translations);

global.setLanguage = (code) => {
    localizedStrings.setLanguage(code);
    const isRtlLang = rtlDetect.isRtlLang(code);
    if (__DEV__) {
        // Note the app bundle needs to be reloaded in order for RTL to take effect.
        // On a real device, if the device is configured with an RTL language then it'll already be in RTL mode
        I18nManager.forceRTL(isRtlLang);
    }
    Navigation.setDefaultOptions({
        layout: {
            direction: isRtlLang ? 'rtl' : 'ltr',
        },
    });
};
