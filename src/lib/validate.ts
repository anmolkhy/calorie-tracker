export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateMacros(data: {
  calories_per_100g: unknown;
  protein_per_100g: unknown;
  carbs_per_100g: unknown;
  fat_per_100g: unknown;
}) {
  const fields = ['calories_per_100g', 'protein_per_100g', 'carbs_per_100g', 'fat_per_100g'] as const;
  for (const field of fields) {
    const val = Number(data[field]);
    if (isNaN(val) || val < 0 || val > 9999) {
      throw new ValidationError(`Invalid value for ${field}`);
    }
  }
}

export function validateQuantity(quantity: unknown): number {
  const val = Number(quantity);
  if (isNaN(val) || val <= 0 || val > 5000) {
    throw new ValidationError('Quantity must be between 1 and 5000g');
  }
  return val;
}

export function validateString(value: unknown, fieldName: string, maxLength = 100): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (value.trim().length > maxLength) {
    throw new ValidationError(`${fieldName} must be under ${maxLength} characters`);
  }
  return value.trim();
}