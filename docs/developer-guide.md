# Developer Guide — Aglow Portfolio Builder

## How to Add a New Block Type

Adding a new block type requires **3 files** and **1 registry update** — no other files need modification (Open/Closed Principle).

### Step 1: Define Props Schema (`src/lib/blocks.ts`)

```typescript
// Add your props schema alongside existing ones
const myBlockPropsSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  // ... your block-specific props
});
```

### Step 2: Register in `BLOCK_TYPES` and `BLOCK_PROPS_REGISTRY`

```typescript
// Add to BLOCK_TYPES array
export const BLOCK_TYPES = [
  // ... existing types
  'my-block',
] as const;

// Add to registry
export const BLOCK_PROPS_REGISTRY: Record<BlockType, z.ZodTypeAny> = {
  // ... existing entries
  'my-block': myBlockPropsSchema,
};
```

### Step 3: Create Edit Component (`src/components/react/blocks/`)

```tsx
// src/components/react/blocks/MyBlockEdit.tsx
export default function MyBlockEdit({ block, onUpdate }) {
  return (
    <div className="block-my-block">
      {/* Editor mode UI */}
    </div>
  );
}
```

### Step 4: Add to BlockRenderer (`src/components/astro/BlockRenderer.astro`)

Add a new `case` in the `renderBlockToHTML` switch statement:

```typescript
case 'my-block': {
  const title = props.title || '';
  return `<div class="${className}"><h3>${escapeHTML(title)}</h3></div>`;
}
```

### Step 5: Write Tests

```typescript
// src/lib/blocks.test.ts
it('creates valid my-block', () => {
  const block = createBlock('my-block');
  expect(validateBlockProps(block)).toBe(true);
});
```

---

## Project Architecture

```
src/
├── db/          → Data Layer (Schema + Client) — DO NOT add business logic here
├── lib/         → Business Logic (Pure functions, no side effects, testable)
├── middleware.ts → Cross-cutting (Auth, RBAC, DB injection)
├── pages/api/   → Thin Controllers (validate → delegate → respond)
├── components/  → UI Layer (Presentational + Container pattern)
│   ├── astro/   → Public site (SSR, zero JS)
│   └── react/   → Admin dashboard (React Islands)
└── stores/      → State Management (Zustand, single source of truth)
```

## Coding Conventions

- **Files**: kebab-case (`my-component.tsx`)
- **Components**: PascalCase (`MyComponent`)
- **Functions**: camelCase, verb-first (`createPage`, `validateBlock`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_HISTORY_SIZE`)
- **Types**: PascalCase, noun-based (`PageMeta`, `BlockType`)
- **Booleans**: is/has/can prefix (`isDirty`, `canPublish`)

## Running the Project

```bash
npm install           # Install dependencies
npm run dev           # Start dev server (wrangler local emulation)
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run db:generate   # Generate SQL migrations from schema
npm run db:migrate    # Apply migrations locally
npm run build         # Production build
npm run deploy        # Build + deploy to Cloudflare Pages
```
