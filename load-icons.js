import ION from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import styleVariables from './app/style/project/style_variables';

const replaceSuffixPattern = /--(active|big|small|very-big)/g;
const defaultIconProvider = ION;

const icons = {
    'md-close': [30, colour.navBarIcon],
    'md-search': [30, colour.navBarIcon],
    'md-person': [30, colour.navBarIcon],
    'ios-arrow-back': [30, colour.navBarIcon],
    'home': [30, colour.tabBarIcon, FontAwesome5],
    'lightbulb': [30, colour.tabBarIcon, FontAwesome5],
    'bell': [30, colour.tabBarIcon, FontAwesome5],
    'tasks': [30, colour.tabBarIcon, FontAwesome],
};

global.iconsMap = {};
module.exports = () => new Promise((resolve) => { // cache all icons as images
    // eslint-disable-next-line
    new Promise.all(
        Object.keys(icons).map((iconName) => {
            const Provider = icons[iconName][2] || defaultIconProvider; // Ionicons
            return Provider.getImageSource(
                iconName.replace(replaceSuffixPattern, ''),
                icons[iconName][0],
                icons[iconName][1],
            );
        }),
    ).then((sources) => {
        Object.keys(icons)
            .forEach((iconName, idx) => global.iconsMap[iconName] = sources[idx]);

        // Call resolve (and we are done)
        resolve(true);
    });
});
