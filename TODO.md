# TestDeck - Proje İyileştirme TODO Listesi

Bu dosya, Tasks.md analizine dayanarak oluşturulmuş yapılacaklar listesidir.

---

## Phase 1: Kritik Güvenlik ve Altyapı (Öncelik: 🔴 Acil) ✅ TAMAMLANDI

### 1.1 XSS Güvenlik Açığını Kapat ✅
- [x] DOMPurify paketini kur
  ```bash
  npm install dompurify @types/dompurify
  ```
- [x] `src/pages/Study.tsx:839-845` - dangerouslySetInnerHTML'i sanitize et
- [x] `src/pages/CardManager.tsx` - Kart önizlemede sanitization ekle
- [x] Import edilen kart içeriklerini sanitize et
- [ ] XSS güvenlik testi yaz (Phase 2'de)

### 1.2 TypeScript Strict Mode Aktifleştir ✅
- [x] `.eslintrc.cjs` - `@typescript-eslint/no-explicit-any: 'error'` yap
- [x] `.eslintrc.cjs` - `@typescript-eslint/no-unused-vars: 'error'` yap
- [x] `tsconfig.json` - `noUnusedLocals: true` ekle
- [x] `tsconfig.json` - `noUnusedParameters: true` ekle

### 1.3 Any Tiplerini Düzelt ✅
- [x] `src/database/database.ts:10` - `sqliteService: any` → proper type
- [x] `src/database/database.ts:37-43` - `mockDb` tiplerini düzelt
- [x] `src/pages/Study.tsx:60` - filter callback tipini düzelt
- [x] `src/pages/Study.tsx:106` - dailyStats tipini düzelt
- [x] `src/pages/CreateCard.tsx:121-122` - JSON parse tipini düzelt
- [x] `src/database/sqliteDatabase.ts` - tüm `as any` cast'leri kaldır

---

## Phase 2: Test Altyapısı Kurulumu (Öncelik: 🔴 Kritik)

### 2.1 Test Framework Kurulumu ✅
- [x] Vitest ve bağımlılıklarını kur
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
  ```
- [x] `vitest.config.ts` oluştur
- [x] `package.json`'a test script'leri ekle
  - `"test": "vitest"`
  - `"test:coverage": "vitest --coverage"`
  - `"test:ui": "vitest --ui"`
- [x] `src/test/setup.ts` oluştur (test utilities)

### 2.2 Unit Testler - Utilities ✅
- [x] `src/utils/sm2.test.ts` oluştur (31 test)
  - [x] `calculateSM2()` temel hesaplama testi
  - [x] Edge case: İlk tekrar (repetitions=0)
  - [x] Edge case: Sıfır kalite skoru
  - [x] Edge case: Maksimum interval
  - [x] Ease factor minimum değer kontrolü (1.3)
- [x] `src/utils/safeMath.test.ts` oluştur (44 test)
  - [x] NaN handling testleri
  - [x] Infinity değer kontrolü
  - [x] Yuvarlama hassasiyeti
- [x] `src/utils/importUtils.test.ts` oluştur (28 test)
  - [x] JSON parsing - valid input
  - [x] JSON parsing - invalid input
  - [x] CSV parsing - valid input
  - [x] CSV parsing - sütun uyumsuzluğu
  - [x] XML parsing
  - [x] Hatalı format handling

### 2.3 Unit Testler - Stores ✅
- [x] `src/store/appStore.test.ts` oluştur (49 test)
  - [x] Initial state kontrolü
  - [x] Card CRUD operations
  - [x] Session management
  - [x] Stats hesaplamaları
  - [x] Fill-in-blank cevap normalleştirme
- [x] `src/store/themeStore.test.ts` oluştur (51 test)
  - [x] Theme değişikliği
  - [x] Color scheme değişikliği
  - [x] Persistence kontrolü
  - [x] resetToDefaults
- [x] `src/store/toastStore.test.ts` oluştur (15 test)
  - [x] Toast ekleme
  - [x] Toast silme
  - [x] Auto-dismiss

### 2.4 Integration Testler - Database ✅
- [x] `src/database/database.test.ts` oluştur (59 test)
  - [x] `createCard()` testi
  - [x] `getAllCards()` testi
  - [x] `updateCard()` testi
  - [x] `deleteCard()` testi
  - [x] `createSession()` / `endSession()` testi
  - [x] `recordAttempt()` testi
  - [x] Auto-save mekanizması testi
  - [x] Data integrity kontrolü
  - [x] localStorage fallback testi

### 2.5 Component Testler ✅
- [x] `src/pages/Dashboard.test.tsx` oluştur (20 test)
  - [x] Render kontrolü
  - [x] Stats gösterimi
  - [x] Navigation
- [x] `src/pages/Study.test.tsx` oluştur (28 test)
  - [x] Kart gösterimi
  - [x] Cevap seçimi
  - [x] Setup mode testleri
- [x] `src/pages/CreateCard.test.tsx` oluştur (33 test)
  - [x] Form validation
  - [x] Kart oluşturma
  - [x] Import işlemi
- [x] `src/components/ToastContainer.test.tsx` oluştur (23 test)

### 2.6 E2E Test Kurulumu ✅
- [x] Playwright kur
  ```bash
  npm install -D @playwright/test
  npx playwright install chromium
  ```
- [x] `playwright.config.ts` oluştur
- [x] `e2e/` klasörü oluştur
- [x] `e2e/card-flow.spec.ts` - Kart oluştur → Çalış → İstatistik (16 test)
- [x] `e2e/import-export.spec.ts` - Import/Export akışı (9 test)
- [x] `e2e/settings.spec.ts` - Tema ve dil değişikliği (14 test)
- [x] `package.json` - E2E test script'leri eklendi (`test:e2e`, `test:e2e:ui`, `test:e2e:headed`)

---

## Phase 3: Kod Kalitesi İyileştirmeleri (Öncelik: 🟠 Yüksek)

### 3.1 ESLint Kurallarını Sıkılaştır
- [ ] `.eslintrc.cjs` güncellemeleri:
  - [ ] `'import/order': 'error'` - import sıralaması
  - [ ] `'prefer-const': 'error'` - const zorunluluğu
  - [ ] `'no-useless-escape': 'error'`
  - [ ] `'react-hooks/exhaustive-deps': 'error'`
  - [ ] `'@typescript-eslint/no-explicit-any': 'error'`
  - [ ] `'@typescript-eslint/no-unused-vars': 'error'`
- [ ] Lint hatalarını düzelt (tüm dosyalar)
- [ ] CI'da `--max-warnings 0` yap

### 3.2 Kod Tekrarını Gider (DRY)
- [ ] `src/utils/cardUtils.ts` oluştur
  - [ ] `checkAnswer(card, userAnswer)` fonksiyonu
  - [ ] `calculateAccuracy(correct, total)` fonksiyonu
- [ ] `src/pages/Study.tsx:188-212` → `checkAnswer()` kullan
- [ ] `src/pages/Study.tsx:958-992` → `checkAnswer()` kullan
- [ ] `src/store/appStore.ts:108-125` → `checkAnswer()` kullan
- [ ] `src/utils/themeUtils.ts` genişlet
  - [ ] `applyTheme()` fonksiyonunu tek noktada topla
- [ ] `src/main.tsx:25-41` → `applyTheme()` kullan
- [ ] `src/pages/Settings.tsx:72-80` → `applyTheme()` kullan

### 3.3 Hata Yönetimini İyileştir
- [ ] `src/types/errors.ts` oluştur
  - [ ] `DatabaseError` class
  - [ ] `ValidationError` class
  - [ ] `ImportError` class
- [ ] Alert kullanımlarını Toast'a çevir:
  - [ ] `src/database/database.ts:205`
  - [ ] `src/pages/Settings.tsx:114`
  - [ ] `src/pages/CreateCard.tsx` - validation alerts
- [ ] Error boundary'yi geliştir (`src/App.tsx`)
- [ ] Yapılandırılmış logging sistemi ekle

### 3.4 Input Validation Ekle
- [ ] `src/utils/validation.ts` oluştur
  ```typescript
  const LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    MAX_CARDS_IMPORT: 10000,
    MAX_SUBJECT_LENGTH: 100,
    MAX_QUESTION_LENGTH: 5000,
    MAX_OPTION_LENGTH: 1000,
  };
  ```
- [ ] `validateFileSize(file)` fonksiyonu
- [ ] `validateCardCount(count)` fonksiyonu
- [ ] `validateSubject(subject)` fonksiyonu
- [ ] `validateQuestion(question)` fonksiyonu
- [ ] `src/pages/CreateCard.tsx:241` - dosya boyutu kontrolü ekle
- [ ] `src/utils/importUtils.ts:283` - kart sayısı limiti ekle
- [ ] `src/utils/importUtils.ts:512` - sütun uyumsuzluğunda satırı atla

---

## Phase 4: CI/CD İyileştirmeleri (Öncelik: 🟠 Yüksek)

### 4.1 CI Pipeline'a Test Ekle
- [ ] `.github/workflows/ci.yml` güncelle:
  ```yaml
  - run: pnpm run test -- --coverage
  - run: pnpm run lint --max-warnings 0
  ```
- [ ] Codecov entegrasyonu ekle
- [ ] Coverage threshold belirle (%60 minimum)
- [ ] Test fail durumunda PR'ı engelle

### 4.2 Güvenlik Taraması Ekle
- [ ] Dependabot konfigürasyonu ekle
  - [ ] `.github/dependabot.yml` oluştur
- [ ] npm audit CI'a ekle
- [ ] Secret scanning aktifleştir

### 4.3 Build ve Artifact
- [ ] Tauri build workflow'u ekle (macOS, Windows, Linux)
- [ ] Release artifact upload
- [ ] Version bumping automation

---

## Phase 5: Dokümantasyon (Öncelik: 🟡 Orta)

### 5.1 Mimari Dokümantasyon
- [ ] `docs/ARCHITECTURE.md` oluştur
  - [ ] Sistem genel görünümü
  - [ ] Veri akışı diyagramı
  - [ ] Komponent yapısı
  - [ ] State management
- [ ] `docs/DATABASE.md` oluştur
  - [ ] SQLite schema
  - [ ] Tablo ilişkileri
  - [ ] Migration stratejisi

### 5.2 API Dokümantasyonu
- [ ] `docs/API.md` oluştur
- [ ] Database fonksiyonlarına JSDoc ekle:
  - [ ] `src/database/database.ts` - tüm export fonksiyonlar
  - [ ] `src/database/sqliteDatabase.ts`
- [ ] SM-2 algoritmasına JSDoc ekle:
  - [ ] `src/utils/sm2.ts` - algoritma açıklaması
- [ ] Store actions'a JSDoc ekle

### 5.3 Geliştirici Dokümantasyonu
- [ ] `docs/DEVELOPMENT.md` oluştur
  - [ ] Gereksinimler
  - [ ] Kurulum adımları
  - [ ] Geliştirme workflow'u
  - [ ] Test çalıştırma
  - [ ] Tauri build
- [ ] `.env.example` oluştur (tüm config değerleri)

---

## Phase 6: Environment ve Config (Öncelik: 🟡 Orta)

### 6.1 Config Yönetimi
- [ ] `src/config/constants.ts` oluştur
  ```typescript
  export const CONFIG = {
    BACKUP_INTERVAL_MS: 600000,
    AUTO_SAVE_DELAY_MS: 2000,
    MAX_STORAGE_MB: 4,
    CLEANUP_DAYS: 30,
    TRANSITION_DELAY_MS: 2500,
    STATS_RANGE_DAYS: 7,
  };
  ```
- [ ] Hard-coded değerleri config'e taşı:
  - [ ] `src/database/database.ts:46-48`
  - [ ] `src/pages/Study.tsx:160`
  - [ ] `src/pages/Dashboard.tsx:93`
- [ ] `.env.example` oluştur

### 6.2 Feature Flags
- [ ] Feature flag sistemi tasarla (opsiyonel)
- [ ] Debug mode flag'i ekle

---

## Phase 7: Git Workflow (Öncelik: 🟡 Orta)

### 7.1 Commit Standardı
- [ ] Commitlint kur
  ```bash
  npm install -D @commitlint/cli @commitlint/config-conventional
  ```
- [ ] `commitlint.config.js` oluştur
- [ ] `.husky/commit-msg` hook ekle

### 7.2 Kod Sahipliği
- [ ] `.github/CODEOWNERS` oluştur
- [ ] Branch protection rules dokümante et

### 7.3 Release Automation
- [ ] Semantic release kur (opsiyonel)
- [ ] CHANGELOG.md otomasyonu

---

## Phase 8: Performance Optimizasyonları (Öncelik: 🟡 Orta)

### 8.1 React Render Optimizasyonu
- [ ] `src/pages/Dashboard.tsx:113-121`
  - [ ] Multiple setState → tek state objesi
- [ ] React.memo kullanımını değerlendir
- [ ] useMemo/useCallback review

### 8.2 Database Performance
- [ ] `src/database/database.ts:213-229`
  - [ ] Filter içinde Date oluşturmayı düzelt
- [ ] `src/database/database.ts:139-150`
  - [ ] Double stringify'ı düzelt
- [ ] Lazy loading stratejisi

### 8.3 Bundle Optimizasyonu
- [ ] Bundle analizi yap
- [ ] Code splitting review
- [ ] Lazy import'ları kontrol et

---

## Özet: Tahmini İş Yükü

| Phase | Açıklama | Tahmini Görev |
|-------|----------|---------------|
| 1 | Kritik Güvenlik | 10 görev |
| 2 | Test Altyapısı | 35+ görev |
| 3 | Kod Kalitesi | 25 görev |
| 4 | CI/CD | 10 görev |
| 5 | Dokümantasyon | 12 görev |
| 6 | Config | 8 görev |
| 7 | Git Workflow | 6 görev |
| 8 | Performance | 8 görev |
| **Toplam** | | **~115 görev** |

---

## Öncelik Sırası

```
🔴 Phase 1 (Kritik) → 🔴 Phase 2 (Kritik) → 🟠 Phase 3 → 🟠 Phase 4 → 🟡 Phase 5-8
```

**Önerilen Başlangıç:**
1. XSS açığını kapat (1.1)
2. Test framework kur (2.1)
3. ESLint kurallarını sıkılaştır (3.1)
4. CI'a test ekle (4.1)

---

