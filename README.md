# 🎓 TestDeck Local

Modern, offline çalışan kişisel test ve hafıza kartı uygulaması. Spaced repetition algoritması ile etkili öğrenme deneyimi sunar.

![TestDeck Local](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## 🚀 Özellikler

### ✅ Temel Özellikler (MVP)
- **Kart Oluşturma**: 5 seçenekli (A-E) test soruları
- **Görsel Desteği**: Her karta JPEG/PNG görsel ekleme (≤5MB)
- **Spaced Repetition**: SM-2 algoritması ile akıllı tekrar sistemi
- **Test Modu**: 10-20 karışık sorudan oluşan çalışma oturumları
- **Anlık Geri Bildirim**: Doğru/yanlış anında gösterim
- **İstatistikler**: Konu bazlı başarı analizi ve günlük performans grafiği
- **Lokal Veri**: Tüm veriler SQLite ile güvenli şekilde saklanır

### 🎯 Kullanım Alanları
- Üniversite sınavlarına hazırlık
- Sertifika sınavları çalışması
- Dil öğrenimi
- Genel bilgi tekrarı
- Mesleki gelişim

## 🛠️ Teknoloji Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Tauri (Rust)
- **State Management**: Zustand
- **Database**: SQLite + Tauri SQL Plugin
- **UI Framework**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- Rust (latest stable)
- Tauri CLI

### Geliştirme Ortamı

1. **Depoyu klonlayın**
```bash
git clone https://github.com/YOUR_USERNAME/testdeck-local.git
cd testdeck-local
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Tauri CLI'yi yükleyin**
```bash
npm install -g @tauri-apps/cli
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run tauri dev
```

### Production Build

```bash
npm run tauri build
```

Bu komut `src-tauri/target/release/bundle/` klasöründe platform-specific kurulum dosyalarını oluşturur.

## 📱 Kullanım

### 1. Kart Oluşturma
- "Yeni Kart Oluştur" butonuna tıklayın
- Soru metninizi yazın
- 5 seçeneği (A-E) doldurun
- Doğru cevabı işaretleyin
- İsteğe bağlı görsel ekleyin
- Konu ve zorluk seviyesi belirleyin

### 2. Çalışma
- "Çalışmaya Başla" seçeneğini kullanın
- Konu ve soru sayısını belirleyin
- Pratik (Spaced Repetition) veya Test modunu seçin
- Soruları cevaplayın ve anında geri bildirim alın

### 3. İstatistik Takibi
- Günlük çözüm grafiklerini görüntüleyin
- Konu bazlı başarı oranlarını analiz edin
- Genel performansınızı takip edin

## 🗂️ Proje Yapısı

```
testdeck-local/
├── src/
│   ├── components/       # React bileşenleri
│   ├── pages/           # Sayfa bileşenleri
│   ├── store/           # Zustand state management
│   ├── database/        # SQLite veritabanı işlemleri
│   ├── utils/           # Yardımcı fonksiyonlar (SM-2 algoritması)
│   ├── types/           # TypeScript tip tanımları
│   └── assets/          # Statik dosyalar
├── src-tauri/           # Tauri backend (Rust)
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/              # Public assets
└── package.json
```

## 🔄 SM-2 Algoritması

Uygulama, SuperMemo-2 algoritmasını kullanarak kartların tekrar zamanlarını optimize eder:

- **İlk doğru cevap**: 1 gün sonra tekrar
- **İkinci doğru cevap**: 6 gün sonra tekrar  
- **Sonraki doğru cevaplar**: Ease Factor × önceki aralık
- **Yanlış cevap**: Tekrar sayacı sıfırlanır, 1 gün sonra tekrar

## 📊 Veritabanı Şeması

### Tablolar
- `cards`: Soru kartları
- `study_sessions`: Çalışma oturumları
- `card_attempts`: Soru çözüm denemeleri
- `card_stats`: SM-2 istatistikleri

## ⚙️ Ayarlar

- **Tema**: Açık/Koyu/Sistem
- **Görsel Boyutu**: 1-10MB arası sınır
- **Otomatik Yedekleme**: Düzenli veri yedekleme
- **Veri İçe/Dışa Aktarma**: JSON formatında

## 🔒 Güvenlik

- Tüm veriler lokal olarak saklanır
- İnternet bağlantısı gerektirmez
- Kişisel veriler hiçbir yere gönderilmez
- SQLite veritabanı güvenli şifreleme ile korunabilir

## 🚧 Roadmap

### v0.2 (Gelecek Özellikler)
- [ ] Bulut senkronizasyonu (isteğe bağlı)
- [ ] Ses kayıtları ekleme
- [ ] Video ekleme desteği
- [ ] Daha gelişmiş istatistikler
- [ ] Tema özelleştirme
- [ ] Kart paylaşımı

### v0.3
- [ ] Mobil uygulama (React Native)
- [ ] Çoklu kullanıcı desteği
- [ ] Gelişmiş SR algoritmaları
- [ ] Kart kategorileri
- [ ] Özel çalışma programları

## 🐛 Bilinen Sorunlar

- Çok büyük görseller performansı etkileyebilir
- İlk açılışta veritabanı oluşturma birkaç saniye sürebilir

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim & Destek

- **GitHub Issues**: Sorun bildirimi ve özellik istekleri için
- **Discussions**: Genel sorular ve tartışmalar için

## 🙏 Teşekkürler

- SuperMemo ekibine SM-2 algoritması için
- Tauri topluluğuna harika framework için
- React ve TypeScript ekiplerine

---

**TestDeck Local v0.1.0** - Kişisel gelişiminiz için tasarlandı 🎓
