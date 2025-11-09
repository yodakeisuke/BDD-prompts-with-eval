/**
 * ACE-based Prompt Optimization for BDD Example Mapping
 *
 * Uses AxACE (Automatic Context Engineering) to optimize SKILL.md
 * by learning from complete input/output examples.
 *
 * ## Key Differences from GEPA
 *
 * - **Algorithm**: Automatic Context Engineering (few-shot learning)
 * - **Training Data**: Complete input/output pairs (ground truth required)
 * - **Metrics**: Single weighted score (not multi-objective)
 * - **Output**: Optimized program with few-shot examples
 * - **Speed**: Faster (2 epochs ~5-10 min with haiku)
 *
 * ## Workflow
 *
 * 1. Load SKILL.md as system description
 * 2. Create typed signature with f() builder
 * 3. Train with 10 complete BDD examples
 * 4. Optimize using LLM-as-judge metric
 * 5. Save optimized playbook to output/
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AxACE, ai, ax, f } from '@ax-llm/ax';
import { getACEDataset } from './data/ace-training-data.js';
import { createACEMetricSimple } from './metrics/ace-metric-simple.js';
import type { ACEOptimizationResult } from './types.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load SKILL.md content from project root
 */
function loadSkillMd(): string {
  const skillMdPath = join(
    __dirname,
    '..',
    '..',
    '.claude',
    'skills',
    'bdd',
    'example-mapping',
    'SKILL.md'
  );

  try {
    const content = readFileSync(skillMdPath, 'utf-8');
    console.log(`✓ Loaded SKILL.md (${content.length} chars)`);
    return content;
  } catch (error) {
    console.error(
      `✗ Failed to load SKILL.md from ${skillMdPath}:`,
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}

/**
 * Create output directory if it doesn't exist
 */
function ensureOutputDir(): string {
  const outputDir = join(__dirname, '..', 'output', 'optimized');
  mkdirSync(outputDir, { recursive: true });
  return outputDir;
}

/**
 * Save ACE optimization result
 */
function saveOptimizationResult(
  result: ACEOptimizationResult,
  outputDir: string
): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultPath = join(outputDir, `ACE-result-${timestamp}.json`);

  writeFileSync(resultPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n✓ Saved optimization result to: ${resultPath}`);

  // Try to extract optimized instruction if available
  try {
    const optimizedInstruction = (result.optimizedProgram as any).description || '';
    if (optimizedInstruction) {
      const skillMdPath = join(outputDir, `SKILL-optimized-${timestamp}.md`);
      writeFileSync(skillMdPath, optimizedInstruction, 'utf-8');
      console.log(`✓ Saved optimized SKILL.md to: ${skillMdPath}`);
    }
  } catch (error) {
    console.log('  (Could not extract optimized instruction from result)');
  }
}

/**
 * Main ACE optimization
 */
async function main() {
  console.log('='.repeat(80));
  console.log('ACE Optimization: BDD Example Mapping SKILL.md');
  console.log('='.repeat(80));

  // 1. Load SKILL.md
  console.log('\n[1/6] Loading SKILL.md...');
  const skillMdContent = loadSkillMd();

  // 2. Load training data
  console.log('\n[2/6] Loading training data...');
  const dataset = getACEDataset({ trainRatio: 0.7 });
  console.log(`  - Training examples: ${dataset.train.length}`);
  console.log(`  - Validation examples: ${dataset.validation.length}`);

  // 3. Create LLM instances (haiku for speed)
  console.log('\n[3/6] Initializing LLMs...');

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not found in .env');
  }

  const haikuModel = 'claude-haiku-4-5-20251001' as any;

  const haiku = ai({
    name: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    config: { model: haikuModel },
  });

  console.log('  - Student AI: Claude Haiku 4.5 (fast inference)');
  console.log('  - Teacher AI: Claude Haiku 4.5 (fast evaluation)');

  // 4. Create signature using f() builder
  console.log('\n[4/6] Creating signature...');

  const signature = f()
    .input('story_input', f.string('User story or feature request'))
    .output(
      'bdd_mapping',
      f.json('Complete BDD Example Mapping in JSON format')
    )
    .build()
    .toString();

  console.log(`  - Signature: ${signature}`);

  // Create program and set SKILL.md as description
  const program = ax(signature);
  program.setDescription(skillMdContent);
  console.log(`  - Description set: ${skillMdContent.length} chars`);

  // 5. Create ACE metric (simplified deterministic version)
  console.log('\n[5/6] Creating metric...');
  const metric = createACEMetricSimple();
  console.log('  - Metric: Deterministic BDD quality score (0-1)');
  console.log('  - Weights: structure (0.4) + density (0.3) + diversity (0.3)');

  // 6. Run ACE optimization
  console.log('\n[6/6] Running ACE optimization...');
  console.log('  - Max epochs: 2 (speed priority)');
  console.log('  - Expected duration: ~5-10 minutes');
  console.log('');

  const optimizer = new AxACE(
    {
      studentAI: haiku,
      teacherAI: haiku,
      verbose: true,
    },
    {
      maxEpochs: 2,
    }
  );

  const startTime = Date.now();

  try {
    const result = await optimizer.compile(
      program,
      dataset.train.map((ex) => ({
        ...ex.input, // Flatten input fields (story_input)
        output: JSON.stringify(ex.output, null, 2),
      })),
      metric as any // Type assertion for simplified metric
    );

    const endTime = Date.now();
    const durationSec = ((endTime - startTime) / 1000).toFixed(0);

    console.log('\n' + '='.repeat(80));
    console.log('Optimization Complete!');
    console.log('='.repeat(80));
    console.log(`Duration: ${durationSec} seconds`);

    // Calculate average training score from result if available
    console.log(`\nOptimization result:`, result);

    // Save results
    const optimizationResult: ACEOptimizationResult = {
      optimizedProgram: result,
      bestScore: 0, // Will be updated if we can extract from result
      totalEpochs: 2,
      timestamp: new Date().toISOString(),
    };

    const outputDir = ensureOutputDir();
    saveOptimizationResult(optimizationResult, outputDir);

    console.log('\n✓ ACE optimization completed successfully');
    console.log('\nNext steps:');
    console.log('1. Review optimized result in output/optimized/');
    console.log('2. Extract optimized prompt and replace SKILL.md');
    console.log('3. Run: cd ../eval && pnpm eval:integration');
  } catch (error) {
    console.error('\n✗ ACE optimization failed:', error);
    throw error;
  }
}

// Run optimization
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
