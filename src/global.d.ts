/// <reference types="svelte" />

import "obsidian";

declare module "obsidian" {
  interface App {
    internalPlugins: {
      getPluginById(id: string): {
        instance?: {
          options?: {
            folder?: string;
            format?: string;
          };
        };
      };
    };
  }
}
