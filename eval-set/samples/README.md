# eval-set/samples - Curated Test Samples

このディレクトリには、統合テストや特定の評価目的のために厳選されたテストケースサンプルが含まれています。

## ディレクトリの目的

- **元データとの関係**: `eval-set/base/`, `eval-set/persona/`, `eval-set/job/` から代表的なケースを抽出
- **用途**: promptfoo統合テストでケース数を制御しながらゴールデンデータセットをimport
- **利点**: テスト実行時間を短縮しつつ、網羅性を維持

## ファイル一覧

### integration-test.csv (9ケース)

**目的**: BDD Example Mapping Skillの統合テスト用

**構成**:
- Job-based: 5ケース（各Job理論カテゴリから1ケースずつ）
- Persona-based: 4ケース（各ペルソナから1ケースずつ）

**カラム定義**:

| カラム | 説明 | 例 |
|-------|------|-----|
| `source_file` | 元ファイル名（トレーサビリティ用） | `reduce-effort.csv` |
| `source_type` | データソースタイプ | `job` or `persona` |
| `category` | 機能カテゴリ | `データ統合`, `権限承認` |
| `complexity` | 複雑度 | `simple`, `medium`, `complex`, `ambiguous` |
| `story_input` | ユーザーストーリー（Example Mappingへの入力） | `予算データをExcelから...` |
| `context` | コンテキスト情報（job_contextまたはpersona_context） | `ユーザーは反復的な...` |
| `expected_rules_min` | 期待される最小ルール数 | `3` |
| `expected_questions_min` | 期待される最小質問数 | `5` |
| `domain_tags` | ドメインタグ（カンマ区切り） | `automation,csv-import` |

**選定基準**:

1. **Job-based (5ケース)**:
   - 手作業削減: CSVインポート自動化（medium）
   - 精度向上: 勘定科目マッピング（medium）
   - 可視性向上: ダッシュボード可視化（medium）
   - 統制強化: 承認後編集制御（complex）
   - 協働促進: 業務委譲と統制（ambiguous）

2. **Persona-based (4ケース)**:
   - 部門長: 人件費一括設定（medium）
   - 経理担当: 全部門統合集計（complex）
   - CFO: シナリオ分析（complex）
   - IT管理者: SAP API連携（complex）

**複雑度分布**:
- simple: 0ケース
- medium: 4ケース
- complex: 4ケース
- ambiguous: 1ケース

## promptfooでの使用方法

### 基本的な使用例

```yaml
# promptfooconfig.yaml
prompts:
  - file://../../.claude/skills/bdd/example-mapping/SKILL.md

tests: file://../../eval-set/samples/integration-test.csv

defaultTest:
  assert:
    - type: is-json
    - type: javascript
      value: |
        const parsed = JSON.parse(output);
        const requiredKeys = ['story', 'rules', 'questions'];
        return requiredKeys.every(key => key in parsed);
```

### 変数へのアクセス

promptfooは各行のカラムを自動的に変数として利用可能にします:

```javascript
// アサーション内で利用可能
context.vars.source_file           // "reduce-effort.csv"
context.vars.source_type           // "job"
context.vars.category              // "データ統合"
context.vars.complexity            // "medium"
context.vars.story_input           // "予算データを..."
context.vars.context               // "ユーザーは反復的な..."
context.vars.expected_rules_min    // 3
context.vars.expected_questions_min // 5
context.vars.domain_tags           // "automation,csv-import,..."
```

## メンテナンス

### 新規サンプルファイルの作成

1. **目的を明確化**: どの評価シナリオのためか？
2. **元データから抽出**: `base/`, `persona/`, `job/` から代表的なケースを選択
3. **ケース数を制限**: 統合テストは5-15ケース程度が適切
4. **カラムスキーマの統一**: できるだけ既存のカラム構造を再利用

### 品質基準

- ✅ 複雑度のバランスが取れている（simple/medium/complex/ambiguousを適度に含む）
- ✅ カテゴリの多様性（データ統合、権限承認、レポート等が偏らない）
- ✅ source_fileで元データへのトレーサビリティを維持
- ✅ 実行時間が10分以内（API呼び出し数 < 30）

## 関連ドキュメント

- [eval-set/README.md](../README.md) - ゴールデンデータセット全体の説明
- [eval/test-integration/README.md](../../eval/test-integration/README.md) - 統合テストの詳細
- [promptfoo Dataset Documentation](https://www.promptfoo.dev/docs/configuration/datasets/)

---

*Last updated: 2025-11-09*
