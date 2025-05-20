import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // JavaScript base config
  {
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        ...globals.browser,
        requirejs: "readonly",
        process: "readonly",
      },
    },
  },

  // TypeScript config
  {
    ...tseslint.configs.recommended[0],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ...tseslint.configs.recommended[0].languageOptions,
      globals: {
        ...globals.browser,
        requirejs: "readonly",
      },
    },
    rules: {
      ...tseslint.configs.recommended[0].rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // React config
  {
    ...pluginReact.configs.flat.recommended,
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off", // ✅ modern JSX doesn't need `React` in scope
      "no-unused-vars": "off",
      "no-extra-boolean-cast": "off",
    },
  },

  // React Hooks config
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
