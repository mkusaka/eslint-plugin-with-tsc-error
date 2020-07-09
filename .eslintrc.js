module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  extends: ["prettier/@typescript-eslint", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  plugins: ["prettier", "@typescript-eslint"],
  rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off"
  },
};
