/**
 * Creds: This is created from the output of sf org describe --json
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

    async query(query: string): Promise<any> {
        const url = this.queryURL + encodeURIComponent(query);
       
        const payload = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        }

        const response = await fetch(url, payload)
        if (!response.ok) {
            throw new Error(`status: ${response.status} msg: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * @param sobject:  sobject type {'Account', 'Contact', 'MyCustomObject__c', ...}
     * @param record:  { field1: <value>, field2: <value>, ...}
     * @returns Salesforce JSON response incudding new record Id
     * @throws: Error with return status and msg when reqquest fails
     */

    async insert(sobject: string, record: any): Promise<any> {
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
        if (!response.ok) {
            // throw new Error(`status: ${response.status} msg: ${response.statusText}`);
            console.log(`status: ${response.status} msg: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * @param sobject: sobject type type {'Account', 'Contact', 'MyCustomObject__c', ...}
     * @param record: { field1: <value>, field2: <value>, ...}
     * @returns Salesforce JSON response
     * @throws Errror with call return status and message
     */
    async update(sobject: string, id: string, record: any): Promise<any> {
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
        if (!response.ok) {
            throw new Error(`status: ${response.status} msg: ${response.statusText}`);
        }
        return response.json();
    }

}


