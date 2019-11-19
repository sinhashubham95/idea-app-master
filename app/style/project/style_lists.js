module.exports = {
    ideaListItem: {
        backgroundColor: 'white',
        paddingLeft: styleVariables.paddingBase,
        paddingRight: styleVariables.paddingBase,
        paddingTop: styleVariables.paddingBase * 1,
        paddingBottom: styleVariables.paddingBase * 1,
        borderWidth: 1,
        borderColor: pallette.ideaListBorderColor,
    },
    listIconGrey: {
        color: pallette.greyDark,
        marginRight: styleVariables.paddingBase,
        fontSize: styleVariables.fontSizeParagraph,
    },
    listIconLightGrey: {
        color: pallette.greyMid,
        marginRight: styleVariables.paddingBase,
        fontSize: styleVariables.fontSizeParagraph,
    },
    listIconNavy: {
        color: pallette.wazokuNavy,
        marginRight: styleVariables.paddingBase,
        fontSize: styleVariables.fontSizeParagraph,
    },
    listIconTextMidGrey: {
        color: pallette.greyMid,
        fontFamily: 'ProximaNova-Regular',
        fontSize: styleVariables.fontSizeParagraph,
    },
    listIconTextNavy: {
        color: pallette.wazokuNavy,
        fontFamily: 'ProximaNova-Regular',
        fontSize: styleVariables.fontSizeParagraph,
    },
    notificationListItem: {
        // borderTopColor: pallette.greyLight,
        borderBottomColor: pallette.greyLight,
        borderBottomWidth: 1,
        paddingTop: styleVariables.paddingBase,
        paddingBottom: styleVariables.paddingBase,
        paddingLeft: styleVariables.paddingBase,
    },

    notificationListItemUnread: {
        borderBottomColor: pallette.greyLight,
        borderBottomWidth: 1,
        paddingTop: styleVariables.paddingBase,
        paddingBottom: styleVariables.paddingBase,
        borderLeftColor: pallette.wazokuDanger,
        paddingLeft: 10,
        borderLeftWidth: 3,
    },
    notificationListItemFirst: {
        borderTopColor: pallette.greyLight,
        borderTopWidth: 1,
    },
    notiificationText: {
        color: '#8798AD',
        fontFamily: 'ProximaNova-Regular',
    },
    notiificationTextBody: {
        fontFamily: 'ProximaNova-Regular',
        color: '#2E384D',
    },
    taskListItem: {
        // borderTopColor: pallette.greyLight,
        borderBottomColor: pallette.greyLight,
        borderBottomWidth: 1,
        paddingTop: styleVariables.paddingBase,
        paddingBottom: styleVariables.paddingBase,
        paddingLeft: styleVariables.paddingBase,
    },
    taskListItemFirst: {
        borderTopColor: pallette.greyLight,
        borderTopWidth: 1,
    },
    outcomeRow: {
        paddingVertical: styleVariables.paddingBase,
    },
    customValueRow: {
        paddingVertical: styleVariables.paddingBase,
    },
};