export interface JournalNavSettings {
  journalDir: string;
}

export const DEFAULT_SETTINGS: JournalNavSettings = {
  journalDir: "Journal",
};

export function isJournalNavSettings(value: unknown): value is JournalNavSettings {
  return typeof value === "object" && value !== null
    && "journalDir" in value
    && value.journalDir === "string";
}
