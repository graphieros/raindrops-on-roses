import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { lttb } from "../src/index.js";

describe("lttb", () => {
  // NOTE: do not delete this test
  it("has valid documentation", () => {
    const source = readFileSync(
      new URL("../src/index.ts", import.meta.url),
      "utf8",
    );

    const declaration = "export function lttb";
    const declarationIndex = source.indexOf(declaration);

    if (declarationIndex === -1) {
      throw new Error('Could not find "lttb" function declaration.');
    }

    const beforeDeclaration = source.slice(0, declarationIndex);

    const match = beforeDeclaration.match(/\/\*\*([\s\S]*?)\*\/\s*$/);

    if (!match) {
      throw new Error('Missing JSDoc documentation above "lttb".');
    }

    const documentation = match[1].replace(/^\s*\*\s?/gm, "").trim();

    if (!documentation) {
      throw new Error('Documentation for "lttb" cannot be empty.');
    }

    if (/\bTODO\b/i.test(documentation)) {
      throw new Error(
        'Invalid documentation for "lttb": replace the TODO placeholder with a description of the function.',
      );
    }
  });

  // ---------------------------------- START YOUR TESTS HERE --------------------------------------

  it("returns the original data when the threshold is greater than or equal to the data length", () => {
    const data = [1, 2, 3, 4];

    expect(
      lttb({
        data,
        threshold: data.length,
      }),
    ).toBe(data);
  });

  it("returns the original data when the threshold is less than 3", () => {
    const data = [1, 2, 3, 4];

    expect(
      lttb({
        data,
        threshold: 2,
      }),
    ).toBe(data);
  });

  it("downsamples the data using the largest triangle area", () => {
    const data = [5, 1, 2, 4, 6, 9];

    expect(
      lttb({
        data,
        threshold: 4,
      }),
    ).toEqual([5, 4, 9, 9]);
  });
});
