# Obsidian Google Tasks Importer

Thanks to YukiGasai for his original https://github.com/YukiGasai/obsidian-google-tasks

This plugin does something different however.

## Features

Use this plugin when your TODO lives in Obsidian, but you're jealous of the integration points of Google Tasks.

This is a simple plugin that imports one of your Google Tasks List into Obsidian, as a one-way operation.
It immediately marks the tasks as Completed in Google Tasks.

## Installation

- Download google-tasks from the latest [release](https://github.com/abourget/obsidian-google-tasks-import/releases/)
- Extract zip into `.obsidian/plugins` folder
- Restart Obsidian
- Activate the plugin in the Obsidian Settings page
- [Create Google Cloud Project](https://console.cloud.google.com/projectcreate?) if you don't have one already
- [Activate Google Tasks API](https://console.cloud.google.com/marketplace/product/google/tasks.googleapis.com?q=search&referrer=search&project=iron-core-327018)
  - This must be done by the admin of the account, or the domain (for Google Workspaces).
- [Configure OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent?) if it wasn't done already
  - Select Extern
  - Fill necessary inputs
  - Add your email as tester if using "@gmail" add gmail and googlemail
- [Add API Token](https://console.cloud.google.com/apis/credentials)
  - Hit "+ CREATE CREDENTIALS"
  - Select "OAuth client ID"
  - Select _Application type_ = "Web application""
  - Give it a meaningful name (like "Obsidian Google Task Import")
  - Add `http://127.0.0.1:42813` under "Authorized Javascript origins"
  - Add `http://127.0.0.1:42813/callback` under "Authorized redirect URIs"
- add the keys into the fields under the plugin settings
- Press Login

### Using the plugin on Mobile (work around)

- Login on a desktop device
- Use the `Copy Google Refresh Token to Clipboard` command on that device
- Install the plugin on the phone
- Paste the token from the desktop device into the _Refresh token_ field that appears only on Mobile.

## Usage

### Commands

Call the command `Insert Uncompleted Google Tasks` to import tasks from Google Tasks from your list, at the beginning of the line where the cursor lies.

### Use a button

Insert something like:

```markdown
`BUTTON[import-google-tasks]`
```

where you want to load the tasks, after installing the [Meta Bind](https://obsidian.md/plugins?id=obsidian-meta-bind-plugin) plugin (see [docs](https://www.moritzjung.dev/obsidian-meta-bind-plugin-docs/guides/buttons/))

and add this Button template to the Meta Bind config:

```yaml
label: Import Tasks
icon: check-in-circle
tooltip: Imports Google Tasks at cursor point
id: import-google-tasks
actions:
  - type: command
    command: obsidian-google-tasks-import:insert-uncompleted-google-tasks
```

### Commands

#### List Google Tasks

Shows a list of all undone tasks selecting one will complete the task

#### Create Google Tasks

Will open a popup to create a new task

#### Insert Google Tasks

Will insert a lost of all undone tasks into the current file. Checking the task inside the File will complete / incomplete it.

### TODO

- Remove the interval config and feature
- Remove the notification config
- Comment out the Confirmations config (in case someone wants to _not_ delete tasks when they are imported).
- Upon Login, call `refreshTaskList()`
- Purge all the unused code.
- Whoops, doesn't work across vaults. Keeps the same refresh token it seems?! Where is that stored? In something global to Electron, and not even to the particular Vault window?