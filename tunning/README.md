# GEPA Prompt Optimization

Multi-objective optimization for `.claude/skills/bdd/example-mapping/SKILL.md` using GEPA.

## Overview

**Target**: `.claude/skills/bdd/example-mapping/SKILL.md`

**Goal**: Optimize prompts using multi-objective genetic algorithms (GEPA) to balance:
- **Three Amigos Coverage**: Developer/Tester/Product Owner perspectives
- **Question Pattern Diversity**: Discovery/Clarification/Boundary questions
- **Example Testability**: Given/When/Then structure and concrete values

**Output**: Optimized SKILL.md ready to replace the original.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Add your Anthropic API key to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

## Usage

### Run Optimization

```bash
pnpm optimize
```

This executes GEPA optimization:
- Loads `.claude/skills/bdd/example-mapping/SKILL.md`
- Runs multi-objective optimization (8 trials, ~5-15 min)
- Outputs `SKILL-optimized-{timestamp}.md` and `result-{timestamp}.json`

### Watch Mode

```bash
pnpm optimize:watch
```

Automatically re-runs optimization when source files change.

### Type Checking & Build

```bash
pnpm typecheck  # Type check without compilation
pnpm build      # Compile TypeScript to JavaScript
```

## Project Structure

```
tunning/
├── src/
│   ├── optimize-gepa.ts      # Main optimization script
│   ├── types.ts              # Type definitions
│   ├── data/
│   │   └── converter.ts      # Training data
│   └── metrics/
│       └── bdd-metrics.ts    # Multi-objective metrics
├── output/
│   └── optimized/            # Optimized prompts (generated)
├── .env                      # Environment variables (not tracked)
├── .env.example              # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

**Architecture:**
- **Modular**: Best practices with separated concerns
- **Minimal**: No unnecessary complexity

## How It Works

### 1. Load SKILL.md

```typescript
// src/optimize-gepa.ts
const initialPrompt = loadSkillPrompt();
```

Loads `.claude/skills/bdd/example-mapping/SKILL.md` as the baseline.

### 2. Load Training Data

```typescript
// src/data/converter.ts
export function getTrainingDataset(): GEPADataset {
  const train: GEPAExample[] = [
    {
      story_input: '予実差異レポートで、マイナス値を赤字で表示したい。',
      validation_criteria: {
        min_questions: 5,
        min_rules: 1,
        expected_keywords: ['マイナス', '赤', '表示'],
      },
    },
    // ...
  ];
  return { train, validation: [] };
}
```

### 3. Define Metrics (LLM-as-judge)

Three domain-specific metrics evaluated using **LLM-as-judge** with detailed rubrics (`src/metrics/bdd-metrics.ts`):

#### **three_amigos_coverage** (0-1)
LLM evaluates whether questions cover all three BDD perspectives:
- **Developer** (0.33): Technical complexity, architecture, integration
- **Tester** (0.33): Edge cases, error handling, test automation
- **Product Owner** (0.34): Business value, priorities, user impact

**Rubric-based scoring**: LLM identifies developer/tester/PO concerns and applies graduated scoring (2+ = full, 1 = partial)

#### **question_pattern_diversity** (0-1)
LLM evaluates coverage of three essential question patterns:
- **Discovery** (0.35): Business rules, conditions, constraints
- **Clarification** (0.30): Resolving ambiguity, defining scope
- **Boundary** (0.35): Edge cases, min/max values, null handling

**Rubric-based scoring**: LLM identifies discovery/clarification/boundary questions with examples

#### **example_testability** (0-1)
LLM evaluates whether examples are structured for automated testing:
- **Given/When/Then** (0.40): Clear precondition, action, outcome
- **Concrete Values** (0.30): Specific data (numbers, strings)
- **Verifiable Outcomes** (0.30): Observable results or state changes

**Rubric-based scoring**: LLM scores each example individually, then returns average

**Why LLM-as-judge?**
- **Deeper evaluation**: Understands semantic meaning, not just keyword matching
- **Nuanced scoring**: Can distinguish quality levels (e.g., "good" vs "excellent" examples)
- **Consistency**: Detailed rubrics ensure reproducible evaluation
- **Domain knowledge**: Can apply BDD/Example Mapping best practices

### 4. Run GEPA

```typescript
const optimizer = new AxGEPA({
  studentAI: llm,
  numTrials: 8,
  minibatch: true,
  verbose: true,
});

const result = await optimizer.compile(
  bddSignature,
  dataset.train,
  bddMultiObjectiveMetric,
  { validationExamples: [], maxMetricCalls: 100 }
);
```

### 5. Output

- `SKILL-optimized-{timestamp}.md` - Ready to use
- `result-{timestamp}.json` - Full optimization result

## Customization

### Add Training Data

Edit `src/data/converter.ts`:

```typescript
export function getTrainingDataset(): GEPADataset {
  const train: GEPAExample[] = [
    {
      story_input: '予実差異レポートで、マイナス値を赤字で表示したい。',
      validation_criteria: {
        min_questions: 5,
        min_rules: 1,
        expected_keywords: ['マイナス', '赤', '表示'],
      },
    },
    // Add more examples here
  ];
  return { train, validation: [] };
}
```

### Adjust Optimization Parameters

Edit `src/optimize-gepa.ts`:

```typescript
const optimizer = new AxGEPA({
  studentAI: llm,
  numTrials: 16,  // Increase for better results (slower)
  minibatch: true,
  verbose: true,
});
```

### Modify Metrics

Edit `src/metrics/bdd-metrics.ts` to customize evaluation rubrics:

**Example: Add security concerns to Developer perspective**
```typescript
const rubric = `
**Developer Perspective (0.33 maximum)**
Questions addressing:
- Technical complexity and implementation challenges (複雑、実装、技術的)
- Integration with existing features (既存機能、整合性、依存関係)
- Security and access control (セキュリティ、認証、権限)  // ← Add this
- Architecture and design concerns (アーキテクチャ、設計、構造)
...
`;
```

**Example: Adjust scoring weights**
```typescript
// Increase boundary questions importance from 0.35 to 0.40
**Boundary Questions (0.40 maximum - highest weight)**
...
Score:
- 0.40: 2+ boundary questions present  // Changed from 0.35
- 0.20: 1 boundary question present    // Changed from 0.18
```

**Example: Add domain-specific examples**
```typescript
**Clarification Questions (0.30 maximum)**
...
Examples:
✅ "『予実差異』の定義は?"  // FP&A specific
✅ "Excelフォーマットは?"   // Domain context
```

**Trade-offs of LLM-as-judge:**
- **Pros**: Deep semantic understanding, nuanced scoring, domain knowledge application
- **Cons**: Slower (~2s per evaluation vs <1ms for heuristics), API costs
- **Verdict**: Worth it for GEPA optimization - quality over speed

## Technical Stack

- **Language**: TypeScript 5.7+
- **Runtime**: Node.js with tsx (TypeScript execution)
- **Optimization**: @ax-llm/ax (v14.0+) with GEPA
- **LLM Provider**: Anthropic Claude

## Validation Workflow

1. **Run optimization**:
   ```bash
   pnpm optimize
   ```

2. **Review output**:
   ```bash
   cat output/optimized/SKILL-optimized-*.md
   ```

3. **Replace SKILL.md** (backup first):
   ```bash
   cp ../.claude/skills/bdd/example-mapping/SKILL.md \
      ../.claude/skills/bdd/example-mapping/SKILL.md.backup

   cp output/optimized/SKILL-optimized-{timestamp}.md \
      ../.claude/skills/bdd/example-mapping/SKILL.md
   ```

4. **Validate with promptfoo**:
   ```bash
   cd ../eval
   pnpm eval:deterministic
   ```

5. **Iterate**:
   - Compare scores (before vs after)
   - Adjust training data or metrics if needed
   - Re-run optimization

## References

- [GEPA Documentation](https://axllm.dev/gepa/)
- [axllm (DSPy for TypeScript)](https://axllm.dev/)
- [DSPy Concepts](https://dspy-docs.vercel.app/)
