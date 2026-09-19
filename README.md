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

Install the complete library:

```sh
npm install raindrops-on-roses
```

Or install only the package you need:

```sh
npm install @raindrops-on-roses/number-clamp
```

You can also install an aggregate package:

```sh
npm install @raindrops-on-roses/number
```

## Usage

From the complete library:

```ts
import { clamp } from "raindrops-on-roses";
```

From an aggregate package:

```ts
import { clamp } from "@raindrops-on-roses/number";
```

From the smallest individual package:

```ts
import { clamp } from "@raindrops-on-roses/number-clamp";
```

## Package architecture

`raindrops-on-roses` uses a module tree as its source of truth.

Human-authored source lives in `modules/`. Publishable npm workspaces under `packages/` are generated from that tree.

```text
modules/
└── number/
    ├── clamp/
    ├── nice-number/
    └── numbers-from-seed/
```

This produces:

```text
@raindrops-on-roses/number
@raindrops-on-roses/number-clamp
@raindrops-on-roses/number-nice-number
@raindrops-on-roses/number-numbers-from-seed
raindrops-on-roses
```

Package names are derived from the module path:

```text
number
→ @raindrops-on-roses/number

number/clamp
→ @raindrops-on-roses/number-clamp

vector/poor
→ @raindrops-on-roses/vector-poor

vector/poor/distance
→ @raindrops-on-roses/vector-poor-distance
```

Parent module paths automatically become aggregate packages.

For example:

```text
modules/
└── vector/
    └── poor/
        ├── distance/
        └── mid-point/
```

generates:

```text
@raindrops-on-roses/vector
@raindrops-on-roses/vector-poor
@raindrops-on-roses/vector-poor-distance
@raindrops-on-roses/vector-poor-mid-point
```

with a dependency graph like:

```text
@raindrops-on-roses/vector
        │
        ▼
@raindrops-on-roses/vector-poor
        │
        ├── @raindrops-on-roses/vector-poor-distance
        └── @raindrops-on-roses/vector-poor-mid-point
```

The `raindrops-on-roses` package is the root aggregate and depends only on top-level aggregate packages.

## Contribute

`raindrops-on-roses` is an open-source library, and welcomes contributions from humans. If like us you love crafting beautiful and useful utilities, you can open a PR!

### Rules regarding LLM usage

- LLM usage is permitted for coding, provided you can explain what the code actually does.
- LLM usage in PR and issue descriptions is **not permitted**. If so, they will be closed swiftly. We believe open-source must put community first, and communicating with your own voice is critical. You can communicate in your own language, you can make mistakes and typos in your messages.

### Adding a new function

Clone the repository and install dependencies:

```sh
npm install
```

Use the generator:

```sh
npm run add:function -- <functionName>
```

The generator will prompt you to choose an existing module path or create a new one.

For example, adding `distance` under `vector/poor` creates:

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

The generator creates only the human-authored module. It does not manually create npm manifests, Vite configs, TypeScript configs, aggregate exports, or umbrella dependencies.

After creating the module, the package assembler generates all required npm workspaces automatically.

The generated test is intentionally incomplete and should initially fail.

Implement and document the function, then replace the placeholder test with meaningful test cases.

Every function must:

- be fully typed
- have JSDoc documentation
- have 100% test coverage

Run the test suite:

```sh
npm run test
```

Check coverage:

```sh
npm run coverage
```

Build every package:

```sh
npm run build
```

You should not manually edit generated files under `packages/`. Changes belong in `modules/` or in the repository's generation scripts.

Do not attempt to publish packages created as part of a contribution. Publishing and versioning are handled by the maintainers.

## File system

The repository separates authored modules from generated npm packages.

```text
raindrops-on-roses/
├── modules/                         # source of truth
│   └── number/
│       ├── clamp/
│       │   ├── src/
│       │   │   └── index.ts
│       │   ├── test/
│       │   │   └── index.test.ts
│       │   └── README.md
│       ├── nice-number/
│       └── numbers-from-seed/
│
├── packages/                        # generated npm workspaces
│   ├── number/
│   ├── number-clamp/
│   ├── number-nice-number/
│   ├── number-numbers-from-seed/
│   └── raindrops-on-roses/
│
├── config/
│   └── vite.library.ts
│
├── scripts/
│   ├── assemble.mjs
│   ├── bootstrap.mjs
│   ├── build.mjs
│   ├── droplet.mjs
│   ├── publish.mjs
│   └── release.mjs
│
├── packages.config.mjs
├── packages.versions.json
├── package.json
└── tsconfig.base.json
```

### Authored modules

Each leaf module contains only the things contributors maintain directly:

```text
modules/<path>/<utility>/
├── src/
│   └── index.ts
├── test/
│   └── index.test.ts
└── README.md
```

For example:

```text
modules/number/clamp/
modules/number/nice-number/
modules/number/numbers-from-seed/
```

The exported JavaScript function keeps its normal camelCase name while the directory uses kebab-case:

```text
numbersFromSeed
↓
modules/number/numbers-from-seed/
↓
@raindrops-on-roses/number-numbers-from-seed
```

### Generated packages

Run:

```sh
npm run assemble
```

to regenerate npm workspaces from the module tree.

Generated packages contain npm/build infrastructure such as:

```text
package.json
tsconfig.json
vite.config.ts
src/index.ts
README.md
.raindrops-generated
```

Aggregate package sources are generated as re-exports of their direct child packages.

For example:

```ts
export * from "@raindrops-on-roses/number-clamp";
export * from "@raindrops-on-roses/number-nice-number";
export * from "@raindrops-on-roses/number-numbers-from-seed";
```

The umbrella package is generated from top-level aggregates, for example:

```ts
export * from "@raindrops-on-roses/number";
```

### Build order

Packages are built in dependency order by:

```sh
npm run build
```

Leaf packages build first, then aggregates, then the umbrella package.

For example:

```text
@raindrops-on-roses/number-clamp
        ↓
@raindrops-on-roses/number
        ↓
raindrops-on-roses
```

### Versions and releases

Generated `package.json` files are not the source of truth for package versions.

Versions are stored in:

```text
packages.versions.json
```

Prepare a release with:

```sh
npm run release
```

The release script lets maintainers select changed leaf modules and choose `patch`, `minor`, or `major`.

Version changes propagate through dependent aggregates automatically.

For example:

```text
number/clamp changes
        ↓
@raindrops-on-roses/number-clamp
        ↓
@raindrops-on-roses/number
        ↓
raindrops-on-roses
```

Unchanged branches keep their existing versions.

### Publishing

Publishing is dependency-aware and skips package versions that already exist on npm.

The publish order is:

```text
leaf packages
    ↓
aggregate packages
    ↓
raindrops-on-roses
```

Normal releases are published through GitHub Actions with npm Trusted Publishing.

When a brand-new module path introduces npm package names that have never existed before, maintainers can inspect the bootstrap plan with:

```sh
npm run bootstrap:dry
```

and then bootstrap the new package names with:

```sh
npm run bootstrap
```

The bootstrap script publishes new package names once and configures Trusted Publishing for future CI releases.

### Package levels

Consumers can choose how much of the library they want to install.

Individual utility:

```sh
npm install @raindrops-on-roses/number-clamp
```

```ts
import { clamp } from "@raindrops-on-roses/number-clamp";
```

Aggregate:

```sh
npm install @raindrops-on-roses/number
```

```ts
import { clamp, niceNumber, numbersFromSeed } from "@raindrops-on-roses/number";
```

Complete library:

```sh
npm install raindrops-on-roses
```

```ts
import { clamp, niceNumber, numbersFromSeed } from "raindrops-on-roses";
```

## Show your love

- In the JsDoc above your function, feel free to add a quote you like. It should ideally be related to the function.
