module.exports = {
    //
    // Overlays
    // --------------------------------------------------

    lightboxOuter: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
        paddingTop: 40,
        height: DeviceHeight - 40,
    },

    lightbox: {
        width: DeviceWidth - 40,
        borderRadius: 5,
        backgroundColor: 'white',
    },

    userSearch: {
        position: 'absolute',
        backgroundColor: 'white',
        maxHeight: 200,
        width: '100%',
        zIndex: 999,
        shadowColor: '#333',
        shadowOffset: {
            width: 3,
            height: 3,
        },
        shadowRadius: 5,
        shadowOpacity: 0.4,
        elevation: 2,
        paddingHorizontal: 10,
        paddingTop: 10,
    },
};