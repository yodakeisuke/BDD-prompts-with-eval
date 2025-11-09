# GEPA Prompt Optimization

Multi-objective optimization for SKILL.md prompts using GEPA (Genetic Evolutionary Programming with Agents).

## Purpose

Optimize `.claude/skills/bdd/example-mapping/SKILL.md` by balancing:
- **Accuracy**: Structural correctness
- **Question Quality**: Depth and relevance
- **Brevity**: Conciseness
- **Completeness**: Coverage and depth

**Output**: Optimized SKILL.md with improved multi-objective scores

## Quick Start

### 1. Setup (First Time Only)

```bash
cd tunning

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add ANTHROPIC_API_KEY=sk-ant-... to .env
```

### 2. Run Optimization

```bash
pnpm optimize
```

**Execution:**
- Loads `.claude/skills/bdd/example-mapping/SKILL.md`
- GEPA multi-objective optimization (8 trials, ~5-15 min)
- Outputs to `output/optimized/SKILL-optimized-{timestamp}.md`

### 3. Review Results

```bash
cat output/optimized/SKILL-optimized-*.md
```

**Console metrics:**
- Pareto Front size (number of optimal solutions)
- Best Score (highest combined score)
- Hypervolume (solution space volume)

### 4. Replace SKILL.md

```bash
# Backup
cp ../.claude/skills/bdd/example-mapping/SKILL.md \
   ../.claude/skills/bdd/example-mapping/SKILL.md.backup

# Deploy optimized version
cp output/optimized/SKILL-optimized-{timestamp}.md \
   ../.claude/skills/bdd/example-mapping/SKILL.md
```

### 5. Validate with promptfoo

```bash
cd ../eval
pnpm eval:deterministic
```

Compare scores before vs after optimization.

## Project Structure

```
tunning/
├── src/
│   ├── optimize-gepa.ts      # GEPA optimization main
│   ├── types.ts              # Type definitions
│   ├── data/
│   │   └── converter.ts      # Training data
│   └── metrics/
│       └── bdd-metrics.ts    # Multi-objective metrics
├── output/
│   └── optimized/            # Generated optimized prompts
├── .env                      # Environment (not tracked)
└── package.json
```

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
    // Add more examples...
  ];
  return { train, validation: [] };
}
```

### Increase Optimization Quality

Edit `src/optimize-gepa.ts`:

```typescript
const optimizer = new AxGEPA({
  numTrials: 16,  // 8 → 16 (slower, better results)
  // ...
});
```

### Adjust Metrics

Edit `src/metrics/bdd-metrics.ts` to modify metric weights or logic.

## Available Commands

```bash
pnpm optimize              # Run GEPA optimization
pnpm optimize:watch        # Watch mode for development
pnpm typecheck             # Type check without compilation
pnpm build                 # Compile TypeScript
```

## Troubleshooting

**Error: ANTHROPIC_API_KEY not found**
→ Add API key to `.env`

**Optimization takes >30 minutes**
→ Reduce `numTrials` to 4 in `src/optimize-gepa.ts`

**Low scores (<0.5)**
→ Add more training data or adjust metrics in `src/metrics/bdd-metrics.ts`

## Technical Stack

- **Language**: TypeScript 5.7+
- **Runtime**: Node.js with tsx
- **Optimization**: @ax-llm/ax (v14.0+) GEPA
- **LLM Provider**: Anthropic Claude

## References

- [GEPA Documentation](https://axllm.dev/gepa/)
- [axllm (DSPy for TypeScript)](https://axllm.dev/)
- [DSPy Concepts](https://dspy-docs.vercel.app/)