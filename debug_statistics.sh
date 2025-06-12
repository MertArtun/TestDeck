#!/bin/bash

echo "📊 İstatistik Debug - Başlatılıyor..."
echo "=================================================="

cd /Volumes/Sandisk/AnkiAPP

echo ""
echo "1️⃣ İstatistik Dosya Kontrolü:"
if [ -d "src" ]; then
    echo "✅ src klasörü mevcut"
    
    # Statistics bileşenini kontrol et
    if [ -f "src/pages/Statistics.tsx" ]; then
        echo "✅ Statistics.tsx mevcut"
        echo ""
        echo "NaN problemi araştırılıyor..."
        grep -n "NaN\|isNaN\|parseInt\|parseFloat\|successRate\|calculateSuccess\|averageAccuracy" src/pages/Statistics.tsx || echo "Matematiksel işlem bulunamadı"
    else
        echo "❌ Statistics.tsx bulunamadı"
    fi
    
    # Database dosyasını kontrol et  
    if [ -f "src/database/database.ts" ]; then
        echo "✅ database.ts mevcut"
        echo "Accuracy hesaplama kontrolü:"
        grep -n "accuracy.*=" src/database/database.ts || echo "Accuracy hesaplama bulunamadı"
    else
        echo "❌ database.ts bulunamadı"
    fi
    
    # Store kontrolü
    if [ -f "src/store/appStore.ts" ]; then
        echo "✅ appStore.ts mevcut"
    else
        echo "❌ appStore.ts bulunamadı"
    fi
else
    echo "❌ src klasörü bulunamadı"
fi

echo ""
echo "2️⃣ JavaScript/TypeScript NaN Test:"
node -e "
console.log('🧮 NaN Sorun Testleri:');
console.log('Normal hesaplama: 8/10 * 100 =', 8/10 * 100);
console.log('Sıfır bölme: 10/0 =', 10/0);
console.log('Sıfır/Sıfır: 0/0 =', 0/0);
console.log('undefined + 1 =', undefined + 1);
console.log('null + 1 =', null + 1);
console.log('');
console.log('🔧 Güvenli NaN Kontrol:');
console.log('isNaN(0/0) =', isNaN(0/0));
console.log('Number.isNaN(0/0) =', Number.isNaN(0/0));
console.log('');
console.log('✅ Güvenli Hesaplama:');
const safeCalc = (correct, total) => {
  if (!total || total === 0) return 0;
  if (!correct || correct < 0) return 0;
  const result = (correct / total) * 100;
  return isNaN(result) ? 0 : Math.round(result);
};
console.log('safeCalc(8, 10) =', safeCalc(8, 10));
console.log('safeCalc(0, 0) =', safeCalc(0, 0));
console.log('safeCalc(undefined, 10) =', safeCalc(undefined, 10));
"

echo ""
echo "3️⃣ Mock Data Kontrolü:"
if [ -f "src/database/database.ts" ]; then
    echo "Mock data mevcudiyeti kontrol ediliyor..."
    grep -n "mockDb\|attempts\|stats" src/database/database.ts | head -5 || echo "Mock data bulunamadı"
fi

echo ""
echo "=================================================="
echo "🔧 İSTATİSTİK SORUN TESPİTİ:"
echo ""
echo "Muhtemel sorunlar:"
echo "1. 📊 Sıfır bölme işlemi (0/0 = NaN)"
echo "2. 🔢 undefined/null değerlerle matematik işlemi"
echo "3. 💾 Mock veritabanı boş olabilir"
echo "4. 🔄 State güncelleme sorunu"
echo ""
echo "✅ ÇÖZÜMLEŞTİRİLİYOR:"
echo "- Güvenli matematik fonksiyonları eklenecek"
echo "- NaN kontrolleri eklenecek"
echo "- Default değerler ayarlanacak"
echo ""
echo "🚀 Düzeltme tamamlandıktan sonra şunu çalıştır:"
echo "./debug_system.sh"