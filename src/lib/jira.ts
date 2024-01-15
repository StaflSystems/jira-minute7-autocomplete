import { JiraCredentialStore, JiraCredentials } from './settings';

export class JiraIssue {
    constructor(init?: Partial<JiraIssue>) {
        Object.assign(this, init);
    }

    key!: string;
    summary!: string;
    assignee!: string;
    iconUrl!: string;
}

export class JiraIssueRetriever {
    private Credentials: JiraCredentials | null = null;

    async init(): Promise<void> {
        this.Credentials = await JiraCredentialStore.load();

        if (!this.Credentials) {
            throw new Error('Jira credentials not found');
        }
    }

    async get(endpoint: string, params: Record<string, string>): Promise<any> {
        if (!this.Credentials) {
            throw new Error('Not initialized');
        }

        const url = new URL(this.Credentials.instanceUrl + endpoint);
        url.search = new URLSearchParams(params).toString();

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${btoa(`${this.Credentials.username}:${this.Credentials.apiToken}`)}`,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url.toString()}: ${response.statusText}`);
        }

        return await response.json();
    }

    async getSuggestions(query: string): Promise<JiraIssue[]> {
        if (!this.Credentials) {
            throw new Error('Not initialized');
        }

        const params = {
            'query': query,
        };

        const response = await this.get('/rest/api/3/issue/picker', params);

        console.log(response);
        const issues = response.sections[0].issues.map((rawIssue: any) => {
            return new JiraIssue({
                key: rawIssue.key,
                summary: rawIssue.summary,
                assignee: '',
                iconUrl: this.Credentials?.instanceUrl + rawIssue.img,
            });
        });

        return issues;
    }
}
