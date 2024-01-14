import React from "react";
import { createRoot } from "react-dom/client";
import { JiraIssue } from "@src/lib/jira";
import browser from 'webextension-polyfill';
import autocomplete, { AutocompleteItem } from "autocompleter";

import "./style.css";

async function init() {
  console.log(document.URL)

  if (!document.URL.startsWith("https://frontend.minute7.com")) {
    return;
  }

  const issues: JiraIssue[] = await browser.runtime.sendMessage({ type: "jiraSuggestions" });

  console.log(issues);
  type MyItem = JiraIssue & AutocompleteItem;
  const te = document.getElementsByTagName("textarea")[0];

  const autocompleteContainer = document.createElement("div");
  autocompleteContainer.classList.add("autocomplete");
  autocompleteContainer.role = "listbox";
  autocompleteContainer.style.backgroundColor = "white";
  autocompleteContainer.style.zIndex = "1";
  document.body.appendChild(autocompleteContainer);

  autocomplete<MyItem>({
    input: te,
    emptyMsg: "No issues found",
    fetch: (text: string, update: (items: JiraIssue[]) => void) => {
      text = text.toLowerCase();
      const suggestions = issues.filter(n => n.summary.toLowerCase().includes(text));
      update(suggestions);
    },
    onSelect: (item: JiraIssue) => {
      te.value = `${item.key} - ${item.summary}`;
    },
    render: (item: JiraIssue, currentValue: string) => {
      const div = document.createElement("div");
      div.classList.add("autocomplete-entry");
      div.textContent = `${item.key} - ${item.summary}`;

      if (item.assignee) {
        div.textContent += ` (${item.assignee})`;
      }

      return div;
    },
    click: e => e.fetch(),
    container: autocompleteContainer,
  });

  

}

document.addEventListener("DOMContentLoaded", init);
