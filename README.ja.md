# eslint-plugin-with-tsc-error

## install

```bash
npm install --save-dev eslint-plugin-with-tsc-error @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

```bash
yarn add -D eslint-plugin-with-tsc-error @typescript-eslint/parser @typescript-eslint/eslint-plugin
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


## Motivation

typescriptコンパイラには様々なオプションが有り、型システムの柔軟さを調整することができます
特にjavascriptプロジェクトをtypescriptのプロジェクトに変換するの際にはそれらのオプションの多くを無効にし、型システムとしてはかなりゆるく入れることが多いです

ただ、後からより厳密な型チェックをする(例えばnoImplicitAnyをtrueにする)事を考えた際に、それらのオプションを一度に有効にするのは現実的に難しい場合が有り、それは大きなプロジェクトになればなるほど顕著です

このパッケージはeslintのプラグインとしてそれらの問題を解決します

eslintプラグインであるがためにファイルごとに掛けたり、eslintの実行時のみtypescriptのオプションを変更する事ができます(つまり、eslintの実行タイミングのみオプションを厳しくすることができます)

## Rule Details

 noImplicitAny オプションをonにした状態での **違反** コード:

```ts
let a;

const b = (c, d) => c + d

function e(f, g) {
  return f / g
}
```

 noImplicitAny オプションをonにした状態での **正しい** コード:

```ts
let a: string

const b = (c: number, d: number) => c + d

function e(f: number, g: number) {
  return f / g
}
```
