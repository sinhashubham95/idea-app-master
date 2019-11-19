import BottomSheet from 'react-native-bottomsheet';
import firebase from 'react-native-firebase';

import branch from 'react-native-branch';
import push from './push-notifications-api';
import auth from './auth';

const analytics = firebase.analytics();


global.API = {

    ajaxHandler(store, res) {
        switch (res.status) {
            case 404:
                // ErrorModal(null, 'API Not found: ');
                break;
            case 503:
                // ErrorModal(null, error);
                break;
            default:
            // ErrorModal(null, error);
        }

        if (!res.clone) {
            store.error = res.error || res.message || localizedStrings.unexpectedError;
            return store.goneABitWest();
        }

        res.clone().json().then((error) => {
            if (store) {
                // eslint-disable-next-line
                // @TODO error_code === 'external' might always give error.message
                switch (error.error_code) {
                    case 'invalid_form_data':
                        store.formDataError = JSON.stringify(error.errors);
                        break;
                    default:
                        store.error = Utils.parseErrorFromAPI(error);
                        break;
                }
                store.goneABitWest();
            }
        }).catch(() => {
            res.text().then((error) => {
                if (store) {
                    // eslint-disable-next-line
                    console.log(error ? error : 'Unknown error ' + error);
                    // eslint-disable-next-line
                    store.error = error || localizedStrings.unexpectedError;
                    store.goneABitWest();
                }
            })
                .catch((err) => {
                    if (store) {
                        // eslint-disable-next-line
                        console.log('Unknown error', err);
                        const error = localizedStrings.unexpectedError;
                        // eslint-disable-next-line
                        store.error = error;
                        store.goneABitWest();
                    }
                });
        });
    },

    log(...args) {
        console.log(...args);
    },

    trackEvent(data) {
        if (analytics) {
            const { event, ...rest } = data;
            if (!data) {
                console.error('Passed null event data');
            }
            console.info('track', data);
            if (!data || !data.category || !data.event) {
                console.error('Invalid event provided', data);
            }

            analytics.logEvent(event.toLowerCase().replace(/ /g, '_'), rest);
        }
    },
    trackPage(name) {
        if (analytics) {
            analytics.setCurrentScreen(name, name);
        }
    },
    share: (uri, message, title, subject, excludedActivityTypes, type) => {
        ReactNative.Share.share({ message, title, url: uri }, { subject, excludedActivityTypes });
    },
    showOptions: (title, options, cancelButton = true, dark = false, destructiveOption) => new Promise((resolve) => {
        if (cancelButton) options.push(localizedStrings.cancel);
        BottomSheet.showBottomSheetWithOptions({
            options,
            title,
            dark,
            destructiveButtonIndex: destructiveOption && cancelButton ? options.length - 2 : options.length - 1,
            cancelButtonIndex: cancelButton && options.length - 1,
        }, (value) => {
            if (cancelButton && value === options.length - 1) return resolve(null);
            resolve(value);
        });
    }),
    getContacts: (includePhotos) => {
        if (typeof Contacts === 'undefined') {
            return Promise.reject(new Error('You need to link react-native-contacts to use this function'));
        }
        return Promise.resolve([]);
        // includePhotos
        //     ? new Promise(resolve => Contacts.getAll((error, contacts) => resolve({
        //         error,
        //         contacts: contacts && contacts.map(parseContact),
        //     })))
        //     : new Promise(resolve => Contacts.getAllWithoutPhotos((error, contacts) => resolve({
        //         error,
        //         contacts: contacts && contacts.map(parseContact),
        //     })));
    },

    generateLink: (title, customMetadata, $fallback_url) => branch.createBranchUniversalObject('share', {
        title,
        customMetadata,
    }).then((branchUniversalObject) => {
        const controlParams = {};
        return branchUniversalObject.generateShortUrl({}, controlParams)
            .then(({ url }) => url);
    }),
    getInitialLink: (cb) => {
        initialLinkCb = cb;
        return initialLink ? cb(link) : null;
    },
    push,
    auth,
};


const linkCb = null;
var initialLinkCb = null;
var link = null;
const checkedInitialLink = null;
var initialLink = null;


// branch.subscribe(({ error, params }) => {
//     if (error) {
//         console.log(`Error from Branch: ${error}`);
//         return;
//     }

//     if (params['+clicked_branch_link']) {
//         link = params;

//         if (!checkedInitialLink) {
//             initialLink = params;
//             if (initialLinkCb) initialLinkCb(params);
//         }

//         if (linkCb) {
//             linkCb(params);
//         }
//     }
//     checkedInitialLink = true;
// });
