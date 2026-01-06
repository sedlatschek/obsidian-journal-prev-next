import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { Linter } from "eslint";
import { defineConfig } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tseslint from "typescript-eslint";

const rules: Linter.RulesRecord = {
  "simple-import-sort/imports": "error",
  "simple-import-sort/exports": "error",

  "@stylistic/array-bracket-newline": [
    "error",
    { multiline: true },
  ],
  "@stylistic/array-element-newline": [
    "error",
    "always",
  ],
  "@stylistic/eol-last": [
    "error",
    "always",
  ],
  "@stylistic/object-property-newline": [
    "error",
    { allowAllPropertiesOnSameLine: false },
  ],
  "@stylistic/object-curly-newline": [
    "error",
    {
      ObjectExpression: {
        multiline: true,
        minProperties: 2,
        consistent: true,
      },
      ObjectPattern: {
        multiline: true,
        minProperties: 2,
        consistent: true,
      },
      ImportDeclaration: {
        multiline: true,
        minProperties: 2,
        consistent: true,
      },
      ExportDeclaration: {
        multiline: true,
        minProperties: 2,
        consistent: true,
      },
    },
  ],
};

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  stylistic.configs.customize({
    arrowParens: true,
    commaDangle: "always-multiline",
    indent: 2,
    quotes: "double",
    semi: true,
  }),
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".svelte"],
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      svelte,
      "simple-import-sort": simpleImportSort,
    },
    rules,
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules,
  },
  {
    ignores: [
      "node_modules/**",
      "dev-vault/**",
      "dist",
    ],
  },
]);
