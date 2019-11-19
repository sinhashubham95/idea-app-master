import SQLite from 'react-native-sqlite-storage';
import { Thread } from 'react-native-threads';

import data from 'stores/base/_data';

SQLite.enablePromise(true);

function syncValues(db, fieldId, next) {
    return fetch(next || `${Project.api}forms/custom-field/${fieldId}/values?page_size=10000`, {
        timeout: 60000,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'AUTHORIZATION': `UserToken ${data.token}`,
        },
    })
        .then(data.status)
        .then(res => res.text())
        .then(jsonString => new Promise((resolve) => {
            try {
                const thread = new Thread('./generate-sql-thread.js');

                thread.postMessage(`${fieldId} ${jsonString}`);
                thread.onmessage = (msg) => {
                    thread.terminate();
                    const res = JSON.parse(msg);
                    resolve(res);
                };
            } catch (e) {
                console.log('Threading error', e);
            }
        }))
        .then(({ sql, page }) => Promise.all([db.transaction(tx => tx.executeSql(sql)), Promise.resolve(page)]))
        .then(([results, page]) => {
            console.log(`Batch of custom field values for ID ${fieldId} synced successfully. Results:`, results);
            if (page.next) {
                console.log('Processing next batch of custom field values');
                return syncValues(db, fieldId, page.next);
            }
            console.log(`Finished syncing all custom field values for ID ${fieldId} succesfully`);
        });
}

let running = false;
export default () => {
    if (running) {
        console.log('Custom fields sync is already running!'); return;
    }
    running = true;
    AsyncStorage.getItem('last-custom-fields-sync', (err, lastSync) => {
        if (err) {
            running = false;
            return;
        }
        if (lastSync && moment(lastSync).isAfter(moment().subtract(1, 'h'))) {
            console.log('Skipping custom fields sync'); // Skip sync if its not even been an hour since the last one
            running = false;
            return;
        }
        if ((Platform.OS === 'ios' && __DEV__)) {
            console.log('Cannot run custom fields sync under iOS dev. Disable Chrome Debugging and comment out this conditional if you need to run it');
            running = false;
            return;
        }
        console.log('Starting custom fields sync');
        let sqlDb;
        // Open/create the encrypted custom fields database
        SQLite.openDatabase({ name: 'custom-fields.db', key: SecuredStorage.localStorageKey })
            .then((db) => {
                sqlDb = db;
                // Cleanup old data table if it exists
                return sqlDb.transaction(tx => tx.executeSql('DROP TABLE IF EXISTS data'));
            })
            .then(() => data.get(`${Project.api}forms/custom-field`))
            .then(({ data: res }) => Utils.promiseSerial(_.map(res, customField => () => sqlDb.transaction(tx => tx.executeSql(`CREATE TABLE IF NOT EXISTS "${customField.id}" (
                        "id"	INT UNIQUE,
                        "value"	TEXT,
                        "visible_only_to_challenges"	TEXT,
                        "visible_only_to_communities"	TEXT,
                        PRIMARY KEY("id")
                    )`))
                .then(() => syncValues(sqlDb, customField.id)))))
            .then(() => {
                console.log('Finished syncing ALL custom fields successfully');
                AsyncStorage.setItem('last-custom-fields-sync', moment().toISOString());
            })
            .catch(e => console.log(e))
            .then(() => {
                if (sqlDb) sqlDb.close();
                running = false;
            });
    });
};
