# Code Quality Cleanup Plan

**Date:** 2025-12-25
**Status:** Approved
**Scope:** TypeScript errors, ESLint warnings, test failures

## Overview

Clean up 80+ TypeScript errors, 60+ ESLint warnings, and 3 failing e2e tests to improve code quality and maintainability.

## Approach

**Principle:** Type definitions are the source of truth. Code must conform to types, not vice versa.

## Phase 1: TypeScript Errors (83 errors, 12 files)

### 1.1 `interval_days` → `interval` (database.ts, database.test.ts)

The `CardStats` interface defines `interval`, but code uses `interval_days`.

**Action:** Rename all `interval_days` to `interval`

### 1.2 Undefined checks (database.ts)

Multiple `stat` variables used without undefined guards.

**Action:** Add early return or proper guards

### 1.3 SubjectStats → SubjectAccumulator (Dashboard.tsx, Dashboard.test.tsx)

Two incompatible types used for same data:
- `SubjectAccumulator`: `{ name, total_cards, accuracy, last_studied }`
- `SubjectStats`: `{ subject, totalCards, correctPercentage, lastStudied }`

**Action:** Remove `SubjectStats`, use `SubjectAccumulator` directly

### 1.4 Unused variables (6 files)

| File | Variables |
|------|-----------|
| Settings.tsx | Clock, Globe, showConfirm, setShowConfirm, language, setLanguage |
| Statistics.tsx | LineChart, Line, Zap |
| Study.tsx | _timeTaken |
| AddQuestionsButton.tsx | message |
| Dashboard.tsx | index |
| Skeleton.tsx, ToastContainer.tsx | React import |

**Action:** Remove unused variables and imports

### 1.5 Type mismatches

- `null` vs `undefined` for `image_path`
- Missing `option_e` in card creation
- Missing `correct_answers` in session creation

**Action:** Fix each to match type definitions

## Phase 2: ESLint Errors (~60 errors)

### 2.1 Import order (~40 errors)

**Action:** Run `eslint --fix` to auto-fix

### 2.2 React hooks dependencies (4 errors)

| File | Hook | Missing |
|------|------|---------|
| QuickCardAdd.tsx | useEffect | handleSubmit, resetForm |
| CardManager.tsx | useEffect | loadCards, filterCards |
| Statistics.tsx | useEffect | loadStatistics |

**Action:** Wrap functions with `useCallback` and add to dependencies

### 2.3 `any` types (6 errors)

Files: Settings.tsx, Statistics.tsx, AddQuestionsButton.tsx

**Action:** Define proper types for JSON parse results

## Phase 3: Test Failures

### 3.1 Playwright version conflict (3 e2e files)

```
You have two different versions of @playwright/test
```

**Action:** Clean install
```bash
rm -rf node_modules package-lock.json
npm install
```

## Task Checklist

- [ ] 1. Rename `interval_days` → `interval` in database.ts
- [ ] 2. Add undefined guards in database.ts
- [ ] 3. Replace SubjectStats with SubjectAccumulator
- [ ] 4. Remove unused variables (6 files)
- [ ] 5. Fix type mismatches (null/undefined, missing fields)
- [ ] 6. Run eslint --fix for import order
- [ ] 7. Fix React hooks dependencies (3 files)
- [ ] 8. Replace `any` types with proper types
- [ ] 9. Fix Dashboard.test.tsx mock types
- [ ] 10. Clean npm install for Playwright

## Success Criteria

- `npm run type-check` passes with 0 errors
- `npm run lint` passes with 0 errors (or only acceptable warnings)
- `npm run test` all tests pass
