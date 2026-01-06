<script lang="ts">
  import { moment } from "obsidian";

  import { JournalPrevNextError } from "./JournalPrevNextError";
  import JournalNavPlugin from "./main";

  export let plugin: JournalNavPlugin;
  export let filePath: string;
  export let journalDir: string;

  function getCurrentFileDate(): moment.Moment {
    const format = plugin.getFormat();
    const date = moment(filePath.replace(journalDir, "").replace(".md", ""), format);

    if (!date.isValid()) {
      throw new JournalPrevNextError(`Could not parse date from file path: ${filePath} with format: ${format}`);
    }

    return date;
  }

  async function nav(dayOffset: number): Promise<void> {
    const format = plugin.getFormat();
    const date = getCurrentFileDate();
    const targetDate = date.add(dayOffset, "day");
    const targetPath = `${journalDir}${targetDate.format(format)}.md`;
    await plugin.openOrCreateFile(targetPath);
  }
</script>

<div class="journal-prev-next">
  <button class="internal-link" on:click={() => nav(-1)} aria-label="Previous journal entry">
    ⬅️ Previous Day
  </button>
  <button class="internal-link" on:click={() => nav(1)} aria-label="Next journal entry">
    Next Day ➡️
  </button>
</div>

<style>
  .journal-prev-next {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--background-modifier-border);
    background: var(--background-primary);
    position: sticky;
    top: 0;
    z-index: 20;
    margin-left: auto;
    margin-right: auto;
    width: var(--file-line-width);
  }
</style>
