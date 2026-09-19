# @raindrops-on-roses/clamp

`clamp` utility from [raindrops-on-roses](https://www.npmjs.com/package/raindrops-on-roses).

Constrains a numeric value between a minimum and maximum bound.

## Install

```sh
npm install @raindrops-on-roses/clamp
```

## Usage

```ts
import { clamp } from "@raindrops-on-roses/clamp";

clamp(5, 0, 10); // 5
clamp(-5, 0, 10); // 0
clamp(15, 0, 10); // 10
```

## API

```ts
clamp(value: number, min: number, max: number): number
```

### Parameters

- `value` — The value to clamp.
- `min` — The minimum value.
- `max` — The maximum value.

### Returns

The clamped value, between `min` and `max`.

## With the complete library

You can also install the complete `raindrops-on-roses` package:

```sh
npm install raindrops-on-roses
```

and import `clamp` from the umbrella package:

```ts
import { clamp } from "raindrops-on-roses";
```

## Lore

Procrustes is an innkeeper who forces his guests to sleep in a magical bed whose size fits no one. Either it is too short, in which case Procrustes cuts off whatever parts of the traveler stick out; or it is too long, in which case the innkeeper stretches the limbs of those who lie in it until they match the size of the bed.

## Repository

[graphieros/raindrops-on-roses](https://github.com/graphieros/raindrops-on-roses)
