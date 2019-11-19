import { self } from 'react-native-threads';

self.onmessage = (msg) => {
    const splitIndex = msg.indexOf(' ');
    const fieldId = msg.substr(0, splitIndex);
    const { page, data } = JSON.parse(msg.substr(splitIndex + 1));
    let sql = `REPLACE INTO "${fieldId}" VALUES\n`;
    data.forEach(({ id, value, visible_only_to_challenges, visible_only_to_communities }, index) => {
        sql += `(${id}, '${JSON.stringify(value)}', '${JSON.stringify(visible_only_to_challenges)}', '${JSON.stringify(visible_only_to_communities)}')${index !== data.length - 1 ? ',\n' : ';'}`;
    });
    self.postMessage(JSON.stringify({ sql, page }));
};
