export const VITAL_SIGN_RANGES = {
  systolicBP: { min: 40, max: 300 },
  diastolicBP: { min: 20, max: 200 },
  heartRate: { min: 20, max: 300 },
  respiratoryRate: { min: 4, max: 60 },
  oxygenSaturation: { min: 50, max: 100 },
  glucose: { min: 10, max: 1000 },
  temperature: { min: 25, max: 45 },
} as const;
