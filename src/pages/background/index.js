import browser from 'webextension-polyfill';
import {JiraIssueRetriever} from '@src/lib/jira';

console.log("background script loaded");

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("here");
    if (message.type === "jiraSuggestions") {
        const jiraIssueRetriever = new JiraIssueRetriever();
        jiraIssueRetriever.init().then(async () => {
            const issues = await jiraIssueRetriever.getRecentlyUpdatedIssues();
            sendResponse(issues);
        });

        return true;
    }
});

console.log("listener added");