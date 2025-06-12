# TestDeck Local - Geliştirme Kurulum Rehberi

Bu rehber TestDeck Local projesini geliştirme ortamında çalıştırmak için gerekli adımları açıklamaktadır.

## 🔧 Gereksinimler

### 1. Node.js ve npm
```bash
# Node.js 18+ gerekli
node --version  # v18.0.0+
npm --version   # 8.0.0+
```

### 2. Rust
```bash
# Rust kurulumu
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Rust versiyon kontrolü
rustc --version  # 1.70.0+
cargo --version  # 1.70.0+
```

### 3. Tauri CLI
```bash
# Tauri CLI kurulumu
npm install -g @tauri-apps/cli

# Versiyon kontrolü
npx tauri --version  # 1.5.0+
```

## 🚀 Kurulum Adımları

### 1. Projeyi Klonlayın
```bash
git clone <repo-url>
cd AnkiAPP
```

### 2. Bağımlılıkları Yükleyin
```bash
# Frontend bağımlılıkları
npm install

# Rust bağımlılıkları (otomatik olarak yüklenecek)
```

### 3. Geliştirme Sunucusunu Başlatın
```bash
# Tauri dev server (önerilen)
npm run tauri:dev

# Alternatif: Sadece frontend
npm run dev
```

## 📁 Proje Yapısı

```
AnkiAPP/
├── src/                    # React frontend
│   ├── components/         # UI bileşenleri
│   ├── pages/             # Sayfa bileşenleri
│   ├── store/             # Zustand state
│   ├── database/          # SQLite işlemleri
│   ├── utils/             # Yardımcı fonksiyonlar
│   └── types/             # TypeScript tipleri
├── src-tauri/             # Tauri backend
│   ├── src/               # Rust kaynak kodu
│   ├── Cargo.toml         # Rust bağımlılıkları
│   └── tauri.conf.json    # Tauri konfigürasyonu
├── public/                # Statik dosyalar
└── package.json           # Node.js konfigürasyonu
```

## 🛠️ Geliştirme Komutları

```bash
# Geliştirme sunucusu (hot reload)
npm run tauri:dev

# Production build
npm run tauri:build

# Debug build (daha hızlı)
npm run tauri:build:debug

# Type checking
npm run type-check

# Temizlik
npm run clean
```

## 🔍 Debugging

### Frontend Debugging
- Chrome DevTools Tauri uygulamasında çalışır
- `console.log()` ve `debugger` kullanabilirsiniz
- React DevTools extension'ı desteklenir

### Backend Debugging (Rust)
```bash
# Debug modunda çalıştır
RUST_LOG=debug npm run tauri:dev

# Sadece Tauri logları
RUST_LOG=tauri=debug npm run tauri:dev
```

### Database Debugging
```bash
# SQLite database'ini görüntüle
sqlite3 ~/.local/share/com.testdeck.local/testdeck.db
.tables
.schema cards
```

## 🗄️ Veritabanı

### Konumu
- **Linux**: `~/.local/share/com.testdeck.local/`
- **macOS**: `~/Library/Application Support/com.testdeck.local/`
- **Windows**: `%APPDATA%\com.testdeck.local\`

### Schema Migrations
Veritabanı şeması değişikliklerinde:
1. `src/database/database.ts` dosyasını güncelleyin
2. Geliştirme veritabanını silin
3. Uygulamayı yeniden başlatın

## 🎨 UI/UX Geliştirme

### Tailwind CSS
- Utility-first CSS framework
- JIT (Just-In-Time) compiler aktif
- Custom theme: `tailwind.config.js`

### Komponenet Yapısı
```bash
src/components/
├── Layout.tsx          # Ana layout
├── Card.tsx           # Kart bileşeni
└── common/            # Ortak bileşenler
```

## 📊 State Management

### Zustand Store
```typescript
// Store kullanımı
import { useAppStore } from '../store/appStore';

const { cards, addCard, setLoading } = useAppStore();
```

### Persistent State
- Zustand persist middleware (localStorage)
- Önemli state SQLite'da saklanır

## 🧪 Testing

### Unit Tests (Gelecek)
```bash
npm test
```

### E2E Tests (Gelecek)
```bash
npm run test:e2e
```

## 📦 Build & Distribution

### Development Build
```bash
npm run tauri:build:debug
```

### Production Build
```bash
npm run tauri:build
```

Build dosyaları:
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **Linux**: `src-tauri/target/release/bundle/deb/`

## 🚨 Sorun Giderme

### 1. Rust Compilation Errors
```bash
# Rust cache temizle
cargo clean
cd src-tauri && cargo clean
```

### 2. SQLite Errors
```bash
# Database dosyasını sil ve yeniden oluştur
rm ~/.local/share/com.testdeck.local/testdeck.db
```

### 3. Node Modules Issues
```bash
# Node modules temizle
rm -rf node_modules package-lock.json
npm install
```

### 4. Tauri CLI Issues
```bash
# Tauri CLI güncelle
npm update -g @tauri-apps/cli
```

## 🔧 IDE Setup

### VS Code (Önerilen)
Önerilen extensions:
- Rust Analyzer
- Tauri
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer

### Settings
`.vscode/settings.json`:
```json
{
  "rust-analyzer.check.command": "cargo",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 📚 Kaynaklar

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## 🤝 Katkıda Bulunma

1. Feature branch oluşturun
2. Değişikliklerinizi test edin
3. TypeScript hatalarını düzeltin
4. Commit message'larınızı açıklayıcı yazın
5. Pull request gönderin

---

**Happy Coding! 🚀**
