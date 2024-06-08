import credsData from './creds.json';
import { Sf, Creds } from './sf';
import { v4 as uuid } from 'uuid';

const creds: Creds = credsData;
const sf = new Sf(creds);
const query = "SELECT Id, Name, Owner.Name FROM Account WHERE Name = 'Marilin Tapping'"

let result = await sf.query(query);

console.log(JSON.stringify(result, null, 4));

const newAccount = {
    Name: 'New Account Name',
    Type: 'Prospect',
    Industry: 'Technology',
    Website: 'https://example.com'
};

const readResult = await sf.insert('Account', newAccount);

console.log(`newAccount Id: ${readResult.id}`);

const RARTQuery = "SELECT Id from RecordType WHERE SobjectType = 'Account' and Name = 'Restricted Access'"
const retrictedAccessRecordType = await sf.query(RARTQuery);

console.log('Retricted Access Recordtype:', retrictedAccessRecordType.records[0].Id);

const accountId = readResult.id;
const rtid = retrictedAccessRecordType.records[0].Id;

// const updateRecord = {
//     RecordTypeId: rtid
// };

const updateRecord = {
    Sales_Country__c: 'United States',
    Monorail_UUID__c: uuid(),
    RecordTypeId: rtid
};

const uresult = await sf.update('Account', accountId, updateRecord)

console.log('update result', JSON.stringify(uresult));


// const restrictedAccount = {
//     Name: 'Restricted Account',
//     Type: 'Prospect',
//     Industry: 'Technology',
//     Website: 'https://example.com',
//     Monorail_UUID__c: 'bbb-ccc-ddd'
// };


// const readResult2 = await sf.insert('Account', restrictedAccount);

// console.log(`restricted account Id: ${JSON.stringify(readResult2)}`);


