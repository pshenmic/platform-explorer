import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import jest from "eslint-plugin-jest";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: [...compat.extends("eslint-config-standard"), ...nextCoreWebVitals],

    plugins: {
        jest,
    },

    languageOptions: {
        globals: {
            ...jest.environments.globals.globals,
        },
    },
}, {
    files: ["**/*.ts", "**/*.tsx"],

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        "no-unused-vars": "off",
        "no-undef": "off",

        "@typescript-eslint/consistent-type-imports": ["error", {
            prefer: "type-imports",
            fixStyle: "separate-type-imports",
        }],
    },
}]);