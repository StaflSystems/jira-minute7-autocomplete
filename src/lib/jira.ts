import { JiraCredentialStore, JiraCredentials } from './settings';

export class JiraIssue {
    constructor(init?: Partial<JiraIssue>) {
        Object.assign(this, init);
    }

    key!: string;
    summary!: string;
    assignee!: string;
}

export class JiraIssueRetriever {
    private Credentials: JiraCredentials | null = null;

    async init(): Promise<void> {
        this.Credentials = await JiraCredentialStore.load();

        if (!this.Credentials) {
            throw new Error('Jira credentials not found');
        }
    }

    async searchIssues(jql: string, startAt: number) : Promise<{issues: JiraIssue[], total: number}> {
        if (!this.Credentials) {
            throw new Error('Not initialized');
        }
        
        const params = {
            'jql': jql,
            'fields': 'summary,description,assignee',
            'startAt': startAt.toString(),
            'maxResults': '100',
        }

        var url = new URL(this.Credentials.instanceUrl + '/rest/api/3/search');
        url.search = new URLSearchParams(params).toString();

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${btoa(`${this.Credentials.username}:${this.Credentials.apiToken}`)}`,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch issues: ${response.statusText}`);
        }

        const rawIssueResponse = await response.json();

        console.log(rawIssueResponse);

        const rawIssues = rawIssueResponse.issues;
        const issues = rawIssues.map((rawIssue: any) => {
            return new JiraIssue({
                key: rawIssue.key,
                summary: rawIssue.fields.summary,
                assignee: rawIssue.fields.assignee?.displayName || '',
            });
        });

        return { issues: issues, total: rawIssueResponse.total };
    }

    async getRecentlyUpdatedIssues(): Promise<JiraIssue[]> {
        if (!this.Credentials) {
            throw new Error('Not initialized');
        }

        const query = 'updated >= -30d order by updated DESC';

        const initialResults = await this.searchIssues(query, 0);
        const total = initialResults.total;
        var issues = initialResults.issues;

        while (issues.length < total) {
            const nextResults = await this.searchIssues(query, issues.length);
            issues = issues.concat(nextResults.issues);
        }

        return issues;
    }
}
