import { getRT, setRT } from './helper/LocalStorage';
import { Editor, MarkdownView, Plugin, Notice } from "obsidian";
import type { GoogleTasksSettings } from "./helper/types";
import { getAllTasksFromList } from "./googleApi/ListAllTasks";
import {
	GoogleCompleteTask,
} from "./googleApi/GoogleCompleteTask";
import {
	GoogleTasksSettingTab,
	settingsAreCompleteAndLoggedIn,
} from "./view/GoogleTasksSettingTab";
import { taskToList } from './helper/TaskToList';

const DEFAULT_SETTINGS: GoogleTasksSettings = {
	googleRefreshToken: "",
	googleClientId: "",
	googleClientSecret: "",
	importTaskList: "",
	completeOnImport: true,
	refreshInterval: 60,
	showNotice: true,
};

export default class GoogleTasks extends Plugin {
	settings: GoogleTasksSettings;
	plugin: GoogleTasks;
	showHidden = false;

	async onload() {
		await this.loadSettings();
		this.plugin = this;

		const writeTodoIntoFile = async (editor: Editor) => {
			const tasks = await getAllTasksFromList(this, this.plugin.settings.importTaskList, null, null, false)
			const taskLines = tasks.map(taskToList)
			// const taskLines = []
			// tasks.forEach((task) => {
			// 	taskLines.push(taskToList(task))
			// })

			const importButton = "`BUTTON[import-google-tasks]`"
			const editorContent = editor.getValue();

			if (editorContent.includes(importButton)) {
				console.log("google-tasks-import: insert near button")
				const updatedContent = editorContent.replace(importButton, importButton + "\n" + taskLines.join("").trimEnd());
				editor.setValue(updatedContent);
			} else {
				console.log("google-tasks-import: insert at cursor")
				const cursor = editor.getCursor()
				cursor.ch = 0
				editor.replaceRange(taskLines.join(""), cursor)	
			}

			if (this.plugin.settings.completeOnImport) {
				tasks.forEach((task) => {
					console.log(`google-tasks-import: deleting task ${task.id}: ${task.title}`)
					GoogleCompleteTask(this, task);
				})
			} else {
				console.log(`google-tasks-import: skipping delete`)
			}
		};

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "insert-uncompleted-google-tasks",
			name: "Insert Uncompleted Google Tasks",
			editorCheckCallback: (
				checking: boolean,
				editor: Editor,
				view: MarkdownView
			): boolean => {
				const canRun = settingsAreCompleteAndLoggedIn(this, false);

				if (checking) {
					return canRun;
				}

				if (!canRun) {
					return;
				}

				writeTodoIntoFile(editor);
			},
		});

		//Copy Refresh token to clipboard
		this.addCommand({
			id: "copy-google-refresh-token",
			name: "Copy Google Refresh Token to Clipboard",

			callback: () => {
				const token = getRT();
				if(token == undefined || token == ''){
					new Notice("No Refresh Token. Please Login.")
					return;
				}

				navigator.clipboard.writeText(token).then(function() {
					new Notice("Token copied")
				}, function(err) {
					new Notice("Could not copy token")
				});
				
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GoogleTasksSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		setRT(this.settings.googleRefreshToken)
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
