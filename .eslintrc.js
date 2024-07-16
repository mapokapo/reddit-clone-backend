const { rules } = require("eslint-plugin-prettier");

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin", "@darraghor/nestjs-typed"],
  extends: [
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@darraghor/nestjs-typed/recommended",
    "plugin:prettier/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "@darraghor/nestjs-typed/sort-module-metadata-arrays": [
      "warn",
      {
        locale: "en-US",
      },
    ],
    "@typescript-eslint/no-extraneous-class": "off",
  },
};
