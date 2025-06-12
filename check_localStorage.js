// Test script to check localStorage data
console.log('🔍 LocalStorage İçeriği Kontrol Ediliyor...');

// Check if data exists
const data = localStorage.getItem('testdeck-data');
if (data) {
  try {
    const parsed = JSON.parse(data);
    console.log('📊 Mevcut Veriler:', {
      cards: parsed.cards?.length || 0,
      sessions: parsed.sessions?.length || 0,
      attempts: parsed.attempts?.length || 0,
      stats: parsed.stats?.length || 0,
      lastSaved: parsed.lastSaved
    });
    
    if (parsed.sessions?.length > 0) {
      console.log('📅 Son Session:', parsed.sessions[parsed.sessions.length - 1]);
    }
    
    if (parsed.attempts?.length > 0) {
      console.log('✍️ Son Attempt:', parsed.attempts[parsed.attempts.length - 1]);
    }
    
  } catch (error) {
    console.error('❌ Veri parse hatası:', error);
  }
} else {
  console.log('⚠️ LocalStorage\'da veri bulunamadı');
}

// Check backup
const backup = localStorage.getItem('testdeck-backup');
if (backup) {
  console.log('🔄 Backup mevcut');
} else {
  console.log('⚠️ Backup yok');
}
