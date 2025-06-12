// Safe mathematics utilities to prevent NaN values
// Used to fix statistics calculation issues

/**
 * Safely calculates a percentage with proper null/undefined/NaN checks
 * @param numerator - The numerator value
 * @param denominator - The denominator value
 * @param defaultValue - Value to return if calculation is invalid (default: 0)
 * @returns Safe percentage value (0-100)
 */
export function safePercentage(
  numerator: any, 
  denominator: any, 
  defaultValue: number = 0
): number {
  // Convert to numbers and validate
  const num = Number(numerator) || 0;
  const den = Number(denominator) || 0;
  
  // Check for invalid cases
  if (den <= 0 || num < 0) {
    return defaultValue;
  }
  
  // Calculate percentage
  const result = (num / den) * 100;
  
  // Return safe value
  return isNaN(result) || !isFinite(result) ? defaultValue : Math.round(result);
}

/**
 * Safely rounds a number with NaN protection
 * @param value - Value to round
 * @param defaultValue - Value to return if invalid (default: 0)
 * @returns Safe rounded number
 */
export function safeRound(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }
  
  return Math.round(num);
}

/**
 * Safely calculates an average with proper validation
 * @param values - Array of values to average
 * @param defaultValue - Value to return if calculation is invalid (default: 0)
 * @returns Safe average value
 */
export function safeAverage(values: any[], defaultValue: number = 0): number {
  if (!Array.isArray(values) || values.length === 0) {
    return defaultValue;
  }
  
  // Filter valid numbers
  const validValues = values
    .map(v => Number(v))
    .filter(v => !isNaN(v) && isFinite(v));
  
  if (validValues.length === 0) {
    return defaultValue;
  }
  
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const result = sum / validValues.length;
  
  return isNaN(result) || !isFinite(result) ? defaultValue : Math.round(result);
}

/**
 * Safely performs division with NaN protection
 * @param numerator - The numerator
 * @param denominator - The denominator
 * @param defaultValue - Value to return if division is invalid (default: 0)
 * @returns Safe division result
 */
export function safeDivision(
  numerator: any, 
  denominator: any, 
  defaultValue: number = 0
): number {
  const num = Number(numerator) || 0;
  const den = Number(denominator) || 0;
  
  if (den === 0) {
    return defaultValue;
  }
  
  const result = num / den;
  return isNaN(result) || !isFinite(result) ? defaultValue : result;
}

/**
 * Validates that a value is a safe number (not NaN, not Infinity)
 * @param value - Value to validate
 * @returns True if value is a safe number
 */
export function isSafeNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}
