import browser from 'webextension-polyfill';

export class JiraCredentials {
    constructor(init?: Partial<JiraCredentials>) {
        Object.assign(this, init);
    }

    instanceUrl!: string;
    username!: string;
    apiToken!: string;
}

export class JiraCredentialStore {
    static save(c: JiraCredentials): void {
        browser.storage.local.set({
            jiraCredentials: {
                instanceUrl: c.instanceUrl,
                username: c.username,
                apiToken: c.apiToken,
            }
        });
    }

    static async load(): Promise<JiraCredentials | null> {
        const data = await browser.storage.local.get('jiraCredentials');
        if (!data.jiraCredentials) {
            return null;
        }

        return new JiraCredentials({
            instanceUrl: data.jiraCredentials.instanceUrl,
            username: data.jiraCredentials.username,
            apiToken: data.jiraCredentials.apiToken,
        });
    }
}