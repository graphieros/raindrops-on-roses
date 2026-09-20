import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { cumulativeAverage } from "../src/index.js";

describe("cumulativeAverage", () => {
  // NOTE: do not delete this test
  it("has valid documentation", () => {
    const source = readFileSync(
      new URL("../src/index.ts", import.meta.url),
      "utf8",
    );

    const declaration = "export function cumulativeAverage";
    const declarationIndex = source.indexOf(declaration);

    if (declarationIndex === -1) {
      throw new Error(
        'Could not find "cumulativeAverage" function declaration.',
      );
    }

    const beforeDeclaration = source.slice(0, declarationIndex);

    const match = beforeDeclaration.match(/\/\*\*([\s\S]*?)\*\/\s*$/);

    if (!match) {
      throw new Error('Missing JSDoc documentation above "cumulativeAverage".');
    }

    const documentation = match[1].replace(/^\s*\*\s?/gm, "").trim();

    if (!documentation) {
      throw new Error('Documentation for "cumulativeAverage" cannot be empty.');
    }

    if (/\bTODO\b/i.test(documentation)) {
      throw new Error(
        'Invalid documentation for "cumulativeAverage": replace the TODO placeholder with a description of the function.',
      );
    }
  });

  // ---------------------------------- START YOUR TESTS HERE --------------------------------------

  it("returns cumulative averages for valid numbers", () => {
    expect(
      cumulativeAverage({
        values: [10, 20, 30, 40],
      }),
    ).toEqual([10, 15, 20, 25]);
  });

  it("returns an empty array when no values are provided", () => {
    expect(
      cumulativeAverage({
        values: [],
      }),
    ).toEqual([]);
  });

  it("keeps invalid values by default without including them in the average", () => {
    expect(
      cumulativeAverage({
        values: [10, null, 20, undefined, 30],
      }),
    ).toEqual([10, null, 15, undefined, 20]);
  });

  it("removes invalid values when keepInvalid is false", () => {
    expect(
      cumulativeAverage({
        values: [10, null, 20, undefined, 30],
        config: {
          keepInvalid: false,
        },
      }),
    ).toEqual([10, 15, 20]);
  });

  it("converts invalid values to zero when configured", () => {
    expect(
      cumulativeAverage({
        values: [10, null, 20],
        config: {
          keepInvalid: true,
          convertInvalidToZero: true,
        },
      }),
    ).toEqual([10, 5, 10]);
  });

  it("ignores convertInvalidToZero when keepInvalid is false", () => {
    expect(
      cumulativeAverage({
        values: [10, null, 20],
        config: {
          keepInvalid: false,
          convertInvalidToZero: true,
        },
      }),
    ).toEqual([10, 15]);
  });

  it("treats NaN and infinities as invalid values", () => {
    expect(
      cumulativeAverage({
        values: [
          10,
          Number.NaN,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          20,
        ],
      }),
    ).toEqual([
      10,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      15,
    ]);
  });

  it("treats non-number values as invalid", () => {
    expect(
      cumulativeAverage({
        values: [10, "20", false, {}, 20],
      }),
    ).toEqual([10, "20", false, {}, 15]);
  });

  it("includes consecutive converted invalid values in the count", () => {
    expect(
      cumulativeAverage({
        values: [12, null, undefined, 12],
        config: {
          convertInvalidToZero: true,
        },
      }),
    ).toEqual([12, 6, 4, 6]);
  });

  it("handles zero and negative numbers", () => {
    expect(
      cumulativeAverage({
        values: [0, -10, 10],
      }),
    ).toEqual([0, -5, 0]);
  });
});
