#!/bin/bash

echo "🔧 AnkiAPP Beyaz Ekran Sorunu Çözücü"
echo "==================================="

# Projenin doğru dizinde olduğundan emin ol
cd /Volumes/Sandisk/AnkiAPP

echo "1️⃣ Rust environment'ı ayarlıyorum..."
source ~/.cargo/env 2>/dev/null || echo "⚠️  Rust bulunamadı, yükleyebilirsiniz: https://rustup.rs/"

echo ""
echo "2️⃣ Eski node_modules'ları temizliyorum..."
rm -rf node_modules package-lock.json dist

echo ""
echo "3️⃣ Bağımlılıkları yeniden yüklüyorum..."
npm install

echo ""
echo "4️⃣ Tauri CLI'yi kontrol ediyorum..."
if ! command -v tauri &> /dev/null; then
    echo "Tauri CLI yükleniyor..."
    npm install -g @tauri-apps/cli
fi

echo ""
echo "5️⃣ Dist klasörünü oluşturuyorum..."
npm run build

echo ""
echo "✅ Hazır! Şimdi uygulamayı başlatıyorum..."
echo "Not: İlk açılış biraz zaman alabilir."
echo ""

# Uygulamayı başlat
npm run tauri:dev
