# eslint-plugin-with-tsc-error

## install

type anotate

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
    project: "tsconfig.json", // This rule require type infomation
  },
  plugins: [
    "eslint-plugin-with-tsc-error",
  ],
  rules: {
    "eslint-plugin-with-tsc-error",
  },
};
```


## Motivation

In cases when the noInplicitAny CompileOption off ts environment, function or variable declaration are sometime inferred to `any` type.

Since `any` type is very dangerous (it brake TypeScript typesystem..), most of TypeScript developer may want to enable `noImplicitAny` compiler option.

So, some project, like gradually converting from js to ts all project files, must annotate implicit any `before` noImplicitAny to true.

But, sometime difficult.

To detect no implicit any and destroy it gradually, eslint is best solution of that. But, there is no good rule for this problem. (typedef rule can't detect inferred type information.)

## Rule Details

Examples of **incorrect** code for this rule:

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
