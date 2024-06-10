/**
 * Creds:  Wrapper of a Salesforce access token
 * 
 * The name of the output file is part of the interface.  The 
 * (1) create the creds.json file
 *     sf org display -o <my-alias> > ./creds.json
 * (2) import the the JSON file to read the access token.   This is easy to do with 
 *     bun.   Add the following at the top the bun client add
 *     
 *     import type { Creds } from '@pogilvie/sf';
 *     import { Sf } from '@pogilvie/sf';
 */

export type Creds = {
    status: number,
    result: {
        id: string,
        accessToken: string,
        instanceUrl: string,
        username: string,
        clientId: string,
        connectedStatus: string,
        alias: string
    },
    warnings: string[]
};

/**
 * SfResponse is a wrapper on the native fetch Response object
 * This allows client to get both the http status and payload with a single
 * await call it ancapculates the results of both both of the statments
 * below
 *     const response = await fetch(url, payload);
 *     const body = await response.json();
 * This macks the package suitable for slow synchronous operations which are
 * easy to to reason about for 
 * 
 */ 

export class SfResponse {
    success: boolean;       // was the outcall success (2xx range status)
    status: number;         // the https status number 200, 400, 501, ...
    msg: string;            // msg associated with the call status
    body: any;              // JSON body for the response. This may be populated with diagnostic
                            // data when the call was unsuccessful

    constructor(success: boolean, status: number, msg: string, body: any)  {
        this.success = success;
        this.status = status;
        this.msg = msg;
        this.body = body;
    }
}

export class Sf {
    private queryURL: string;
    private sobjectURL: string;
    private accessToken: string;

    constructor(creds: Creds) {
        const apiVersion = 'v60.0'
        this.queryURL = `${creds.result.instanceUrl}/services/data/${apiVersion}/query?q=`;
        this.sobjectURL = `${creds.result.instanceUrl}/services/data/${apiVersion}/sobjects`
        this.accessToken = creds.result.accessToken;
    }

    /**
     * @param query:  SOQL query string
     * @returns Promise with the payload
     * @throws Error with return status and mesg when reqquest fails
     */

    async query(query: string): Promise<SfResponse> {
        const url = this.queryURL + encodeURIComponent(query);
        
        const payload = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, payload);
        const body = await response.json();
        return new SfResponse(
            response.ok,
            response.status,
            response.statusText,
            body
        );
    }

    /**
     * @param sobject:  sobject type {'Account', 'Contact', 'MyCustomObject__c', ...}
     * @param record:  { field1: <value>, field2: <value>, ...}
     * @returns Salesforce JSON response incudding new record Id
     * @throws: Error with return status and msg when reqquest fails
     */

    async insert(sobject: string, record: any): Promise<SfResponse> {
        const url = `${this.sobjectURL}/${sobject}`;

        const payload = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        }

        const response = await fetch(url, payload);
        const body = await response.json();
        return new SfResponse(
            response.ok,
            response.status,
            response.statusText,
            body
        );
    }

    /**
     * @param sobject: sobject type type {'Account', 'Contact', 'MyCustomObject__c', ...}
     * @param record: { field1: <value>, field2: <value>, ...}
     * @returns Salesforce JSON response
     * @throws Errror with call return status and message
     */
    async update(sobject: string, id: string, record: any): Promise<SfResponse> {
        const url = `${this.sobjectURL}/${sobject}/${id}`;

        const payload = {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        };

        const response = await fetch(url, payload);
        const body = await response.json();
        return new SfResponse(
            response.ok,
            response.status,
            response.statusText,
            body
        );
    }
}


