import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import tailwindcss from "eslint-plugin-tailwindcss";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

const config = [
    {
        ignores: [
            "node_modules/*",
            ".next/*",
            "drizzle/meta/*",
            ".husky/*",
            ".prettierignore",
            "**/*.log",
            "docs",
            "**/.*",
            "src/components/shadcn",
        ],
    },
    ...compat.extends(
        "next/core-web-vitals",
        "plugin:tailwindcss/recommended",
        "prettier",
        "plugin:jsdoc/recommended-typescript",
    ),
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
            tailwindcss,
        },

        languageOptions: {
            parser: tsParser,
        },

        rules: {
            "tailwindcss/classnames-order": "off",
            "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
            "react/jsx-curly-brace-presence": [
                "error",
                {
                    props: "never",
                    children: "never",
                    propElementValues: "always",
                },
            ],
            "jsdoc/require-jsdoc": [
                "warn",
                {
                    contexts: [
                        "TSTypeAliasDeclaration",
                        "TSInterfaceDeclaration",
                        "TSMethodSignature",
                        "TSPropertySignature",
                        "VariableDeclaration",
                    ],
                    publicOnly: { ancestorsOnly: true },
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: true,
                        ArrowFunctionExpression: true,
                    },
                    exemptEmptyConstructors: true,
                },
            ],
            "jsdoc/require-param": "warn",
            "jsdoc/require-returns": "warn",
            "jsdoc/require-description": "warn",
            "jsdoc/check-tag-names": "warn",
            "jsdoc/require-param-description": "warn",
            "jsdoc/require-returns-description": "warn",
            "jsdoc/require-param-type": "off",
            "jsdoc/require-returns-type": "off",
            "jsdoc/tag-lines": [
                "warn",
                "never",
                {
                    startLines: 1,
                },
            ],
        },
    },
    ...compat
        .extends(
            "next/core-web-vitals",
            "plugin:@typescript-eslint/recommended-type-checked",
            "plugin:tailwindcss/recommended",
        )
        .map((config) => ({
            ...config,
            files: ["**/*.ts", "**/*.tsx"],
        })),
    {
        files: ["**/*.ts", "**/*.tsx"],

        languageOptions: {
            ecmaVersion: 5,
            sourceType: "script",

            parserOptions: {
                project: ["./tsconfig.json"],
                projectService: true,
                tsconfigRootDir: "./",
            },
        },

        rules: {
            "tailwindcss/classnames-order": "off",
        },
    },
];

export default config;
