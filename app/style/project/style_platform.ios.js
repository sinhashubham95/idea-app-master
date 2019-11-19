// Here you can override any style and it'll only be overridden in ios - e.g. h1: { ... }
module.exports = {
    userMentionsOuter: {
        position: 'absolute',
        left: 10,
    },

    userMentionsContainer: {
        width: DeviceWidth - 20,
        borderRadius: 5,
        backgroundColor: 'white',
        shadowColor: '#333',
        shadowOffset: {
            width: 3,
            height: 3,
        },
        shadowRadius: 5,
        shadowOpacity: 0.4,
    },
};
