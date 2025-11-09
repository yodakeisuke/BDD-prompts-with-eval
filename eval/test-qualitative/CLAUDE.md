# test-qualitative: LLM-as-Judge Evaluation Layer

Qualitative evaluation for Example Mapping SKILL.md using LLM-based quality assessment.

## Purpose

Subjective quality assessment using `llm-rubric` assertions to evaluate:
- Depth of questions (3 Amigos perspectives)
- Domain expertise (FP&A SaaS specificity)
- Appropriateness of rule decomposition
- Concreteness and testability of examples

## Test Type

**LLM-as-judge** - Uses Claude to evaluate quality against detailed rubrics

## Characteristics

| Aspect | Value |
|--------|-------|
| Speed | Slow (multiple LLM calls per test) |
| Cost | High (judge model + output model) |
| Determinism | Low (LLM-based scoring) |
| Insight | Deep (explanatory feedback) |

## When to Use

Use qualitative tests when you need to assess:
- **Question quality**: Are questions insightful, non-redundant, and cover all perspectives?
- **Domain expertise**: Does output demonstrate deep FP&A SaaS domain knowledge?
- **Rule decomposition**: Are business rules appropriately granular and well-organized?
- **Example quality**: Are examples concrete, testable (Given/When/Then), and cover edge cases?
- **Balance**: Is the output balanced (blocker/clarification/future questions, normal/error cases)?

## Current Test Cases

### Case 1: [UI/UX] 曖昧な要求からの質問生成能力
**Story**: "予算入力画面をもっと使いやすくしたい"

**Evaluation Criteria** (5-point scale, requires avg ≥4.0):
1. **質問の深さと洞察力**: 3 Amigos視点(Developer/Tester/PO)を網羅し本質的か
2. **FP&A SaaS特化性**: Excel親和性、予算編成プロセス、ワークフローへの配慮
3. **質問の重複・冗長性の回避**: 各質問が独立した価値を持つか
4. **実用性・実装可能性**: 開発チームが実装できる粒度、next_actionsが明確か

### Case 2: [権限承認] 複雑な業務ロジックの整理能力
**Story**: "部門予算の承認フローを2段階にしたい。部門長承認後、経理承認を追加。"

**Evaluation Criteria** (5-point scale, requires avg ≥4.0):
1. **ルール分解の適切性**: 権限マトリクス、状態遷移考慮、適切な粒度(3-7個)
2. **例の具体性・検証可能性**: Given/When/Then形式、正常系+異常系
3. **技術的正確性**: 承認フロー用語、FP&Aドメイン知識(予算ロック/監査証跡/再承認)
4. **バランス**: 質問カテゴリ配分、複雑度に応じた分割提案、ルール:例の比率

## Running Tests

```bash
# Single run
pnpm eval:qualitative

# Watch mode (auto re-run on file changes)
pnpm eval:qualitative:watch

# View results in browser
pnpm eval:ui
```

## Understanding LLM-Rubric Output

When tests run, the judge model provides:
- **Individual criterion scores** (1-5 for each evaluation point)
- **Reasoning** for each score
- **Overall pass/fail** (based on average ≥4.0 threshold)

Example output:
```
Criterion 1: 質問の深さと洞察力
Score: 4/5
Reason: Developer視点とTester視点は十分だが、PO視点(ビジネス価値)がやや弱い

Criterion 2: FP&A SaaS特化性
Score: 5/5
Reason: Excel操作、月次サイクル、既存ワークフローへの配慮が明確

...

Overall: PASS (average 4.25)
```

## Debugging Failures

When qualitative tests fail:

1. **Review judge feedback** in `promptfoo view` - check which criteria scored low
2. **Examine actual output** - does it truly lack the quality, or is rubric too strict?
3. **Consider adjustments**:
   - **Rubric too strict**: Lower threshold or adjust criteria descriptions
   - **Output truly lacking**: Improve SKILL.md knowledge sections
   - **Rubric unclear**: Add concrete examples of 1-star vs 5-star outputs

## Cost Considerations

Qualitative tests are expensive:
- Each test case = 1 output generation + 1 judge evaluation
- For 2 test cases: ~4 LLM calls (2 outputs, 2 judges)
- Estimated cost: $0.10-0.50 per full test run (depending on output length)

**Best Practice**: Use `test-deterministic` to validate structure first, then run qualitative tests to assess quality.

## Relation to Deterministic Layer

| Layer | Validates | Example |
|-------|-----------|---------|
| Deterministic | Structure exists | "Has `questions.blocker` array?" |
| Qualitative | Structure is good | "Are blocker questions actually blocking issues?" |

Both layers test the same prompt (`../../.claude/skills/bdd/example-mapping/SKILL.md`) but validate different aspects.

## Maintenance

When encountering issues or learning new patterns:
1. Check deterministic layer's learnings: `test-deterministic/learnings/CLAUDE.md`
2. Most promptfoo + Claude Agent SDK patterns apply to both layers
3. Qualitative-specific patterns:
   - Rubric design (balance specificity with flexibility)
   - Threshold tuning (4.0 avg is strict, 3.5 is moderate)
   - Judge model selection (current: same as output model)

## References

- **Deterministic learnings**: `../test-deterministic/learnings/CLAUDE.md`
- **promptfoo LLM-rubric docs**: https://www.promptfoo.dev/docs/configuration/expected-outputs/llm-rubric/
- **Target prompt**: `../../.claude/skills/bdd/example-mapping/SKILL.md`
