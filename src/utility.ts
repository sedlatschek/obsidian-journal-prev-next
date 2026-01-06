import {
  type App,
} from "obsidian";

import { JournalPrevNextError } from "./JournalPrevNextError";

export const JOURNAL_DIR = "Journal/";

export type DailyNotesSettings = {
  folder: string;
  format: string;
};

function isDailyNotesSettings(value: unknown): value is DailyNotesSettings {
  return typeof value === "object" && value !== null
    && "format" in value
    && "folder" in value
    && (typeof (value).format === "string" || (value).format === undefined)
    && (typeof (value).folder === "string" || (value).folder === undefined);
}

export function getDailyNotesSettings(app: App): DailyNotesSettings {
  const dailyNotes = app.internalPlugins.getPluginById("daily-notes");

  if (!dailyNotes) {
    throw new JournalPrevNextError("Daily Notes plugin is not enabled.");
  }

  const options = dailyNotes.instance?.options;
  if (!isDailyNotesSettings(options)) {
    throw new JournalPrevNextError("Daily Notes plugin options have an unexpected format.");
  }

  return options;
}
