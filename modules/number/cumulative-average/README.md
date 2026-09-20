# @raindrops-on-roses/number-cumulative-average

Calculates the cumulative average of the provided values.

`cumulativeAverage` utility from [raindrops-on-roses](https://www.npmjs.com/package/raindrops-on-roses).

## Install

```sh
npm install @raindrops-on-roses/number-cumulative-average
```

## Usage

```ts
import { cumulativeAverage } from "@raindrops-on-roses/number-cumulative-average";

cumulativeAverage({
  values: [10, 20, 30, 40],
}); // [10, 15, 20, 25]

cumulativeAverage({
  values: [10, null, 20, undefined, 30],
}); // [10, null, 15, undefined, 20]

cumulativeAverage({
  values: [10, null, 20, undefined, 30],
  config: {
    keepInvalid: false,
  },
}); // [10, 15, 20]
```

### Parameters

- `values` - The numeric series to process
- `config.keepInvalid` - Keep invalid values in the output
- `config.convertInvalidToZero` - Converts invalid values to 0 if `config.keepInvalid` is `true`

## With the complete library

You can also install the complete library:

```sh
npm install raindrops-on-roses
```

and import the utility from the umbrella package:

```ts
import { cumulativeAverage } from "raindrops-on-roses";
```

## Lore

Every new experience changes ever so slightly the average that came before.

## Repository

[graphieros/raindrops-on-roses](https://github.com/graphieros/raindrops-on-roses)
