#!/bin/bash

echo "🚀 TestDeck Basit Mod Başlatılıyor..."
echo "==================================="

cd /Volumes/Sandisk/AnkiAPP

echo "1️⃣ Önceki process'leri temizliyorum..."
pkill -f "tauri.*dev" 2>/dev/null || echo "Tauri process bulunamadı"
pkill -f "vite.*dev" 2>/dev/null || echo "Vite process bulunamadı"

echo ""
echo "2️⃣ Port kontrolü..."
if lsof -i :5174 > /dev/null 2>&1; then
    echo "⚠️ Port 5174 kullanımda, temizleniyor..."
    lsof -ti :5174 | xargs kill -9 2>/dev/null || echo "Port temizlenemedi"
    sleep 2
fi

echo ""
echo "3️⃣ Vite dev server başlatılıyor..."
echo "Terminal 1: Vite server"
echo "Terminal 2: Tauri (2 saniye sonra)"

# Arka planda Vite'i başlat
npm run dev &
VITE_PID=$!

echo "Vite PID: $VITE_PID"

# 3 saniye bekle ve server'ın hazır olup olmadığını kontrol et
echo "Vite server'ın hazır olması bekleniyor..."
for i in {1..10}; do
    if curl -s http://localhost:5174/ > /dev/null 2>&1; then
        echo "✅ Vite server hazır (${i} saniye)"
        break
    fi
    echo "Bekleniyor... ${i}/10"
    sleep 1
done

echo ""
echo "4️⃣ Tauri başlatılıyor..."
npm run tauri:dev

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Temizlik yapılıyor..."
    kill $VITE_PID 2>/dev/null
    pkill -f "tauri.*dev" 2>/dev/null
    pkill -f "vite.*dev" 2>/dev/null
    exit
}

# SIGINT yakalandığında cleanup yap
trap cleanup SIGINT

# Script bitti
wait