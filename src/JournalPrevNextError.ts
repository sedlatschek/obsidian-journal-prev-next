import { PLUGIN_NAME } from "./constants";

export class JournalPrevNextError extends Error {
  public readonly plugin: string;
  constructor(message: string) {
    super(message);
    this.name = "JournalPrevNextError";
    this.plugin = PLUGIN_NAME;
  }
}
