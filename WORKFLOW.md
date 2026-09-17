This workflow is intended for mantainers with publishign rights, and currently contains some manual operations.

## Steps when addding a new function

0. build

```bash
npm run build --workspace=@aleclloydprobert/[function name]
```

1. Verify

```bash
npm install
npm run test
npm run build
```

2. Manually bootsrap-publish

```bash
npm publish --workspace=@aleclloydprobert/[function name] --access public
```

Now npm contains @aleclloydprobert/[function name]@0.0.0

3. Configure trusted publishing on npm

4. bump the umbrella version (/raindrops-on-roses)

5. build

```bash
npm install
npm run test
npm run build
```
