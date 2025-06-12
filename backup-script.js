// ACİL VERİ YEDEKLEME SCRIPT'İ
// Browser console'da çalıştırın: copy(JSON.stringify(localStorage.getItem('testdeck-data')))

// 1. HEMEN YEDEK YAPIN
function acilYedekle() {
  const data = localStorage.getItem('testdeck-data');
  if (data) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ACIL-YEDEK-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('✅ ACİL YEDEK İNDİRİLDİ!');
  } else {
    console.log('❌ Veri bulunamadı');
  }
}

// 2. VERİ KONTROL ET
function veriKontrol() {
  const data = localStorage.getItem('testdeck-data');
  if (data) {
    const parsed = JSON.parse(data);
    console.log('📊 VERİ DURUMU:', {
      'Toplam Kart': parsed.cards?.length || 0,
      'Oturum': parsed.sessions?.length || 0,
      'Son Kayıt': parsed.lastSaved
    });
    return parsed.cards?.length || 0;
  }
  return 0;
}

// 3. İKİLİ YEDEK OLUŞTUR
function ikiliYedek() {
  const data = localStorage.getItem('testdeck-data');
  if (data) {
    // LocalStorage backup
    localStorage.setItem('testdeck-emergency-backup', data);
    // Console copy için
    console.log('🔄 İkili yedek oluşturuldu');
    console.log('📋 Manuel kopyalama için:');
    console.log(data);
  }
}

// 4. ÇALIŞTIR
console.log('🚨 ACİL YEDEKLEME BAŞLATILIYOR...');
console.log('📊 Mevcut veri sayısı:', veriKontrol());
acilYedekle();
ikiliYedek();
console.log('✅ YEDEKLEME TAMAMLANDI!'); 