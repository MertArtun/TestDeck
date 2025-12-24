// SQLite Database Service using Tauri Commands
// Gerçek SQLite veritabanı entegrasyonu

import { invoke } from '@tauri-apps/api/tauri';
import { Card, Session, Attempt, Subject, DailyStats } from '../types/database';

// Card operations
export async function createCard(card: Omit<Card, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  try {
    console.log('🃏 Yeni kart oluşturuluyor:', card);
    const cardId = await invoke<number>('create_card', { card });
    console.log('✅ Kart başarıyla oluşturuldu, ID:', cardId);
    return cardId;
  } catch (error) {
    console.error('❌ Kart oluşturma hatası:', error);
    throw new Error(`Kart oluşturulamadı: ${error}`);
  }
}

export async function createMultipleCards(cards: Omit<Card, 'id' | 'created_at' | 'updated_at'>[]): Promise<number[]> {
  try {
    console.log(`🃏 ${cards.length} adet kart toplu olarak oluşturuluyor...`);
    const cardIds: number[] = [];
    
    for (const card of cards) {
      const cardId = await createCard(card);
      cardIds.push(cardId);
    }
    
    console.log(`✅ ${cardIds.length} kart başarıyla oluşturuldu`);
    return cardIds;
  } catch (error) {
    console.error('❌ Toplu kart oluşturma hatası:', error);
    throw new Error(`Kartlar oluşturulamadı: ${error}`);
  }
}

export async function getAllCards(): Promise<Card[]> {
  try {
    console.log('📚 Tüm kartlar yükleniyor...');
    const cards = await invoke<Card[]>('get_all_cards');
    console.log(`✅ ${cards.length} kart başarıyla yüklendi`);
    return cards;
  } catch (error) {
    console.error('❌ Kartları yükleme hatası:', error);
    throw new Error(`Kartlar yüklenemedi: ${error}`);
  }
}

export async function getCardsBySubject(subject: string): Promise<Card[]> {
  try {
    console.log(`📖 ${subject} konusundaki kartlar yükleniyor...`);
    const cards = await invoke<Card[]>('get_cards_by_subject', { subject });
    console.log(`✅ ${subject} konusunda ${cards.length} kart bulundu`);
    return cards;
  } catch (error) {
    console.error('❌ Konu kartlarını yükleme hatası:', error);
    throw new Error(`${subject} kartları yüklenemedi: ${error}`);
  }
}

export async function updateCard(id: number, updates: Partial<Card>): Promise<void> {
  try {
    console.log(`🔄 Kart güncelleniyor, ID: ${id}`, updates);
    
    // Get current card first
    const allCards = await getAllCards();
    const currentCard = allCards.find(card => card.id === id);
    
    if (!currentCard) {
      throw new Error(`Kart bulunamadı: ${id}`);
    }
    
    // Merge updates with current card
    const updatedCard = { ...currentCard, ...updates };
    
    await invoke('update_card', { id, card: updatedCard });
    console.log(`✅ Kart başarıyla güncellendi, ID: ${id}`);
  } catch (error) {
    console.error('❌ Kart güncelleme hatası:', error);
    throw new Error(`Kart güncellenemedi: ${error}`);
  }
}

export async function deleteCard(id: number): Promise<void> {
  try {
    console.log(`🗑️ Kart siliniyor, ID: ${id}`);
    await invoke('delete_card', { id });
    console.log(`✅ Kart başarıyla silindi, ID: ${id}`);
  } catch (error) {
    console.error('❌ Kart silme hatası:', error);
    throw new Error(`Kart silinemedi: ${error}`);
  }
}

export async function deleteAllCards(): Promise<void> {
  try {
    console.log('🗑️ Tüm kartlar ve ilgili veriler siliniyor...');
    await invoke('delete_all_cards');
    console.log('✅ Tüm kartlar başarıyla silindi');
  } catch (error) {
    console.error('❌ Toplu kart silme hatası:', error);
    throw new Error(`Kartlar silinemedi: ${error}`);
  }
}

// Session operations
export async function createSession(session: Omit<Session, 'id'>): Promise<number> {
  try {
    console.log('🎯 Yeni oturum oluşturuluyor:', session);
    const sessionId = await invoke<number>('create_session', { session });
    console.log('✅ Oturum başarıyla oluşturuldu, ID:', sessionId);
    return sessionId;
  } catch (error) {
    console.error('❌ Oturum oluşturma hatası:', error);
    throw new Error(`Oturum oluşturulamadı: ${error}`);
  }
}

export async function endSession(sessionId: number, correctAnswers: number): Promise<void> {
  try {
    console.log(`🏁 Oturum sonlandırılıyor, ID: ${sessionId}, Doğru: ${correctAnswers}`);
    await invoke('end_session', { sessionId, correctAnswers });
    console.log(`✅ Oturum başarıyla sonlandırıldı, ID: ${sessionId}`);
  } catch (error) {
    console.error('❌ Oturum sonlandırma hatası:', error);
    throw new Error(`Oturum sonlandırılamadı: ${error}`);
  }
}

// Attempt operations
export async function recordAttempt(attempt: Omit<Attempt, 'id' | 'attempted_at'>): Promise<number> {
  try {
    const attemptWithTimestamp = {
      ...attempt,
      attempted_at: new Date().toISOString(),
      // Backend expects time_taken, while frontend types use time_spent
      time_taken: attempt.time_spent ?? 0,
    };
    
    console.log('📝 Deneme kaydediliyor:', attemptWithTimestamp);
    const attemptId = await invoke<number>('record_attempt', { attempt: attemptWithTimestamp });
    console.log('✅ Deneme başarıyla kaydedildi, ID:', attemptId);
    return attemptId;
  } catch (error) {
    console.error('❌ Deneme kaydetme hatası:', error);
    throw new Error(`Deneme kaydedilemedi: ${error}`);
  }
}

// Statistics operations
export async function getSubjectStats(): Promise<Subject[]> {
  try {
    console.log('📊 Konu istatistikleri yükleniyor...');
    const stats = await invoke<Subject[]>('get_subject_stats');
    console.log(`✅ ${stats.length} konu istatistiği yüklendi`);
    return stats;
  } catch (error) {
    console.error('❌ Konu istatistikleri yükleme hatası:', error);
    throw new Error(`Konu istatistikleri yüklenemedi: ${error}`);
  }
}

interface RawDailyStats {
  date: string;
  questions_answered?: number;
  total_questions?: number;
  correct_answers?: number;
  accuracy?: number;
  study_time?: number;
}

export async function getDailyStats(days: number = 30): Promise<DailyStats[]> {
  try {
    console.log(`📈 Son ${days} günün istatistikleri yükleniyor...`);
    const rawStats = await invoke<RawDailyStats[]>('get_daily_stats', { days });
    console.log(`✅ ${rawStats.length} günlük istatistik yüklendi`);

    // Normalize field names to match frontend expectations
    // Backend returns: { date, sessions, total_questions, correct_answers, accuracy }
    // Frontend expects: { date, questions_answered, correct_answers, accuracy, study_time }
    const stats: DailyStats[] = rawStats.map((s) => ({
      date: s.date,
      questions_answered: s.questions_answered ?? s.total_questions ?? 0,
      correct_answers: s.correct_answers ?? 0,
      accuracy: s.accuracy ?? 0,
      study_time: s.study_time ?? 0,
    }));
    return stats;
  } catch (error) {
    console.error('❌ Günlük istatistikler yükleme hatası:', error);
    throw new Error(`Günlük istatistikler yüklenemedi: ${error}`);
  }
}

// Utility functions
export async function updateCardStats(cardId: number, isCorrect: boolean): Promise<void> {
  try {
    // This is handled automatically by recording attempts
    console.log(`📊 Kart istatistiği güncellendi: ${cardId}, Doğru: ${isCorrect}`);
  } catch (error) {
    console.error('❌ Kart istatistiği güncelleme hatası:', error);
  }
}

// Database initialization and management
export async function initDatabase(): Promise<void> {
  try {
    console.log('🗄️ Veritabanı başlatılıyor...');
    // Database is automatically initialized when first command is called
    await getAllCards(); // This will trigger database initialization
    console.log('✅ Veritabanı başarıyla başlatıldı');
  } catch (error) {
    console.error('❌ Veritabanı başlatma hatası:', error);
    throw new Error(`Veritabanı başlatılamadı: ${error}`);
  }
}

interface DatabaseInfo {
  type: string;
  status: string;
  location: string;
}

export function getDatabase(): DatabaseInfo {
  // Return a mock database object for compatibility
  return {
    type: 'sqlite',
    status: 'connected',
    location: 'app_data/testdeck.db'
  };
}

// Data export/import functions (for backup compatibility)
export async function exportUserData(): Promise<void> {
  try {
    console.log('📤 Veriler dışa aktarılıyor...');
    
    const cards = await getAllCards();
    const subjectStats = await getSubjectStats();
    const dailyStats = await getDailyStats(365); // Last year
    
    const exportData = {
      cards,
      subjectStats,
      dailyStats,
      exportedAt: new Date().toISOString(),
      version: '2.0-sqlite'
    };
    
    // Use Tauri's save dialog
    const { save } = await import('@tauri-apps/api/dialog');
    const { writeTextFile } = await import('@tauri-apps/api/fs');
    
    const filePath = await save({
      filters: [{
        name: 'TestDeck Backup',
        extensions: ['json']
      }],
      defaultPath: `testdeck-backup-${new Date().toISOString().split('T')[0]}.json`
    });
    
    if (filePath) {
      await writeTextFile(filePath, JSON.stringify(exportData, null, 2));
      console.log('✅ Veriler başarıyla dışa aktarıldı:', filePath);
    }
  } catch (error) {
    console.error('❌ Veri dışa aktarma hatası:', error);
    throw new Error(`Veriler dışa aktarılamadı: ${error}`);
  }
}

// Migration function from localStorage to SQLite
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    console.log('🔄 localStorage verilerinden SQLite\'e geçiş yapılıyor...');
    
    // Check if there's existing localStorage data
    const localData = localStorage.getItem('testdeck-data');
    if (!localData) {
      console.log('ℹ️ Geçirilecek localStorage verisi bulunamadı');
      return;
    }
    
    const parsedData = JSON.parse(localData);
    if (!parsedData.cards || !Array.isArray(parsedData.cards)) {
      console.log('ℹ️ Geçerli kart verisi bulunamadı');
      return;
    }
    
    console.log(`📦 ${parsedData.cards.length} kart geçiriliyor...`);
    
    // Migrate cards
    let migratedCount = 0;
    for (const card of parsedData.cards) {
      try {
        // Convert localStorage card format to SQLite format
        const sqliteCard = {
          question: card.question || '',
          option_a: card.option_a || null,
          option_b: card.option_b || null,
          option_c: card.option_c || null,
          option_d: card.option_d || null,
          option_e: card.option_e || null,
          correct_answer: card.correct_answer || null,
          blank_answer: card.blank_answer || null,
          question_type: card.question_type || 'multiple_choice',
          subject: card.subject || 'Genel',
          difficulty: card.difficulty || 1,
          image_path: card.image_path || null
        };
        
        await createCard(sqliteCard);
        migratedCount++;
      } catch (error) {
        console.warn(`⚠️ Kart geçirilemedi:`, card, error);
      }
    }
    
    console.log(`✅ ${migratedCount} kart başarıyla SQLite'e geçirildi`);
    
    // Backup localStorage data before clearing
    localStorage.setItem('testdeck-data-backup', localData);
    localStorage.removeItem('testdeck-data');
    
    console.log('🧹 localStorage temizlendi, yedek oluşturuldu');
    
  } catch (error) {
    console.error('❌ Veri geçiş hatası:', error);
    throw new Error(`Veriler geçirilemedi: ${error}`);
  }
} 