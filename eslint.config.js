import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const fileList = ["**/*.{js,mjs,cjs,ts}"];

export default defineConfig([
  globalIgnores(["dist/", "node_modules/", "package-lock.json"]),
  { files: fileList, plugins: { js }, extends: ["js/recommended"] },
  { files: fileList, languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      eqeqeq: "error",
      "no-console": "error",
      "no-restricted-syntax": [
        "error",
        "FunctionDeclaration",
        "FunctionExpression",
      ],
      "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
      curly: ["error", "all"],
      "no-implicit-coercion": ["error", { allow: ["!!"] }],
    },
  },
]);
