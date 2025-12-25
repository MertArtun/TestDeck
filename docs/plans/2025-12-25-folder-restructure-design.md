# Folder Restructure Design

**Date:** 2025-12-25
**Status:** Approved
**Scope:** Feature-based folder organization

## Overview

Reorganize the codebase from flat structure to feature-based architecture for better maintainability and scalability.

## Current Structure

```
src/
├── components/     (7 files - flat)
├── pages/          (5 pages + tests)
├── store/          (3 stores)
├── utils/          (8 utilities)
├── database/       (2 files)
├── types/          (1 file)
├── i18n/
└── data/
```

## Target Structure

```
src/
├── features/
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── components/
│   │   │   ├── StatCard.tsx
│   │   │   └── SubjectList.tsx
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── cards/
│   │   ├── CreateCardPage.tsx
│   │   ├── CardManagerPage.tsx
│   │   ├── components/
│   │   │   ├── CardForm.tsx
│   │   │   ├── CardList.tsx
│   │   │   ├── QuickCardAdd.tsx
│   │   │   └── AddQuestionsButton.tsx
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── study/
│   │   ├── StudyPage.tsx
│   │   ├── components/
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── AnswerOptions.tsx
│   │   │   └── SessionSummary.tsx
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── statistics/
│   │   ├── StatisticsPage.tsx
│   │   ├── components/
│   │   │   ├── ActivityChart.tsx
│   │   │   └── SubjectBreakdown.tsx
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── settings/
│       ├── SettingsPage.tsx
│       ├── components/
│       │   ├── ThemeSelector.tsx
│       │   └── LanguageSelector.tsx
│       ├── types.ts
│       └── index.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── index.ts
│   │   ├── feedback/
│   │   │   ├── ToastContainer.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FloatingActionButton.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── safeMath.ts
│   │   ├── htmlSanitizer.ts
│   │   ├── importUtils.ts
│   │   └── index.ts
│   │
│   └── types/
│       ├── common.ts
│       └── index.ts
│
├── services/
│   ├── database/
│   │   ├── index.ts
│   │   ├── localStorage.ts
│   │   ├── sqlite.ts
│   │   ├── types.ts
│   │   └── migrations/
│   │
│   └── sm2/
│       ├── index.ts
│       └── algorithm.ts
│
├── store/
│   ├── appStore.ts
│   ├── themeStore.ts
│   ├── toastStore.ts
│   └── index.ts
│
├── i18n/
├── App.tsx
└── main.tsx
```

## Naming Conventions

| Type            | Format           | Example             |
| --------------- | ---------------- | ------------------- |
| Page components | `*Page.tsx`      | `DashboardPage.tsx` |
| UI components   | `PascalCase.tsx` | `StatCard.tsx`      |
| Hooks           | `use*.ts`        | `useCardForm.ts`    |
| Utils           | `camelCase.ts`   | `safeMath.ts`       |
| Types           | `types.ts`       | `types.ts`          |
| Tests           | `*.test.ts(x)`   | `StatCard.test.tsx` |

## Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/services/*": ["./src/services/*"]
    }
  }
}
```

```typescript
// vite.config.ts
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/features': resolve(__dirname, './src/features'),
      '@/shared': resolve(__dirname, './src/shared'),
      '@/services': resolve(__dirname, './src/services'),
    },
  },
});
```

## Import Examples

```typescript
// Feature-internal imports (relative)
import { StatCard } from './components';
import { useDashboardStats } from './hooks';

// Cross-feature imports (absolute)
import { Skeleton, ToastContainer } from '@/shared/components';
import { createCard } from '@/services/database';
import { useThemeStore } from '@/store';
```

## Migration Strategy

### Phase 1: Infrastructure Setup

- [ ] Add path aliases to tsconfig.json
- [ ] Add path aliases to vite.config.ts
- [ ] Create new folder structure (empty)
- [ ] Add barrel export files (index.ts)

### Phase 2: Shared Migration

- [ ] Create shared/components/ui/
- [ ] Move Skeleton.tsx to shared/components/ui/
- [ ] Create shared/components/feedback/
- [ ] Move ToastContainer.tsx to shared/components/feedback/
- [ ] Create shared/components/layout/
- [ ] Move Layout.tsx to shared/components/layout/
- [ ] Extract Sidebar from Layout.tsx
- [ ] Move FloatingActionButton.tsx to shared/components/layout/
- [ ] Create shared/utils/
- [ ] Move safeMath.ts, htmlSanitizer.ts, importUtils.ts
- [ ] Update all imports

### Phase 3: Services Migration

- [ ] Create services/database/
- [ ] Split database.ts into localStorage.ts + sqlite.ts
- [ ] Create services/database/index.ts (public API)
- [ ] Create services/sm2/
- [ ] Move sm2.ts to services/sm2/algorithm.ts
- [ ] Update all imports

### Phase 4: Features Migration (in order)

- [ ] settings/ (simplest)
- [ ] statistics/
- [ ] dashboard/
- [ ] cards/
- [ ] study/ (most complex, last)

### Phase 5: Cleanup

- [ ] Delete old empty folders
- [ ] Remove unused imports
- [ ] Update test file locations
- [ ] Verify all tests pass

## Key Principles

1. **Feature Independence**: Each feature is self-contained
2. **Barrel Exports**: Only export what's needed via index.ts
3. **No Breaking Changes**: Migration preserves existing functionality
4. **Incremental Migration**: Phase by phase, tests passing after each
5. **Shared Components**: Reusable UI in shared/, feature-specific in feature/

## Success Criteria

- [ ] All tests pass after migration
- [ ] No circular dependencies
- [ ] Consistent naming conventions
- [ ] Path aliases working correctly
- [ ] Build succeeds without errors
