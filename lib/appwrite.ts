import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('674097b50029c71c4ff1');

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
export { ID } from 'appwrite';

