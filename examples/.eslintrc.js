module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 11,
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "plugins": [
        "with-tsc-error"
    ],
    "rules": {
        "with-tsc-error/all": "error"
    }
};
