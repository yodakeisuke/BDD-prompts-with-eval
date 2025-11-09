/**
 * BDD Example Mapping metrics for GEPA optimization
 *
 * LLM-as-judge evaluation metrics based on BDD and Example Mapping principles.
 * Uses detailed rubrics to assess domain-specific quality.
 *
 * ## Evaluation Philosophy
 *
 * These metrics use LLM-as-judge for deep domain-specific evaluation:
 * - **Depth**: Evaluates nuanced quality beyond pattern matching
 * - **Domain Knowledge**: BDD and Example Mapping best practices
 * - **Consistency**: Detailed rubrics ensure reproducible scoring
 *
 * ## Key Metrics
 *
 * ### 1. three_amigos_coverage (0-1)
 * Evaluates whether questions cover all three BDD perspectives:
 * - Developer (0.33): Technical complexity, architecture, integration
 * - Tester (0.33): Edge cases, error handling, test automation
 * - Product Owner (0.34): Business value, priorities, user impact
 *
 * ### 2. question_pattern_diversity (0-1)
 * Evaluates coverage of three essential question patterns:
 * - Discovery (0.35): Business rules, conditions, constraints
 * - Clarification (0.30): Resolving ambiguity, defining scope
 * - Boundary (0.35): Edge cases, min/max values, null handling
 *
 * ### 3. example_testability (0-1)
 * Evaluates whether examples are structured for automated testing:
 * - Given/When/Then (0.40): Clear precondition, action, outcome
 * - Concrete Values (0.30): Specific data (numbers, strings)
 * - Verifiable Outcomes (0.30): Observable results or state changes
 *
 * @see METRICS.md for detailed rubric design
 */

import type { AxAI } from '@ax-llm/ax';
import type { BDDExampleMapping, GEPAMetricResult } from '../types.js';

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
 * Call LLM to evaluate based on rubric, returning 0.0-1.0 score
 */
async function evaluateWithLLM(
  ai: AxAI,
  rubric: string,
  content: string
): Promise<number> {
  try {
    const { ax } = await import('@ax-llm/ax');

    // Create evaluator signature
    const evaluator = ax(
      'rubric:string, content:string -> score:number "Evaluation score from 0.0 to 1.0"'
    );

    const result = await evaluator.forward(ai, {
      rubric: `You are an expert evaluator for BDD Example Mapping outputs.

Carefully analyze the content against the rubric criteria.
Be precise and consistent in your evaluation.

${rubric}

IMPORTANT: Return ONLY a number between 0.0 and 1.0.
No explanation, no text, just the numeric score.`,
      content: `CONTENT TO EVALUATE:

${content}`,
    });

    const score = Number.parseFloat(String(result.score || 0));
    return Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('LLM evaluation error:', error);
    return 0;
  }
}

/**
 * Metric 1: Three Amigos Coverage (LLM-as-judge)
 *
 * Evaluates whether questions represent all three BDD perspectives.
 */
async function evaluateThreeAmigosCoverage(
  ai: AxAI,
  parsed: BDDExampleMapping | null
): Promise<number> {
  if (!parsed?.questions) return 0;

  const allQuestions = [
    ...parsed.questions.blocker,
    ...parsed.questions.clarification,
    ...parsed.questions.future,
  ].join('\n');

  if (allQuestions.trim().length === 0) return 0;

  const rubric = `
EVALUATION RUBRIC: Three Amigos Coverage (0.0-1.0)

Assess whether questions represent all three BDD perspectives:

**Developer Perspective (0.33 maximum)**
Questions addressing:
- Technical complexity and implementation challenges (複雑、実装、技術的)
- Integration with existing features (既存機能、整合性、依存関係)
- Architecture and design concerns (アーキテクチャ、設計、構造)
- Performance and scalability (パフォーマンス、性能、速度)
- Technical infrastructure (API、データベース、インターフェース)

Score:
- 0.33: 2+ different developer concerns present
- 0.17: 1 developer concern present
- 0.00: No developer concerns

**Tester Perspective (0.33 maximum)**
Questions addressing:
- Edge cases and special scenarios (エッジケース、特殊ケース、例外)
- Boundary values and limits (境界値、最小、最大)
- Error handling and failure scenarios (エラー、異常系、失敗)
- Validation and verification (バリデーション、検証、確認)
- Test automation feasibility (テスト、自動化)

Score:
- 0.33: 2+ different tester concerns present
- 0.17: 1 tester concern present
- 0.00: No tester concerns

**Product Owner Perspective (0.34 maximum)**
Questions addressing:
- Business value and benefits (ビジネス価値、価値、効果)
- Priorities and importance (優先順位、優先度、重要度)
- MVP scope and essential features (MVP、最小機能、必須)
- User impact and experience (ユーザー、利用者、顧客)
- ROI and cost-benefit (売上、収益、コスト、効率)

Score:
- 0.34: 2+ different PO concerns present
- 0.17: 1 PO concern present
- 0.00: No PO concerns

**TOTAL SCORE**: Sum all three perspective scores (0.0-1.0)
`;

  return evaluateWithLLM(ai, rubric, `Questions:\n${allQuestions}`);
}

/**
 * Metric 2: Question Pattern Diversity (LLM-as-judge)
 *
 * Evaluates coverage of three essential question patterns in Example Mapping.
 */
async function evaluateQuestionPatternDiversity(
  ai: AxAI,
  parsed: BDDExampleMapping | null
): Promise<number> {
  if (!parsed?.questions) return 0;

  const criticalQuestions = [
    ...parsed.questions.blocker,
    ...parsed.questions.clarification,
  ].join('\n');

  if (criticalQuestions.trim().length === 0) return 0;

  const rubric = `
EVALUATION RUBRIC: Question Pattern Diversity (0.0-1.0)

Assess coverage of three essential question generation patterns:

**Discovery Questions (0.35 maximum)**
Questions that uncover hidden business rules and constraints:
- Identifying business rules (ルール、ビジネスルール、仕様)
- Trigger conditions (どんな場合、いつ、どのような状況)
- Constraints and prohibitions (制約、禁止、許可)
- Prerequisites and assumptions (前提、前提条件)
- Root cause exploration (なぜ、理由、背景)

Examples:
✅ "どんな場合にマイナス表示が必要か?"
✅ "守るべきビジネスルールは何か?"
✅ "禁止される操作はあるか?"

Score:
- 0.35: 2+ discovery questions present
- 0.18: 1 discovery question present
- 0.00: No discovery questions

**Clarification Questions (0.30 maximum)**
Questions that resolve ambiguity and define precise scope:
- Requesting specificity (具体的に、詳しく)
- Asking for examples (例えば、具体例)
- Defining terms (定義、意味、解釈)
- Clarifying scope (範囲、スコープ、対象)
- Semantic clarification ("『〇〇』とは")
- Optionality (必須、任意、オプション)

Examples:
✅ "『マイナス値』とは具体的にどの範囲?"
✅ "赤字表示は必須か任意か?"
✅ "対象範囲に何が含まれるか?"

Score:
- 0.30: 2+ clarification questions present
- 0.15: 1 clarification question present
- 0.00: No clarification questions

**Boundary Questions (0.35 maximum - highest weight)**
Questions exploring edge cases and limits:
- Min/max values (最小、最大、上限、下限)
- Boundary conditions (境界、境界値)
- Empty/null states (空、null、未設定、未入力)
- Zero handling (ゼロ、0)
- Negative values (負、マイナス)
- Default values (デフォルト、初期値)

Examples:
✅ "ゼロの場合の表示は?"
✅ "未入力時のデフォルト値は?"
✅ "最小値・最大値の制限は?"

Score:
- 0.35: 2+ boundary questions present
- 0.18: 1 boundary question present
- 0.00: No boundary questions

**TOTAL SCORE**: Sum all three pattern scores (0.0-1.0)

NOTE: Boundary questions have the highest weight because they prevent the most production bugs.
`;

  return evaluateWithLLM(
    ai,
    rubric,
    `Critical Questions (blocker + clarification):\n${criticalQuestions}`
  );
}

/**
 * Metric 3: Example Testability (LLM-as-judge)
 *
 * Evaluates whether examples are structured for automated testing.
 */
async function evaluateExampleTestability(
  ai: AxAI,
  parsed: BDDExampleMapping | null
): Promise<number> {
  if (!parsed?.rules || parsed.rules.length === 0) return 0;

  const allExamples: string[] = [];
  for (const rule of parsed.rules) {
    for (const example of rule.examples) {
      allExamples.push(
        `Rule: ${rule.name}\nGiven: ${example.given}\nWhen: ${example.when}\nThen: ${example.then}`
      );
    }
  }

  if (allExamples.length === 0) return 0;

  const examplesText = allExamples.join('\n\n---\n\n');

  const rubric = `
EVALUATION RUBRIC: Example Testability (0.0-1.0)

Assess ALL examples and return the AVERAGE score.

For EACH example, evaluate three dimensions:

**Given/When/Then Structure (0.40 per example)**
BDD examples should follow Gherkin syntax:
- **Given**: Clear preconditions (Given、前提、与えられた、初期状態)
- **When**: Clear action or trigger (When、もし、場合、操作、実行、ユーザーが)
- **Then**: Clear expected outcome (Then、ならば、結果、期待、表示される、すべき)

Examples:
✅ "Given 予実差異が-500,000円, When レポート表示, Then 金額が赤字で表示"
✅ "前提: ユーザーがログイン済み, 操作: 予算入力, 結果: 保存完了メッセージ"
❌ "マイナス値の場合は赤字で表示する" (no clear G/W/T structure)

Score per example:
- 0.40: All 3 components (Given AND When AND Then) clearly present
- 0.20: 2 components present
- 0.00: 0-1 components

**Concrete Values (0.30 per example)**
Examples should specify actual data, not abstract descriptions:
- Specific numbers (金額が-500,000円、件数が10件)
- Quoted strings ("エラーメッセージ"、'成功')
- Identifiable values (ID: 12345、コード: ABC)
- Named data (田中太郎、2024年度予算)

Examples:
✅ "金額が -1,000,000 円の場合" (specific number)
✅ "ユーザー名が '田中太郎' の時" (concrete name)
❌ "大きな負の値の場合" (abstract, not testable)
❌ "適切な金額" (vague)

Score per example:
- 0.30: 2+ concrete values present
- 0.15: 1 concrete value present
- 0.00: No concrete values

**Verifiable Outcomes (0.30 per example)**
Expected results should be observable and testable:
- UI changes (表示される、画面に出る、色が変わる)
- Error messages (エラーメッセージ、警告、アラート)
- Status changes (成功、失敗、OK、NG、完了)
- Data changes (保存される、更新される、削除される)
- State transitions (ステータスが変わる、状態が遷移)

Examples:
✅ "金額が赤字で表示される" (observable UI change)
✅ "エラーメッセージ '入力値が不正です' が表示" (specific error)
✅ "データベースに保存される" (state change)
❌ "適切に処理される" (not verifiable)
❌ "良い感じになる" (subjective, not testable)

Score per example:
- 0.30: 2+ verifiable outcomes present
- 0.15: 1 verifiable outcome present
- 0.00: No verifiable outcomes

**CALCULATION**:
1. Score EACH example individually (0.0-1.0)
2. Calculate AVERAGE across all examples
3. Return final average (0.0-1.0)

Example scoring:
- Example with G/W/T (0.40) + 2 values (0.30) + 1 outcome (0.15) = 0.85
- Example with W/T (0.20) + 1 value (0.15) + 2 outcomes (0.30) = 0.65
- Average: (0.85 + 0.65) / 2 = 0.75
`;

  return evaluateWithLLM(ai, rubric, `Examples:\n\n${examplesText}`);
}

/**
 * Multi-objective metric for GEPA optimization (LLM-as-judge)
 *
 * Factory function that creates an async metric evaluator with AI instance.
 *
 * @param ai - AxAI instance for LLM evaluation
 * @returns Async metric function compatible with GEPA
 */
export function createBddMultiObjectiveMetric(ai: AxAI) {
  return async function bddMultiObjectiveMetric({
    prediction,
  }: {
    prediction: any;
    example: any;
  }): Promise<GEPAMetricResult> {
    const parsed = parseJSONOutput(prediction.output);

    // Debug: Log parsing result
    if (!parsed) {
      console.warn('⚠️  Failed to parse JSON output');
      console.warn('   Output preview:', prediction.output?.substring(0, 200));
    }

    // Evaluate all three metrics in parallel for efficiency
    const [three_amigos_coverage, question_pattern_diversity, example_testability] =
      await Promise.all([
        evaluateThreeAmigosCoverage(ai, parsed),
        evaluateQuestionPatternDiversity(ai, parsed),
        evaluateExampleTestability(ai, parsed),
      ]);

    // Debug: Log metric scores
    console.log(`   Metrics: amigos=${three_amigos_coverage.toFixed(2)}, diversity=${question_pattern_diversity.toFixed(2)}, testability=${example_testability.toFixed(2)}`);

    return {
      three_amigos_coverage,
      question_pattern_diversity,
      example_testability,
    };
  };
}
