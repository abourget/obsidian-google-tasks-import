import { createNotice } from "src/helper/NoticeHelper";
import {
	PluginSettingTab,
	App,
	Setting,
	Notice,
	ButtonComponent,
	Platform,
	DropdownComponent,
} from "obsidian";
import { customSetting } from "../helper/CustomSettingElement";
import { LoginGoogle } from "../googleApi/GoogleAuth";
import type GoogleTasks from "../GoogleTasksPlugin";
import { getAllTaskLists } from "../googleApi/ListAllTasks";
import { GoogleTaskView, VIEW_TYPE_GOOGLE_TASK } from "./GoogleTaskView";
import { getRT, setAT, setET, setRT } from "../helper/LocalStorage";

export class GoogleTasksSettingTab extends PluginSettingTab {
	plugin: GoogleTasks;

	constructor(app: App, plugin: GoogleTasks) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for Google Tasks" });

		new Setting(containerEl)
			.setName("ClientId")
			.setDesc("Google client id")
			.addText((text) =>
				text
					.setPlaceholder("Enter your client id")
					.setValue(this.plugin.settings.googleClientId)
					.onChange(async (value) => {
						this.plugin.settings.googleClientId = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("ClientSecret")
			.setDesc("Google client secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your client secret")
					.setValue(this.plugin.settings.googleClientSecret)
					.onChange(async (value) => {
						this.plugin.settings.googleClientSecret = value;
						await this.plugin.saveSettings();
						refreshTaskLists()
					})
			);

		const AuthSetting = new Setting(containerEl);

		const createLogOutButton = (button: ButtonComponent) => {
			button.setButtonText("Logout");
			button.onClick(async (event) => {
				setRT("");
				setAT("");
				setET(0);
				button.buttonEl.remove();

				AuthSetting.setName("Login");
				AuthSetting.setDesc("Login to your Google Account");
				AuthSetting.addButton((button: ButtonComponent) => {
					button.setButtonText("Login");
					button.onClick(async (event) => {
						if (settingsAreCorrect(this.plugin)) {
							LoginGoogle(this.plugin).then(refreshTaskLists);
						}
					});
				});
			});
		};

		if (Platform.isDesktop) {
			if (getRT()) {
				AuthSetting.setName("Logout");
				AuthSetting.setDesc("Logout off your Google Account");
				AuthSetting.addButton(createLogOutButton);
			} else {
				AuthSetting.setName("Login");
				AuthSetting.setDesc("Login to your Google Account");
				AuthSetting.addButton((button: ButtonComponent) => {
					button.setButtonText("Login");
					button.onClick(async (event) => {
						if (settingsAreCorrect(this.plugin)) {
							LoginGoogle(this.plugin).then(refreshTaskLists)

							let count = 0;
							const intId = setInterval(() => {
								count++;

								if (count > 900) {
									clearInterval(intId);
								} else if (getRT()) {
									clearInterval(intId);
									button.buttonEl.remove();
									AuthSetting.setName("Logout");
									AuthSetting.setDesc(
										"Logout off your Google Account"
									);
									AuthSetting.addButton(createLogOutButton);
								}
							}, 200);
						}
					});
				});
			}
		} else {
			new Setting(containerEl)
				.setName("Refresh Token")
				.setDesc("Google Refresh Token from OAuth")
				.addText((text) =>
					text
						.setPlaceholder("Enter refresh token")
						.setValue(this.plugin.settings.googleRefreshToken)
						.onChange(async (value) => {
							setRT(value);
							this.plugin.settings.googleRefreshToken = value;
							await this.plugin.saveSettings()
						})
				);
		}

		const taskListSetting = new Setting(containerEl)
			.setName("Task List To Import From")
			.setDesc("Select the task list to import tasks from")
			.addDropdown((dropdown) => {
				dropdown.setValue(this.plugin.settings.importTaskList);
				dropdown.onChange(async (value) => {
					this.plugin.settings.importTaskList = value
					await this.plugin.saveSettings()
				})
				dropdown.addOption("", "Loading...")
			})

		const refreshTaskLists = async () => {
			// taskListSetting.components.forEach((component) => {
			// 	taskListSetting.components.remove(component)
			// });
			const ctrl = taskListSetting.components[0] as DropdownComponent

			if (!settingsAreCompleteAndLoggedIn(this.plugin)) {
				ctrl.selectEl.empty()
				ctrl.addOption(this.plugin.settings.importTaskList, "Login first")
				return
			}

			const tasks = {};
			const taskLists = await getAllTaskLists(this.plugin)
			for (const taskList of taskLists) {
				tasks[taskList.id] = taskList.title;
			}
			if (this.plugin.settings.importTaskList === "") {
				this.plugin.settings.importTaskList = taskLists[0].id
			}
			ctrl.selectEl.empty()
			ctrl.addOptions(tasks)
		}

		new Setting(containerEl)
			.setName("Complete on import")
			.setDesc("Mark imported tasks as completed")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.completeOnImport);
				toggle.onChange(async (state) => {
					this.plugin.settings.completeOnImport = state;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Notifications")
			.setDesc("Show notifications of info and errors")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.showNotice);
				toggle.onChange(async (state) => {
					this.plugin.settings.showNotice = state;
					await this.plugin.saveSettings();
				});
			});

		const RefreshIntervalInput = customSetting(
			containerEl,
			"Refresh Interval",
			"Time in seconds between refresh request from google server"
		).createEl("input", {
			type: "number",
		});
		RefreshIntervalInput.value = this.plugin.settings.refreshInterval + "";
		RefreshIntervalInput.min = "10";
		RefreshIntervalInput.step = "1";
		RefreshIntervalInput.addEventListener("input", async () => {
			this.plugin.settings.refreshInterval = parseInt(
				RefreshIntervalInput.value
			);
			this.app.workspace
				.getLeavesOfType(VIEW_TYPE_GOOGLE_TASK)
				.forEach((leaf) => {
					if (leaf.view instanceof GoogleTaskView) {
						leaf.view.setRefreshInterval();
					}
				});
			await this.plugin.saveSettings();
		});

		refreshTaskLists()
	}
}

export function settingsAreComplete(
	plugin: GoogleTasks,
	showNotice = true
): boolean {
	if (
		plugin.settings.googleClientId == "" ||
		plugin.settings.googleClientSecret == ""
	) {
		createNotice(plugin, "Google Tasks missing settings", showNotice);
		return false;
	}
	return true;
}

export function settingsAreCorrect(plugin: GoogleTasks): boolean {
	if (
		/^[0-9a-zA-z-]*\.apps\.googleusercontent\.com$/.test(
			plugin.settings.googleClientId
		) == false
	) {
		new Notice("Client ID Token is not the correct format");
		return false;
	} else if (
		/^[0-9a-zA-z-]*$/.test(plugin.settings.googleClientSecret) == false
	) {
		new Notice("Client Secret is not the correct format");
		return false;
	}
	return true;
}

export function settingsAreCompleteAndLoggedIn(
	plugin: GoogleTasks,
	showNotice = true
): boolean {
	if (!settingsAreComplete(plugin, false) || getRT() == "") {
		createNotice(
			plugin,
			"Google Tasks missing settings or not logged in",
			showNotice
		);

		return false;
	}
	return true;
}
