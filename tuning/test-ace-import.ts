/**
 * Test if AxACE can be imported and used
 */
import { AxACE, ai, ax, f } from '@ax-llm/ax';

console.log('✅ AxACE imported successfully');
console.log('AxACE class:', AxACE.name);

// Test type checking
const testSignature = f()
  .input('userInput', f.string('Test input'))
  .output('resultOutput', f.string('Test output'))
  .build()
  .toString();

console.log('✅ Signature builder works');
console.log('Signature:', testSignature);

// Test AI initialization
const testAI = ai({
  name: 'anthropic',
  apiKey: 'test-key',
  config: {
    model: 'claude-haiku-4-5-20251001' as any,
  },
});

console.log('✅ AI initialization works');

// Test AxACE constructor (without actually calling it)
console.log('✅ All imports and type definitions are working correctly');
console.log('\nReady to implement ACE optimization!');
