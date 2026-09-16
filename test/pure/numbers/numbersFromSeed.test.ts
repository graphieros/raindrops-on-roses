import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { numbersFromSeed } from "../../../src/pure/numbers/numbersFromSeed.js";

describe("numbersFromSeed", () => {
  // NOTE: do not delete this test
  it("has valid documentation", () => {
    const source = readFileSync(
      new URL("../../../src/pure/numbers/numbersFromSeed.ts", import.meta.url),
      "utf8",
    );

    const declaration = "export function numbersFromSeed";
    const declarationIndex = source.indexOf(declaration);

    if (declarationIndex === -1) {
      throw new Error('Could not find "numbersFromSeed" function declaration.');
    }

    const beforeDeclaration = source.slice(0, declarationIndex);
    const match = beforeDeclaration.match(/\/\*\*([\s\S]*?)\*\/\s*$/);

    if (!match) {
      throw new Error('Missing JSDoc documentation above "numbersFromSeed".');
    }

    const documentation = match[1].replace(/^\s*\*\s?/gm, "").trim();

    if (!documentation) {
      throw new Error('Documentation for "numbersFromSeed" cannot be empty.');
    }

    if (/\bTODO\b/i.test(documentation)) {
      throw new Error(
        'Invalid documentation for "numbersFromSeed": replace the TODO placeholder with a description of the function.',
      );
    }
  });

  // ---------------------------------- START YOUR TESTS HERE --------------------------------------

  it("generates a deterministic sequence from a seed", () => {
    expect(
      numbersFromSeed({
        count: 5,
        seed: "abc",
      }),
    ).toEqual([1, 1, 0, 1, 1]);

    expect(
      numbersFromSeed({
        count: 5,
        seed: "abc",
      }),
    ).toEqual(
      numbersFromSeed({
        count: 5,
        seed: "abc",
      }),
    );
  });

  it("supports an undefined seed", () => {
    expect(
      numbersFromSeed({
        count: 4,
      }),
    ).toEqual([1, 0, 0, 1]);
  });

  it("supports an empty seed", () => {
    expect(
      numbersFromSeed({
        count: 3,
        seed: "",
      }),
    ).toEqual([1, 0, 1]);
  });

  it("treats numeric and equivalent string seeds identically", () => {
    expect(
      numbersFromSeed({
        count: 4,
        seed: 1,
        multiplicator: 10,
      }),
    ).toEqual(
      numbersFromSeed({
        count: 4,
        seed: "1",
        multiplicator: 10,
      }),
    );
  });

  it("applies the multiplicator without rounding", () => {
    const numbers = numbersFromSeed({
      count: 3,
      seed: "abc",
      multiplicator: 10,
      rounded: false,
    });

    expect(numbers).toHaveLength(3);
    expect(numbers[0]).toBeCloseTo(5.166419988963753);
    expect(numbers[1]).toBeCloseTo(6.596221292857081);
    expect(numbers[2]).toBeCloseTo(0.01879659714177251);
  });

  it("sorts generated numbers in ascending order", () => {
    expect(
      numbersFromSeed({
        count: 5,
        seed: 123,
        trend: "up",
        multiplicator: 100,
      }),
    ).toEqual([7, 8, 16, 39, 66]);
  });

  it("sorts generated numbers in descending order", () => {
    expect(
      numbersFromSeed({
        count: 5,
        seed: 123,
        trend: "down",
        multiplicator: 100,
      }),
    ).toEqual([66, 39, 16, 8, 7]);
  });

  it("returns an empty array when count is zero", () => {
    expect(
      numbersFromSeed({
        count: 0,
        seed: "abc",
      }),
    ).toEqual([]);
  });
});
