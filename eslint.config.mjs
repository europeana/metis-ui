import typescriptEslint from "@typescript-eslint/eslint-plugin";
import stylistic from '@stylistic/eslint-plugin';
import globals from "globals";
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

export default [
    // =========================================================================
    // 1. GLOBAL SYSTEM EXCLUSIONS
    // =========================================================================
    {
        ignores: [
            "**/*.cjs",
            "**/dist/*",
            "**/.angular/**",
            "**/node_modules/**",
            "**/tmp/**",
            "**/cypress/plugins/*",
            "**/cypress/fixtures/*"
        ],
    },

    // Inject core default recommended layout collections
    ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),

    // =========================================================================
    // 2. LOOSE JAVASCRIPT ASSET COMPILING (No TS Parser Overhead)
    // =========================================================================
    {
        // 🚀 FIX: Broadened glob to support assets across any workspace sub-app
        files: [
            "projects/**/src/assets/**/*.js",
            "eslint.config.mjs"
        ],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.browser
            }
        },
        rules: {
            "no-var": "error",
            "prefer-const": "error"
        }
    },

    // =========================================================================
    // 3. CORE ANGULAR APPLICATION TS LOGIC (Your Exact Original Rules)
    // =========================================================================
    {
        // 🚀 FIX: Swapped "projects/metis/**/*.ts" to "projects/**/*.ts"
        // This ensures shared, metis, and sandbox libraries all process types safely.
        files: ["projects/**/*.ts"],
        plugins: {
          "@typescript-eslint": typescriptEslint,
          "@stylistic": stylistic
        },
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "module",
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            "@stylistic/member-delimiter-style": "error",
            "@stylistic/type-annotation-spacing": "error",
            "@typescript-eslint/adjacent-overload-signatures": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "@typescript-eslint/ban-types": "off",
            camelcase: "off",
            "@typescript-eslint/camelcase": "off",
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/interface-name-prefix": "off",

            "max-len": ["error", {
                code: 140,
            }],

            "no-array-constructor": "off",
            "@typescript-eslint/no-array-constructor": "error",
            "no-empty-function": "off",
            "@typescript-eslint/no-empty-function": "error",
            "@typescript-eslint/no-empty-interface": "error",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-misused-new": "error",
            "@typescript-eslint/no-namespace": "error",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-this-alias": "error",
            "no-unused-vars": "off",

            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "_",
            }],

            "no-use-before-define": "off",
            "@typescript-eslint/no-use-before-define": "error",
            "@typescript-eslint/no-var-requires": "error",
            "@typescript-eslint/prefer-namespace-keyword": "error",
            "@typescript-eslint/triple-slash-reference": "error",
            "@typescript-eslint/unbound-method": "off",
            "no-var": "error",
            "prefer-const": "error",
            "prefer-rest-params": "error",
            "prefer-spread": "error",

            "@typescript-eslint/explicit-member-accessibility": ["off", {
                overrides: {
                    constructors: "off",
                },
            }],

            "sort-imports": ["error", {
                ignoreCase: true,
                ignoreDeclarationSort: true,
                ignoreMemberSort: false,
                memberSyntaxSortOrder: ["none", "all", "single", "multiple"],
            }],
        },
    },

    // =========================================================================
    // 4. TEST CASE SPECIFICATIONS OVERRIDES (Your Original Relaxations)
    // =========================================================================
    {
        // 🚀 FIX: Updated to apply across all workspace apps/libs
        files: [
            "projects/**/*.spec.ts",
            "projects/**/*.test.ts",
            "**/test-data/**",
            "**/_mocked/**",         // Safely catches mock folders from your screenshot
            "**/_helpers/**"         // Safely catches test helper files from your screenshot
        ],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-empty-function": "off",
            // 🚀 TIP: Adding this explicitly forces your unused patterns to pass in test mocks
            "@typescript-eslint/no-unused-vars": "off"
        }
    }
];
