import browser from 'webextension-polyfill';
import { JiraIssue, JiraIssueRetriever } from '@src/utils/jira';

console.log("background script loaded");

const jiraIssueRetriever = new JiraIssueRetriever();

browser.runtime.onMessage.addListener(async function (message) {
    console.log("here");
    if (message.type === "jiraSuggestions") {
        await jiraIssueRetriever.init();
        const issues = await jiraIssueRetriever.getRecentlyUpdatedIssues();
        return issues;
    }
});

console.log("listener added");