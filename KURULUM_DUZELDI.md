#!/bin/bash

echo "🚀 TestDeck Local - Düzeltilmiş kurulum adımları"
echo "================================================"

echo "1. Terminal'e şu komutu girin (Rust PATH için):"
echo "   source ~/.cargo/env"
echo ""

echo "2. Proje dizinine gidin:"
echo "   cd /Volumes/Sandisk/AnkiAPP"
echo ""

echo "3. Node modules'ları temizleyin ve yeniden yükleyin:"
echo "   rm -rf node_modules package-lock.json"
echo "   npm install"
echo ""

echo "4. Tauri CLI'yi global olarak yükleyin:"
echo "   npm install -g @tauri-apps/cli"
echo ""

echo "5. Uygulamayı çalıştırın:"
echo "   npm run tauri:dev"
echo ""

echo "✅ Yapılan düzeltmeler:"
echo "   - SQL plugin kaldırıldı (geçici mock data kullanılıyor)"
echo "   - Tauri konfigürasyonu düzeltildi"
echo "   - Cargo.toml güncellendi"
echo "   - Database mock implementation eklendi"
echo ""

echo "📝 Not: Şu anda uygulama localStorage ile çalışıyor"
echo "     Ileride gerçek SQLite eklenecek"
