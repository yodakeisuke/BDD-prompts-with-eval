# Source Code Structure

Modular architecture following best practices.

## Files

### `optimize-gepa.ts`
Main optimization script:
- Loads SKILL.md
- Configures GEPA optimizer
- Runs optimization
- Saves results

### `types.ts`
Type definitions:
- `GEPAExample` - Training example format
- `GEPADataset` - Train/validation split
- `BDDExampleMapping` - Output schema
- Metric result types

### `data/converter.ts`
Training data:
- `getTrainingDataset()` - Returns train/validation examples
- Example format with validation criteria
- Easy to add more examples

### `metrics/bdd-metrics.ts`
Multi-objective metrics:
- `bddMultiObjectiveMetric()` - Main metric function
- Evaluates accuracy, question_quality, brevity, completeness
- Parses JSON output
- Handles validation criteria

## Usage

```bash
# Run optimization
pnpm optimize

# Watch mode
pnpm optimize:watch
```

## Customization

1. **Add training data**: Edit `data/converter.ts`
2. **Adjust metrics**: Edit `metrics/bdd-metrics.ts`
3. **Change optimization params**: Edit `optimize-gepa.ts`

See parent `README.md` for details.
