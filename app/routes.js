import { Navigation } from 'react-native-navigation';
import DomainStore from 'stores/domain-store';

const routes = {

    // The initial screen
    homeScreen: () => ({
        component: {
            name: '/',
            options: global.navbarHidden,
        },
    }),

    loginScreen: () => ({
        component: {
            name: '/login',
            options: global.navbarHidden,
        },
    }),

    registerScreen: () => ({
        component: {
            name: '/register',
            options: global.navbarHidden,
        },
    }),

    goToDashboard: () => {
        Navigation.setRoot({
            root: {
                bottomTabs: {
                    id: 'BottomTabsId',
                    children: [
                        routes.withStack(routes.dashboardScreen(), {
                            bottomTab: {
                                icon: global.iconsMap.home,
                                iconColor: colour.tabBarIcon,
                                selectedIconColor: colour.tabBarIconSelected,
                            },
                        }),
                        routes.withStack(routes.searchScreen(), {
                            bottomTab: {
                                icon: global.iconsMap.lightbulb,
                                iconColor: colour.tabBarIcon,
                                selectedIconColor: colour.tabBarIconSelected,
                            },
                        }, 'searchTab'),
                        routes.withStack(routes.notificationsScreen(), {
                            bottomTab: {
                                icon: global.iconsMap.bell,
                                iconColor: colour.tabBarIcon,
                                selectedIconColor: colour.tabBarIconSelected,
                            },
                        }),
                        routes.withStack(routes.tasksScreen(), {
                            bottomTab: {
                                icon: global.iconsMap.tasks,
                                iconColor: colour.tabBarIcon,
                                selectedIconColor: colour.tabBarIconSelected,
                                badgeColor: pallette.wazokuDanger,
                            },
                        }),
                    ],
                    options: {
                        bottomTabs: {
                            titleDisplayMode: 'alwaysHide',
                        },
                    },
                },
            },
        });
        global.selectedTabIndex = 0;
        global.selectedTabComponentId = 'dashboardTab';
    },

    dashboardScreen: () => ({
        component: {
            id: 'dashboardTab',
            name: '/dashboard',
            options: _.merge({}, global.navbarStyle, {
                topBar: {
                    background: {
                        color: DomainStore.getBrandingConfig().header_background || 'rgba(46,56,77,1)',
                    },
                    leftButtons: [],
                    rightButtons: [
                        {
                            component: {
                                name: 'nav-profile-button',
                                passProps: {
                                    ...AccountStore.getUser(),
                                    onPress: () => Navigation.push('dashboardTab', routes.myProfileScreen()),
                                },
                            },
                            id: 'my-profile', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                        {
                            icon: global.iconsMap['md-search'], // for icon button, provide the local image asset name
                            id: 'search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                    ],
                },
            }),
        },
    }),

    myProfileScreen: () => ({
        component: {
            name: '/my-profile',
            options: _.merge({}, global.navbarStyle, {
                topBar: {
                    background: {
                        color: DomainStore.getBrandingConfig().header_background || 'rgba(46,56,77,1)',
                    },
                    rightButtons: [
                        {
                            component: {
                                name: 'nav-profile-button',
                                passProps: {
                                    ...AccountStore.getUser(),
                                },
                            },
                            id: 'my-profile', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                        {
                            icon: global.iconsMap['md-search'], // for icon button, provide the local image asset name
                            id: 'search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                    ],
                    backButton: {
                        icon: global.iconsMap['ios-arrow-back'],
                        color: 'white',
                    },
                },
            }),
        },
    }),

    goToSearchTab: (props) => {
        Navigation.setStackRoot('searchTab', routes.searchScreen(props));
        Navigation.mergeOptions('BottomTabsId', {
            bottomTabs: {
                currentTabIndex: 1,
            },
        });
        global.selectedTabComponentId = 'searchTab';
    },

    searchScreen: props => ({
        component: {
            name: '/search',
            passProps: props || {},
            options: _.merge({}, global.navbarStyle, {
                topBar: {
                    background: {
                        color: DomainStore.getBrandingConfig().header_background || 'rgba(46,56,77,1)',
                    },
                    leftButtons: [],
                    rightButtons: [
                        {
                            component: {
                                name: 'nav-profile-button',
                                passProps: {
                                    ...AccountStore.getUser(),
                                    onPress: () => Navigation.push('searchTab', routes.myProfileScreen()),
                                },
                            },
                            id: 'my-profile', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                    ],
                },
            }),
        },
    }),

    notificationsScreen: () => ({
        component: {
            id: 'notificationsTab',
            name: '/notifications',
            options: _.merge({}, global.navbarStyle, {
                topBar: {
                    background: {
                        color: DomainStore.getBrandingConfig().header_background || 'rgba(46,56,77,1)',
                    },
                    leftButtons: [],
                    rightButtons: [
                        {
                            component: {
                                name: 'nav-profile-button',
                                passProps: {
                                    ...AccountStore.getUser(),
                                    onPress: () => Navigation.push('notificationsTab', routes.myProfileScreen()),
                                },
                            },
                            id: 'my-profile', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                        {
                            icon: global.iconsMap['md-search'], // for icon button, provide the local image asset name
                            id: 'search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                    ],
                },
            }),
        },
    }),

    tasksScreen: () => ({
        component: {
            id: 'tasksTab',
            name: '/tasks',
            options: _.merge({}, global.navbarStyle, {
                topBar: {
                    background: {
                        color: DomainStore.getBrandingConfig().header_background || 'rgba(46,56,77,1)',
                    },
                    leftButtons: [],
                    rightButtons: [
                        {
                            component: {
                                name: 'nav-profile-button',
                                passProps: {
                                    ...AccountStore.getUser(),
                                    onPress: () => Navigation.push('tasksTab', routes.myProfileScreen()),
                                },
                            },
                            id: 'my-profile', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                        {
                            icon: global.iconsMap['md-search'], // for icon button, provide the local image asset name
                            id: 'search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                    ],
                },
            }),
        },
    }),

    ideaDetailsScreen: (ideaId, myIdea, offlineIdea) => ({
        component: {
            name: '/idea-details',
            passProps: { ideaId, myIdea, offlineIdea },
            options: _.merge({}, global.navbarStyle, {
                topBar: {
                    background: {
                        color: DomainStore.getBrandingConfig().header_background || 'rgba(46,56,77,1)',
                    },
                    rightButtons: [
                        {
                            component: {
                                name: 'nav-profile-button',
                                passProps: {
                                    ...AccountStore.getUser(),
                                    onPress: () => Navigation.push(global.selectedTabComponentId, routes.myProfileScreen()),
                                },
                            },
                            id: 'my-profile', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                        {
                            icon: global.iconsMap['md-search'], // for icon button, provide the local image asset name
                            id: 'search', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                            color: colour.navBarIcon,
                        },
                    ],
                    backButton: {
                        icon: global.iconsMap['ios-arrow-back'],
                        color: 'white',
                    },
                },
            }),
        },
    }),

    ideaCommentsModal: (ideaId, ideaName, scrollToCommentId) => routes.withStack({
        component: {
            name: '/idea-comments',
            passProps: { ideaId, ideaName, scrollToCommentId },
            options: _.merge({}, global.navbarModalStyle, global.modalNavButtons, {
                topBar: { title: { text: localizedStrings.comments } },
            }),
        },
    }),

    addIdeaModal: challenge => routes.withStack({
        component: {
            name: '/add-idea',
            passProps: { challenge, challengeId: challenge && challenge.id },
            options: _.merge({}, global.navbarModalStyle, global.modalNavButtons),
        },
    }),

    editIdeaModal: (challengeId, idea, showToast) => routes.withStack({
        component: {
            name: '/add-idea',
            passProps: { challengeId, idea, edit: true, showToast },
            options: _.merge({}, global.navbarModalStyle, global.modalNavButtons),
        },
    }),

    // Standardised routing for logging out
    logout() {
        AppActions.logout();
        Navigation.setRoot({
            root: {
                ...routes.withStack(routes.homeScreen()),
            },
        });
    },

    webModal: (uri, title) => routes.withStack({
        component: {
            name: '/webmodal',
            passProps: { uri },
            options: _.merge({}, global.navbarModalStyle, global.modalNavButtons, {
                topBar: { title: { text: title || '' } },
            }),
        },
    }),

    ssoLoginModal: (uri, onError) => routes.withStack({
        component: {
            name: '/sso-login',
            passProps: { uri, onError },
            options: _.merge({}, global.navbarModalStyle, global.modalNavButtons),
        },
    }),

    filterByChallengeModal: (challenge, onDone) => routes.withStack({
        component: {
            name: '/search-challenge',
            passProps: { challenge, onDone, filter: true },
            options: _.merge({}, global.navbarModalStyle, global.modalNavButtons, {
                topBar: { title: { text: localizedStrings.selectChallenge } },
            }),
        },
    }),

    searchChallengeModal: (challenge, onDone) => routes.withStack({
        component: {
            name: '/search-challenge',
            passProps: { challenge, onDone },
            options: _.merge({}, global.navbarModalStyle, global.modalNavButtons, {
                topBar: { title: { text: localizedStrings.selectChallenge } },
            }),
        },
    }),

    changePasswordModal: () => routes.withStack({
        component: {
            name: '/change-password-modal',
            passProps: {},
            options: _.merge({}, global.navbarModalStyle, global.modalNavButtons, {
                topBar: { title: { text: localizedStrings.changePassword } },
            }),
        },
    }),

    shareModal: (type, id) => routes.withStack({
        component: {
            name: '/share-modal',
            passProps: { type, id },
            options: _.merge({}, global.navbarModalStyle, global.modalNavButtons, {
                topBar: { title: { text: `${localizedStrings.share} ${localizedStrings[type.substr(0, type.length - 1)]}` } },
            }),
        },
    }),

    addCustomValueModal: (fieldId, selected, challengeId, onDone) => routes.withStack({
        component: {
            name: '/add-custom-value',
            passProps: { fieldId, selected, challengeId, onDone },
            options: _.merge({}, global.navbarModalStyle, {
                topBar: { title: { text: localizedStrings.selectValues } },
            }),
        },
    }),

    navEvents: {
        WILL_SHOW: 'willAppear',
        SHOW: 'didAppear',
        HIDE: 'didDisappear',
    },

    // Shorthand for wrapping a screen in a stack
    withStack: (screen, options, id) => ({
        stack: {
            id,
            children: [screen],
            options,
        },
    }),

    // Shorthand for wrapping a screen in a stack
    tab: (title, image) => ({
        text: title,
        icon: image,
        iconColor: styleVariables.tabIcon,
        textColor: styleVariables.tabText,
        selectedIconColor: styleVariables.tabIconActive,
        selectedTextColor: styleVariables.tabTextActive,
        disableIconTint: true,
    }),

    selectModal: (title, { items, renderRow, onChange, multiple, filterItem, autoclose, value, isSelected, required, keyExtractor }) => routes.withStack({
        component: { name: '/select',
            passProps: { items, renderRow, onChange, multiple, filterItem, autoclose, value, isSelected, required, keyExtractor },
            options: _.merge({}, global.navbarStyle, global.modalNavButtons, {
                topBar: {
                    drawBehind: false,
                    background: {
                        color: pallette.bodyBackground,
                        translucent: false,
                    },
                },
            }),
        },
    }),

    // A styleguide screen used to show off all components
    markupScreen: () => ({
        component: {
            name: '/markup',
            options: { ...global.navbarStyle },
        },
    }),

    forgotPasswordLightbox: () => ({
        component: {
            name: '/forgot-password',
            options: {
                overlay: {
                    interceptTouchOutside: true,
                },
            },
        },
    }),

    contactSelectModal: (title, onChange) => ({
        component: {
            name: '/contact-select',
            passProps: { onChange },
            options: _.merge({}, global.navbarStyle, global.modalNavButtons, {
                topBar: {
                    title: {
                        text: title || '',
                    },
                },
            }),
        },
    }),

    handlePushNotification: ({ type, html: text }) => {
        const parsed = Utils.parseNotification(type, text);
        if (!parsed) return;
        switch (type) {
            case 'AddTeamMember':
            case 'IdeaVoted':
            case 'IdeaInResponseToChallenge':
            case 'IdeaMovedReviewReviewer':
            case 'IdeaMoveOn':
            case 'OutcomeReviewYesFollower':
            case 'IdeaMovedReviewCreator': {
                routes.goToIdeaFromPushNotification(parsed.ideaId);
                return;
            }
            case 'CommentsNew':
            case 'CommentsLiked':
            case 'CommentsMentioned': {
                const { ideaId, ideaName, commentId } = parsed;
                Navigation.showModal(routes.ideaCommentsModal(ideaId, ideaName, commentId));
                return;
            }
            case 'NewShare': {
                if (parsed.entityType !== 'idea') return;
                routes.goToIdeaFromPushNotification(parsed.entityId);
            }
            default:
        }
    },

    goToIdeaFromPushNotification: (id) => {
        Navigation.dismissAllModals()
            .then(() => Utils.goToIdea(global.selectedTabComponentId, NetworkStore.isOffline(), id))
            .catch(() => Utils.goToIdea(global.selectedTabComponentId, NetworkStore.isOffline(), id));
    },
};

// BASE Routes
Navigation.registerComponent('/', () => require('./screens/DomainScreen').default);
Navigation.registerComponent('/login', () => require('./screens/LoginScreen').default);
Navigation.registerComponent('/register', () => require('./screens/RegisterScreen').default);
Navigation.registerComponent('/dashboard', () => require('./screens/DashboardScreen').default);
Navigation.registerComponent('/my-profile', () => require('./screens/MyProfileScreen').default);
Navigation.registerComponent('/search', () => require('./screens/SearchScreen').default);
Navigation.registerComponent('/idea-details', () => require('./screens/IdeaDetailsScreen').default);
Navigation.registerComponent('/notifications', () => require('./screens/NotificationsScreen').default);
Navigation.registerComponent('/tasks', () => require('./screens/TasksScreen').default);
Navigation.registerComponent('/markup', () => require('./screens/__MarkupScreen__'));

// Components
Navigation.registerComponent('dashboard-action-button', () => require('./components/DashboardActionButton').default);
Navigation.registerComponent('idea-details-action-button', () => require('./components/IdeaDetailsActionButton').default);
Navigation.registerComponent('nav-profile-button', () => require('./components/ProfileButton').default);
Navigation.registerComponent('loading-overlay', () => require('./components/LoadingOverlay').default);
Navigation.registerComponent('user-search', () => require('./components/UserSearch').default);

// Modals
Navigation.registerComponent('/idea-comments', () => require('./screens/modals/IdeaCommentsModal').default);
Navigation.registerComponent('/add-idea', () => require('./screens/modals/AddIdeaModal').default);
Navigation.registerComponent('/sso-login', () => require('./screens/modals/SSOLoginModal').default);
Navigation.registerComponent('/search-challenge', () => require('./screens/modals/SearchChallengeModal').default);
Navigation.registerComponent('/select', () => require('./components/base/SelectModal'));
Navigation.registerComponent('/webmodal', () => require('./components/base/NativeWebModal'));
Navigation.registerComponent('/contact-select', () => require('./components/base/ContactSelectModal'));
Navigation.registerComponent('/change-password-modal', () => require('./screens/modals/ChangePasswordModal'));
Navigation.registerComponent('/share-modal', () => require('./screens/modals/ShareModal'));
Navigation.registerComponent('/add-custom-value', () => require('./screens/modals/AddCustomValueModal').default);

// Lightboxes
Navigation.registerComponent('/forgot-password', () => require('./screens/lightboxes/ForgotPassword'));


// Navigation button listener
Navigation.events().registerNavigationButtonPressedListener(({ buttonId, componentId }) => {
    switch (buttonId) {
        case 'close':
            Navigation.dismissModal(componentId);
            break;
        case 'my-profile':
            Navigation.push(componentId, routes.myProfileScreen());
            break;
        case 'search':
            routes.goToSearchTab({ reset: true });
            break;
        default:
            break;
    }
});

// Bottom tab selected listener
Navigation.events().registerBottomTabSelectedListener(({ selectedTabIndex, unselectedTabIndex }) => {
    if (selectedTabIndex === unselectedTabIndex && Platform.OS === 'android') { // Effectively a reselection event
        switch (unselectedTabIndex) {
            case 0: // Dashboard
                Navigation.popToRoot('dashboardTab').catch(() => {});
                break;
            case 1: // Search
                Navigation.popToRoot('searchTab').catch(() => {});
                break;
            case 2: // Notifications
                Navigation.popToRoot('notificationsTab').catch(() => {});
                break;
            case 3: // Tasks
                Navigation.popToRoot('tasksTab').catch(() => {});
                break;
            default:
        }
    }
    if (selectedTabIndex !== unselectedTabIndex) {
        switch (unselectedTabIndex) {
            case 0: // Dashboard
                Navigation.popToRoot('dashboardTab').catch(() => {});
                break;
            case 1: // Search
                Navigation.popToRoot('searchTab').catch(() => {});
                break;
            case 2: // Notifications
                Navigation.popToRoot('notificationsTab').catch(() => {});
                AppActions.resetUpdateCount();
                break;
            case 3: // Tasks
                Navigation.popToRoot('tasksTab').catch(() => {});
                break;
            default:
        }
        switch (selectedTabIndex) {
            case 0: // Dashboard
                global.selectedTabComponentId = 'dashboardTab';
                break;
            case 1: // Search
                global.selectedTabComponentId = 'searchTab';
                break;
            case 2: // Notifications
                global.selectedTabComponentId = 'notificationsTab';
                if (NotificationsStore.getUnreadCount() > 0) {
                    AppActions.markNotificationsAsRead();
                }
                break;
            case 3: // Tasks
                global.selectedTabComponentId = 'tasksTab';
                break;
            default:
        }
    }
    global.selectedTabIndex = selectedTabIndex;
});

// Component did appear global listener
let dashboardActionButtonVisible = false;
Navigation.events().registerComponentDidAppearListener(({ componentId, componentName, passProps }) => {
    if (!AccountStore.getUser()) {
        if (dashboardActionButtonVisible) {
            Navigation.dismissOverlay('dashboard-action-button').then(() => dashboardActionButtonVisible = false);
        }
        return;
    }
    let promise = Promise.resolve();
    if (!global.bottomTabsHeight) {
        promise = Navigation.constants().then((constants) => {
            global.bottomTabsHeight = constants.bottomTabsHeight;
        });
    }
    switch (componentName) {
        case '/dashboard':
        case '/search':
        case '/notifications':
        case '/tasks':
        case '/my-profile':
            if (dashboardActionButtonVisible) return;
            promise.then(() => {
                Navigation.showOverlay({
                    component: {
                        id: 'dashboard-action-button',
                        name: 'dashboard-action-button',
                        options: {
                            overlay: {
                                interceptTouchOutside: false,
                            },
                        },
                        passProps: {
                            onAddIdea: challenge => Navigation.showModal(routes.addIdeaModal(challenge)),
                        },
                    },
                });
            }).then(() => {
                dashboardActionButtonVisible = true;
            });
            break;
        // Ignore overlays and custom nav components
        case 'dashboard-action-button':
        case 'nav-profile-button':
        case 'idea-details-action-button':
        case 'loading-overlay':
        case 'user-search':
            break;
        default:
            if (dashboardActionButtonVisible) {
                Navigation.dismissOverlay('dashboard-action-button').then(() => dashboardActionButtonVisible = false);
            }
            break;
    }
});

global.routes = routes;
module.exports = routes;
