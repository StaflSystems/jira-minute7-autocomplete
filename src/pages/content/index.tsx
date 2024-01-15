import { JiraIssue } from "@src/lib/jira";
import browser from 'webextension-polyfill';
import autocomplete, { AutocompleteItem } from "autocompleter";

import "./style.css";


async function getDescriptionField(): Promise<HTMLTextAreaElement>
{
  var te: HTMLTextAreaElement | null = null;
  while (te == null) {
    te = document.getElementsByTagName("textarea")[0];
    await new Promise(r => setTimeout(r, 100));
  }

  return te;
}

async function init() {
  if (!document.URL.startsWith("https://frontend.minute7.com")) {
    return;
  }
    
  const autocompleteContainer = document.createElement("div");
  autocompleteContainer.classList.add("autocomplete");
  autocompleteContainer.role = "listbox";
  document.body.appendChild(autocompleteContainer);
  
  const textArea = await getDescriptionField();
  type MyItem = JiraIssue & AutocompleteItem;
  autocomplete<MyItem>({
    input: textArea,
    emptyMsg: "No issues found",
    fetch: (text: string, update: (items: JiraIssue[]) => void) => {
      browser.runtime.sendMessage({ type: "jiraSuggestions", text: text }).then(
        (response: JiraIssue[]) => {
          update(response);
        }
      );
    },
    onSelect: (item: JiraIssue) => {
      textArea.value = `${item.key} - ${item.summary.replaceAll('<b>', '').replaceAll('</b>', '')}`;
    },
    render: (item: JiraIssue, currentValue: string) => {
      const div = document.createElement("div");
      div.classList.add("autocomplete-entry");

      const img = document.createElement("img");
      img.src = item.iconUrl;
      div.appendChild(img);

      const p = document.createElement("div");
      
      p.innerHTML = `${item.key} - ${item.summary}`;
      if (item.assignee) {
        p.innerHTML += ` (${item.assignee})`;
      }

      div.appendChild(p);

      return div;
    },
    click: e => e.fetch(),
    container: autocompleteContainer,
  });
}

document.addEventListener("DOMContentLoaded", init);
