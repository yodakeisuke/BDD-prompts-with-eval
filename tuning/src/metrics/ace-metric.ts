/**
 * ACE Metric: Combined BDD Quality Score
 *
 * Combines three GEPA metrics into a single weighted score for ACE optimization.
 *
 * ## Metric Composition
 *
 * - **three_amigos_coverage** (0.35): Developer/Tester/PO perspective balance
 * - **question_pattern_diversity** (0.35): Discovery/Clarification/Boundary patterns
 * - **example_testability** (0.30): Given/When/Then structure + concrete values
 *
 * **Total weight:** 1.0
 *
 * ## Score Interpretation
 *
 * - **0.8-1.0**: Excellent BDD quality (all perspectives covered, testable examples)
 * - **0.6-0.8**: Good quality (minor gaps in coverage or testability)
 * - **0.4-0.6**: Acceptable (missing some perspectives or patterns)
 * - **0.0-0.4**: Poor quality (significant structural or coverage issues)
 */

import type { AxAI } from '@ax-llm/ax';
import type { BDDExampleMapping } from '../types.js';

/**
 * Metric weights (must sum to 1.0)
 */
const METRIC_WEIGHTS = {
  three_amigos_coverage: 0.35,
  question_pattern_diversity: 0.35,
  example_testability: 0.3,
} as const;

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
 * Evaluate Three Amigos Coverage (Developer/Tester/PO perspectives)
 */
async function evaluateThreeAmigosCoverage(
  ai: AxAI,
  bdd: BDDExampleMapping | null
): Promise<number> {
  if (!bdd || !bdd.questions) return 0;

  const allQuestions = [
    ...(bdd.questions.blocker || []),
    ...(bdd.questions.clarification || []),
    ...(bdd.questions.future || []),
  ];

  if (allQuestions.length === 0) return 0;

  const evaluationPrompt = `
You are evaluating BDD Example Mapping questions for Three Amigos coverage.

**Questions to evaluate:**
${allQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Evaluation Criteria:**

1. **Developer perspective (33%)**: Technical questions about:
   - Implementation complexity
   - Architecture and integration
   - Performance and scalability
   - Data models and APIs

2. **Tester perspective (33%)**: Quality questions about:
   - Edge cases and error handling
   - Test automation feasibility
   - Validation and error messages
   - Negative scenarios

3. **Product Owner perspective (34%)**: Business questions about:
   - Business value and ROI
   - User needs and priorities
   - Scope and timeline
   - Stakeholder alignment

**Scoring:**
- Count questions for each perspective
- Calculate: (Dev_count * 0.33) + (Tester_count * 0.33) + (PO_count * 0.34)
- Normalize to 0-1 range (assume 3+ questions per perspective = 1.0)

**Output only a number between 0 and 1.**
Example: 0.85
`;

  try {
    const response = await ai.chat([
      { role: 'user', content: evaluationPrompt },
    ]);
    const score = parseFloat(response.trim());
    return isNaN(score) ? 0 : Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('Three Amigos evaluation failed:', error);
    return 0;
  }
}

/**
 * Evaluate Question Pattern Diversity (Discovery/Clarification/Boundary)
 */
async function evaluateQuestionPatternDiversity(
  ai: AxAI,
  bdd: BDDExampleMapping | null
): Promise<number> {
  if (!bdd || !bdd.questions) return 0;

  const blockerQuestions = bdd.questions.blocker || [];
  const clarificationQuestions = bdd.questions.clarification || [];
  const futureQuestions = bdd.questions.future || [];

  if (
    blockerQuestions.length === 0 &&
    clarificationQuestions.length === 0 &&
    futureQuestions.length === 0
  ) {
    return 0;
  }

  const evaluationPrompt = `
You are evaluating BDD Example Mapping questions for pattern diversity.

**Blocker Questions (Discovery):**
${blockerQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') || 'None'}

**Clarification Questions:**
${clarificationQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') || 'None'}

**Future Questions (Boundary):**
${futureQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') || 'None'}

**Evaluation Criteria:**

1. **Discovery pattern (35%)**: Questions that uncover business rules
   - Japanese patterns: 「〜の場合は？」「〜はどうなりますか？」
   - Explore conditions, constraints, exceptions

2. **Clarification pattern (30%)**: Questions that resolve ambiguity
   - Japanese patterns: 「〜のみですか？」「〜も対応しますか？」
   - Define scope, specify alternatives

3. **Boundary pattern (35%)**: Questions about edge cases
   - Japanese patterns: 「最大〜は？」「〜が0件の場合は？」
   - Min/max values, null/empty handling

**Scoring:**
- Assess each category independently
- Calculate: (Discovery * 0.35) + (Clarification * 0.30) + (Boundary * 0.35)
- Normalize to 0-1 range

**Output only a number between 0 and 1.**
Example: 0.75
`;

  try {
    const response = await ai.chat([
      { role: 'user', content: evaluationPrompt },
    ]);
    const score = parseFloat(response.trim());
    return isNaN(score) ? 0 : Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('Question pattern diversity evaluation failed:', error);
    return 0;
  }
}

/**
 * Evaluate Example Testability (Given/When/Then structure)
 */
async function evaluateExampleTestability(
  ai: AxAI,
  bdd: BDDExampleMapping | null
): Promise<number> {
  if (!bdd || !bdd.rules || bdd.rules.length === 0) return 0;

  const allExamples = bdd.rules.flatMap((rule) => rule.examples || []);
  if (allExamples.length === 0) return 0;

  const examplesSample = allExamples.slice(0, 5); // Evaluate first 5 examples

  const evaluationPrompt = `
You are evaluating BDD examples for testability.

**Examples to evaluate:**
${examplesSample
  .map(
    (ex, i) => `
${i + 1}. Given: ${ex.given}
   When: ${ex.when}
   Then: ${ex.then}
`
  )
  .join('\n')}

**Evaluation Criteria:**

1. **Given/When/Then structure (40%)**: Clear separation of:
   - Given: Precondition/state setup
   - When: Action/trigger
   - Then: Observable outcome

2. **Concrete values (30%)**: Specific, not abstract
   - Good: 「金額が1000円」「10件のデータ」
   - Bad: 「金額が大きい」「複数のデータ」

3. **Verifiable outcomes (30%)**: Measurable results
   - Good: 「エラーメッセージ「X」を表示」「ステータスが「承認済み」になる」
   - Bad: 「適切に処理される」「正しく動作する」

**Scoring:**
- Evaluate structure, values, and outcomes independently
- Calculate: (Structure * 0.40) + (Concrete * 0.30) + (Verifiable * 0.30)
- Normalize to 0-1 range

**Output only a number between 0 and 1.**
Example: 0.90
`;

  try {
    const response = await ai.chat([
      { role: 'user', content: evaluationPrompt },
    ]);
    const score = parseFloat(response.trim());
    return isNaN(score) ? 0 : Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('Example testability evaluation failed:', error);
    return 0;
  }
}

/**
 * ACE Metric: Combined BDD quality score
 *
 * @param ai - LLM instance for LLM-as-judge evaluation
 * @param prediction - Model output (BDD JSON)
 * @param expected - Expected output (ground truth)
 * @returns Single score between 0-1
 */
export async function createACEMetric(ai: AxAI) {
  return async function aceMetric(args: {
    prediction: string;
    expected?: BDDExampleMapping;
  }): Promise<number> {
    const parsed = parseJSONOutput(args.prediction);

    // If parsing fails, return 0
    if (!parsed) {
      console.warn('JSON parsing failed, returning score 0');
      return 0;
    }

    // Evaluate all three metrics in parallel
    const [three_amigos, pattern_diversity, testability] = await Promise.all([
      evaluateThreeAmigosCoverage(ai, parsed),
      evaluateQuestionPatternDiversity(ai, parsed),
      evaluateExampleTestability(ai, parsed),
    ]);

    // Calculate weighted score
    const finalScore =
      three_amigos * METRIC_WEIGHTS.three_amigos_coverage +
      pattern_diversity * METRIC_WEIGHTS.question_pattern_diversity +
      testability * METRIC_WEIGHTS.example_testability;

    // Log individual scores for debugging
    console.log(`  - Three Amigos: ${three_amigos.toFixed(2)}`);
    console.log(`  - Pattern Diversity: ${pattern_diversity.toFixed(2)}`);
    console.log(`  - Testability: ${testability.toFixed(2)}`);
    console.log(`  → Combined Score: ${finalScore.toFixed(2)}`);

    return finalScore;
  };
}
