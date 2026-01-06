/// <reference types="svelte" />
/// <reference types="vite/client" />

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
