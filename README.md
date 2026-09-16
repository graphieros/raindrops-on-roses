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

- Clone the repository and install dependencies:

  ```sh
  npm install
  ```

- Use the generator to create a new function:

  ```sh
  npm run add:function -- <functionName>
  ```

- The generator will prompt you to:
  - choose whether the function is `pure` or `composed`
  - choose an existing category, such as `numbers`, or create a new one

- Each function is created as its own npm workspace package. The generator creates:
  - `src/index.ts` for the implementation
  - `test/index.test.ts` for tests
  - `package.json` for the individual npm package
  - `tsconfig.json`
  - `vite.config.ts`
  - the corresponding dependency and export in the `raindrops-on-roses` umbrella package

- New utility packages start at version `0.0.0`.

- After generating a function, install again so npm registers the new workspace:

  ```sh
  npm install
  ```

- The generated tests are intentionally incomplete and should initially fail.

- Implement and document the function, then replace the placeholder test with meaningful test cases.

- Every function must:
  - be fully typed
  - have JSDoc documentation
  - have 100% test coverage

- Run the full test suite:

  ```sh
  npm run test
  ```

- Check coverage:

  ```sh
  npm run coverage
  ```

- Verify that every package builds successfully:

  ```sh
  npm run build
  ```

You should not need to manually add the function to the umbrella `package.json`, `index.ts`, or Vite configuration. The generator handles this automatically.

Do not attempt to publish packages created as part of a contribution. Publishing and versioning are handled by the maintainers as part of the release process.

### File system

There are two types of functions:

- **pure**: an independent unit with no side effects and no dependency on other `raindrops-on-roses` utilities
- **composed**: a function built by composing existing utilities

Every utility is also an independent npm workspace package.

For example, the `clamp` utility is stored as:

```text
packages/
├── pure/
│   └── numbers/
│       └── clamp/
│           ├── src/
│           │   └── index.ts
│           ├── test/
│           │   └── index.test.ts
│           ├── package.json
│           ├── tsconfig.json
│           └── vite.config.ts
│
└── raindrops-on-roses/
    ├── src/
    │   └── index.ts
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

The directory hierarchy describes the kind of utility:

```text
packages/<type>/<category>/<utility>/
```

For example:

```text
packages/pure/numbers/clamp/
packages/pure/numbers/numbers-from-seed/
```

The utility directory name uses kebab-case, while the exported JavaScript function keeps its normal camelCase name:

```text
numbersFromSeed
↓
packages/pure/numbers/numbers-from-seed/
↓
@aleclloydprobert/numbers-from-seed
```

Each utility package can be installed independently:

```sh
npm install @aleclloydprobert/clamp
```

and imported directly:

```ts
import { clamp } from "@aleclloydprobert/clamp";
```

The same utility is also re-exported by the umbrella package:

```ts
import { clamp } from "raindrops-on-roses";
```

The umbrella package depends on the individual utility packages and provides the complete library API while remaining tree-shakeable.

When using:

```sh
npm run add:function -- <functionName>
```

you will be prompted to select:

1. `pure` or `composed`
2. an existing category or a new category

The generator then creates the complete workspace package in the appropriate location.

### Show your love

- In the JsDoc above your function, feel free to add a quote you like. It should ideally be related to the function.
