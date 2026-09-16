import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { niceNumber } from "../src/index.js";

describe("niceNumber", () => {
  // NOTE: do not delete this test
  it("has valid documentation", () => {
    const source = readFileSync(
      new URL("../src/index.ts", import.meta.url),
      "utf8",
    );

    const declaration = "export function niceNumber";
    const declarationIndex = source.indexOf(declaration);

    if (declarationIndex === -1) {
      throw new Error('Could not find "niceNumber" function declaration.');
    }

    const beforeDeclaration = source.slice(0, declarationIndex);
    const match = beforeDeclaration.match(/\/\*\*([\s\S]*?)\*\/\s*$/);

    if (!match) {
      throw new Error('Missing JSDoc documentation above "niceNumber".');
    }

    const documentation = match[1].replace(/^\s*\*\s?/gm, "").trim();

    if (!documentation) {
      throw new Error('Documentation for "niceNumber" cannot be empty.');
    }

    if (/\bTODO\b/i.test(documentation)) {
      throw new Error(
        'Invalid documentation for "niceNumber": replace the TODO placeholder with a description of the function.',
      );
    }
  });

  // ---------------------------------- START YOUR TESTS HERE --------------------------------------

  it.each([
    { range: 0.001, expected: 0.001 },
    { range: 0.00101, expected: 0.002 },
    { range: 0.002, expected: 0.002 },
    { range: 0.00201, expected: 0.005 },
    { range: 0.005, expected: 0.005 },
    { range: 0.00501, expected: 0.01 },

    { range: 0.01, expected: 0.01 },
    { range: 0.0101, expected: 0.02 },
    { range: 0.02, expected: 0.02 },
    { range: 0.0201, expected: 0.05 },
    { range: 0.05, expected: 0.05 },
    { range: 0.0501, expected: 0.1 },

    { range: 0.1, expected: 0.1 },
    { range: 0.101, expected: 0.2 },
    { range: 0.2, expected: 0.2 },
    { range: 0.201, expected: 0.5 },
    { range: 0.5, expected: 0.5 },
    { range: 0.501, expected: 1 },

    { range: 1, expected: 1 },
    { range: 1.01, expected: 2 },
    { range: 2, expected: 2 },
    { range: 2.01, expected: 5 },
    { range: 5, expected: 5 },
    { range: 5.01, expected: 10 },

    { range: 10, expected: 10 },
    { range: 10.1, expected: 20 },
    { range: 20, expected: 20 },
    { range: 20.1, expected: 50 },
    { range: 50, expected: 50 },
    { range: 50.1, expected: 100 },

    { range: 100, expected: 100 },
    { range: 101, expected: 200 },
    { range: 200, expected: 200 },
    { range: 201, expected: 500 },
    { range: 500, expected: 500 },
    { range: 501, expected: 1000 },

    { range: 1000, expected: 1000 },
    { range: 1001, expected: 2000 },
    { range: 2001, expected: 5000 },
    { range: 5001, expected: 10000 },
  ])("rounds $range upward to $expected by default", ({ range, expected }) => {
    expect(niceNumber(range)).toBe(expected);
  });

  it.each([
    { range: 0.001, expected: 0.001 },
    { range: 0.00149, expected: 0.001 },
    { range: 0.0015, expected: 0.002 },
    { range: 0.00299, expected: 0.002 },
    { range: 0.003, expected: 0.005 },
    { range: 0.00699, expected: 0.005 },
    { range: 0.007, expected: 0.01 },

    { range: 0.01, expected: 0.01 },
    { range: 0.0149, expected: 0.01 },
    { range: 0.015, expected: 0.02 },
    { range: 0.0299, expected: 0.02 },
    { range: 0.03, expected: 0.05 },
    { range: 0.0699, expected: 0.05 },
    { range: 0.07, expected: 0.1 },

    { range: 0.1, expected: 0.1 },
    { range: 0.149, expected: 0.1 },
    { range: 0.15, expected: 0.2 },
    { range: 0.299, expected: 0.2 },
    { range: 0.3, expected: 0.5 },
    { range: 0.699, expected: 0.5 },
    { range: 0.7, expected: 1 },

    { range: 1, expected: 1 },
    { range: 1.49, expected: 1 },
    { range: 1.5, expected: 2 },
    { range: 2.99, expected: 2 },
    { range: 3, expected: 5 },
    { range: 6.99, expected: 5 },
    { range: 7, expected: 10 },

    { range: 10, expected: 10 },
    { range: 14.9, expected: 10 },
    { range: 15, expected: 20 },
    { range: 29.9, expected: 20 },
    { range: 30, expected: 50 },
    { range: 69.9, expected: 50 },
    { range: 70, expected: 100 },

    { range: 100, expected: 100 },
    { range: 149, expected: 100 },
    { range: 150, expected: 200 },
    { range: 299, expected: 200 },
    { range: 300, expected: 500 },
    { range: 699, expected: 500 },
    { range: 700, expected: 1000 },

    { range: 1000, expected: 1000 },
    { range: 1499, expected: 1000 },
    { range: 1500, expected: 2000 },
    { range: 2999, expected: 2000 },
    { range: 3000, expected: 5000 },
    { range: 6999, expected: 5000 },
    { range: 7000, expected: 10000 },
  ])(
    "rounds $range to the nearest nice number when requested",
    ({ range, expected }) => {
      expect(niceNumber(range, true)).toBe(expected);
    },
  );
});
