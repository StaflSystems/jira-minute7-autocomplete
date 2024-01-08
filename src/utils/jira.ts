import { Version3Client, Config } from 'jira.js';
import { JiraCredentialStore } from './settings';
import {DTClass, DTParsers} from 'ts-data-class';

export class JiraIssue extends DTClass<JiraIssue> {
    key!: string;
    summary!: string;
    assignee!: string;

    protected get parsers(): DTParsers<JiraIssue> {
        return {
            key: (v)  => (typeof v === "string" ? v : ""),
            summary: (v) => (typeof v === "string" ? v : ""),
            assignee: (v) => (typeof v === "string" ? v : ""),
        };
    }
}

export class JiraIssueRetriever {
    private jiraClient?: Version3Client;

    async init(): Promise<void> {
        const credentials = await JiraCredentialStore.load();

        if (!credentials) {
            throw new Error('Jira credentials not found');
        }

        const config: Config = {
            host: credentials.instanceUrl,
            authentication: {
                basic: {
                    email: credentials.username,
                    apiToken: credentials.apiToken,
                },
            },
        };

        this.jiraClient = new Version3Client(config);
    }

    async getRecentlyUpdatedIssues(): Promise<JiraIssue[]> {
        if (!this.jiraClient) {
            throw new Error('Jira client not initialized');
        }

        const response = await this.jiraClient.issueSearch.searchForIssuesUsingJql({
            jql: 'updated >= -30d order by updated DESC',
            fields: ['summary', 'description', 'assignee'],
            maxResults: 100,
        });

        const rawIssues = response.issues || [];
        const issues = rawIssues.map((rawIssue) => {
            return new JiraIssue({
                key: rawIssue.key,
                summary: rawIssue.fields.summary,
                assignee: rawIssue.fields.assignee?.displayName || '',
            });
        });

        return issues;
    }
}
