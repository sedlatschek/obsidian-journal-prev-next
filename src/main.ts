import {
  Notice,
  Plugin,
} from "obsidian";

export default class ObsidianPrevNextJournal extends Plugin {
  public override async onload(): Promise<void> {
    await super.onload();

    new Notice("Obsidian Prev/Next Journal loaded");
  }
}
