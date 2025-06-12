// Test safe math functions
console.log('🧮 Testing Safe Math Functions...');

// Simulate the safe math functions
function safePercentage(numerator, denominator, defaultValue = 0) {
  if (typeof numerator !== 'number' || typeof denominator !== 'number') {
    return defaultValue;
  }
  if (isNaN(numerator) || isNaN(denominator)) {
    return defaultValue;
  }
  if (denominator === 0) {
    return defaultValue;
  }
  const result = (numerator / denominator) * 100;
  return isNaN(result) ? defaultValue : Math.round(result);
}

function safeRound(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// Test cases that were causing NaN
console.log('Test 1 - Normal calculation:', safePercentage(8, 10)); // Should be 80
console.log('Test 2 - Zero division:', safePercentage(10, 0)); // Should be 0 (not NaN)
console.log('Test 3 - Zero/Zero:', safePercentage(0, 0)); // Should be 0 (not NaN)
console.log('Test 4 - Undefined numerator:', safePercentage(undefined, 10)); // Should be 0
console.log('Test 5 - Null denominator:', safePercentage(5, null)); // Should be 0
console.log('Test 6 - NaN values:', safePercentage(NaN, 10)); // Should be 0

console.log('\n📊 Safe rounding tests:');
console.log('Test 7 - Normal rounding:', safeRound(3.14159, 2)); // Should be 3.14
console.log('Test 8 - NaN rounding:', safeRound(NaN, 2)); // Should be 0
console.log('Test 9 - Undefined rounding:', safeRound(undefined, 1)); // Should be 0

console.log('\n✅ All safe math tests completed!');
