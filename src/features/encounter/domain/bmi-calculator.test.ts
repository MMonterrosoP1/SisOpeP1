import { describe, expect, it } from "vitest";
import { calculateBmi, classifyBmi } from "./bmi-calculator";

describe("calculateBmi", () => {
  it("returns 0 when weight is not positive", () => {
    expect(calculateBmi(0, 170)).toBe(0);
    expect(calculateBmi(-1, 170)).toBe(0);
  });

  it("returns 0 when height is not positive", () => {
    expect(calculateBmi(150, 0)).toBe(0);
    expect(calculateBmi(150, -10)).toBe(0);
  });

  it("calculates BMI with pounds to kilograms conversion", () => {
    expect(calculateBmi(154, 170)).toBe(24.17);
  });
});

describe("classifyBmi", () => {
  it("classifies all category boundaries", () => {
    expect(classifyBmi(0)).toBe("NORMAL");
    expect(classifyBmi(18.49)).toBe("UNDERWEIGHT");
    expect(classifyBmi(18.5)).toBe("NORMAL");
    expect(classifyBmi(24.99)).toBe("NORMAL");
    expect(classifyBmi(25)).toBe("OVERWEIGHT");
    expect(classifyBmi(29.99)).toBe("OVERWEIGHT");
    expect(classifyBmi(30)).toBe("OBESE_I");
    expect(classifyBmi(34.99)).toBe("OBESE_I");
    expect(classifyBmi(35)).toBe("OBESE_II");
    expect(classifyBmi(39.99)).toBe("OBESE_II");
    expect(classifyBmi(40)).toBe("OBESE_III");
  });
});