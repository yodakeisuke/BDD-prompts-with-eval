/**
 * ACE Metric (Simplified Deterministic Version)
 *
 * Simplified metric for testing ACE workflow.
 * Uses deterministic structural validation instead of LLM-as-judge.
 *
 * ## Metric Composition
 *
 * - **Structure completeness** (0.4): Has story, rules, questions, next_actions
 * - **Content density** (0.3): Number of rules, examples, questions
 * - **Question diversity** (0.3): Blocker/clarification/future distribution
 *
 * **Total weight:** 1.0
 */

import type { BDDExampleMapping } from '../types.js';

/**
 * Parse JSON output from LLM, handling markdown code fences
 */
function parseJSONOutput(output: string): BDDExampleMapping | null {
  try {
    // Extract JSON from markdown code blocks if present
    const match = output.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    const jsonText = match ? match[1].trim() : output.trim();
    return JSON.parse(jsonText) as BDDExampleMapping;
  } catch {
    return null;
  }
}

/**
 * Evaluate structure completeness (0-1)
 */
function evaluateStructure(bdd: BDDExampleMapping | null): number {
  if (!bdd) return 0;

  let score = 0;

  // Story (0.25)
  if (bdd.story && bdd.story.as_a && bdd.story.i_want_to && bdd.story.so_that) {
    score += 0.25;
  }

  // Rules (0.25)
  if (bdd.rules && bdd.rules.length > 0) {
    score += 0.25;
  }

  // Questions (0.25)
  if (bdd.questions) {
    const hasBlocker = (bdd.questions.blocker || []).length > 0;
    const hasClarification = (bdd.questions.clarification || []).length > 0;
    const hasFuture = (bdd.questions.future || []).length > 0;
    if (hasBlocker && hasClarification && hasFuture) {
      score += 0.25;
    } else if (hasBlocker || hasClarification || hasFuture) {
      score += 0.15;
    }
  }

  // Next actions (0.25)
  if (bdd.next_actions && bdd.next_actions.length > 0) {
    score += 0.25;
  }

  return score;
}

/**
 * Evaluate content density (0-1)
 */
function evaluateContentDensity(bdd: BDDExampleMapping | null): number {
  if (!bdd) return 0;

  let score = 0;

  // Rules (0.4): 3+ rules = 1.0, 2 rules = 0.67, 1 rule = 0.33
  const ruleCount = (bdd.rules || []).length;
  score += Math.min(ruleCount / 3, 1.0) * 0.4;

  // Examples (0.3): 5+ examples total = 1.0
  const exampleCount = (bdd.rules || []).reduce(
    (sum, rule) => sum + (rule.examples || []).length,
    0
  );
  score += Math.min(exampleCount / 5, 1.0) * 0.3;

  // Questions (0.3): 6+ questions total = 1.0
  const questionCount =
    (bdd.questions?.blocker || []).length +
    (bdd.questions?.clarification || []).length +
    (bdd.questions?.future || []).length;
  score += Math.min(questionCount / 6, 1.0) * 0.3;

  return score;
}

/**
 * Evaluate question diversity (0-1)
 */
function evaluateQuestionDiversity(bdd: BDDExampleMapping | null): number {
  if (!bdd || !bdd.questions) return 0;

  const blockerCount = (bdd.questions.blocker || []).length;
  const clarificationCount = (bdd.questions.clarification || []).length;
  const futureCount = (bdd.questions.future || []).length;
  const totalQuestions = blockerCount + clarificationCount + futureCount;

  if (totalQuestions === 0) return 0;

  // Calculate entropy-based diversity score
  // Best case: roughly equal distribution across all three categories
  const blockerRatio = blockerCount / totalQuestions;
  const clarificationRatio = clarificationCount / totalQuestions;
  const futureRatio = futureCount / totalQuestions;

  // Penalize if any category is missing
  if (blockerCount === 0 || clarificationCount === 0 || futureCount === 0) {
    return 0.5; // Max 0.5 if missing a category
  }

  // Calculate uniformity score (closer to 1/3 each = better)
  const ideal = 1 / 3;
  const deviationBlocker = Math.abs(blockerRatio - ideal);
  const deviationClarification = Math.abs(clarificationRatio - ideal);
  const deviationFuture = Math.abs(futureRatio - ideal);
  const totalDeviation = deviationBlocker + deviationClarification + deviationFuture;

  // Convert deviation to score (0 deviation = 1.0, max deviation 2/3 = 0.0)
  const diversityScore = 1.0 - totalDeviation / (2 / 3);

  return Math.max(0, Math.min(1, diversityScore));
}

/**
 * ACE Metric (Simplified): Combined BDD quality score
 *
 * @param prediction - Model output (BDD JSON string)
 * @param expected - Expected output (ground truth, optional)
 * @returns Single score between 0-1
 */
export function createACEMetricSimple() {
  return function aceMetricSimple(args: {
    prediction: string;
    expected?: BDDExampleMapping;
  }): number {
    const parsed = parseJSONOutput(args.prediction);

    // If parsing fails, return 0
    if (!parsed) {
      console.warn('  ⚠ JSON parsing failed, returning score 0');
      return 0;
    }

    // Evaluate three dimensions
    const structureScore = evaluateStructure(parsed);
    const densityScore = evaluateContentDensity(parsed);
    const diversityScore = evaluateQuestionDiversity(parsed);

    // Calculate weighted score
    const finalScore =
      structureScore * 0.4 + densityScore * 0.3 + diversityScore * 0.3;

    // Log individual scores for debugging
    console.log(`  - Structure: ${structureScore.toFixed(2)}`);
    console.log(`  - Density: ${densityScore.toFixed(2)}`);
    console.log(`  - Diversity: ${diversityScore.toFixed(2)}`);
    console.log(`  → Combined: ${finalScore.toFixed(2)}`);

    return finalScore;
  };
}
