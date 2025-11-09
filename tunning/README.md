# DSPy Prompt Tuning with axllm

Minimal setup for prompt tuning using DSPy (TypeScript version via axllm).

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Add your API key to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

## Usage

Run the minimal example:
```bash
pnpm start
```

Or run in watch mode:
```bash
pnpm dev
```

## Project Structure

```
tunning/
├── src/
│   └── index.js          # Minimal DSPy example
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Next Steps

- Add more sophisticated signatures
- Implement prompt optimization
- Create custom modules
- Add evaluation metrics
