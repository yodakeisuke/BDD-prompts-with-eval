import { ai, ax } from '@ax-llm/ax';
import 'dotenv/config';

/**
 * Minimal DSPy setup example with axllm
 *
 * This demonstrates:
 * 1. LLM provider initialization
 * 2. Simple signature-based prompt
 * 3. Type-safe execution
 */

async function main() {
  // Step 1: Initialize LLM provider
  // You can use: anthropic, openai, google, etc.
  const llm = ai({
    name: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log('🚀 DSPy with axllm - Minimal Setup\n');

  // Step 2: Define a simple classifier using signature
  const classifier = ax(
    'review:string -> sentiment:class "positive, negative, neutral"'
  );

  // Step 3: Execute and get typed results
  const testReviews = [
    'This product is amazing!',
    'Terrible experience, would not recommend.',
    'It works as expected.',
  ];

  for (const review of testReviews) {
    const result = await classifier.forward(llm, { review });
    console.log(`Review: "${review}"`);
    console.log(`Sentiment: ${result.sentiment}\n`);
  }

  console.log('✅ Setup verified successfully!');
}

main().catch(console.error);
