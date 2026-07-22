import { BmiCategory } from "@/shared/schemas/enums";

export function calculateBmi(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const heightMeters = heightCm / 100;
  return Number((weightKg / (heightMeters * heightMeters)).toFixed(2));
}

export function classifyBmi(bmi: number): BmiCategory {
  if (bmi <= 0) return "NORMAL"; // Fallback
  if (bmi < 18.5) return "UNDERWEIGHT";
  if (bmi < 25) return "NORMAL";
  if (bmi < 30) return "OVERWEIGHT";
  if (bmi < 35) return "OBESE_I";
  if (bmi < 40) return "OBESE_II";
  return "OBESE_III";
}
