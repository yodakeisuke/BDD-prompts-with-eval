# eval dev-prompts
Prompt evaluations for development automation.
We are assuming a brownfield development for the FP&A SaaS.

## Overview

Prompt evaluation harness for Claude Agent SDK using promptfoo. This directory contains a two-layer evaluation framework for assessing Claude Agent outputs through both deterministic validation and qualitative assessment.

**IMPORTANT**: Always reference the official promptfoo documentation when working with configuration:
- **Configuration Guide**: https://www.promptfoo.dev/docs/category/configuration/
- **Assertions Reference**: https://www.promptfoo.dev/docs/configuration/expected-outputs/
- **Providers**: https://www.promptfoo.dev/docs/providers/
- **Variables**: https://www.promptfoo.dev/docs/configuration/parameters/

## Layer Responsibilities

| Layer | Purpose | Method | Speed | Cost | Use Case |
|-------|---------|--------|-------|------|----------|
| **test-deterministic** | Structural validation | Mechanical assertions | Fast | Low | Schema, required fields, data types |
| **test-qualitative** | Quality assessment | LLM-as-judge | Slow | High | Clarity, accuracy, helpfulness |

## DataSets
`../eval-set/`