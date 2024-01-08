import React from "react";
import { createRoot } from "react-dom/client";
import Tribute from "tributejs";
import { JiraIssueRetriever, JiraIssue } from "@src/utils/jira";
import browser from 'webextension-polyfill';

import "./style.css";

async function init() {
  console.log(document.URL)

  if (!document.URL.startsWith("https://frontend.minute7.com")) {
    return;
  }

  const issues: JiraIssue[] = await browser.runtime.sendMessage({ type: "jiraSuggestions" });
  
  console.log(issues);
  var tribute = new Tribute({
    values: issues.map((issue: JiraIssue) => {
      return {
        key: issue.key + ": " + issue.summary,
        value: issue.key + ": " + issue.summary,
      };
    })
  });

  const te = document.getElementsByTagName("textarea")[0];
  console.log(te);
  tribute.attach(te);
}

document.addEventListener("DOMContentLoaded", init);
