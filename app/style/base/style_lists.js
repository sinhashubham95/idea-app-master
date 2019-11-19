module.exports = {

    listContainer: {
        flex: 1,
        backgroundColor: colour.listBackground,
    },

    insetList: {
        padding: styleVariables.paddingBase,
        backgroundColor: '#fff',
    },

    listItem: {
        minHeight: 44,
        alignItems: 'stretch',
        alignSelf: 'stretch',
        borderBottomWidth: 1 / PixelRatio.get(),
        paddingLeft: styleVariables.paddingBase,
        paddingRight: styleVariables.paddingBase,
        borderBottomColor: colour.divider,
        backgroundColor: colour.listBackground,
        paddingTop: styleVariables.paddingBase,
        paddingBottom: styleVariables.paddingBase,
    },

    listItemAlt: {
        borderBottomColor: colour.dividerAlt,
        backgroundColor: colour.listBackgroundAlt,
    },

    listItemDisabled: {
        opacity: 0.5,
    },

    listItemLast: {
        borderBottomWidth: 0,
    },
    liContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    listItemText: {
        color: pallette.text,
    },

    listIcon: {
        fontSize: styleVariables.fontSizeBase,
        marginRight: styleVariables.paddingBase,
    },

    listIconNav: {
        fontSize: styleVariables.fontSizeBase * 1.5,
        marginRight: styleVariables.paddingBase,
        color: pallette.textFaintLight,
    },

    listItemTitle: {
    },

    listHeaderText: {
        color: '#fff',
    },

    indentListItem: {
        paddingLeft: 30,
    },
    ListRowHeaderContainer: {
        paddingBottom: styleVariables.gutterBase,
    },
    ListRowText: {
        color: pallette.primaryDark,
        fontSize: 14,
    },
    ListRowHeaderText: {
        fontSize: 11,
        color: pallette.primaryDarkAlt,
        marginBottom: 0,
    },

    customValueListItemText: {
        color: pallette.text,
        paddingRight: 5,
    },

};