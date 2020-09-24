# eslint-plugin-with-tsc-error
Report TypeScript Compile error through eslint.
- report typescript compile error
- autocomment ts-comment (like ts-ignore, ts-expect-error) with typescript compile error log with eslint autofix.

## install

```bash
npm install --save-dev eslint-plugin-with-tsc-error
```

```bash
yarn add -D eslint-plugin-with-tsc-error
```

## config
.eslintrc.js
```js
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "tsconfig.eslint.json", // This rule require type information
  },
  plugins: [
    "with-tsc-error",
  ],
  rules: {
    "with-tsc-error/all": "warn",
  },
};
```

## options

|  key | value | default | description |
| --- | --- | --- | --- |
|  tsCommentType | "ts-ignore" or "ts-expect-error" | ts version >= 3.9 ? "ts-expect-error" : "ts-ignore" | specify ts-comment. |
|  reportOnly | boolean | false | if true, no autofix provided even if --fix flag enable. |

### examples
with eslint config.
```js
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "tsconfig.eslint.json", // This rule require type information
  },
  plugins: [
    "with-tsc-error",
  ],
  rules: {
    "with-tsc-error/all": [
      "warn",
      {
        tsCommentType: "ts-ignore",
        reportOnly: false,
      },
    ],
  },
};
```

one liner
```
yarn eslint --no-eslintrc --fix --plugin with-tsc-error --rule '{"with-tsc-error/all": ["error", { "tsCommentType": "ts-ignore", "reportOnly": false }]}' --parser '@typescript-eslint/parser' --parser-options '{ "ecmaVersion": 2020, "sourceType": "module", "project": "tsconfig.eslint.json" }'
```

## Motivation

The typescript compiler has a variety of options to adjust the flexibility of the type system.

Especially when converting a javascript project to a typescript project, many of those options are disabled and often included quite loosely as a type system.

However, if you want to do a stricter type check later (e.g., noImplicitAny to true), it can be difficult in practice to enable all those options at once, which is more pronounced in larger projects.

This package solves those problems as a plugin for eslint.

Because it is an eslint plugin, you can multiply it by a file or change the typescript options only when eslint is running (i.e. you can tighten the options only when eslint is running).

Translated with www.DeepL.com/Translator (free version).

## Rule Details

Examples of **incorrect** code for this rule with noImplicitAny compiler option:

```ts
let a;

const b = (c, d) => c + d

function e(f, g) {
  return f / g
}
```

Examples of **correct** code for this rule:

```ts
let a: string

const b = (c: number, d: number) => c + d

function e(f: number, g: number) {
  return f / g
}
```
