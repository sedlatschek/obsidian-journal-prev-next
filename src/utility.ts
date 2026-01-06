import {
  type App,
  normalizePath,
  TFile,
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

export async function ensureFolder(app: App, folderPath: string): Promise<void> {
  const parts = folderPath.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) {
      await app.vault.createFolder(current).catch(() => {});
    }
  }
}

export async function openOrCreateFile(
  app: App,
  path: string,
  content = "",
): Promise<TFile> {
  const normalized = normalizePath(path);
  const existing = app.vault.getAbstractFileByPath(normalized);

  let file: TFile;
  if (existing instanceof TFile) {
    file = existing;
  }
  else {
    const folderPath = normalized.split("/").slice(0, -1).join("/");
    await ensureFolder(app, folderPath);
    file = await app.vault.create(normalized, content);
  }

  await app.workspace.getLeaf(false).openFile(file);
  return file;
}

export function normalizeFolderPath(input: string): string {
  const p = normalizePath(input.trim());
  const noLeading = p.replace(/^\/+/, "");
  return noLeading.length > 0 && !noLeading.endsWith("/") ? `${noLeading}/` : noLeading;
}
