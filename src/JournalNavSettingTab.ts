import {
  App,
  PluginSettingTab,
  Setting,
} from "obsidian";

import type JournalNavPlugin from "./main";
import { normalizeFolderPath } from "./utility";

export class JournalNavSettingTab extends PluginSettingTab {
  private plugin: JournalNavPlugin;

  constructor(app: App, plugin: JournalNavPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Journal Nav Settings" });

    new Setting(containerEl)
      .setName("Journal directory")
      .setDesc("Vault-relative folder path (e.g. \"Journal\" or \"Journal/Daily\").")
      .addText((text) => {
        text
          .setPlaceholder("Journal")
          .setValue(this.plugin.settings.journalDir.replace(/\/$/, ""))
          .onChange(async (value) => {
            this.plugin.settings.journalDir = normalizeFolderPath(value);
            await this.plugin.saveSettings();

            this.plugin.scheduleSync();
          });
      });

    new Setting(containerEl)
      .setName("Current value")
      .setDesc(this.plugin.settings.journalDir);
  }
}
