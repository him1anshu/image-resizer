import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    {
        files: ["**/*.js"], // Define the file patterns this config applies to
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                __dirname: "readonly",
                module: "readonly",
                require: "readonly",
                process: "readonly",
            },
        },
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            "no-console": "warn",
            eqeqeq: "error",
            semi: ["error", "always"],
            quotes: ["error", "single"],
            indent: ["error", 2],
            curly: ["error", "multi-line"],
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-var": "error",
            "prefer-const": "error",
            "prettier/prettier": [
                "error",
                {
                    printWidth: 100,
                    semi: true,
                    singleQuote: false,
                    tabWidth: 4,
                    trailingComma: "es5",
                },
            ],
        },
        ignores: ["package-lock.json", "test/*", "coverage/*"],
    },
    {
        // eslint:recommended rules manually included
        rules: {
            eqeqeq: "error",
            "no-console": "off",
            "no-unused-vars": "warn",
        },
    },
    {
        // eslint-config-prettier rules to disable conflicting rules with Prettier
        rules: eslintConfigPrettier.rules,
    },
];
