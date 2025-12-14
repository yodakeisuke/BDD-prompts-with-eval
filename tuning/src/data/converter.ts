/**
 * Training data for GEPA optimization
 */

import type { GEPAExample, GEPADataset } from '../types.js';

/**
 * All available examples for BDD Example Mapping optimization
 */
const allExamples: GEPAExample[] = [
  // 訓練データ候補（多様なパターン）
  {
    story_input: '予実差異レポートで、マイナス値を赤字で表示したい。',
    validation_criteria: {
      min_questions: 5,
      min_rules: 1,
      expected_keywords: ['マイナス', '赤', '表示'],
    },
  },
  {
    story_input:
      '経理承認が完了した予算は、部門長も編集できないようにしたい。ただし、CFOと経理部長は編集可能のまま。あと、コメント追加は誰でもできるようにしたい。',
    validation_criteria: {
      min_questions: 3,
      min_rules: 3,
      expected_keywords: ['承認', '権限', '編集'],
    },
  },
  {
    story_input: '予算入力がやりにくい。もっと早くしたい。Excelみたいに。',
    validation_criteria: {
      min_questions: 7,
      min_rules: 3,
    },
  },
  {
    story_input: '月次締め処理を自動化したい。',
    validation_criteria: {
      min_questions: 5,
      min_rules: 2,
      expected_keywords: ['締め', '自動', '処理'],
    },
  },
  {
    story_input: '部門別の予算配分を可視化したい。グラフで見たい。',
    validation_criteria: {
      min_questions: 4,
      min_rules: 2,
      expected_keywords: ['部門', 'グラフ', '可視化'],
    },
  },
];

/**
 * Get training dataset with proper train/validation split
 *
 * @param splitRatio - Ratio of training data (default: 0.7)
 * @returns Dataset split into train and validation
 */
export function getTrainingDataset(splitRatio: number = 0.7): GEPADataset {
  // データをシャッフル（毎回ランダムに分割）
  const shuffled = [...allExamples].sort(() => Math.random() - 0.5);

  // 訓練データ/検証データに分割
  const splitIndex = Math.floor(shuffled.length * splitRatio);
  const train = shuffled.slice(0, splitIndex);
  const validation = shuffled.slice(splitIndex);

  console.log(`📊 Dataset split:`);
  console.log(`   Total: ${allExamples.length} examples`);
  console.log(`   Train: ${train.length} examples (${Math.round(splitRatio * 100)}%)`);
  console.log(`   Validation: ${validation.length} examples (${Math.round((1 - splitRatio) * 100)}%)`);

  return { train, validation };
}

/**
 * Get dataset with fixed split (deterministic, for reproducibility)
 */
export function getTrainingDatasetFixed(): GEPADataset {
  // 最初の70%を訓練、残りを検証
  const splitIndex = Math.floor(allExamples.length * 0.7);

  const train = allExamples.slice(0, splitIndex);
  const validation = allExamples.slice(splitIndex);

  return { train, validation };
}
