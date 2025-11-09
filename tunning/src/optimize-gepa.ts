/**
 * GEPA optimization for SKILL.md
 *
 * Optimizes .claude/skills/bdd/example-mapping/SKILL.md using multi-objective
 * genetic optimization (GEPA).
 */

import { ai, ax, AxGEPA } from '@ax-llm/ax';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { getTrainingDataset } from './data/converter.js';
import { createBddMultiObjectiveMetric } from './metrics/bdd-metrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load SKILL.md as initial prompt
 */
function loadSkillPrompt(): string {
  const skillPath = join(__dirname, '../..', '.claude/skills/bdd/example-mapping/SKILL.md');

  try {
    const content = readFileSync(skillPath, 'utf-8');
    console.log(`📄 Loaded: ${skillPath}\n`);
    return content;
  } catch (error) {
    console.error(`❌ Failed to load SKILL.md from ${skillPath}`);
    throw error;
  }
}

async function main(): Promise<void> {
  console.log('🧬 GEPA Optimization: SKILL.md\n');

  // Verify API key
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not found in .env');
  }

  // Initialize LLM
  console.log('📡 Initializing LLM...');
  const llm = ai({
    name: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Create LLM-as-judge metric function
  console.log('🔬 Creating LLM-as-judge metrics...');
  const bddMultiObjectiveMetric = createBddMultiObjectiveMetric(llm);

  // Load training data
  console.log('📊 Loading training data...');
  const dataset = getTrainingDataset();
  console.log(`   Train: ${dataset.train.length} examples\n`);

  // Load SKILL.md (for reference, but GEPA will optimize from scratch)
  const initialPrompt = loadSkillPrompt();
  console.log(`📝 Initial prompt length: ${initialPrompt.length} chars (reference only)\n`);

  // Define signature (GEPA will optimize the instruction)
  console.log('🔧 Defining signature...');
  const bddSignature = ax(
    'story_input:string -> bdd_mapping:json "BDD Example Mapping"'
  );

  // Create optimizer
  console.log('🧬 Creating optimizer...');
  const optimizer = new AxGEPA({
    studentAI: llm,
    numTrials: 4,
    minibatch: true,
    verbose: true,
  });

  // Run optimization
  console.log('🚀 Starting LLM-based optimization (1 trial for testing)...');
  console.log('⏱️  Note: LLM evaluation is slower but more accurate\n');
  const startTime = Date.now();

  const result = await optimizer.compile(
    bddSignature,
    dataset.train,
    bddMultiObjectiveMetric as any, // Type assertion: async metrics supported
    {
      validationExamples: dataset.validation,
      maxMetricCalls: 100,
    } as any
  );

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Report results
  console.log('\n✅ Optimization complete!\n');
  console.log(`📈 Pareto Front: ${result.paretoFrontSize}`);
  console.log(`📈 Best Score: ${result.bestScore.toFixed(4)}`);
  console.log(`📈 Hypervolume: ${result.hypervolume?.toFixed(4) ?? 'N/A'}`);
  console.log(`⏱️  Duration: ${duration}s\n`);

  // Access optimized program (type assertion for incomplete types)
  const optimizedProgram = (result as any).optimizedProgram;

  if (!optimizedProgram) {
    console.error('❌ No optimized program in result. Using signature directly.');
    console.log('Result keys:', Object.keys(result));
    return;
  }

  // Apply optimization to signature
  bddSignature.applyOptimization(optimizedProgram);

  // Save results
  const outputDir = join(process.cwd(), 'output', 'optimized');
  mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const skillPath = join(outputDir, `SKILL-optimized-${timestamp}.md`);
  const jsonPath = join(outputDir, `result-${timestamp}.json`);

  writeFileSync(skillPath, optimizedProgram.instruction || 'No instruction available', 'utf-8');
  writeFileSync(jsonPath, JSON.stringify(optimizedProgram, null, 2), 'utf-8');

  console.log(`💾 Saved: ${skillPath}`);
  console.log(`💾 Saved: ${jsonPath}\n`);

  // Display optimized prompt
  console.log('─'.repeat(80));
  console.log(optimizedProgram.instruction || 'No instruction available');
  console.log('─'.repeat(80));

  console.log('\n💡 Next: Copy to .claude/skills/bdd/example-mapping/SKILL.md');
  console.log('   Then run: cd ../eval && pnpm eval:deterministic\n');
}

main().catch((error) => {
  console.error('❌ Error during optimization:', error);
  process.exit(1);
});
