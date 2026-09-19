# @raindrops-on-roses/nice-number

`niceNumber` utility from [raindrops-on-roses](https://www.npmjs.com/package/raindrops-on-roses).

Returns a human-friendly number based on the `1`, `2`, `5`, `10` progression, scaled to the appropriate power of ten. It is useful for chart scales, tick intervals, and similar numeric steps.

## Install

```sh
npm install @raindrops-on-roses/nice-number
```

## Usage

```ts
import { niceNumber } from "@raindrops-on-roses/nice-number";

niceNumber(37); // 50
niceNumber(23, true); // 20
```

By default, the result is rounded upward so it is greater than or equal to the provided range.

When `round` is `true`, the nearest human-friendly value is returned instead.

```ts
niceNumber(101); // 200
niceNumber(149, true); // 100
niceNumber(150, true); // 200
niceNumber(0.15, true); // 0.2
```

## API

```ts
niceNumber(range: number, round?: boolean): number
```

### Parameters

- `range` - The positive numeric range to convert to a human-friendly value.
- `round` - Whether to return the nearest human-friendly value instead of rounding upward. Defaults to `false`.

### Returns

A human-friendly number expressed as `1`, `2`, `5`, or `10` times a power of ten.

## With the complete library

You can also install the complete `raindrops-on-roses` package:

```sh
npm install raindrops-on-roses
```

and import `niceNumber` from the umbrella package:

```ts
import { niceNumber } from "raindrops-on-roses";
```

## Lore

> We talk about being in our 30s, and our 40s, and our 50s. We don’t talk about being in our 37s.

## Repository

[graphieros/raindrops-on-roses](https://github.com/graphieros/raindrops-on-roses)
