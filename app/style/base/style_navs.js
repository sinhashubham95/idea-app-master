// https://github.com/wix/react-native-navigation/wiki/Styling-the-navigator
global.navbarStyle = {
    topBar: {
        elevation: 0,
        noBorder: false,
        background: {
            translucent: false,
            color: 'rgba(46,56,77,1)',
        },
        title: {
            color: pallette.navBarText,
        },
        subtitle: {
            fontSize: 10,
            color: pallette.navBarSubtitle,
        },
        backButton: {
            title: 'Back',
            color: pallette.navBarIcon,
        },
    },
};

global.navbarModalStyle = {
    topBar: {
        elevation: 0,
        noBorder: true,
        background: {
            translucent: false,
            color: 'white',
        },
        title: {
            color: pallette.navBarText,
        },
        subtitle: {
            fontSize: 10,
            color: pallette.navBarSubtitle,
        },
        backButton: {
            title: 'Back',
            color: pallette.navBarIcon,
        },
    },
};

global.navbarWithTabsStyle = {
    statusBar: {
        style: 'dark',
    },
    topBar: {
        elevation: 0,
        noBorder: true,
        drawBehind: true,
        visible: false,
        background: {
            translucent: true,
            color: 'transparent',
        },
        title: {
            color: pallette.navBarText,
        },
        subtitle: {
            fontSize: 10,
            color: pallette.navBarSubtitle,
        },
        backButton: {
            title: 'Back',
            color: pallette.navBarIcon,
        },
    },
};

global.backHidden = {
    topBar: {
        backButton: {
            visible: false,
        },
    },
};

global.navbarHidden = {
    statusBar: {
        style: 'dark',
        backgroundColor: 'white',
    },
    topBar: {
        visible: false,
        elevation: 0,
        drawBehind: true,
    },
    bottomTabs: {
        drawBehind: true,
        visible: false,
    },
    backButton: {
        title: '',
        color: pallette.navBarIcon,
    },
};

global.tabsHidden = {
    bottomTabs: {
        drawBehind: true,
        visible: false,
    },
    backButton: {
        // title: 'Back',
        color: pallette.navBarIcon,
    },
};

module.exports = {

    navIcon: {
        fontSize: 28,
        color: 'white',
        marginTop: 10,
    },

    barText: {
        color: 'black',
    },

};
