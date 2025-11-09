# test-scenario: BDD Example Mapping Integration Tests

## Overview

This directory contains **scenario-based integration tests** for the BDD Example Mapping skill (`/.claude/skills/bdd/example-mapping/SKILL.md`). Unlike the deterministic and qualitative tests which validate specific behaviors, these scenario tests validate the **complete end-to-end workflow** of the Example Mapping process.

## Test Philosophy

### Integration Testing Approach

- **Target**: The main BDD skill prompt (`SKILL.md`) - the "parent process" of the prompt hierarchy
- **Level**: Integration test (not unit test)
- **Scope**: Validates the complete Example Mapping workflow from ambiguous user story to structured JSON output
- **Data Source**: Golden dataset from `eval-set/` (shared with fine-tuning)

### Scenario Testing Benefits

From promptfoo's scenario documentation:
> Scenarios allow you to "group a set of data along with a set of tests that should be run on that data"

This creates a **test matrix** by combining:
- Multiple variable sets (different complexity levels)
- Shared assertions (structural and qualitative validations)

Result: Comprehensive coverage without redundant test definitions.

## Directory Structure

```
test-scenario/
├── promptfooconfig.yaml       # Scenario configuration
├── sandbox/                   # Agent working directory
│   └── .gitkeep
└── README.md                  # This file
```

## Test Configuration

### Current Scenarios

#### Scenario 1: Representative Sample (9 cases)

**Purpose**: Validate Example Mapping with a balanced sample across Job and Persona dimensions

**Composition**: 5 Job-based + 4 Persona-based = **9 cases total**

**Job-based samples** (1 case from each Job category):

| # | Job | Complexity | Story | Source |
|---|-----|-----------|-------|--------|
| 1 | 手作業削減 | medium | CSV自動インポート | `reduce-effort.csv` |
| 2 | 精度向上 | medium | 勘定科目マッピング | `increase-accuracy.csv` |
| 3 | 可視性向上 | medium | ダッシュボード可視化 | `improve-visibility.csv` |
| 4 | 統制強化 | complex | 承認後の編集制御 | `strengthen-control.csv` |
| 5 | 協働促進 | ambiguous | 業務委譲と統制 | `enhance-collaboration.csv` |

**Persona-based samples** (1 case from each persona):

| # | Persona | Complexity | Story | Source |
|---|---------|-----------|-------|--------|
| 6 | 部門長 | medium | 人件費一括設定 | `department-head.csv` |
| 7 | 経理担当 | complex | 全部門統合集計 | `finance-manager.csv` |
| 8 | CFO | complex | シナリオ分析 | `cfo.csv` |
| 9 | IT管理者 | complex | SAP API連携 | `it-admin.csv` |

**Total Test Matrix**: 9 test cases × 10 assertions = **90 test results**

**Assertions** (10 total):

1. ✅ **Valid JSON**: No markdown fences, parseable JSON
2. ✅ **Top-level structure**: All required keys present
3. ✅ **Story decomposition**: Proper persona structure (as_a, i_want_to, so_that)
4. ✅ **Rule threshold**: Meets minimum rule count based on complexity
5. ✅ **Rule structure**: Each rule has id, name, examples array
6. ✅ **Question threshold**: Meets minimum question count based on complexity
7. ✅ **Ambiguous handling**: Ambiguous cases generate 7+ questions
8. ✅ **Metadata accuracy**: Counts match actual array lengths
9. ✅ **Japanese output**: All text in Japanese
10. ✅ **Domain awareness** (LLM-as-judge): Demonstrates FP&A SaaS brownfield considerations

## Running Tests

### Prerequisites

```bash
cd eval
export $(grep -v '^#' .env | xargs)  # Load ANTHROPIC_API_KEY
```

### Execute Scenario Tests

```bash
# Run scenario tests
pnpm promptfoo eval -c test-scenario/promptfooconfig.yaml

# View results
pnpm promptfoo view -c test-scenario/promptfooconfig.yaml
```

### Expected Runtime

- **9 test cases** = **9 LLM calls** (Claude Sonnet 4.5 via Agent SDK) + **9 LLM-as-judge calls** (assertion #10)
- Total API calls: **18**
- Estimated time: ~5-7 minutes (depends on agent execution time)

## Test Design Rationale

### Why Scenario Tests for Integration Testing?

1. **Matrix Coverage**: Test the same skill with multiple complexity levels without writing 40 individual test cases
2. **Shared Assertions**: All complexity levels should satisfy the same structural requirements
3. **Scalability**: Easy to add new complexity levels or story patterns
4. **Golden Dataset Integration**: Uses real test cases from `eval-set/` for authenticity

### Assertion Strategy

**Structural Assertions (1-9)**: JavaScript-based validation
- Fast execution
- Deterministic results
- Catches schema violations and logic errors

**Qualitative Assertion (10)**: LLM-as-judge
- Validates domain-specific reasoning
- Checks for FP&A SaaS brownfield awareness
- Complements structural validation

## Adding New Scenarios

### Pattern: Testing Different Story Types

```yaml
scenarios:
  - description: 'Example Mapping for different FP&A categories'
    config:
      - category: 'データ統合'
        story_input: 'ERPシステムから予算データを自動連携したい'
      - category: '権限承認'
        story_input: '部門長承認後はCFO承認必須にしたい'
      - category: 'レポート'
        story_input: '月次予実レポートを自動生成したい'
    tests:
      # Shared assertions apply to all categories
      - description: 'Valid JSON structure'
        assert:
          - type: is-json
      # ... more assertions
```

### Pattern: Testing Persona Variations

```yaml
scenarios:
  - description: 'Example Mapping with persona context'
    config:
      - persona: '部門長'
        story_input: '予算入力を部下に委譲したい'
        persona_context: '部門長は予算全体の調整が主業務。細かい手入力は避けたい。'
      - persona: '経理担当'
        story_input: '勘定科目マッピングを自動化したい'
        persona_context: '経理担当はデータ品質と監査対応が最優先。'
    tests:
      # Assertions validate persona-appropriate questions are generated
```

## Maintenance

### When to Update

- ✅ When `SKILL.md` schema changes (update assertions)
- ✅ When adding new complexity levels to golden dataset (add to config)
- ✅ When discovering new failure modes (add targeted assertions)
- ❌ When adding new sub-skills (those should have their own test directories)

### Quality Checks

Before committing changes:

1. All scenario tests pass: `pnpm promptfoo eval -c test-scenario/promptfooconfig.yaml`
2. Results viewable: `pnpm promptfoo view -c test-scenario/promptfooconfig.yaml`
3. No warnings in output
4. Sandbox directory remains clean (only `.gitkeep` tracked)

## References

- [promptfoo Scenario Documentation](https://www.promptfoo.dev/docs/configuration/scenarios/)
- [BDD Example Mapping SKILL.md](../../.claude/skills/bdd/example-mapping/SKILL.md)
- [Golden Dataset README](../../eval-set/README.md)
- [Project CLAUDE.md](../../CLAUDE.md)

---

*Last updated: 2025-11-09*
