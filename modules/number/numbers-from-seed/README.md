# @aleclloydprobert/numbers-from-seed

`numbersFromSeed` utility from [raindrops-on-roses](https://www.npmjs.com/package/raindrops-on-roses).

Generates a deterministic array of pseudo-random numbers from a seed. Using the same seed and options always produces the same sequence.

## Install

```sh
npm install @aleclloydprobert/numbers-from-seed
```

## Usage

```ts
import { numbersFromSeed } from "@aleclloydprobert/numbers-from-seed";

numbersFromSeed({
  count: 5,
  seed: "example",
});
// Deterministic sequence for this seed and configuration
```

You can control the generated range, rounding behavior, and sort direction:

```ts
numbersFromSeed({
  count: 5,
  seed: "example",
  trend: "up",
  multiplicator: 100,
});
// Returns the same sorted sequence every time

numbersFromSeed({
  count: 3,
  seed: 42,
  multiplicator: 10,
  rounded: false,
});
// Returns deterministic decimal values between 0 and 10
```

## API

```ts
numbersFromSeed({
  count,
  seed,
  trend,
  multiplicator,
  rounded,
}: {
  count: number;
  seed?: string | number;
  trend?: "up" | "down" | null;
  multiplicator?: number;
  rounded?: boolean;
}): number[]
```

### Parameters

- `count` - Number of values to generate.
- `seed` - Seed used to generate the deterministic sequence.
- `trend` - Optional sorting direction. Use `"up"` for ascending order, `"down"` for descending order, or `null` to keep the generated order.
- `multiplicator` - Multiplier applied to each generated value. Defaults to `1`.
- `rounded` - Whether generated values should be rounded to integers. Defaults to `true`.

### Returns

An array of deterministic pseudo-random numbers.

Values are generated between `0` and `multiplicator`, then optionally rounded and sorted.

## Deterministic output

The same seed and configuration always produce the same sequence:

```ts
const first = numbersFromSeed({
  count: 5,
  seed: "example",
});

const second = numbersFromSeed({
  count: 5,
  seed: "example",
});

// first and second contain the same values in the same order
```

## With the complete library

You can also install the complete `raindrops-on-roses` package:

```sh
npm install raindrops-on-roses
```

and import `numbersFromSeed` from the umbrella package:

```ts
import { numbersFromSeed } from "raindrops-on-roses";
```

## Lore

> All the flowers of all the tomorrows are in the seeds of today.

(Native American proverb)

## Repository

[graphieros/raindrops-on-roses](https://github.com/graphieros/raindrops-on-roses)
