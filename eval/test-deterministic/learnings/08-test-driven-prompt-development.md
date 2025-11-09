# 08. テスト駆動プロンプト開発 (TDPD)

**Index**: [README](./README.md) > 08-test-driven-prompt-development

## Test-Driven Prompt Development とは

TDD (Test-Driven Development) の原則をプロンプト開発に適用したアプローチ。

伝統的TDD:
```
1. テストを書く
2. コードを書く (失敗)
3. テストが通るまで修正
4. リファクタリング
```

TDPD:
```
1. 期待する出力を定義 (assertion)
2. プロンプトを書く (失敗)
3. プロンプトを改善 (パス)
4. 知識を追加して精緻化
```

## 今回の実践例

### Phase 1: テストケース定義

promptfooconfig.yaml:
```yaml
tests:
  - description: "[曖昧×既存機能調整] 予実差異レポートの表示改善"
    vars:
      story_input: "予実差異レポートで、マイナス値を赤字で表示したい。"
    assert:
      - type: javascript
        value: |
          // 曖昧な指示: blockerまたはclarificationに質問が3つ以上
          const criticalQuestions =
            out.questions.blocker.length +
            out.questions.clarification.length;
          return criticalQuestions >= 3;
```

**目的を明確化**: 「曖昧な要求から適切な質問を生成できるか」

### Phase 2: 最小プロンプト

SKILL.md (v1 - 最小版):
```markdown
User Story: {{story_input}}

Output JSON:
{
  "story": { ... },
  "rules": [ ... ],
  "questions": { ... }
}
```

結果: **FAIL** - 会話形式の出力

### Phase 3: JSON出力の強制

SKILL.md (v2):
```markdown
User Story: {{story_input}}

Analyze and output ONLY valid JSON (no markdown code fences, no commentary):
[JSON schema]
```

結果: **PASS (構造)** - しかし質問が表面的

### Phase 4: 知識の追加

SKILL.md (v3):
```markdown
[JSON schema]

## Example Mapping Principles
**3 Amigos Perspectives**: [Developer, Tester, PO]
**Question Patterns**: [発見的、明確化、境界値]
```

結果: **PASS (品質)** - 多角的な質問を生成

### Phase 5: ドメイン特化

SKILL.md (v4 - 最終版):
```markdown
[Principles]

**FP&A SaaS Brownfield Considerations**:
- 既存機能との整合性
- 権限・承認フローへの影響
- Excel出力への影響
```

結果: **PASS (100%)** - FP&A特有の質問も生成

## TDPDのワークフロー

```
┌─────────────────────┐
│ 1. Define Tests     │ ← アサーションで期待値を定義
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Minimal Prompt   │ ← 必要最小限のプロンプト
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Run & Analyze    │ ← promptfoo eval実行
└──────────┬──────────┘
           │
           ▼
   ┌───────┴────────┐
   │  Pass?         │
   └───┬────────┬───┘
       │ No     │ Yes
       ▼        ▼
┌──────────┐ ┌────────────┐
│ 4. Debug │ │ 5. Refine  │
│  & Fix   │ │  Knowledge │
└─────┬────┘ └─────┬──────┘
      │            │
      └─────┬──────┘
            │
            ▼
┌─────────────────────┐
│ 6. Iterate          │ ← 全テストパスまで繰り返し
└─────────────────────┘
```

## Phase別の焦点

| Phase | 焦点 | ゴール |
|-------|------|--------|
| 1 | テスト定義 | 期待値の明確化 |
| 2 | 最小プロンプト | 構造の確立 |
| 3 | 形式の強制 | JSON出力の実現 |
| 4 | 知識の追加 | 内容の質向上 |
| 5 | ドメイン特化 | 実用性の向上 |
| 6 | リファクタリング | 簡潔性と保守性 |

## 重要な原則

### ✅ 小さく始める

最初から完璧なプロンプトを目指さない:
```markdown
# v1: 動くことを確認
User Story: {{story_input}}
Output JSON: {...}

# v2 → v3 → v4: 段階的に改善
```

### ✅ 失敗を歓迎する

```bash
Pass Rate: 0.00%  # これは情報
```

promptfoo viewで**なぜ失敗したか**を分析:
- 出力形式が違う？
- 内容が浅い？
- キーワードが足りない？

### ✅ 一度に一つの変更

```
v1 → v2: JSON出力の強制
v2 → v3: 3 Amigos追加
v3 → v4: FP&A考慮事項追加
```

各ステップでテスト実行 → 効果を測定

### ❌ config内に直接プロンプト記述

```yaml
prompts:
  - |
    [長いプロンプト]  # アンチパターン
```

理由: 反復的な改善が困難、バージョン管理できない

## デバッグサイクル

```bash
# 1. テスト実行
pnpm eval:deterministic

# 2. 失敗分析
pnpm eval:ui  # ブラウザで確認

# 3. プロンプト修正
vim ../../.claude/skills/bdd/example-mapping/SKILL.md

# 4. 再テスト
pnpm eval:deterministic
```

**重要**: promptfoo viewは新しいLLM呼び出しをしないため、プロンプト修正後は`pnpm eval`が必要。

## メトリクスで進捗を測定

各反復で記録:
- Pass rate
- トークン使用量
- 実行時間
- 質問数/質の主観評価

例:
```
v1: 0% pass, 1000 tokens, "質問が浅い"
v2: 33% pass, 3000 tokens, "JSON出力OK、内容が浅い"
v3: 66% pass, 5000 tokens, "質問が深まった、FP&A特化不足"
v4: 100% pass, 5868 tokens, "実用レベル"
```

## まとめ

| 原則 | 理由 |
|------|------|
| テストから始める | 期待値を明確化 |
| 小さく始める | 段階的改善 |
| 失敗から学ぶ | promptfoo viewで分析 |
| 一度に一つの変更 | 効果の測定 |
| file://参照を使う | 反復的改善の効率化 |

TDPDにより、プロンプトの品質を**測定可能**かつ**再現可能**な形で向上できる。

## 関連する学び

- [03-prompt-design-principles.md](./03-prompt-design-principles.md) - プロンプト構造
- [06-preserving-prompt-knowledge.md](./06-preserving-prompt-knowledge.md) - 段階的知識追加
- [09-debugging-tips.md](./09-debugging-tips.md) - デバッグサイクル
