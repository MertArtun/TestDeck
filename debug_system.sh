#!/bin/bash

echo "🔍 TestDeck System Debug - Başlatılıyor..."
echo "=================================================="

cd /Volumes/Sandisk/AnkiAPP

echo ""
echo "1️⃣ Sistem Bilgileri:"
echo "Node.js versiyonu: $(node --version)"
echo "NPM versiyonu: $(npm --version)"
echo "Rust versiyonu: $(rustc --version 2>/dev/null || echo 'Rust bulunamadı')"
echo "Çalışma dizini: $(pwd)"

echo ""
echo "2️⃣ Port Kontrolü:"
echo "Port 5173 durumu:"
lsof -i :5173 || echo "Port 5173 boş"
echo "Port 5174 durumu:"
lsof -i :5174 || echo "Port 5174 boş"

echo ""
echo "3️⃣ Node Modules Kontrolü:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules mevcut"
    echo "React mevcut: $(ls node_modules/ | grep '^react$' || echo 'YOK')"
    echo "Vite mevcut: $(ls node_modules/ | grep '^vite$' || echo 'YOK')"
else
    echo "❌ node_modules bulunamadı"
fi

echo ""
echo "4️⃣ Çalışan Process'ler:"
ps aux | grep -E "(node|vite|tauri)" | grep -v grep || echo "İlgili process bulunamadı"

echo ""
echo "5️⃣ Temel Dosya Kontrolü:"
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json"
[ -f "vite.config.ts" ] && echo "✅ vite.config.ts" || echo "❌ vite.config.ts"
[ -f "index.html" ] && echo "✅ index.html" || echo "❌ index.html"
[ -f "src/main.tsx" ] && echo "✅ src/main.tsx" || echo "❌ src/main.tsx"

echo ""
echo "6️⃣ NPM Cache Kontrol:"
echo "NPM cache info:"
npm cache verify

echo ""
echo "=================================================="
echo "🔍 Debug tamamlandı. Şimdi adım adım çözüm:"
echo ""

echo "ADIM 1: Tüm process'leri öldür"
pkill -f "node.*vite" 2>/dev/null || echo "Vite process'i bulunamadı"
pkill -f "tauri" 2>/dev/null || echo "Tauri process'i bulunamadı"

echo ""
echo "ADIM 2: Node modules temizliği"
rm -rf node_modules package-lock.json
echo "✅ Eski dosyalar temizlendi"

echo ""
echo "ADIM 3: Dependencies yeniden yükleniyor..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies başarıyla yüklendi"
else
    echo "❌ Dependencies yüklemesinde hata!"
    exit 1
fi

echo ""
echo "ADIM 4: Vite server test ediliyor..."
timeout 10s npm run dev &
VITE_PID=$!

sleep 5

# Test et
if curl -s http://localhost:5174/ > /dev/null; then
    echo "✅ Vite server çalışıyor!"
    kill $VITE_PID 2>/dev/null
else
    echo "❌ Vite server başlatılamadı"
    kill $VITE_PID 2>/dev/null
    
    echo ""
    echo "Manuel test için:"
    echo "npm run dev"
    exit 1
fi

echo ""
echo "🚀 Sistem hazır! Tauri başlatılıyor..."
npm run tauri:dev
