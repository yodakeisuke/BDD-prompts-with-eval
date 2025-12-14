/**
 * Type definitions for BDD Example Mapping and GEPA optimization
 */

// ============================================================================
// BDD Example Mapping Types (Output Schema)
// ============================================================================

export interface BDDStory {
  as_a: string;
  i_want_to: string;
  so_that: string;
}

export interface BDDExample {
  given: string; // Precondition (Gherkin)
  when: string; // Action (Gherkin)
  then: string; // Expected outcome (Gherkin)
}

export interface BDDRule {
  id: string;
  name: string;
  examples: BDDExample[];
}

export interface BDDQuestions {
  blocker: string[];
  clarification: string[];
  future: string[];
}

export interface BDDMetadata {
  rule_count: number;
  example_count: number;
  question_count: number;
}

export interface BDDExampleMapping {
  story: BDDStory;
  rules: BDDRule[];
  questions: BDDQuestions;
  next_actions: string[];
  metadata?: BDDMetadata;
}

// ============================================================================
// GEPA Training/Validation Data Types
// ============================================================================

export interface GEPAExample {
  story_input: string;
  expected?: Partial<BDDExampleMapping>;
  validation_criteria?: {
    min_questions: number;
    min_rules: number;
    expected_keywords?: string[];
  };
  [key: string]: any; // Allow additional properties for GEPA compatibility
}

export interface GEPADataset {
  train: GEPAExample[];
  validation: GEPAExample[];
}

// ============================================================================
// GEPA Metrics Types
// ============================================================================

export interface GEPAMetricResult {
  three_amigos_coverage: number;
  question_pattern_diversity: number;
  example_testability: number;
}

export interface GEPAPrediction {
  output: string;
  parsed?: BDDExampleMapping;
  error?: string;
}

// ============================================================================
// GEPA Optimization Result Types
// ============================================================================

export interface OptimizedPrompt {
  instruction: string;
  demos: unknown[];
  examples: unknown[];
  modelConfig: unknown;
  optimizerType: string;
  timestamp: string;
  bestScore: number;
}

export interface GEPAOptimizationResult {
  paretoFrontSize: number;
  bestScore: number;
  hypervolume: number | null;
  optimizedPrompt: OptimizedPrompt;
}

// ============================================================================
// ACE Training/Validation Data Types
// ============================================================================

/**
 * ACE training example with complete input/output pairs
 *
 * Unlike GEPA (which uses validation_criteria), ACE requires
 * complete expected outputs (ground truth) for each input.
 */
export interface ACEExample {
  input: {
    story_input: string;
  };
  output: BDDExampleMapping; // Complete ground truth BDD mapping
}

export interface ACEDataset {
  train: ACEExample[];
  validation: ACEExample[];
}

// ============================================================================
// ACE Metric Types
// ============================================================================

/**
 * ACE metric result (single combined score)
 *
 * Unlike GEPA's multi-objective metrics, ACE uses a single
 * weighted score combining all three BDD quality dimensions.
 */
export interface ACEMetricResult {
  score: number; // 0-1 combined score
  breakdown?: {
    three_amigos_coverage: number;
    question_pattern_diversity: number;
    example_testability: number;
  };
}

// ============================================================================
// ACE Optimization Result Types
// ============================================================================

/**
 * ACE optimization result (playbook with optimized examples)
 */
export interface ACEOptimizationResult {
  optimizedProgram: any; // AxProgram with optimized demos
  bestScore: number;
  totalEpochs: number;
  timestamp: string;
}
