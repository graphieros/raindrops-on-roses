# Maintainer publish checklist

Private checklist for publishing a contributed utility in `raindrops-on-roses`.

Use this after a contributor adds a function and you decide it should be released.

---

## 1. Review the contribution

Before versioning anything, make sure the contributed module is acceptable.

Check that the module lives under:

```text
modules/<path>/<utility>/
├── src/
│   └── index.ts
├── test/
│   └── index.test.ts
└── README.md
```

Confirm that:

- the implementation is fully typed
- the function has valid JSDoc
- the module README is complete
- the tests are meaningful
- coverage remains at 100%
- no generated files under `packages/` were edited manually
- the module path is the one you want to expose publicly

Run:

```bash
npm run lint
npm run test
npm run coverage
npm run typecheck
```

If needed:

```bash
npm run lint:fix
```

---

## 2. Regenerate packages

Generate the npm workspace packages from the module tree:

```bash
npm run assemble
```

Then refresh workspace links:

```bash
npm install
```

Build everything:

```bash
npm run build
```

The build script should build packages in dependency order:

```text
leaf package
    ↓
aggregate package(s)
    ↓
raindrops-on-roses
```

Do not edit generated files under `packages/` manually.

---

## 3. Check which npm packages the new module creates

The module path determines the package names.

For example:

```text
modules/vector/poor/distance
```

creates or participates in:

```text
@aleclloydprobert/vector-poor-distance
@aleclloydprobert/vector-poor
@aleclloydprobert/vector
raindrops-on-roses
```

A new leaf can therefore introduce:

- one new leaf package
- one or more new aggregate packages
- a new version of `raindrops-on-roses`

Existing packages only need a new version when the release graph says they changed.

---

## 4. Prepare versions

Run:

```bash
npm run release
```

Select the contributed leaf module.

Choose:

```text
patch
minor
major
```

The release script updates `packages.versions.json` and propagates the bump through dependent aggregate packages and `raindrops-on-roses`.

Example:

```text
number/clamp
    ↓
@aleclloydprobert/number-clamp
    ↓
@aleclloydprobert/number
    ↓
raindrops-on-roses
```

After confirming the release plan, the script should:

- update `packages.versions.json`
- rerun assembly
- update `package-lock.json`

Check the resulting versions before continuing.

---

## 5. Run the final validation

After the release script:

```bash
npm run lint
npm run test
npm run coverage
npm run typecheck
npm run build
```

Everything should pass before publishing.

---

## 6. Bootstrap brand-new npm package names

This is required only when the contribution introduces npm package names that have never existed before.

First inspect the plan:

```bash
npm run bootstrap:dry
```

If new package names are detected, bootstrap them:

```bash
npm run bootstrap
```

New package names must exist on npm before Trusted Publishing can be configured.

If the bootstrap helper has trouble with npm 2FA / `npm trust`, do the one-time bootstrap manually.

Publish new packages in dependency order.

Example:

```bash
npm publish --workspace=@aleclloydprobert/vector-poor-distance --access public
npm publish --workspace=@aleclloydprobert/vector-poor --access public
npm publish --workspace=@aleclloydprobert/vector --access public
```

Then configure Trusted Publishing for each new package:

```bash
npm trust github @aleclloydprobert/vector-poor-distance \
  --file publish.yml \
  --repo graphieros/raindrops-on-roses \
  --env npm \
  --allow-publish
```

Repeat for every new aggregate package.

You only need to bootstrap a package name once.

Future versions are published through GitHub Actions.

---

## 7. Inspect the staged changes

Before committing:

```bash
git status
```

Make sure the intended release changes are staged, including where applicable:

```text
modules/...
packages/...
packages.versions.json
package-lock.json
README / documentation changes
scripts / config changes
```

Remember that `packages/` is generated, but it is still part of the release state if the repository tracks it.

---

## 8. Commit before tagging

Commit the complete release state first.

Example:

```bash
git add .
git commit -m "feat(number): add <functionName> utility"
git push
```

Do not create the version tag before the release commit exists.

---

## 9. Tag the umbrella version

Read the generated umbrella version:

```bash
node -p "require('./packages/raindrops-on-roses/package.json').version"
```

If it prints, for example:

```text
0.0.6
```

create that exact tag:

```bash
git tag v0.0.6
git push origin v0.0.6
```

The tag triggers the publish workflow.

---

## 10. Let GitHub Actions publish the release

The publish workflow should:

```text
install
    ↓
test
    ↓
build
    ↓
publish unpublished versions in dependency order
```

`scripts/publish.mjs` skips package versions that already exist on npm.

This is important after bootstrapping because the newly created package versions may already have been published manually.

The expected order is:

```text
leaf packages
    ↓
aggregate packages
    ↓
raindrops-on-roses
```

---

## 11. Verify the release on npm

Check the umbrella version:

```bash
npm view raindrops-on-roses version
```

Check its dependencies:

```bash
npm view raindrops-on-roses dependencies
```

Check the new leaf package:

```bash
npm view @aleclloydprobert/<package-name> version
```

For a new aggregate package:

```bash
npm view @aleclloydprobert/<aggregate-name> version
npm view @aleclloydprobert/<aggregate-name> dependencies
```

Confirm that:

- the expected versions are published
- aggregate dependencies point to the expected versions
- `raindrops-on-roses` points to the expected top-level aggregate versions
- README files appear correctly on npm

---

# Short version

For an ordinary contribution that does **not** introduce a brand-new npm package name:

```bash
npm run lint
npm run test
npm run coverage
npm run typecheck

npm run assemble
npm install
npm run build

npm run release

npm run lint
npm run test
npm run coverage
npm run typecheck
npm run build

git add .
git commit -m "feat(...): ..."
git push

git tag v<umbrella-version>
git push origin v<umbrella-version>
```

For a contribution that **does** introduce new npm package names, insert this before committing/tagging:

```bash
npm run bootstrap:dry
npm run bootstrap
```

If the automated trust setup fails because of npm authentication, publish/configure the new package names manually once, then continue with the normal tagged release flow.

---

# Mental model

```text
contributor edits modules/
        ↓
review + tests
        ↓
assemble generated packages
        ↓
release chooses versions
        ↓
bootstrap only brand-new package names
        ↓
commit release state
        ↓
tag umbrella version
        ↓
GitHub Actions publishes missing versions
        ↓
verify npm
```
