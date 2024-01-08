import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { JiraCredentialStore, JiraCredentials } from "@src/utils/settings";

import logo from "@assets/img/logo.svg";

export default function Popup(): JSX.Element {
  const { register, handleSubmit, reset } = useForm<JiraCredentials>();

  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);

  async function loadCredentials(): Promise<void> {
    console.log("loading creds");

    var credentials = await JiraCredentialStore.load();
    if (!credentials) {
      credentials = new JiraCredentials({ instanceUrl: "", username: "", apiToken: "" });
    }

    setCredentials(credentials)
  }

  useEffect(() => {
    loadCredentials();
  }, []);

  useEffect(() => {
    reset(credentials || new JiraCredentials({ instanceUrl: "", username: "", apiToken: "" }));
  }, [credentials]);

  function handleSave(data: JiraCredentials): void {
    JiraCredentialStore.save(data);
  };


  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <div>
          <h1>Options</h1>
          {credentials && (
            <form onSubmit={handleSubmit(handleSave)}>
              <label>Jira URL</label>
              <input type="text" {...register("instanceUrl")} />
              <label>Username</label>
              <input type="text" {...register("username")} />
              <label>API Token</label>
              <input type="text" {...register("apiToken")} />
              <button type="submit">Save</button>
            </form>
          )}
        </div>
      </header>
    </div>
  );
}
