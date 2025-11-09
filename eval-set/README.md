# eval-set: Golden Dataset Repository

FP&A SaaSのExample Mapping評価用ゴールデンデータセット。promptfoo evaluation及びfine-tuningで共有利用。

## ディレクトリ構成

```
eval-set/
├── base/              # 基本シナリオ（ペルソナ・Job混在）
├── persona/           # ペルソナ特化シナリオ
├── job/               # Jobs-to-be-Done特化シナリオ
└── samples/           # 厳選サンプル（統合テスト用）
```

---

## 0. samples/ - 厳選サンプル（統合テスト用）

**目的**: promptfoo統合テストでケース数を制御しながらゴールデンデータセットをimport

### ファイル構成

| ファイル | ケース数 | 構成 | 用途 |
|---------|----------|------|------|
| `integration-test.csv` | 9 | Job 5ケース + Persona 4ケース | BDD Example Mapping統合テスト |

### 特徴

- **元データからの抽出**: base/persona/jobから代表的なケースを厳選
- **トレーサビリティ**: `source_file`カラムで元ファイルを記録
- **実行時間の最適化**: 9ケース × 9アサーション = 81テスト結果（約5-7分）
- **promptfoo直接import**: `tests: file://path/to/integration-test.csv`

詳細は [samples/README.md](samples/README.md) を参照。

---

## 1. base/ - 基本ゴールデンセット

**目的**: FP&A SaaS開発でよくある代表的ユーザーストーリー

### ファイル構成

| ファイル | ケース数 | 用途 |
|---------|----------|------|
| `fpa-saas-stories.csv` | 10 | ドメイン横断の基本シナリオ（UI/UX、レポート、権限、データ統合等） |

### カラム定義

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `category` | string | 機能カテゴリ | `UI/UX`, `レポート`, `権限承認`, `データ統合` |
| `complexity` | enum | 複雑度（`simple`, `medium`, `complex`, `ambiguous`） | `complex` |
| `story_input` | string | ユーザーストーリー断片（Example Mappingへの入力） | `"予算入力がやりにくい。もっと早くしたい。"` |
| `expected_rules_min` | int | 期待されるルール数（最小） | `3` |
| `expected_questions_min` | int | 期待される質問数（最小） | `7` |
| `domain_tags` | string | ドメインタグ（カンマ区切り） | `"input,excel-like,brownfield"` |

### 複雑度の定義

- **simple**: 要求が明確、1-2機能で完結、既存機能の小改修
- **medium**: 中程度の曖昧性、3-4機能の組み合わせ、既存機能の拡張
- **complex**: 高度な曖昧性、5+ルール必要、権限マトリクス/状態遷移等
- **ambiguous**: 要求が非常に曖昧、大量の質問（7+）で仕様確定が必要

### 使用例（promptfooconfig.yaml）

```yaml
tests:
  - file://../eval-set/base/fpa-saas-stories.csv
```

---

## 2. persona/ - ペルソナ特化データセット

**目的**: 役割別の典型的要求パターンと文脈を反映

### ファイル構成

| ファイル | ペルソナ | ケース数 | 特徴 |
|---------|----------|----------|------|
| `department-head.csv` | 部門長 | 6 | 予算調整、承認履歴、進捗モニタリング、業務委譲 |
| `finance-manager.csv` | 経理担当 | 6 | データ統合、監査証跡、月次締め、差異分析 |
| `cfo.csv` | CFO | 6 | 経営ダッシュボード、シナリオ分析、最終承認、経営報告 |
| `it-admin.csv` | IT管理者 | 6 | システム統合、ユーザー管理、パフォーマンス、バックアップ |

### カラム定義（base/の全カラム + 追加カラム）

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `persona_context` | string | ペルソナ固有の文脈・背景 | `"部門長は予算全体の調整が主業務。細かい手入力は避けたい。"` |

### ペルソナ別の特徴

#### department-head.csv（部門長）
- **関心**: 効率的な予算入力、承認履歴管理、進捗モニタリング
- **課題**: 業務委譲と統制のバランス、Excel慣れ
- **典型的要求**: 一括操作、変更差分の可視化、代理入力

#### finance-manager.csv（経理担当）
- **関心**: データ品質、監査対応、統合レポート、月次締め統制
- **課題**: 複数システム間の整合性、監査証跡、勘定科目マッピング
- **典型的要求**: 自動集計、変更履歴記録、外部監査対応

#### cfo.csv（CFO）
- **関心**: 経営判断材料、シナリオ分析、取締役会報告
- **課題**: 全社予算の統括、緊急時の柔軟性、資金繰り予測
- **典型的要求**: ダッシュボード、What-if分析、自動レポート生成

#### it-admin.csv（IT管理者）
- **関心**: システム統合、自動化、パフォーマンス、セキュリティ
- **課題**: 既存システムとの連携、ユーザー管理、データ保護
- **典型的要求**: API統合、AD連携、バッチ処理最適化

### 使用例（promptfooconfig.yaml）

```yaml
# 部門長視点のみで評価
tests:
  - file://../eval-set/persona/department-head.csv

# 全ペルソナで網羅評価
tests:
  - file://../eval-set/persona/department-head.csv
  - file://../eval-set/persona/finance-manager.csv
  - file://../eval-set/persona/cfo.csv
  - file://../eval-set/persona/it-admin.csv
```

---

## 3. job/ - Jobs-to-be-Done特化データセット

**目的**: ユーザーが達成したい「Job（仕事）」別にシナリオを分類

### ファイル構成

| ファイル | Job | ケース数 | 焦点 |
|---------|-----|----------|------|
| `reduce-effort.csv` | 手作業削減 | 5 | 自動化、一括操作、定型業務削減 |
| `increase-accuracy.csv` | 精度向上 | 5 | エラー削減、検証強化、異常検知 |
| `improve-visibility.csv` | 可視性向上 | 5 | ダッシュボード、進捗把握、差分表示 |
| `strengthen-control.csv` | 統制強化 | 5 | アクセス制御、承認階層、監査証跡 |
| `enhance-collaboration.csv` | 協働促進 | 5 | 業務委譲、コメント機能、情報共有 |

### カラム定義（base/の全カラム + 追加カラム）

| カラム | 型 | 説明 | 例 |
|--------|-----|------|-----|
| `job_to_be_done` | string | Jobs-to-be-Done分類 | `"手作業削減"`, `"精度向上"` |
| `job_context` | string | Job達成の文脈・背景 | `"ユーザーは反復的な手入力作業を削減したい（Jobs: 時間節約・エラー削減）"` |

### Job別の特徴

#### reduce-effort.csv（手作業削減）
- **Job**: 反復作業を自動化し、本質的業務に集中する
- **典型的要求**: CSVインポート、レポート自動生成、一括コピー、システム連携、自動通知
- **成功指標**: 作業時間削減率、自動化率

#### increase-accuracy.csv（精度向上）
- **Job**: 人的エラーを削減し、データ品質を向上する
- **典型的要求**: 自動マッピング、必須入力、フォーマット検証、期限管理、異常値アラート
- **成功指標**: エラー発生率、データ品質スコア

#### improve-visibility.csv（可視性向上）
- **Job**: 進捗状況を常時把握し、迅速な意思決定を行う
- **典型的要求**: ダッシュボード、ステータス表示、変更履歴、シナリオ比較、差分ハイライト
- **成功指標**: 意思決定速度、情報アクセス時間

#### strengthen-control.csv（統制強化）
- **Job**: 不正防止と内部統制を強化する
- **典型的要求**: 状態ベース権限、承認階層、アクセスログ、データ分離、例外管理
- **成功指標**: 監査指摘数、セキュリティインシデント数

#### enhance-collaboration.csv（協働促進）
- **Job**: 部門間・役割間の連携を円滑化する
- **典型的要求**: 代理入力、コメント機能、リマインダー、レポート共有、外部アクセス
- **成功指標**: 承認リードタイム、コミュニケーション頻度

### 使用例（promptfooconfig.yaml）

```yaml
# 自動化関連の評価のみ
tests:
  - file://../eval-set/job/reduce-effort.csv

# 統制・品質関連のみ
tests:
  - file://../eval-set/job/increase-accuracy.csv
  - file://../eval-set/job/strengthen-control.csv

# 全Job網羅評価
tests:
  - file://../eval-set/job/reduce-effort.csv
  - file://../eval-set/job/increase-accuracy.csv
  - file://../eval-set/job/improve-visibility.csv
  - file://../eval-set/job/strengthen-control.csv
  - file://../eval-set/job/enhance-collaboration.csv
```

---

## データセット選択ガイド

### どのデータセットを使うべきか？

| 評価目的 | 推奨データセット | 理由 |
|---------|----------------|------|
| **プロンプトの基本性能検証** | `base/` | ドメイン横断・複雑度バランス良好 |
| **特定ペルソナ向け最適化** | `persona/` | ペルソナ固有の文脈と語彙を反映 |
| **機能別の性能評価** | `job/` | Job達成度で評価可能 |
| **網羅的な回帰テスト** | 全データセット統合 | 49ケース全体で品質保証 |
| **fine-tuning用データ** | `base/` + `persona/` | ペルソナ理解を強化 |

### promptfooconfig.yaml 統合例

#### パターンA: 基本評価（10ケース）
```yaml
tests:
  - file://../eval-set/base/fpa-saas-stories.csv
```

#### パターンB: ペルソナ網羅評価（24ケース）
```yaml
tests:
  - file://../eval-set/persona/department-head.csv
  - file://../eval-set/persona/finance-manager.csv
  - file://../eval-set/persona/cfo.csv
  - file://../eval-set/persona/it-admin.csv
```

#### パターンC: Job網羅評価（25ケース）
```yaml
tests:
  - file://../eval-set/job/reduce-effort.csv
  - file://../eval-set/job/increase-accuracy.csv
  - file://../eval-set/job/improve-visibility.csv
  - file://../eval-set/job/strengthen-control.csv
  - file://../eval-set/job/enhance-collaboration.csv
```

#### パターンD: 完全網羅評価（49ケース）
```yaml
tests:
  # Base scenarios
  - file://../eval-set/base/fpa-saas-stories.csv

  # Persona-specific
  - file://../eval-set/persona/department-head.csv
  - file://../eval-set/persona/finance-manager.csv
  - file://../eval-set/persona/cfo.csv
  - file://../eval-set/persona/it-admin.csv

  # Job-specific
  - file://../eval-set/job/reduce-effort.csv
  - file://../eval-set/job/increase-accuracy.csv
  - file://../eval-set/job/improve-visibility.csv
  - file://../eval-set/job/strengthen-control.csv
  - file://../eval-set/job/enhance-collaboration.csv
```

---

## データセットの保守

### 新規ケース追加ガイドライン

1. **カテゴリ選択**
   - 既存ペルソナ/Jobに該当 → 該当CSVに追加
   - 新規ペルソナ/Job → 新規CSV作成

2. **複雑度の判定基準**
   - `simple`: ルール2-3個、質問3-4個
   - `medium`: ルール3-4個、質問4-6個
   - `complex`: ルール5+個、質問6+個
   - `ambiguous`: ルール3-7個、質問7+個（仕様が極めて不明確）

3. **品質基準**
   - ✅ 実際のユーザー要求に基づく（Slack/Jira/Issue等）
   - ✅ 曖昧性が適切に含まれる（過度に詳細でない）
   - ✅ FP&A SaaSドメインの語彙を使用
   - ✅ 既存ケースと重複しない

4. **コミットルール**
   - CSV追加時は本READMEのケース数も更新
   - domain_tagsは既存タグとの整合性を保つ

---

## 統計情報

### 全体概要

| カテゴリ | ファイル数 | 総ケース数 |
|---------|-----------|-----------|
| **base/** | 1 | 10 |
| **persona/** | 4 | 24 |
| **job/** | 5 | 25 |
| **合計** | 10 | **59** |

### 複雑度分布

| 複雑度 | ケース数 | 割合 |
|--------|----------|------|
| simple | 13 | 22% |
| medium | 28 | 47% |
| complex | 12 | 20% |
| ambiguous | 6 | 10% |

### カテゴリ分布

| カテゴリ | ケース数 |
|---------|----------|
| データ統合 | 16 |
| 権限承認 | 11 |
| レポート | 11 |
| 承認フロー | 10 |
| UI/UX | 7 |
| 監査証跡 | 4 |

---

## 関連ドキュメント

- [promptfoo Configuration Guide](https://www.promptfoo.dev/docs/configuration/)
- [promptfoo Dataset Documentation](https://www.promptfoo.dev/docs/configuration/datasets/)
- [Example Mapping SKILL.md](../.claude/skills/bdd/example-mapping/SKILL.md)
- [eval/test-deterministic/promptfooconfig.yaml](../eval/test-deterministic/promptfooconfig.yaml)
- [eval/test-qualitative/promptfooconfig.yaml](../eval/test-qualitative/promptfooconfig.yaml)

---

*Last updated: 2025-11-09*
