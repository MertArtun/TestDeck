# Folder Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize codebase from flat structure to feature-based architecture.

**Architecture:** Feature-based folder structure with shared components, services layer, and path aliases. Each feature is self-contained with its own components, hooks, and types.

**Tech Stack:** React, TypeScript, Vite, Zustand

---

## Phase 1: Infrastructure Setup ✅

### Task 1: Add Path Aliases to TypeScript Config ✅

**Files:**

- Modify: `tsconfig.json`
- Modify: `tsconfig.node.json`

**Step 1: Update tsconfig.json**

Add to `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/services/*": ["./src/services/*"],
      "@/store/*": ["./src/store/*"]
    }
  }
}
```

**Step 2: Verify TypeScript recognizes paths**

Run: `npm run type-check`
Expected: PASS (no errors related to paths yet)

**Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "build: add path aliases to TypeScript config"
```

---

### Task 2: Add Path Aliases to Vite Config ✅

**Files:**

- Modify: `vite.config.ts`

**Step 1: Update vite.config.ts**

Add resolve.alias configuration:

```typescript
import { resolve } from 'path';

export default defineConfig({
  // ... existing config
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/features': resolve(__dirname, './src/features'),
      '@/shared': resolve(__dirname, './src/shared'),
      '@/services': resolve(__dirname, './src/services'),
      '@/store': resolve(__dirname, './src/store'),
    },
  },
});
```

**Step 2: Verify Vite builds successfully**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "build: add path aliases to Vite config"
```

---

### Task 3: Create Folder Structure ✅

**Files:**

- Create directories only (no files yet)

**Step 1: Create all directories**

```bash
mkdir -p src/features/dashboard/components
mkdir -p src/features/cards/components
mkdir -p src/features/study/components
mkdir -p src/features/statistics/components
mkdir -p src/features/settings/components
mkdir -p src/shared/components/ui
mkdir -p src/shared/components/feedback
mkdir -p src/shared/components/layout
mkdir -p src/shared/hooks
mkdir -p src/shared/utils
mkdir -p src/shared/types
mkdir -p src/services/database
mkdir -p src/services/sm2
```

**Step 2: Verify directories exist**

Run: `ls -la src/features src/shared src/services`
Expected: All directories visible

**Step 3: Commit**

```bash
git add .
git commit -m "chore: create feature-based folder structure"
```

---

## Phase 2: Shared Layer Migration

### Task 4: Move Skeleton Component

**Files:**

- Move: `src/components/Skeleton.tsx` → `src/shared/components/ui/Skeleton.tsx`
- Create: `src/shared/components/ui/index.ts`

**Step 1: Copy Skeleton to new location**

```bash
cp src/components/Skeleton.tsx src/shared/components/ui/Skeleton.tsx
```

**Step 2: Create barrel export**

Create `src/shared/components/ui/index.ts`:

```typescript
export { SkeletonCard, SkeletonText, SkeletonAvatar } from './Skeleton';
```

**Step 3: Verify import works**

Run: `npm run type-check`
Expected: PASS

**Step 4: Commit**

```bash
git add src/shared/components/ui/
git commit -m "refactor: move Skeleton to shared/components/ui"
```

---

### Task 5: Move ToastContainer Component

**Files:**

- Move: `src/components/ToastContainer.tsx` → `src/shared/components/feedback/ToastContainer.tsx`
- Move: `src/components/ToastContainer.test.tsx` → `src/shared/components/feedback/ToastContainer.test.tsx`
- Create: `src/shared/components/feedback/index.ts`

**Step 1: Copy files to new location**

```bash
cp src/components/ToastContainer.tsx src/shared/components/feedback/ToastContainer.tsx
cp src/components/ToastContainer.test.tsx src/shared/components/feedback/ToastContainer.test.tsx
```

**Step 2: Create barrel export**

Create `src/shared/components/feedback/index.ts`:

```typescript
export { ToastContainer } from './ToastContainer';
```

**Step 3: Verify tests pass**

Run: `npm run test -- --run src/shared/components/feedback/ToastContainer.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/shared/components/feedback/
git commit -m "refactor: move ToastContainer to shared/components/feedback"
```

---

### Task 6: Move Layout Components

**Files:**

- Move: `src/components/Layout.tsx` → `src/shared/components/layout/Layout.tsx`
- Move: `src/components/FloatingActionButton.tsx` → `src/shared/components/layout/FloatingActionButton.tsx`
- Create: `src/shared/components/layout/index.ts`

**Step 1: Copy files**

```bash
cp src/components/Layout.tsx src/shared/components/layout/Layout.tsx
cp src/components/FloatingActionButton.tsx src/shared/components/layout/FloatingActionButton.tsx
```

**Step 2: Update imports in Layout.tsx**

Change:

```typescript
import FloatingActionButton from './FloatingActionButton';
```

To:

```typescript
import { FloatingActionButton } from './FloatingActionButton';
```

**Step 3: Create barrel export**

Create `src/shared/components/layout/index.ts`:

```typescript
export { default as Layout } from './Layout';
export { default as FloatingActionButton } from './FloatingActionButton';
```

**Step 4: Verify build**

Run: `npm run type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared/components/layout/
git commit -m "refactor: move Layout and FAB to shared/components/layout"
```

---

### Task 7: Create Shared Components Barrel Export

**Files:**

- Create: `src/shared/components/index.ts`

**Step 1: Create main barrel export**

Create `src/shared/components/index.ts`:

```typescript
export * from './ui';
export * from './feedback';
export * from './layout';
```

**Step 2: Verify exports**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/shared/components/index.ts
git commit -m "refactor: add shared components barrel export"
```

---

### Task 8: Move Utils

**Files:**

- Move: `src/utils/safeMath.ts` → `src/shared/utils/safeMath.ts`
- Move: `src/utils/safeMath.test.ts` → `src/shared/utils/safeMath.test.ts`
- Move: `src/utils/htmlSanitizer.ts` → `src/shared/utils/htmlSanitizer.ts`
- Move: `src/utils/importUtils.ts` → `src/shared/utils/importUtils.ts`
- Move: `src/utils/importUtils.test.ts` → `src/shared/utils/importUtils.test.ts`
- Move: `src/utils/themeUtils.ts` → `src/shared/utils/themeUtils.ts`
- Create: `src/shared/utils/index.ts`

**Step 1: Copy all utils**

```bash
cp src/utils/safeMath.ts src/shared/utils/
cp src/utils/safeMath.test.ts src/shared/utils/
cp src/utils/htmlSanitizer.ts src/shared/utils/
cp src/utils/importUtils.ts src/shared/utils/
cp src/utils/importUtils.test.ts src/shared/utils/
cp src/utils/themeUtils.ts src/shared/utils/
```

**Step 2: Create barrel export**

Create `src/shared/utils/index.ts`:

```typescript
export * from './safeMath';
export * from './htmlSanitizer';
export * from './importUtils';
export * from './themeUtils';
```

**Step 3: Verify tests pass**

Run: `npm run test -- --run src/shared/utils/`
Expected: PASS

**Step 4: Commit**

```bash
git add src/shared/utils/
git commit -m "refactor: move utils to shared/utils"
```

---

## Phase 3: Services Migration

### Task 9: Move SM2 Algorithm

**Files:**

- Move: `src/utils/sm2.ts` → `src/services/sm2/algorithm.ts`
- Move: `src/utils/sm2.test.ts` → `src/services/sm2/algorithm.test.ts`
- Create: `src/services/sm2/index.ts`

**Step 1: Copy files**

```bash
cp src/utils/sm2.ts src/services/sm2/algorithm.ts
cp src/utils/sm2.test.ts src/services/sm2/algorithm.test.ts
```

**Step 2: Create barrel export**

Create `src/services/sm2/index.ts`:

```typescript
export * from './algorithm';
```

**Step 3: Verify tests pass**

Run: `npm run test -- --run src/services/sm2/`
Expected: PASS

**Step 4: Commit**

```bash
git add src/services/sm2/
git commit -m "refactor: move SM2 algorithm to services/sm2"
```

---

### Task 10: Create Database Service Types

**Files:**

- Create: `src/services/database/types.ts`

**Step 1: Copy types from existing file**

Create `src/services/database/types.ts` with content from `src/types/database.ts`:

```typescript
// Copy entire content of src/types/database.ts here
```

**Step 2: Verify type-check**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/services/database/types.ts
git commit -m "refactor: add database types to services/database"
```

---

### Task 11: Create Database Service Index

**Files:**

- Create: `src/services/database/index.ts`

**Step 1: Create public API**

Create `src/services/database/index.ts`:

```typescript
// Re-export types
export * from './types';

// Re-export database functions from existing location (temporary)
export {
  initDatabase,
  getDatabase,
  createCard,
  createMultipleCards,
  getAllCards,
  getCardsBySubject,
  updateCard,
  deleteCard,
  deleteAllCards,
  createSession,
  endSession,
  recordAttempt,
  updateCardStats,
  getSubjectStats,
  getDailyStats,
  exportUserData,
  importUserData,
  checkDataIntegrity,
  cleanupDatabase,
} from '../../database/database';
```

**Step 2: Verify imports work**

Run: `npm run type-check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/services/database/index.ts
git commit -m "refactor: add database service barrel export"
```

---

## Phase 4: Update Imports Across Codebase

### Task 12: Update App.tsx Imports

**Files:**

- Modify: `src/App.tsx`

**Step 1: Update imports**

Change from:

```typescript
import Layout from './components/Layout';
```

To:

```typescript
import { Layout } from '@/shared/components';
```

**Step 2: Verify build**

Run: `npm run type-check && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: update App.tsx to use path aliases"
```

---

### Task 13: Update Dashboard Imports

**Files:**

- Modify: `src/pages/Dashboard.tsx`

**Step 1: Update imports**

Change:

```typescript
import { SkeletonCard } from '../components/Skeleton';
import { initDatabase, getSubjectStats, getDailyStats, getAllCards } from '../database/database';
```

To:

```typescript
import { SkeletonCard } from '@/shared/components';
import { initDatabase, getSubjectStats, getDailyStats, getAllCards } from '@/services/database';
```

**Step 2: Verify tests pass**

Run: `npm run test -- --run src/pages/Dashboard.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "refactor: update Dashboard to use path aliases"
```

---

### Task 14: Update Remaining Page Imports

**Files:**

- Modify: `src/pages/CreateCard.tsx`
- Modify: `src/pages/CardManager.tsx`
- Modify: `src/pages/Study.tsx`
- Modify: `src/pages/Statistics.tsx`
- Modify: `src/pages/Settings.tsx`

**Step 1: Update all pages to use new import paths**

Replace:

- `'../database/database'` → `'@/services/database'`
- `'../components/Skeleton'` → `'@/shared/components'`
- `'../utils/safeMath'` → `'@/shared/utils'`
- `'../utils/sm2'` → `'@/services/sm2'`

**Step 2: Verify all tests pass**

Run: `npm run test -- --run`
Expected: 381 tests PASS

**Step 3: Commit**

```bash
git add src/pages/
git commit -m "refactor: update all pages to use path aliases"
```

---

## Phase 5: Cleanup Old Files

### Task 15: Remove Old Component Files

**Files:**

- Delete: `src/components/Skeleton.tsx`
- Delete: `src/components/ToastContainer.tsx`
- Delete: `src/components/ToastContainer.test.tsx`
- Delete: `src/components/Layout.tsx`
- Delete: `src/components/FloatingActionButton.tsx`

**Step 1: Verify new imports work everywhere**

Run: `npm run type-check && npm run build`
Expected: PASS

**Step 2: Delete old files**

```bash
rm src/components/Skeleton.tsx
rm src/components/ToastContainer.tsx
rm src/components/ToastContainer.test.tsx
rm src/components/Layout.tsx
rm src/components/FloatingActionButton.tsx
```

**Step 3: Verify build still works**

Run: `npm run type-check && npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove old component files"
```

---

### Task 16: Remove Old Utils Files

**Files:**

- Delete: `src/utils/safeMath.ts`
- Delete: `src/utils/safeMath.test.ts`
- Delete: `src/utils/htmlSanitizer.ts`
- Delete: `src/utils/importUtils.ts`
- Delete: `src/utils/importUtils.test.ts`
- Delete: `src/utils/themeUtils.ts`
- Delete: `src/utils/sm2.ts`
- Delete: `src/utils/sm2.test.ts`

**Step 1: Delete old files**

```bash
rm src/utils/safeMath.ts src/utils/safeMath.test.ts
rm src/utils/htmlSanitizer.ts
rm src/utils/importUtils.ts src/utils/importUtils.test.ts
rm src/utils/themeUtils.ts
rm src/utils/sm2.ts src/utils/sm2.test.ts
```

**Step 2: Verify all tests pass**

Run: `npm run test -- --run`
Expected: 381 tests PASS

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove old utils files"
```

---

## Phase 6: Final Verification

### Task 17: Full Test Suite

**Step 1: Run type-check**

Run: `npm run type-check`
Expected: PASS (0 errors)

**Step 2: Run linter**

Run: `npm run lint`
Expected: PASS (0 errors, warnings acceptable)

**Step 3: Run all tests**

Run: `npm run test -- --run`
Expected: 381 tests PASS

**Step 4: Run build**

Run: `npm run build`
Expected: PASS

**Step 5: Commit final state**

```bash
git add -A
git commit -m "refactor: complete folder restructure phase 1"
```

---

## Success Criteria

- [ ] All 381 unit tests pass
- [ ] TypeScript has 0 errors
- [ ] ESLint has 0 errors
- [ ] Build succeeds
- [ ] Path aliases working (@/shared, @/services, @/store)
- [ ] Shared components in src/shared/components/
- [ ] Utils in src/shared/utils/
- [ ] SM2 algorithm in src/services/sm2/
- [ ] Database service in src/services/database/
