import "./styles.css";

import {
  MarkdownView,
  normalizePath,
  Plugin,
  TFile,
  WorkspaceLeaf,
} from "obsidian";
import {
  mount,
  unmount,
} from "svelte";

import { PLUGIN_NAME } from "./constants";
import { JournalNavSettingTab } from "./JournalNavSettingTab";
import JournalPrevNext from "./JournalPrevNext.svelte";
import { JournalPrevNextError } from "./JournalPrevNextError";
import type { JournalNavSettings } from "./settings";
import {
  DEFAULT_SETTINGS,
  isJournalNavSettings,
} from "./settings";
import {
  getDailyNotesSettings,
  normalizeFolderPath,
  openOrCreateFile,
} from "./utility";

type Getter<T> = () => T;
type Setter<T> = (value: T) => void;
type Dynamic<T> = {
  get: Getter<T>;
  set: Setter<T>;
};

type MountedApp = ReturnType<typeof mount>;

export default class JournalNavPlugin extends Plugin {
  public settings: JournalNavSettings = { ...DEFAULT_SETTINGS };

  private leaf?: WorkspaceLeaf;
  private filePath?: string;
  private syncScheduled = false;

  private readingApp: MountedApp | undefined;
  private hostReading: HTMLElement | undefined | null;
  private sourceApp: MountedApp | undefined;
  private hostSource: HTMLElement | undefined | null;

  async onload() {
    await this.loadSettings();
    this.settings.journalDir = normalizeFolderPath(this.settings.journalDir);
    this.addSettingTab(new JournalNavSettingTab(this.app, this));

    const rerender = () => this.scheduleSync();
    this.registerEvent(this.app.workspace.on("active-leaf-change", rerender));
    this.registerEvent(this.app.workspace.on("file-open", rerender));
    this.registerEvent(this.app.workspace.on("layout-change", rerender));
    this.scheduleSync();
  }

  onunload() {
    this.teardown();
  }

  private isJournalFile(file: TFile | null | undefined): file is TFile {
    return !!file && file.path.startsWith(this.settings.journalDir);
  }

  public scheduleSync() {
    if (this.syncScheduled) {
      return;
    }
    this.syncScheduled = true;
    queueMicrotask(() => {
      this.syncScheduled = false;
      this.sync();
    });
  }

  private sync() {
    console.debug(`${PLUGIN_NAME}: Syncing JournalPrevNext Svelte components.`);

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = this.app.workspace.getActiveFile();

    if (!this.isJournalFile(file)) {
      this.teardown();
      return;
    }

    if (!view) {
      throw new JournalPrevNextError("Active view is not a MarkdownView.");
    }

    const leafChanged = this.leaf !== view.leaf;
    const fileChanged = this.filePath !== file.path;

    this.leaf = view.leaf;
    this.filePath = file.path;

    if (leafChanged || fileChanged) {
      this.teardownSvelte();
    }

    this.attachSvelteToHost(view, ".markdown-reading-view", {
      get: () => this.hostReading,
      set: (el) => (this.hostReading = el),
    }, {
      get: () => this.readingApp,
      set: (app) => this.readingApp = app,
    });
    this.attachSvelteToHost(view, ".markdown-source-view", {
      get: () => this.hostSource,
      set: (el) => (this.hostSource = el),
    }, {
      get: () => this.sourceApp,
      set: (app) => this.sourceApp = app,
    });
  }

  private attachSvelteToHost(view: MarkdownView, targetSelector: string, host: Dynamic<HTMLElement | undefined | null>, app: Dynamic<MountedApp | undefined>) {
    console.debug(`${PLUGIN_NAME}: Attaching Svelte to host for selector: ${targetSelector}`);

    if (!this.filePath) {
      throw new JournalPrevNextError("File path is required.");
    }

    const target = view.containerEl.querySelector(targetSelector);
    console.debug(`${PLUGIN_NAME}: Found target:`, target);

    if (!target) {
      throw new JournalPrevNextError("Target container not found for selector: " + targetSelector);
    }

    const element = host.get();
    console.debug(`${PLUGIN_NAME}: Current host element:`, element);

    if (element?.isConnected) {
      console.debug(`${PLUGIN_NAME}: Host element already connected; skipping creation.`);
      return;
    }

    const createdElement = document.createElement("div");
    createdElement.className = "journal-prev-next-host";
    target.prepend(createdElement);
    host.set(createdElement);

    const mountedApp = app.get();
    if (mountedApp) {
      unmount(mountedApp);
    }
    app.set(mount(JournalPrevNext, {
      target: createdElement,
      props: {
        plugin: this,
        filePath: this.filePath,
        journalDir: this.settings.journalDir,
      },
    }));
  }

  private teardownSvelte() {
    try {
      if (this.readingApp) {
        unmount(this.readingApp);
      }
    }
    catch (error) {
      console.error(`${PLUGIN_NAME}: Error unmounting readingApp:`, error);
    }
    try {
      if (this.sourceApp) {
        unmount(this.sourceApp);
      }
    }
    catch (error) {
      console.error(`${PLUGIN_NAME}: Error unmounting sourceApp:`, error);
    }

    this.readingApp = undefined;
    this.sourceApp = undefined;

    this.hostReading?.remove();
    this.hostSource?.remove();
    this.hostReading = undefined;
    this.hostSource = undefined;
  }

  private teardown() {
    console.debug(`${PLUGIN_NAME}: Tearing down JournalPrevNext plugin.`);

    this.teardownSvelte();
    this.leaf = undefined;
    this.filePath = undefined;
  }

  getFormat(): string {
    return getDailyNotesSettings(this.app).format;
  }

  openOrCreateFile(path: string, content = ""): Promise<TFile> {
    return openOrCreateFile(this.app, normalizePath(path), content);
  }

  async loadSettings(): Promise<void> {
    const loaded = await this.loadData();

    if (!isJournalNavSettings(loaded)) {
      console.warn(`${PLUGIN_NAME}: Loaded settings are invalid, resetting to defaults.`, loaded);
      this.settings = { ...DEFAULT_SETTINGS };
    }
    else {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
