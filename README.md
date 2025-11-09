# Prompt Optimization & Evaluation Framework

Multi-objective prompt optimization using GEPA combined with promptfoo evaluation harness.

## Overview

This framework provides a complete workflow for **pre-optimizing** and **validating** prompts:

1. **Optimization** (`tunning/`): GEPA-based multi-objective genetic optimization
2. **Evaluation** (`eval/`): promptfoo-based validation with deterministic and qualitative tests

**Optimization Target**: `.claude/skills/bdd/example-mapping/SKILL.md`

**Key Principle**: The output is optimized prompt text (SKILL.md), not runtime agents. This is a pre-optimization framework.

## Quick Start

### 1. Install Dependencies

```bash
# Install optimization dependencies
cd tunning
pnpm install

# Install evaluation dependencies
cd ../eval
pnpm install
pnpm approve-builds  # Approve better-sqlite3
```

### 2. Configure API Keys

```bash
# tunning/
cd tunning
cp .env.example .env
# Add ANTHROPIC_API_KEY=sk-ant-... to .env

# eval/
cd ../eval
cp .env.example .env
# Add ANTHROPIC_API_KEY=sk-ant-... to .env
```

### 3. Run Optimization

```bash
cd tunning
pnpm optimize
```

This runs GEPA optimization:
- Loads `.claude/skills/bdd/example-mapping/SKILL.md`
- Multi-objective optimization (8 trials, ~5-15 min)
- Outputs `SKILL-optimized-{timestamp}.md` and `result-{timestamp}.json`

### 4. Validate Optimized Prompt

```bash
cd ../eval
pnpm eval:deterministic
```

## Architecture

```
dev-prompt-eval/
├── tunning/                  # GEPA optimization (pre-optimization)
│   ├── src/
│   │   ├── optimize-gepa.ts  # Main optimization script
│   │   ├── types.ts          # Type definitions
│   │   ├── data/
│   │   │   └── converter.ts  # Data conversion
│   │   └── metrics/
│   │       └── bdd-metrics.ts # Multi-objective metrics
│   └── output/
│       └── optimized/        # Optimized prompts (generated)
│
├── eval/                     # promptfoo evaluation
│   ├── test-deterministic/   # Structured JSON validation
│   ├── test-qualitative/     # LLM-as-judge evaluation
│   └── test-integration/     # Integration tests
│
└── CLAUDE.md                 # Detailed project documentation
```

## GEPA Optimization

**Purpose**: Pre-optimize prompts using genetic algorithms to balance multiple objectives.

**Multi-Objective Metrics**:
- **Accuracy**: JSON structure validity and required fields
- **Question Quality**: Depth and relevance of generated questions
- **Brevity**: Token efficiency (optimal: 500-2000 tokens)
- **Completeness**: Rule coverage and example depth

**Output**: Pareto frontier of optimized prompts with trade-off analysis.

**See**: [`tunning/README.md`](tunning/README.md) for detailed documentation.

## promptfoo Evaluation

**Purpose**: Validate optimized prompts against comprehensive test cases.

**Evaluation Layers**:
- **Deterministic**: Unit-test-like structured validation
- **Qualitative**: LLM-as-judge quality assessment
- **Integration**: End-to-end workflow validation

**See**: [`CLAUDE.md`](CLAUDE.md) for detailed evaluation workflow.

## Workflow

### Complete Optimization Cycle

1. **Prepare Training Data** (manual or from promptfoo config)

2. **Run GEPA Optimization**:
   ```bash
   cd tunning
   pnpm optimize
   ```

3. **Review Results**:
   - Check Pareto frontier size and best score
   - Review optimized instruction in console output
   - Inspect `output/optimized/SKILL-optimized-*.md`

4. **Replace Original Prompt** (backup first):
   ```bash
   cp .claude/skills/bdd/example-mapping/SKILL.md \
      .claude/skills/bdd/example-mapping/SKILL.md.backup

   cp tunning/output/optimized/SKILL-optimized-{timestamp}.md \
      .claude/skills/bdd/example-mapping/SKILL.md
   ```

5. **Validate with promptfoo**:
   ```bash
   cd eval
   pnpm eval:deterministic
   ```

6. **Iterate**:
   - Compare evaluation scores (before vs after)
   - Adjust metrics or training data if needed
   - Re-run optimization
   - Review Pareto frontier trade-offs

### Customization

**Add training data** (`tunning/src/data/converter.ts`):
```typescript
export function getTrainingDataset(): GEPADataset {
  const train: GEPAExample[] = [
    // Add 5-10 diverse examples
  ];
  return { train, validation: [] };
}
```

**Increase optimization quality** (`tunning/src/optimize-gepa.ts`):
```typescript
const optimizer = new AxGEPA({
  numTrials: 16,  // Increase from 8 (slower)
  // ...
});
```

**Adjust metrics** (`tunning/src/metrics/bdd-metrics.ts`):
Modify metric calculations or weights.

## Technical Stack

- **Optimization**: @ax-llm/ax (GEPA for TypeScript)
- **Evaluation**: promptfoo with Claude Agent SDK
- **Language**: TypeScript 5.7+
- **Runtime**: Node.js with tsx
- **LLM Provider**: Anthropic Claude

## Documentation

- **CLAUDE.md**: Comprehensive project documentation (for Claude Code)
- **tunning/README.md**: GEPA optimization guide
- **eval/** (inline): promptfoo configuration examples

## References

- [GEPA Documentation](https://axllm.dev/gepa/)
- [axllm (DSPy for TypeScript)](https://axllm.dev/)
- [promptfoo](https://www.promptfoo.dev/)
- [DSPy](https://dspy-docs.vercel.app/)

## License

ISC
