import data from 'stores/base/_data';
import FileViewer from 'react-native-file-viewer';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import { RNPhotoEditor } from 'react-native-photo-editor';
import rnTextSize from 'react-native-text-size';

const Url = require('url-parse');
const uuid = require('react-native-uuid');
const DomParser = require('react-native-html-parser').DOMParser;

rnTextSize.measure({
    text: 'This is a line',
    fontFamily: 'ProximaNova-Regular',
}).then((size) => {
    global.proximaNovaRegularLineHeight = Math.ceil(size.height);
});

const annotateImage = (res, resolve, reject) => {
    if (res.error) return reject(res.error);
    if (res.didCancel) return reject(new Error('User cancelled'));
    RNPhotoEditor.Edit({
        path: Platform.OS === 'android' ? res.path : res.uri,
        hiddenControls: ['sticker', 'save'],
        onDone: () => {
            resolve(res);
        },
        onCancel: () => {
            resolve(res);
        },
    });
};

module.exports = window.Utils = Object.assign({}, require('./base/_utils'), {
    openAttachment: (url, filename) => {
        if (url.indexOf('file://') === 0 || url.indexOf('content://') === 0) {
            return FileViewer.open(Platform.OS === 'ios' ? url.substr(7) : url);
        }
        // Get the filename extension
        const ext = filename.substr(filename.lastIndexOf('.') + 1);
        // Determine whether we need to grab a temporary link
        let promise;
        if (Constants.securedFileTypes.indexOf(ext) !== -1) {
            const parsedUrl = new Url(url);
            const parts = parsedUrl.pathname.split('/');
            promise = data.get(`${Project.api}files?url=/${parts[2]}/${parts[3]}`)
                .then(({ data: res }) => {
                    url = res.url;
                });
        } else {
            url = Utils.getSafeImageUrl(url);
            promise = Promise.resolve();
        }
        return promise
            .then(() => Linking.canOpenURL(url))
            .then(() => Linking.openURL(url));
    },
    parseErrorFromAPI: (error) => {
        if (Constants.errors[error.error_code]) {
            return Constants.errors[error.error_code];
        }
        if (error.errors) {
            return _.map(error.errors, subError => Constants.errors[subError] || (error.details && error.details[subError]) || subError).join(' ');
        }
        if (error.message) {
            return error.message;
        }
        return localizedStrings.unexpectedError;
    },
    handleErrorFromAPI: (e, defaultMsg) => new Promise((resolve) => {
        if (e instanceof Error) {
            return resolve(e.message || defaultMsg);
        }
        try {
            if (e.json) {
                e.json().then((error) => {
                    resolve(Utils.parseErrorFromAPI(error));
                })
                    .catch(() => resolve(defaultMsg));
            } else {
                resolve(defaultMsg);
            }
        } catch (err) {
            resolve(defaultMsg);
        }
    }),
    padCards: (numColumns, cards) => {
        if (cards.length % numColumns !== 0) {
            return cards.concat(_.map(new Array(numColumns - (cards.length % numColumns)), () => ({ pad: true })));
        }
        return cards;
    },
    getCardMargins: (index, numColumns) => {
        switch (numColumns) {
            case 1: return { marginLeft: 10, marginRight: 10 };
            case 2:
            case 3:
                if (index % numColumns === 0) return { marginLeft: 10, marginRight: 5 };
                if (index % numColumns === numColumns - 1) return { marginLeft: 5, marginRight: 10 };
                return { marginLeft: 5, marginRight: 5 };
            default:
                return {};
        }
    },
    generateOfflineId: () => `temp-${uuid.v1()}`,
    isOfflineId: id => id.indexOf('temp-') === 0,
    uploadAttachments: attachments => Promise.all(_.map(attachments, (attachment) => {
        const body = new FormData();
        body.append('file', {
            uri: attachment.uri,
            name: attachment.name,
            type: attachment.type,
        });
        // @TODO do something about failure
        return fetch(`${Project.api}files/upload`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'AUTHORIZATION': `UserToken ${data.token}`,
                'Content-Type': 'multipart/form-data',
            },
            body,
        })
            .then((uploadRes) => {
                if (uploadRes.status >= 200 && uploadRes.status < 300) {
                    return uploadRes.json();
                }
                switch (uploadRes.status) {
                    case 413:
                        return Promise.reject(new Error(localizedStrings.attachmentsTooLarge));
                    default:
                        return Promise.reject(new Error(localizedStrings.unexpectedError));
                }
            })
            .then((res) => {
                if (attachment.isBannerImage) res.isBannerImage = true;
                if (attachment.isCoverImage) res.isCoverImage = true;
                return res;
            });
    })),
    promiseSerial: tasks => tasks.reduce((promiseChain, currentTask) => promiseChain.then(chainResults => new Promise((resolve) => {
        currentTask().then(currentResult => resolve([...chainResults, currentResult])).catch(err => resolve([...chainResults, err]));
    })), Promise.resolve([])),
    orderIdeas: (ideas, order) => {
        if (!order) {
            return _.sortBy(ideas, idea => -idea.created);
        }
        const asc = order.charAt(0) !== '-';
        const field = order.substr(asc ? 0 : 1);
        switch (field) {
            case 'created':
            case 'modified':
            case 'num_visits':
                return _.sortBy(ideas, idea => idea[field] * (asc ? 1 : -1));
            case 'name': {
                let res = _.sortBy(ideas, 'name');
                if (!asc) res = _.reverse(res);
                return res;
            }
            case 'popularity':
                return _.sortBy(ideas, idea => idea.score * (asc ? 1 : -1));
            default:
                return null;
        }
    },
    mentionRegex: /[@][\w -]+[:]/g,
    mentionSplitRegex: /([@][\w -]+[:])/g,
    existingMentionRegex: /@<a href="(.+)">(.+)<\/a>/g,
    goToIdea: (componentId, isOffline, ideaId) => {
        // Check for its presence within all idea stores
        if (IdeasStore.getIdea(ideaId)) {
            Navigation.push(componentId, routes.ideaDetailsScreen(ideaId));
            return;
        }
        if (MyIdeasStore.getIdea(ideaId)) {
            Navigation.push(componentId, routes.ideaDetailsScreen(ideaId, true));
            return;
        }
        if (OfflineIdeasStore.getIdea(ideaId)) {
            Navigation.push(componentId, routes.ideaDetailsScreen(ideaId, false, true));
            return;
        }
        // Not present in any idea store, if we are offline do nothing
        if (isOffline) return;

        // We are online, specifically get this idea
        data.get(`${Project.api}ideas/${ideaId}?include=${Constants.include.ideas}`)
            .then(({ data: res }) => {
                if (res.creator.id === AccountStore.getUser().id) {
                    MyIdeasStore.pushIdea(res);
                }
                OfflineIdeasStore.pushIdea(res);
                Navigation.push(componentId, routes.ideaDetailsScreen(ideaId, false, true));
            })
            .catch((e) => {
                // Do nothing
            });
    },
    attach: (type) => {
        if (type === localizedStrings.photo) {
            return new Promise((resolve, reject) => {
                if (Platform.OS === 'ios') {
                    ImagePicker.launchCamera({
                        mediaType: 'photo',
                    }, (res) => {
                        if (res.error) return reject(new Error(res.error));
                        res.name = res.uri.substr(res.uri.lastIndexOf('/') + 1);
                        annotateImage(res, resolve, reject);
                    });
                } else {
                    ImageCropPicker.openCamera({ cropping: true })
                        .then((res) => {
                            res.uri = res.path;
                            res.type = res.mime;
                            res.path = res.path.indexOf('file://') === 0 ? res.path.substr(7) : res.path;
                            res.name = res.path.substr(res.path.lastIndexOf('/') + 1);
                            annotateImage(res, resolve, reject);
                        })
                        .catch((err) => {
                            if (err.message === 'User cancelled image selection') return reject(new Error('User cancelled'));
                            reject(err);
                        });
                }
            });
        }
        if (type === localizedStrings.media) {
            return new Promise((resolve, reject) => {
                if (Platform.OS === 'ios') {
                    ImagePicker.launchImageLibrary({}, (res) => {
                        if (res.error) return reject(new Error(res.error));
                        annotateImage(res, resolve, reject);
                    });
                } else {
                    ImageCropPicker.openPicker({ cropping: true })
                        .then((res) => {
                            res.uri = res.path;
                            res.type = res.mime;
                            res.path = res.path.indexOf('file://') === 0 ? res.path.substr(7) : res.path;
                            res.name = res.path.substr(res.path.lastIndexOf('/') + 1);
                            annotateImage(res, resolve, reject);
                        })
                        .catch((err) => {
                            if (err.message === 'User cancelled image selection') return reject(new Error('User cancelled'));
                            reject(err);
                        });
                }
            });
        }
        return DocumentPicker.pick({
            type: Constants.uploadFileTypes[type],
        });
    },
    findIdea: (id) => {
        // Check for its presence within all idea stores
        let idea = IdeasStore.getIdea(id);
        if (idea) return idea;

        idea = MyIdeasStore.getIdea(id);
        if (idea) return idea;

        idea = OfflineIdeasStore.getIdea(id);
        return idea;
    },
    getSafeImageUrl: (url) => {
        if (url[0] === '/') {
            return `${DomainStore.getBaseImageUrl()}${url}`;
        }
        return url;
    },
    checkCacheExpiry: () => {
        if (DomainStore.cacheExpiry && moment(DomainStore.cacheExpiry).isBefore(moment()) && !NetworkStore.isOffline()) {
            routes.logout();
            return true;
        }
        return false;
    },
    parseNotification: (type, text, is_read) => {
        const html = new DomParser().parseFromString(text, 'text/html');
        let thumbnail;
        const imgNodes = html.querySelect('img');
        if (imgNodes.length) {
            thumbnail = imgNodes[0].getAttribute('src');
        }
        const links = html.getElementsByTagName('a');
        const div = html.getElementsByTagName('div');
        const paragraph = html.getElementsByTagName('p');
        try {
            switch (type) {
                case 'CommentsNew':
                case 'CommentsLiked':
                case 'CommentsMentioned': {
                    if ((type !== 'CommentsMentioned' && links.length < 3) || (type === 'CommentsMentioned' && links.length < 4)) {
                        console.log(`Expected at least 3 anchor links for ${type} notification. Got ${links.length}`, text, links);
                        return false;
                    }
                    const userId = links[0].getAttribute('href').split('/')[2];
                    const displayName = links[0].textContent;
                    const commentId = links[1].getAttribute('href').split('=')[1].substr(8);
                    const ideaId = links[2].getAttribute('href').split('/')[3];
                    const ideaName = links[2].textContent.slice(1, links[2].textContent.length - 1);
                    const message = div[0].childNodes[2].textContent.substr(1) + div[0].childNodes[3].textContent + div[0].childNodes[4].textContent;
                    return { text, type, is_read, thumbnail, userId, displayName, ideaId, ideaName, commentId, message };
                }
                case 'IdeaVoted': {
                    if (links.length !== 2) {
                        console.log(`Expected 2 anchor links for IdeaVoted notification. Got ${links.length}`, text);
                        return false;
                    }
                    const userId = links[0].getAttribute('href').split('/')[2];
                    const displayName = links[0].textContent;
                    const ideaId = links[1].getAttribute('href').split('/')[3];
                    const ideaName = links[1].textContent.slice(1, links[1].textContent.length - 1);
                    const message = div[0].childNodes[2].textContent.substr(1);
                    return { text, type, is_read, thumbnail, userId, displayName, ideaId, ideaName, message };
                }
                case 'IdeaInResponseToChallenge': {
                    if (links.length !== 3) {
                        console.log(`Expected 3 anchor links for IdeaInResponseToChallenge notification. Got ${links.length}`, text);
                        return false;
                    }
                    const userId = links[0].getAttribute('href').split('/')[2];
                    const displayName = links[0].textContent;
                    const challengeId = links[1].getAttribute('href').split('/')[3];
                    const challengeName = links[1].textContent;
                    const ideaId = links[2].getAttribute('href').split('/')[3];
                    const ideaName = links[2].textContent.slice(1, links[2].textContent.length - 1);
                    const message = _.trimStart(div[0].childNodes[2].textContent);
                    return { text, type, is_read, thumbnail, userId, displayName, challengeId, challengeName, ideaId, ideaName, message };
                }
                case 'IdeaMovedReviewReviewer': {
                    if (links.length !== 1) {
                        console.log(`Expected 1 anchor links for IdeaMovedReviewReviewer notification. Got ${links.length}`, text);
                        return false;
                    }
                    const href = links[0].getAttribute('href');
                    const challengeId = href.substr(href.lastIndexOf('/') + 1);
                    const challengeName = links[0].textContent.slice(1, links[0].textContent.length - 1);
                    const message = _.trim(paragraph[0].firstChild.textContent);
                    return { text, type, is_read, challengeId, challengeName, message };
                }
                case 'NewShare': {
                    if (links.length !== 2) {
                        console.log(`Expected 2 anchor links for NewShare notification. Got ${links.length}`, text);
                        return false;
                    }
                    const userId = links[0].getAttribute('href').split('/')[2];
                    const displayName = links[0].textContent;
                    const parts = links[1].getAttribute('href').split('/');
                    const entityType = parts[2];
                    const entityId = parts[3];
                    const entityName = links[1].textContent;
                    const messageShared = _.trimStart(div[0].childNodes[2].textContent);
                    let message;
                    let messageWithYou;
                    if (!div[0].childNodes[5]) {
                        message = _.trimEnd(div[0].childNodes[4].textContent);
                    } else {
                        messageWithYou = _.trimEnd(div[0].childNodes[4].textContent);
                        message = _.trimEnd(div[0].childNodes[5].textContent);
                    }
                    return { text, type, is_read, userId, displayName, entityId, entityName, entityType, messageShared, messageWithYou, message };
                }
                case 'AddTeamMember': {
                    if (links.length !== 1) {
                        console.log(`Expected 1 anchor links for AddTeamMember notification. Got ${links.length}`, text);
                        return false;
                    }
                    const ideaId = links[0].getAttribute('href').split('/')[3];
                    const ideaName = links[0].textContent.slice(1, links[0].textContent.length - 1);
                    const message = _.trimStart(div[0].firstChild.textContent);
                    return { text, type, is_read, ideaId, ideaName, message };
                }
                case 'TeamMemberRequest':
                case 'TeamMemberRequestAccepted': {
                    if (links.length !== 1) {
                        console.log(`Expected 1 anchor link for ${type} notification. Got ${links.length}`, text);
                        return false;
                    }
                    const ideaId = links[0].getAttribute('href').split('/')[5];
                    const ideaName = links[0].textContent;
                    const messageStart = div[0].childNodes[0].textContent.substr(3);
                    const messageEnd = _.trimEnd(div[0].childNodes[2].textContent);
                    return { text, type, is_read, ideaId, ideaName, messageStart, messageEnd };
                }
                case 'IdeaMoveOn': {
                    if (links.length !== 1) {
                        console.log(`Expected 1 anchor link for IdeaMoveOn notification. Got ${links.length}`, text);
                        return false;
                    }
                    const ideaId = links[0].getAttribute('href').split('/')[3];
                    const ideaName = links[0].textContent.slice(1, links[0].textContent.length - 1);
                    const messageStart = _.trimStart(text.substr(0, text.indexOf('<')));
                    const messageEnd = _.trimEnd(html.childNodes[1].textContent);
                    return { text, type, is_read, ideaId, ideaName, messageStart, messageEnd };
                }
                case 'OutcomeReviewYesFollower': {
                    if (links.length !== 1) {
                        console.log(`Expected 1 anchor link for OutcomeReviewYesFollower notification. Got ${links.length}`, text);
                        return false;
                    }
                    const ideaId = links[0].getAttribute('href').split('/')[3];
                    const ideaName = links[0].textContent.slice(1, links[0].textContent.length - 1);
                    const messageEnd = _.trimEnd(html.childNodes[1].textContent);
                    return { text, type, is_read, ideaId, ideaName, messageEnd };
                }
                case 'NewBadge': {
                    return { text, type, is_read, message: _.trim(text) };
                }
                case 'IdeaMovedReviewCreator': {
                    if (links.length !== 2) {
                        console.log(`Expected 2 anchor links for IdeaMovedReviewCreator notification. Got ${links.length}`, text);
                        return false;
                    }
                    const challengeId = links[1].getAttribute('href').split('/')[3];
                    const challengeName = links[1].textContent;
                    const ideaId = links[0].getAttribute('href').split('/')[3];
                    const ideaName = links[0].textContent.slice(1, links[0].textContent.length - 1);
                    const messageStart = _.trimStart(text.substr(0, text.indexOf('<')));
                    const message = html.childNodes[1].textContent;
                    return { text, type, is_read, challengeId, challengeName, ideaId, ideaName, messageStart, message };
                }
                default:
                    console.warn('UNKNOWN NOTIFICATION TYPE', type, text);
                    return false;
            }
        } catch (e) {
            console.warn(`Failed to parse ${type} notification`, e, text);
            return false;
        }
    },
});
