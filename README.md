# raindrops-on-roses

[![Open on npmx.dev](https://npmx.dev/api/registry/badge/version/raindrops-on-roses)](https://npmx.dev/package/raindrops-on-roses)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/types/raindrops-on-roses)](https://npmx.dev/package/raindrops-on-roses)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/downloads/raindrops-on-roses)](https://npmx.dev/package/raindrops-on-roses)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/likes/raindrops-on-roses)](https://npmx.dev/package/raindrops-on-roses)

> A collection of delicately crafted TS functions from passionate OSS maintainers, 100% tested and made with love.

<img width="1280" height="640" alt="image" src="https://github.com/user-attachments/assets/cba604e3-b767-41b7-bb3b-21b07fc9d0b3" />

_When the dog bites\
When the bee stings\
When I'm feeling sad\
I simply remember my favourite things\
And then I don't feel so bad_

## Install

```sh
npm install raindrops-on-roses
```

## Usage

```ts
import { clamp } from "raindrops-on-roses";
```

## Contribute

`raindrops-on-roses` is an open-source library, and welcomes contributions from humans. If like us you love crafting beautiful and useful utilities, you can open a PR!

### Rules regarding LLM usage

- LLM usage is permitted for coding, provided you can explain what the code actually does.
- LLM usage in PR and issue descriptions is **not permitted**. If so, they will be closed swiftly. We believe open-source must put community first, and communicating with your own voice is critical. You can communicate in your own language, you can make mistakes and typos in your messages.

### Adding a new function

- clone the repo and `npm i`
- use the `npm run add:function <function name>` script to create boilerplates for:
  - the function
  - its test
- After creating the boilerplate, running `npm run test` should fail.
- Write your function and make the tests pass
- The function must be documented (JsDoc) and typed
- Test coverage of your function must be 100%. Run `npm run coverage` to check
- Reference the path of the function in the package.json, vite.config
- export the function in index.ts

### File system

There are 2 types of functions:

- **pure**: independant unit, with no side effects
- **combined**: a composition of already existing pure functions

Using the boilerplate with `npm run add:function <function name>`, you will be prompted:

- to select the pure or combined directory
- to use an exisitng sub directory or create a new one

```text
├─ src/
│  ├─ pure/
│  │  └─ numbers/
│  │    └─ clamp.ts
│  └─ index.ts
├─ test/
│  └─ pure/
│     └─ numbers/
│       └─ clamp.test.ts
```

The test directory must follow the same structure as the src directory.

### Show your love

- In the JsDoc above your function, feel free to add a quote you like. It should ideally be related to the function.
