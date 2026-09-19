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
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
- [Development workflow](#development-workflow)
  - [Available commands](#available-commands)
  - [Repository architecture](#repository-architecture)
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

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm

### Setup

1. Fork and clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the tests. All existing tests should pass:

   ```bash
   npm run test
   ```

4. Build the generated packages:

   ```bash
   npm run build
   ```

## Development workflow

### Available commands

```bash
npm run add:function -- <functionName> # Add a new function
npm run assemble                      # Regenerate npm workspaces from modules
npm run test                          # Run all tests
npm run test:w                        # Run tests in watch mode
npm run coverage                      # Run test coverage
npm run lint                          # Run linting
npm run lint:fix                      # Run linting and apply fixes
npm run typecheck                     # Run TypeScript checks
npm run build                         # Build packages in dependency order
```

### Repository architecture

The repository separates **human-authored modules** from **generated npm packages**.

`modules/` is the source of truth:

```text
modules/
└── number/
    ├── clamp/
    │   ├── src/
    │   │   └── index.ts
    │   ├── test/
    │   │   └── index.test.ts
    │   └── README.md
    ├── nice-number/
    └── numbers-from-seed/
```

`packages/` contains generated npm workspaces:

```text
packages/
├── number/
├── number-clamp/
├── number-nice-number/
├── number-numbers-from-seed/
└── raindrops-on-roses/
```

Do not manually edit generated files under `packages/`. They are recreated by:

```bash
npm run assemble
```

A module path determines its package name:

```text
number/clamp
→ @raindrops-on-roses/number-clamp

vector/poor/distance
→ @raindrops-on-roses/vector-poor-distance
```

Parent paths automatically become aggregate packages:

```text
modules/
└── vector/
    └── poor/
        ├── distance/
        └── mid-point/
```

produces:

```text
@raindrops-on-roses/vector
@raindrops-on-roses/vector-poor
@raindrops-on-roses/vector-poor-distance
@raindrops-on-roses/vector-poor-mid-point
```

The `raindrops-on-roses` package is the root aggregate and re-exports the top-level package groups.

### Adding a new function

#### Boilerplate

Create the boilerplate using:

```bash
npm run add:function -- myFunction
```

The generator will prompt you to:

1. choose an existing module path, or
2. create a new module path such as `vector/poor`

For example, creating `distance` under `vector/poor` creates:

```text
modules/
└── vector/
    └── poor/
        └── distance/
            ├── src/
            │   └── index.ts
            ├── test/
            │   └── index.test.ts
            └── README.md
```

The generator then runs the package assembler so the corresponding npm packages and aggregate packages can be generated automatically.

The module itself contains only files that contributors maintain directly:

- `src/index.ts` — implementation
- `test/index.test.ts` — tests
- `README.md` — package documentation

Package metadata, TypeScript configuration, Vite configuration, aggregate exports, and umbrella dependencies are generated elsewhere.

#### Tests should fail at the start

Run:

```bash
npm run test
```

The newly generated test should initially fail because:

- the function requires valid JSDoc documentation
- real test cases still need to replace the placeholder test

#### Testing

The generated test file contains:

- a documentation test that must remain and verifies that the function has valid JSDoc
- a placeholder failing test that must be replaced with meaningful test cases
- test coverage must be 100% for a PR to be merged

Tests run directly from `modules/`, not from generated copies under `packages/`.

## Submitting changes

### Before submitting

1. Ensure your code is documented properly and update the module `README.md`.
2. Run linting:

   ```bash
   npm run lint:fix
   ```

3. Run tests:

   ```bash
   npm run test
   ```

4. Run type checking:

   ```bash
   npm run typecheck
   ```

5. Check coverage and ensure it is 100%:

   ```bash
   npm run coverage
   ```

6. Regenerate packages:

   ```bash
   npm run assemble
   ```

7. Build all packages:

   ```bash
   npm run build
   ```

Do not manually version or publish packages as part of a contribution. Versioning, release propagation, npm bootstrapping, and publishing are handled by maintainers.

### Pull request process

1. Create a feature branch from `main`.
2. Make your changes with clear, descriptive commits.
3. Push your branch and open a pull request.
4. Ensure CI checks pass: lint, type checking, tests, coverage, and build.
5. Request review from maintainers.

### Commit messages and PR titles

Write clear, concise PR titles that explain the "why" behind changes.

We use [Conventional Commits](https://www.conventionalcommits.org/). Since we squash on merge, the PR title becomes the commit message in `main`, so it's important to get it right.

Format: `type(scope): description`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scopes (optional):** `config`, `deps`, `docs`, `cli`, or a module/package name such as `number-clamp`

**Examples:**

- `fix(perf): break loop when condition is met`
- `feat(number): add myFunction utility`
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
