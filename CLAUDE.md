# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a prompt optimization and evaluation framework combining GEPA-based pre-optimization with promptfoo evaluation harness.

**Key Components:**
- **tunning/**: GEPA-based multi-objective prompt optimization (pre-optimization only)
- **eval/**: promptfoo evaluation harness for validation

**Primary working directories:**
- For optimization: `tunning/`
- For evaluation: `eval/`

**Domain Context:**
- Target application: FP&A (Financial Planning & Analysis) SaaS
- Development context: Brownfield (existing codebase)
- Output language: Japanese
- Testing methodology: BDD (Behavior-Driven Development) with Example Mapping

## Key Architectural Decisions

1. **Two-Stage Workflow**: GEPA optimization (pre-processing) → promptfoo validation (quality gate)
   - Optimization produces static SKILL.md files (not runtime agents)
   - Evaluation validates prompt quality across multiple dimensions

2. **LLM-as-Judge Metrics**: Uses Claude for semantic evaluation during optimization
   - Trade-off: Slower (~15-45 min) but higher quality vs heuristic patterns
   - Cost: ~$2.40 per optimization run (~240 API calls)
   - Benefit: Deep understanding of BDD domain knowledge

3. **Three-Layer Evaluation**:
   - Deterministic: Fast structural validation (schema, types)
   - Qualitative: LLM-based quality assessment (clarity, accuracy)
   - Integration: End-to-end with golden dataset (9 curated cases)

4. **Independent Workspaces**: `tunning/` and `eval/` are self-contained
   - Each has its own `package.json`, `.env`, and dependencies
   - Can be run independently or as a pipeline

## Architecture

### GEPA Optimization (tunning/)

**Purpose**: Pre-optimize prompts using multi-objective genetic algorithms

**Core Technology**: GEPA (Genetic Evolutionary Programming with Agents) from @ax-llm/ax

**Key Features:**
- **Multi-objective optimization**: Balances three domain-specific BDD metrics
- **Pareto frontier analysis**: Identifies optimal trade-offs between competing objectives
- **Output**: Optimized prompt instructions (not runtime agents)

**Optimization Target**: `.claude/skills/bdd/example-mapping/SKILL.md`

**Three Core Metrics** (LLM-as-judge evaluation):
1. **three_amigos_coverage** (0-1): Developer/Tester/Product Owner perspectives
2. **question_pattern_diversity** (0-1): Discovery/Clarification/Boundary questions
3. **example_testability** (0-1): Given/When/Then structure + concrete values

See `tunning/METRICS.md` for detailed metric definitions and customization guide.

**Workflow:**
1. Load initial prompt from SKILL.md
2. Define training/validation examples (`tunning/src/data/converter.ts`)
3. Configure multi-objective metrics (`tunning/src/metrics/bdd-metrics.ts`)
4. Run GEPA compile() to evolve prompts (~15-45 min with LLM-as-judge)
5. Save optimized prompts to `output/optimized/` (JSON + SKILL.md format)
6. Replace original SKILL.md with optimized version
7. Validate with promptfoo eval harness

**Directory Structure:**
```
tunning/
├── src/
│   ├── optimize-gepa.ts      # GEPA optimization main
│   ├── types.ts              # BDD and GEPA types
│   ├── data/
│   │   └── converter.ts      # promptfoo → GEPA converter
│   └── metrics/
│       └── bdd-metrics.ts    # Multi-objective metrics
├── output/
│   └── optimized/            # Optimized prompts
└── package.json
```

### promptfoo Evaluation (eval/)

**Purpose**: Validate optimized prompts against test cases

**Core Technology**: promptfoo with Claude Agent SDK provider

- **promptfoo Integration**: Uses `anthropic:claude-agent-sdk` provider exclusively
- **Two-Layer Evaluation**:
  - **test-deterministic/**: Unit-test-like structured JSON validation
  - **test-qualitative/**: LLM-as-judge qualitative assessment
- **Sandbox Execution**: Claude Agent runs in isolated sandbox directories
- **pnpm Workspace**: Configured with specific native build allowlists

### Directory Structure

```
eval/
├── test-deterministic/           # Deterministic evaluation layer
│   ├── promptfooconfig.yaml      # Deterministic eval configuration
│   ├── prompts/                  # JSON-enforcing prompts ({{vars}})
│   ├── sandbox/                  # Agent working directory
│   └── learnings/                # Best practices documentation
├── test-qualitative/             # Qualitative evaluation layer
│   ├── promptfooconfig.yaml      # Qualitative eval configuration
│   ├── prompts/                  # Natural language prompts
│   ├── sandbox/                  # Agent working directory
│   └── learnings/                # Best practices documentation
├── test-integration/             # Integration tests (end-to-end)
│   ├── promptfooconfig.yaml      # Integration test configuration
│   └── sandbox/                  # Agent working directory
├── package.json                  # Scripts and dependencies
└── pnpm-workspace.yaml           # Native build configuration

eval-set/
└── samples/                      # Test datasets
    └── integration-test.csv      # Golden dataset (9 curated test cases)
```

### Evaluation Layers

#### test-deterministic (Deterministic Tests)
- **Purpose**: Unit-test-like structured validation
- **Method**: JSON output + contains/javascript assertions
- **Use Cases**: Schema validation, required field checks, value type verification
- **Examples**: Security vulnerability detection, code analysis result structure validation
- **Learnings**: See `eval/test-deterministic/learnings/` for best practices

#### test-qualitative (Qualitative Tests)
- **Purpose**: Quality assessment (helpfulness, accuracy, reasoning quality)
- **Method**: LLM-as-judge (llm-rubric assertions)
- **Use Cases**: Clarity of explanations, technical accuracy, structural quality
- **Examples**: Technical explanation quality evaluation, documentation generation appropriateness
- **Learnings**: See `eval/test-qualitative/learnings/` for best practices

#### test-integration (Integration Tests)
- **Purpose**: End-to-end workflow validation with golden dataset
- **Method**: Combined deterministic + qualitative assertions
- **Dataset**: `eval-set/samples/integration-test.csv` (9 curated test cases)
- **Use Cases**: Complete BDD workflow validation, brownfield FP&A SaaS domain testing
- **Key Assertions**:
  - JSON structure validation (7 deterministic checks)
  - FP&A domain considerations (llm-rubric for brownfield constraints)
  - Japanese language output validation

## Development Commands

### GEPA Optimization (tunning/)

All optimization commands must be run from the `tunning/` directory:

```bash
cd tunning

# Install dependencies
pnpm install

# Run GEPA prompt optimization
pnpm optimize                        # Multi-objective optimization (RECOMMENDED)
pnpm optimize:watch                  # Watch mode for development

# Run minimal DSPy example
pnpm start                           # Basic sentiment classifier example
pnpm dev                             # Watch mode

# Type checking and build
pnpm typecheck                       # Type check without compilation
pnpm build                           # Compile TypeScript to JavaScript
```

**Output**: Optimized prompts saved to `tunning/output/optimized/bdd-prompt-{timestamp}.json`

### promptfoo Evaluation (eval/)

All evaluation commands must be run from the `eval/` directory:

```bash
cd eval

# Install dependencies
pnpm install

# Approve native builds (required on first setup)
pnpm approve-builds
# → Must approve at least: better-sqlite3

# Run evaluations
pnpm eval                            # Run all evals (deterministic + qualitative + integration)
pnpm eval:deterministic              # Run deterministic tests only
pnpm eval:deterministic:watch        # Watch mode for deterministic tests
pnpm eval:qualitative                # Run qualitative tests only
pnpm eval:qualitative:watch          # Watch mode for qualitative tests
pnpm eval:integration                # Run integration tests only
pnpm eval:integration:watch          # Watch mode for integration tests
pnpm eval:ui                         # View results in browser (no new LLM calls)
```

## Environment Setup

**Both `tunning/` and `eval/` require separate `.env` files:**

### tunning/ Environment
```bash
cd tunning
cp .env.example .env
# Add ANTHROPIC_API_KEY=sk-ant-... to .env
```

### eval/ Environment
```bash
cd eval
cp .env.example .env
# Add ANTHROPIC_API_KEY=sk-ant-... to .env
export $(grep -v '^#' .env | xargs)  # Load to shell
```

**Critical**: `ANTHROPIC_API_KEY` must be available in shell before running `pnpm eval`.

**Note**: Each directory maintains its own `.env` to support independent usage.

## promptfoo Configuration

### Provider Settings (`promptfooconfig.yaml`)

```yaml
providers:
  - id: anthropic:claude-agent-sdk
    config:
      model: sonnet                  # Claude Sonnet 4.5
      working_dir: ./sandbox         # Agent execution directory
      permission_mode: plan          # Requires user approval for tool use
      setting_sources:
        - project                    # Use project-level settings
```

### Adding New Evals

#### Deterministic Eval (Structured Validation)

1. **Create prompt file** in `eval/test-deterministic/prompts/`:
   - Use Mustache syntax for variables: `{{varName}}`
   - Enforce JSON structure in system prompt
   - Example pattern: See `test-deterministic/prompts/structured-json.md`

2. **Update `test-deterministic/promptfooconfig.yaml`**:
   ```yaml
   prompts:
     - file://prompts/your-prompt.md

   tests:
     - description: Test case name
       vars:
         varName: value
       assert:
         - type: is-json
         - type: contains
           value: '"expectedKey"'
         - type: javascript
           value: JSON.parse(output).field.length > 0
   ```

3. **Run**: `pnpm eval:deterministic` or `pnpm eval:deterministic:watch`

#### Qualitative Eval (LLM-as-Judge)

1. **Create prompt file** in `eval/test-qualitative/prompts/`:
   - Use Mustache syntax for variables: `{{varName}}`
   - Natural language output is acceptable
   - Example pattern: See `test-qualitative/prompts/example-qualitative.md`

2. **Update `test-qualitative/promptfooconfig.yaml`**:
   ```yaml
   prompts:
     - file://prompts/your-prompt.md

   tests:
     - description: Test case name
       vars:
         query: "Your test query here"
       assert:
         - type: llm-rubric
           value: |
             The response should be:
             - Clear and well-structured
             - Technically accurate
             - Appropriate for the audience
   ```

3. **Run**: `pnpm eval:qualitative` or `pnpm eval:qualitative:watch`

### Assertion Types

#### Deterministic Assertions
```yaml
assert:
  - type: is-json              # Validate JSON parsability
  - type: contains             # Check for substring
    value: '"answer"'
  - type: javascript           # Custom JS validation
    value: JSON.parse(output).risk.length > 0
  - type: regex                # Pattern matching
    value: '"status":\s*"(success|failure)"'
```

#### Qualitative Assertions
```yaml
assert:
  - type: llm-rubric          # LLM-based quality assessment
    value: |
      Evaluation criteria:
      - Clarity and readability
      - Technical accuracy
      - Completeness of explanation
```

## Package Management

- **Package Manager**: pnpm 10.20.0 (pinned via `packageManager` field in `eval/package.json`)
- **Workspace Structure**: Monorepo with two independent workspaces
  - `tunning/`: TypeScript with tsx (no native builds)
  - `eval/`: promptfoo with native build requirements
- **Native Builds** (eval/ only): Pre-approved in `pnpm-workspace.yaml`:
  - `better-sqlite3` (required for promptfoo)
  - `@playwright/browser-chromium`
  - `esbuild`
  - `sharp`

## Best Practices

### Choosing Test Type

**Use Deterministic Tests when**:
- You need to validate specific output structure
- Checking for presence of required fields
- Verifying data types and value ranges
- Testing parsing or extraction accuracy
- Regression testing for specific behaviors

**Use Qualitative Tests when**:
- Assessing explanation quality
- Evaluating helpfulness or clarity
- Checking technical accuracy of prose
- Measuring appropriateness for audience
- Testing creative or generative outputs

### Prompt Design

#### Deterministic Prompts
- Always return structured JSON (no markdown fences, no commentary)
- Define exact schema in system prompt
- Use `{{variables}}` for parameterized tests
- Include clear type annotations in schema

#### Qualitative Prompts
- Focus on task clarity rather than output format
- Use `{{variables}}` for different scenarios
- Natural language output is acceptable
- Specify audience and context in prompt

### Eval Workflow

#### Deterministic Workflow
1. Design prompt with clear JSON schema
2. Add test cases with different `vars`
3. Use `pnpm eval:deterministic:watch` during development
4. Review results with `pnpm eval:ui`
5. Iterate on assertions based on actual outputs

#### Qualitative Workflow
1. Design prompt with clear task description
2. Create evaluation rubric (criteria for LLM judge)
3. Add test cases covering different scenarios
4. Use `pnpm eval:qualitative:watch` during development
5. Review judge feedback and refine rubric

### Sandbox Management
- Each test type has isolated sandbox directory
- Keep sandboxes clean between runs (only `.gitkeep` tracked)
- Agent can read/write files within respective sandbox
- No cross-contamination between deterministic and qualitative tests

## GEPA Optimization Workflow

### Complete Optimization Cycle

1. **Verify SKILL.md** (`.claude/skills/bdd/example-mapping/SKILL.md`):
   - Ensure the initial prompt file exists
   - This is the baseline that GEPA will optimize

2. **Prepare Training Data** (`tunning/src/data/converter.ts`):
   - Use manual test data or convert from promptfoo config
   - Define validation criteria for each example

3. **Configure Metrics** (`tunning/src/metrics/bdd-metrics.ts`):
   - Adjust metric weights if needed
   - Customize evaluation logic for your use case

4. **Run Optimization** (`tunning/`):
   ```bash
   cd tunning
   pnpm optimize
   ```
   - Loads SKILL.md as initial prompt
   - Monitor Pareto frontier size and best score
   - Optimization typically takes 5-15 minutes (8 trials)

5. **Review Optimized Prompt** (`tunning/output/optimized/`):
   - `SKILL-optimized-{timestamp}.md` - Ready-to-use format
   - `bdd-prompt-{timestamp}.json` - Full optimization result
   - Review `bestScore` and optimized instruction in console

6. **Replace Original SKILL.md** (backup first):
   ```bash
   cp .claude/skills/bdd/example-mapping/SKILL.md \
      .claude/skills/bdd/example-mapping/SKILL.md.backup

   cp tunning/output/optimized/SKILL-optimized-{timestamp}.md \
      .claude/skills/bdd/example-mapping/SKILL.md
   ```

7. **Validate with promptfoo** (`eval/`):
   ```bash
   cd eval
   pnpm eval:deterministic
   ```

8. **Iterate**:
   - Compare evaluation scores (before vs after)
   - Adjust metrics or training data based on results
   - Re-run optimization
   - Compare Pareto frontiers and best scores

### Multi-Objective Trade-offs

GEPA returns a **Pareto frontier** of solutions, where improving one objective necessarily degrades another:

- **High accuracy, low brevity**: Verbose but comprehensive
- **High brevity, lower completeness**: Concise but may miss details
- **Balanced**: Middle ground across all objectives

The optimizer selects the best scalarized solution, but you can inspect the Pareto frontier in logs to understand trade-offs.

### Customization Examples

**Increase optimization quality** (slower):
```typescript
// tunning/src/optimize-gepa.ts
const optimizer = new AxGEPA({
  numTrials: 32,  // More iterations
  // ...
});
```

**Add more training data**:
```typescript
// tunning/src/data/converter.ts
export function getManualTestData(): PromptfooTestCase[] {
  return [
    // Add 10-20 diverse examples
    { description: '...', vars: { story_input: '...' } },
    // ...
  ];
}
```

**Change metric priorities**:
```typescript
// tunning/src/optimize-gepa.ts
{
  validationExamples: dataset.validation,
  maxMetricCalls: 100,
  paretoMetricKey: 'completeness',  // Prioritize completeness over accuracy
}
```

## Common Issues

### Build Approval Required
**Error**: Native builds not approved
**Fix**: Run `pnpm approve-builds` and select at least `better-sqlite3`

### Missing API Key
**Error**: Authentication failed
**Fix**: Ensure `ANTHROPIC_API_KEY` is exported in current shell session

### Wrong Directory
**Error**: Cannot find promptfooconfig.yaml
**Fix**: All commands must run from `eval/` directory

### Config File Path Issues
**Error**: Config file not found when running specific test type
**Fix**: Ensure you're using the correct command:
- `pnpm eval:deterministic` for `test-deterministic/promptfooconfig.yaml`
- `pnpm eval:qualitative` for `test-qualitative/promptfooconfig.yaml`

### GEPA Optimization Issues

**Error**: `Cannot find module '@ax-llm/ax'`
**Fix**: Install dependencies in `tunning/` directory:
```bash
cd tunning
pnpm install
```

**Error**: Optimization takes too long (>30 minutes)
**Fix**: Reduce `numTrials` in `tunning/src/optimize-gepa.ts`:
```typescript
const optimizer = new AxGEPA({
  numTrials: 4,  // Start with 4 for faster iteration
  // ...
});
```

**Issue**: Low optimization scores (<0.5)
**Diagnosis**:
- Check if training data is representative
- Review metric definitions in `tunning/src/metrics/bdd-metrics.ts`
- Ensure initial prompt in `optimize-gepa.ts` is reasonable

**Issue**: Pareto frontier size is 1
**Meaning**: All solutions are dominated by a single solution (no trade-offs found)
**Fix**: This may be acceptable, but consider:
- Adding more diverse training examples
- Adjusting metric definitions to create more tension between objectives

## Important File Locations

### Optimization Target
- **SKILL.md**: `.claude/skills/bdd/example-mapping/SKILL.md`
  - This is the prompt being optimized
  - ALWAYS backup before replacing with optimized version

### Training Data
- **Manual dataset**: `tunning/src/data/converter.ts` (getTrainingDataset function)
- **Integration dataset**: `eval-set/samples/integration-test.csv` (9 curated cases)

### Metric Definitions
- **Core metrics**: `tunning/src/metrics/bdd-metrics.ts`
- **Documentation**: `tunning/METRICS.md` (detailed rubrics and customization guide)

### Output Locations
- **Optimized prompts**: `tunning/output/optimized/`
  - `SKILL-optimized-{timestamp}.md` - Ready to deploy
  - `result-{timestamp}.json` - Full GEPA result with metadata
- **Eval results**: `eval/test-integration-results.json` (integration test results)

### Documentation
- **Project overview**: `README.md` (root)
- **Claude Code guide**: `CLAUDE.md` (this file)
- **Optimization guide**: `tunning/README.md`, `tunning/QUICKSTART.md`
- **Evaluation guide**: `eval/README.md`
- **Best practices**: `eval/test-*/learnings/` directories

## References

### GEPA & Optimization
- [GEPA Documentation](https://axllm.dev/gepa/) - Multi-objective genetic optimization
- [axllm](https://axllm.dev/) - DSPy for TypeScript
- [DSPy](https://dspy-docs.vercel.app/) - Original Python framework

### promptfoo & Evaluation
- [promptfoo Documentation](https://www.promptfoo.dev/)
- [Configuration Guide](https://www.promptfoo.dev/docs/category/configuration/)
- [Assertions Reference](https://www.promptfoo.dev/docs/configuration/expected-outputs/)
- [Claude Agent SDK Provider](https://www.promptfoo.dev/docs/providers/)

### BDD & Example Mapping
- [Example Mapping](https://cucumber.io/blog/bdd/example-mapping-introduction/) - Matt Wynne's original technique
- [3 Amigos](https://www.agilealliance.org/glossary/three-amigos/) - Collaborative specification
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/) - Given/When/Then syntax
