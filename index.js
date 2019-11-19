import { Navigation } from 'react-native-navigation';
import crashlytics from 'react-native-fabric-crashlytics';

import './app/localization';
import './app/project/globals';
import './app/routes';
import data from 'stores/base/_data';
import DomainStore from 'stores/domain-store';
import loadIcons from './load-icons';

const getUser = () => new Promise((resolve) => {
    setTimeout(() => {
        AsyncStorage.getItem('user', (err, user) => { // Load the user from async storage
            resolve(user && JSON.parse(user));
        });
    }, Constants.simulate.NEW_USER ? 500 : 0);
});

const getDomainConfig = () => new Promise((resolve) => {
    AsyncStorage.getItem('domain', (err, res) => {
        if (!err && res) {
            DomainStore.model = JSON.parse(res);
        }
        resolve();
    });
});

const getCacheExpiry = () => new Promise((resolve) => {
    AsyncStorage.getItem('cache-expiry', (err, res) => {
        if (!err && res) {
            DomainStore.cacheExpiry = res;
        }
        resolve();
    });
});


const initialiseApp = (user) => {
    global.modalNavButtons = {
        topBar: {
            leftButtons: [],
            rightButtons: [
                {
                    icon: global.iconsMap['md-close'], // for icon button, provide the local image asset name
                    id: 'close', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                    color: 'black',
                },
            ],
        },
    };

    const defaultOptions = {
        topBar: {
            elevation: 0,
        },
        statusBar: {
            style: 'light',
            backgroundColor: 'rgba(46,56,77,1)',
        },
    };
    if (Platform.OS === 'android' && !DeviceInfo.isTablet()) {
        defaultOptions.layout = {
            orientation: ['portrait'],
        };
    }
    const duration = 400;
    // const duration = null;
    const fromFade = 0;
    const toFade = 1;
    const fromX = DeviceWidth;
    const toX = 0;

    if (Platform.OS === 'android') {
        defaultOptions._animations = {
            push: {
                waitForRender: true,
            },
        };
        defaultOptions.animations = {
            push: {
                content: {
                    x: {
                        from: fromX,
                        to: toX,
                        interpolation: 'decelerate',
                    },
                    alpha: {
                        from: fromFade,
                        to: toFade,
                        duration,
                        interpolation: 'decelerate',
                    },
                },
            },
            pop: {
                topBar: {
                    alpha: {
                        from: toFade,
                        to: fromFade,
                    },
                },
                content: {
                    x: {
                        from: toX,
                        to: fromX * 2.5,
                        duration,
                        interpolation: 'accelerateDecelerate',
                    },
                    alpha: {
                        from: toFade,
                        to: fromFade,
                        duration,
                        interpolation: 'accelerateDecelerate',
                    },
                },
            },
        };
    }
    Navigation.setDefaultOptions(defaultOptions);

    if (Constants.simulate.SHOW_MARKUP_PAGE) {
        Navigation.setRoot({
            root: {
                ...routes.withStack(routes.markupScreen()),
            },
        });
        return;
    }

    SecuredStorage.get()
        .then((storage) => {
            if (!storage) {
                if (user) {
                    // User is logged in with legacy storage, log user out and show alert
                    global.showSecurityAlert = true;
                    routes.logout();
                    return;
                }
                Navigation.setRoot({
                    root: {
                        ...routes.withStack(routes.homeScreen()),
                    },
                });
                return;
            }

            if (!storage.user || !storage.user.is_active) {
                routes.logout();
                return;
            }

            if ((!storage['offline-actions'] || !storage['offline-actions'].length) && Utils.checkCacheExpiry()) return;

            if (DomainStore.getAPIEndpoint()) Project.api = `${DomainStore.getAPIEndpoint()}/api/v${Project.apiVersion}/`;
            setLanguage(AccountStore.getLanguageCode());
            data.setToken(storage.user.token);
            AppActions.setUser(storage.user);
            AppActions.data(storage);
            routes.goToDashboard();
            AppActions.refreshUser();
            AppActions.refreshDomain();
            AppActions.processOfflineActions();
        })
        .catch((e) => {
            console.log('Failed to get secured storage', e);
            routes.logout();
        });
};

let appLaunched = false;
Navigation.events().registerAppLaunchedListener(() => {
    if (appLaunched && Platform.OS === 'ios') return;
    appLaunched = true;
    Promise.all([
        getUser(),
        loadIcons(),
        getDomainConfig(),
        getCacheExpiry(),
    ])
        .then(([user]) => {
            initialiseApp(user);
        });
});

// eslint-disable-next-line
console.disableYellowBox = true;
crashlytics.init();
