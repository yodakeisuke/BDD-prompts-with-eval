# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a prompt evaluation harness for Claude Agent SDK using promptfoo. The repository contains a two-layer evaluation configuration for running both deterministic and qualitative evals against Claude's Agent SDK.

**Primary working directory**: `eval/`

## Architecture

### Core Components

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
│   │   └── structured-json.md
│   └── sandbox/                  # Agent working directory
├── test-qualitative/             # Qualitative evaluation layer
│   ├── promptfooconfig.yaml      # Qualitative eval configuration
│   ├── prompts/                  # Natural language prompts
│   │   └── example-qualitative.md
│   └── sandbox/                  # Agent working directory
├── package.json                  # Scripts and dependencies
└── pnpm-workspace.yaml           # Native build configuration

eval-set/                         # (Currently empty placeholder)
tunning/                          # (Currently empty placeholder)
```

### Evaluation Layers

#### test-deterministic (Deterministic Tests)
- **Purpose**: Unit-test-like structured validation
- **Method**: JSON output + contains/javascript assertions
- **Use Cases**: Schema validation, required field checks, value type verification
- **Examples**: Security vulnerability detection, code analysis result structure validation

#### test-qualitative (Qualitative Tests)
- **Purpose**: Quality assessment (helpfulness, accuracy, reasoning quality)
- **Method**: LLM-as-judge (llm-rubric assertions)
- **Use Cases**: Clarity of explanations, technical accuracy, structural quality
- **Examples**: Technical explanation quality evaluation, documentation generation appropriateness
```

## Development Commands

All commands must be run from the `eval/` directory:

```bash
cd eval

# Install dependencies
pnpm install

# Approve native builds (required on first setup)
pnpm approve-builds
# → Must approve at least: better-sqlite3

# Run evaluations
pnpm eval                            # Run all evals (deterministic + qualitative)
pnpm eval:deterministic              # Run deterministic tests only
pnpm eval:deterministic:watch        # Watch mode for deterministic tests
pnpm eval:qualitative                # Run qualitative tests only
pnpm eval:qualitative:watch          # Watch mode for qualitative tests
pnpm eval:ui                         # View results in browser (no new LLM calls)
```

## Environment Setup

1. Copy environment template:
   ```bash
   cd eval
   cp .env.example .env.local
   ```

2. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Load environment (choose one):
   ```bash
   export $(grep -v '^#' .env.local | xargs)  # Manual
   # OR use direnv/similar tool
   ```

**Critical**: `ANTHROPIC_API_KEY` must be available in shell before running `pnpm eval`.

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

- **Package Manager**: pnpm 10.20.0 (pinned via `packageManager` field)
- **Native Builds**: Pre-approved in `pnpm-workspace.yaml`:
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
