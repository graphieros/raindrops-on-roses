import { describe, expect, it } from "vitest";

import { clamp } from "../../../src/pure/numbers/clamp.js";

describe("clamp", () => {
  it("returns the value when it is within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns the minimum when the value is too small", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns the maximum when the value is too large", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("accepts values equal to the boundaries", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});
