const Constants = window.Constants = {
    errors: {
        'domain.not_exists': localizedStrings.errorDomainNotFound,
        'not_found': localizedStrings.errorNotFound,
        PASSWORD_MATCH: localizedStrings.errorPasswordMatch,
        'invalid_username_or_password': localizedStrings.errorInvalidUsernameOrPassword,
        NETWORK_REQUEST_FAILED: localizedStrings.errorNetworkRequestFailed,
        DOMAIN_NOT_FOUND: localizedStrings.errorDomainNotFound,
        'email.user_already_exists': localizedStrings.unableToCompleteRegistration,
        'attachment_id.not_exists': localizedStrings.errorAttachmentNotExists,
        FIELD_IS_REQUIRED: localizedStrings.errorFieldRequired,
        'username.not_exists': localizedStrings.errorInvalidUsernameOrPassword,
        EMAIL_IS_INVALID: localizedStrings.errorInvalidEmail,
        'old_password.mismatch': localizedStrings.errorOldPasswordMismatch,
    },
    events: {
        'LOGIN': { 'event': 'User login', 'category': 'User' },
        'REGISTER': { 'event': 'User register', 'category': 'User' },
    },
    pages: {
        NOT_FOUND: 'Not Found',
        HOME_PAGE: 'Home',
    },
    strings: {},
    simulate: {
        SHOW_MARKUP_PAGE: false,
        API_ERROR: false, // Force all network requests to error out
    },
    uploadFileTypes: Platform.OS === 'ios' ? {
        [localizedStrings.media]: ['public.jpeg', 'public.png', 'com.compuserve.gif', 'public.tiff'],
        [localizedStrings.document]: ['com.adobe.pdf', 'com.microsoft.word.doc', 'org.openxmlformats.wordprocessingml.document', 'com.microsoft.excel.xls', 'org.openxmlformats.spreadsheetml.sheet',
            'com.microsoft.powerpoint.​ppt', 'org.openxmlformats.presentationml.presentation'],
    } : {
        [localizedStrings.media]: ['image/jpeg', 'image/gif', 'image/png', 'image/tiff'],
        [localizedStrings.document]: ['application/pdf', 'application/msword', 'org.openxmlformats.wordprocessingml.document',
            'application/vnd.ms-excel', 'org.openxmlformats.spreadsheetml.sheet', 'application/mspowerpoint',
            'org.openxmlformats.presentationml.presentation'],
    },
    include: {
        ideas: 'challenge,creator,attachments,team,data,category,is_following,current_stage,team_request_pending,custom_fields,outcomevalues',
        comments: 'liked_by,creator,attachments',
        challenges: 'categories,stages,current_stage_forms,submit_idea_action',
    },
    securedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    sortBy: [{
        field: 'created',
        label: localizedStrings.dateCreated,
    }, {
        field: 'modified',
        label: localizedStrings.dateModified,
    }, {
        field: 'name',
        label: localizedStrings.name,
    }, {
        field: 'num_visits',
        label: localizedStrings.visitCount,
    }, {
        field: 'popularity',
        label: localizedStrings.popularity,
    }],
    ideaStatus: [
        'Concept',
        'Consultation',
        'InDevelopment',
        'InReview',
        'Approved',
        'Rejected',
        'Completed',
        'Moved',
        'OnHold',
    ],
};

export default Constants;