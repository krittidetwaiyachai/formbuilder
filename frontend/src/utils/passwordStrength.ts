type PasswordStrengthResult = {
  score: number;
  level: 1 | 2 | 3 | 4 | 5;
  labelKey: string;
};
export const STRENGTH_COLORS = {
  bar: ["bg-red-500", "bg-orange-500", "bg-yellow-400", "bg-emerald-400", "bg-emerald-500"],
  text: ["text-red-600", "text-orange-600", "text-yellow-600", "text-emerald-600", "text-emerald-600"]
};
export function evaluatePasswordStrength(value: string): PasswordStrengthResult {
  if (!value) {
    return { score: 0, level: 1, labelKey: "auth.forgot_password.strength.very_low" };
  }
  let score = 0;
  const length = value.length;
  if (length >= 8) score += 1;
  if (length >= 10) score += 1;
  if (length >= 12) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  let level: 1 | 2 | 3 | 4 | 5 = 1;
  let labelKey = "auth.forgot_password.strength.very_low";
  if (score <= 2) {level = 1;labelKey = "auth.forgot_password.strength.very_low";} else
  if (score <= 4) {level = 2;labelKey = "auth.forgot_password.strength.low";} else
  if (score <= 5) {level = 3;labelKey = "auth.forgot_password.strength.medium";} else
  if (score <= 6) {level = 4;labelKey = "auth.forgot_password.strength.high";} else
  {level = 5;labelKey = "auth.forgot_password.strength.very_high";}
  return { score, level, labelKey };
}