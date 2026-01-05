import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      js,
      "simple-import-sort": simpleImportSort,
    },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  tseslint.configs.recommended,
  stylistic.configs.customize({
    arrowParens: true,
    commaDangle: "always-multiline",
    indent: 2,
    quotes: "double",
    semi: true,
  }),
  {
    rules: {
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
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dev-vault/**",
      "dist",
    ],
  },
]);
