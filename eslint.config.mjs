// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    ignores: ["dist/**", "data/**"],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  // @ts-expect-error bad typing given by stylistic
  stylistic.configs.customize({
    arrowParens: true,
    blockSpacing: true,
    braceStyle: "stroustrup",
    commaDangle: "always-multiline",
    indent: 2,
    jsx: false,
    quoteProps: "consistent-as-needed",
    quotes: "double",
    semi: true,
  }),
  {
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
);
