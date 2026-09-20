# @raindrops-on-roses/number-lttb

Downsamples a numeric data series using the Largest-Triangle-Three-Buckets algorithm while preserving the first and last data points.

`lttb` utility from [raindrops-on-roses](https://www.npmjs.com/package/raindrops-on-roses).

## Install

```sh
npm install @raindrops-on-roses/number-lttb
```

## Usage

```ts
import { lttb } from "@raindrops-on-roses/number-lttb";

lttb({
  data: [5, 1, 2, 4, 6, 9],
  threshold: 4,
}); // [5, 4, 9, 9]
```

### Parameters

- `data` - The numeric series to downsample
- `threshold` - The max number of data points to retain

## With the complete library

You can also install the complete library:

```sh
npm install raindrops-on-roses
```

and import the utility from the umbrella package:

```ts
import { lttb } from "raindrops-on-roses";
```

## Lore

A point appears.
A second point as a mirror sends a distance.
There love makes a triangle.

## Repository

[graphieros/raindrops-on-roses](https://github.com/graphieros/raindrops-on-roses)
