export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Please enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Please enter your password.";
  if (password.length < 6)
    return "Password must be at least 6 characters.";
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return "Please enter your name.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  if (name.trim().length > 50) return "Name must be 50 characters or fewer.";
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `Please enter ${fieldName}.`;
  return null;
}

export function validateMaxLength(
  value: string,
  max: number,
  fieldName: string
): string | null {
  if (value.length > max)
    return `${fieldName} must be ${max} characters or fewer.`;
  return null;
}
