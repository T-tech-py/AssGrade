export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasUppercase(value: string) {
  return /[A-Z]/.test(value);
}

export function hasNumber(value: string) {
  return /\d/.test(value);
}

export function getPasswordChecks(password: string) {
  return [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'One uppercase letter', passed: hasUppercase(password) },
    { label: 'One number', passed: hasNumber(password) },
  ];
}

export function getPasswordStrength(password: string) {
  const score = getPasswordChecks(password).filter((rule) => rule.passed).length;

  if (score === 0) return 'Start with a stronger password';
  if (score === 1) return 'Needs work';
  if (score === 2) return 'Almost there';
  return 'Strong password';
}
