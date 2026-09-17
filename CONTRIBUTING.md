# Contributing to raindrops-on-roses

Thank you for your interest in contributing! ❤️ This document provides guidelines and instructions for contributing.

> [!IMPORTANT]
> Please be respectful and constructive in all interactions. We aim to maintain a welcoming environment for all contributors.
> [👉 Read more](./CODE_OF_CONDUCT.md)

## Goals

The goal of `raindrops-on-roses` is to build a community-driven package of original and handy TS utility functions, human readable and written with care, to preserve and share technical know-how.

### Core values

- Human and community first
- Readability and maintainability

### Target audience

`raindrops-on-roses` is built for all developers, by open-source developers.

## Table of contents

- [Getting started](#getting-started)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
- [Development workflow](#development-workflow)
  - [Available commands](#available-commands)
  - [Adding a new function](#adding-a-new-function)
    - [Boilerplate](#boilerplate)
    - [Tests should fail at the start](#tests-should-fail-at-the-start)
    - [Testing](#testing)
- [Submitting changes](#submitting-changes)
  - [Before submitting](#before-submitting)
  - [Pull request process](#pull-request-process)
  - [Commit messages and PR titles](#commit-messages-and-pr-titles)
- [Using AI](#using-ai)
- [Questions](#questions)
- [License](#license)

### Setup

1. fork and clone the repository
2. install dependencies

   ```bash
   npm i
   ```

3. run tests, all should pass

   ```bash
   npm run test

   ```

## Development workflow

### Available commands

```bash
npm run add:function <function name> # Add a new function
npm run test                         # Run all the tests
npm run test:w                       # Run tests in watch mode
npm run coverage                     # Run test coverage
```

### Adding a new function

#### Boilerplate

Create the boilerplate files and configuration using the `add:function` script

```bash
npm run add:function myFunction
```

This will prompt you to choose between `pure` and `composed`:

- pure: single unit, without side effects
- composed: a function usign existing pure units

Then you will be prompted to choose a category, or to create one.

After choosing the category a sub-package directory will be generated, with the following structure:

```text
packages/
├── pure/
│   └── numbers/
│       └── my-function/
│           ├── src/
│           │   └── index.ts
│           ├── test/
│           │   └── index.test.ts
│           ├── package.json
│           ├── tsconfig.json
│           └── vite.config.ts

```

#### Tests should fail at the start

    ```bash
    npm run test
    ```

Should fail because:

- The function requires a JsDoc documentation
- The function requires a suite of tests to be implemented

#### Testing

The testing file is ready-made, and contains:

- a first assertion that must remain, and checks if the function has a valid JsDoc
- a second assertion, throwing, to be replaced with your suite of tests
- test coverage must be 100% for a PR to be merged

## Submitting changes

### Before submitting

1. ensure your code is documented properly
2. run linting: `npm run lint:fix`
3. run tests: `npm run test`
4. build: `npm run build`
5. run type checking: `npm run typecheck`
6. run coverage and ensure it is 100%: `npm run coverage`

### Pull request process

1. create a feature branch from `main`
2. make your changes with clear, descriptive commits
3. push your branch and open a pull request
4. ensure CI checks pass (lint, type check, tests)
5. request review from maintainers

### Commit messages and PR titles

Write clear, concise PR titles that explain the "why" behind changes.

We use [Conventional Commits](https://www.conventionalcommits.org/). Since we squash on merge, the PR title becomes the commit message in `main`, so it's important to get it right.

Format: `type(scope): description`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scopes (optional):** `config`, `deps`, `docs`, `cli`, can also be a sub package (for example `clamp`)

**Examples:**

- `fix(perf): break loop when condition is met`
- `feat: add myFunction utility`
- `fix(docs): typo`
- `chore(deps): update vite to v8`

Where front end changes are made, please include before and after screenshots in your pull request description.

> [!NOTE]
> Use lowercase letters in your pull request title. Individual commit messages within your PR don't need to follow this format since they'll be squashed.

## Using AI

You're welcome to use AI tools to help you contribute. But there are two important ground rules:

### 1. Never let an LLM speak for you

When you write a comment, issue, or PR description, use your own words. Grammar and spelling don't matter &ndash; real connection does. AI-generated summaries tend to be long-winded, dense, and often inaccurate. Simplicity is an art. The goal is not to sound impressive, but to communicate clearly.

### 2. Never let an LLM think for you

Feel free to use AI to write code, tests, or point you in the right direction. But always understand what it's written before contributing it. Take personal responsibility for your contributions. Don't say "ChatGPT says..." &ndash; tell us what _you_ think.

For more context, see [Using AI in open source](https://roe.dev/blog/using-ai-in-open-source).

## Questions?

If you have questions or need help, feel free to open an issue for discussion or join our Discord server (Raindrops on Roses).

## License

By contributing to raindrops-on-roses, you agree that your contributions will be licensed under the [MIT License](LICENSE).
