// Database Service - SQLite Integration with localStorage fallback
// SQLite entegrasyonu ile geliştirilmiş veritabanı servisi

import { safePercentage, safeRound } from '../utils/safeMath';

// Try to use SQLite first, fallback to localStorage if not available
let useSQLite = true;

// Import SQLite service dynamically
let sqliteService: any = null;

async function initSQLiteService() {
  try {
    sqliteService = await import('./sqliteDatabase');
    await sqliteService.initDatabase();
    console.log('✅ SQLite veritabanı başarıyla başlatıldı');
    
    // Check for localStorage migration
    const localData = localStorage.getItem('testdeck-data');
    if (localData) {
      console.log('🔄 localStorage verilerinden SQLite\'e geçiş başlatılıyor...');
      await sqliteService.migrateFromLocalStorage();
    }
    
    return true;
  } catch (error) {
    console.warn('⚠️ SQLite başlatılamadı, localStorage kullanılacak:', error);
    useSQLite = false;
    return false;
  }
}

// Original localStorage implementation as fallback
import { save } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';

let mockDb = {
  cards: [] as any[],
  sessions: [] as any[],
  attempts: [] as any[],
  stats: [] as any[],
  lastBackup: null as string | null
};

// Backup management
const BACKUP_KEY = 'testdeck-backup';
const BACKUP_INTERVAL = 1000 * 60 * 10; // 10 dakika

// Data validation functions
const validateCard = (card: any): boolean => {
  const baseValid = !!(
    card.question &&
    card.subject &&
    card.difficulty
  );
  
  if (!baseValid) return false;
  
  // Boşluk doldurma sorusu için validation
  if (card.question_type === 'fill_in_blank') {
    return !!(card.blank_answer);
  }
  
  // Çoktan seçmeli soru için validation (varsayılan)
  return !!(
    card.option_a &&
    card.option_b &&
    card.option_c &&
    card.option_d &&
    card.correct_answer
  );
};

// Multi-layer data persistence
function loadMockData() {
  // Return if db is already in memory
  if (mockDb.cards.length > 0 || mockDb.sessions.length > 0) {
    return;
  }

  let dataLoaded = false;

  // 1. Try to load primary data
  try {
    const localData = localStorage.getItem('testdeck-data');
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.cards)) {
        mockDb = { ...mockDb, ...parsed };
        dataLoaded = true;
        console.log('✅ Ana veriler başarıyla yüklendi.');
      }
    }
  } catch (error) {
    console.error('❌ Ana veriler yüklenirken hata oluştu:', error);
    // DO NOT DELETE DATA ON PARSE ERROR.
  }

  // 2. If primary data fails, try to load from backup
  if (!dataLoaded) {
    console.warn('⚠️ Ana veri yüklenemedi. Yedek deneniyor...');
    try {
      const backupData = localStorage.getItem(BACKUP_KEY);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.cards)) {
          mockDb = { ...mockDb, ...parsed };
          console.log('✅ Yedek veriler başarıyla yüklendi.');
          // Also, restore the primary data from this backup
          saveMockData(); 
          console.log('🔄 Ana veri yedekten geri yüklendi.');
        }
      } else {
        console.log('ℹ️ Yüklenecek yedek veri bulunamadı.');
      }
    } catch (error) {
      console.error('❌ Yedek veriler yüklenirken hata oluştu:', error);
    }
  }
}

// Enhanced save with error handling and backup
function saveMockData() {
  try {
    console.log('💾 Veriler kaydediliyor...', {
      cards: mockDb.cards.length,
      sessions: mockDb.sessions.length,
      attempts: mockDb.attempts.length,
      stats: mockDb.stats.length
    });
    
    const dataToSave = {
      ...mockDb,
      lastSaved: new Date().toISOString(),
      version: '1.0'
    };
    
    // Check data size before saving
    const jsonString = JSON.stringify(dataToSave);
    const sizeInMB = jsonString.length / (1024 * 1024);
    console.log(`📦 Veri boyutu: ${sizeInMB.toFixed(2)} MB`);
    
    // If data is too large, try to clean up
    if (sizeInMB > 4) {
      console.log('⚠️ Veri çok büyük, temizlik yapılıyor...');
      cleanupLargeData();
    }
    
    // Save to primary storage
    localStorage.setItem('testdeck-data', jsonString);
    console.log('✅ Veriler localStorage\'a kaydedildi');
    
    // Create backup every interval (but only if space allows)
    const now = Date.now();
    const lastBackup = mockDb.lastBackup ? new Date(mockDb.lastBackup).getTime() : 0;
    
    if (now - lastBackup > BACKUP_INTERVAL && sizeInMB < 3) {
      try {
        localStorage.setItem(BACKUP_KEY, jsonString);
        mockDb.lastBackup = new Date().toISOString();
        console.log('🔄 Backup oluşturuldu');
      } catch (backupError) {
        console.log('⚠️ Backup oluşturulamadı, ana veri korundu');
      }
    }
    
    console.log(`📊 Toplam ${mockDb.cards.length} kart kaydedildi`);
  } catch (error: any) {
    console.error('💥 Veri kaydetme hatası:', error);
    
    // Aggressive cleanup and retry
    try {
      console.log('🧹 Agresif temizlik başlatılıyor...');
      
      // Clear all temporary data
      localStorage.removeItem('create-card-draft');
      localStorage.removeItem('quick-card-draft');
      
      // Clear other apps' data if exists
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('testdeck-')) {
          keysToRemove.push(key);
        }
      }
      
      if (keysToRemove.length > 0) {
        console.log(`🗑️ ${keysToRemove.length} diğer key temizleniyor...`);
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      // Try to save just the essential data
      const essentialData = {
        cards: mockDb.cards,
        lastSaved: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem('testdeck-data', JSON.stringify(essentialData));
      console.log('✅ Temel veriler kaydedildi');
      
    } catch (retryError) {
      console.error('💥 Retry save failed:', retryError);
      alert('⚠️ Veri kaydedilemedi! Tarayıcı depolama alanı dolu.\n\n📥 Öneriler:\n• Verileri dışa aktarın\n• Tarayıcı önbelleğini temizleyin\n• Eski kartları silin');
    }
  }
}

// Clean up large data
function cleanupLargeData() {
  try {
    // Keep only last 30 days of sessions
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const oldSessionCount = mockDb.sessions.length;
    mockDb.sessions = mockDb.sessions.filter(session => 
      new Date(session.started_at).getTime() > thirtyDaysAgo
    );
    
    // Keep only last 30 days of attempts
    const oldAttemptCount = mockDb.attempts.length;
    mockDb.attempts = mockDb.attempts.filter(attempt => 
      new Date(attempt.attempted_at).getTime() > thirtyDaysAgo
    );
    
    console.log(`🧹 Temizlik: ${oldSessionCount - mockDb.sessions.length} eski session, ${oldAttemptCount - mockDb.attempts.length} eski attempt silindi`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Export data with Tauri API
export async function exportUserData() {
  try {
    console.log('🚀 [Tauri] Export başlatılıyor...');
    
    loadMockData();
    
    if (!mockDb.cards || mockDb.cards.length === 0) {
      alert('⚠️ Export edilecek kart bulunamadı! Önce birkaç kart oluşturun.');
      return;
    }

    const exportData = {
      ...mockDb,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    
    const defaultFileName = `testdeck-backup-${new Date().toISOString().split('T')[0]}.json`;

    // Open native save dialog
    const filePath = await save({
      defaultPath: defaultFileName,
      filters: [{
        name: 'JSON Backup',
        extensions: ['json']
      }]
    });

    if (filePath) {
      await writeTextFile(filePath, jsonString);
      console.log(`✅ [Tauri] Veri başarıyla şuraya kaydedildi: ${filePath}`);
      alert(`✅ Veri başarıyla kaydedildi!\n\n📁 Dosya: ${filePath}`);
    } else {
      console.log('ℹ️ [Tauri] Kullanıcı dosya kaydetme işlemini iptal etti.');
    }
    
  } catch (error) {
    console.error('💥 [Tauri] Export hatası:', error);
    alert('❌ Veri dışa aktarılamadı: ' + error);
  }
}

// Import data from backup
export async function importUserData(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const importData = JSON.parse(text);
    
    // Validate import data
    if (!importData.cards || !Array.isArray(importData.cards)) {
      throw new Error('Invalid backup file format');
    }
    
    // Validate cards
    const validCards = importData.cards.filter(validateCard);
    
    if (validCards.length === 0) {
      throw new Error('No valid cards found in backup');
    }
    
    // Merge with existing data
    const existingIds = new Set(mockDb.cards.map((card: any) => card.id));
    const newCards = validCards.filter((card: any) => !existingIds.has(card.id));
    
    mockDb.cards = [...mockDb.cards, ...newCards];
    
    // Merge other data safely
    if (importData.sessions && Array.isArray(importData.sessions)) {
      mockDb.sessions = [...mockDb.sessions, ...importData.sessions];
    }
    
    if (importData.attempts && Array.isArray(importData.attempts)) {
      mockDb.attempts = [...mockDb.attempts, ...importData.attempts];
    }
    
    if (importData.stats && Array.isArray(importData.stats)) {
      mockDb.stats = [...mockDb.stats, ...importData.stats];
    }
    
    saveMockData();
    
    console.log(`Imported ${newCards.length} new cards`);
    return true;
  } catch (error: any) {
    console.error('Import error:', error);
    alert('Veri içe aktarılamadı: ' + (error?.message || 'Bilinmeyen hata'));
    return false;
  }
}

// Auto-save mechanism
let autoSaveTimer: any = null;
const AUTO_SAVE_DELAY = 2000; // 2 saniye

function scheduleAutoSave() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  
  autoSaveTimer = setTimeout(() => {
    saveMockData();
  }, AUTO_SAVE_DELAY);
}

export async function initDatabase(): Promise<any> {
  try {
    console.log('🗄️ Veritabanı başlatılıyor...');
    
    // Try SQLite first
    const sqliteInitialized = await initSQLiteService();
    
    if (!sqliteInitialized) {
      // Fallback to localStorage
      console.log('📦 localStorage kullanılıyor...');
      loadMockData();
      
      // Setup periodic backup
      setInterval(() => {
        saveMockData();
      }, BACKUP_INTERVAL);
      
      console.log(`✅ localStorage veritabanı başlatıldı - ${mockDb.cards.length} kart yüklendi`);
      return mockDb;
    }
    
    console.log('✅ SQLite veritabanı başarıyla başlatıldı');
    return { type: 'sqlite' };
  } catch (error) {
    console.error('❌ Veritabanı başlatma hatası:', error);
    throw error;
  }
}

export function getDatabase(): any {
  return mockDb;
}

// Enhanced Card CRUD operations
export async function createCard(card: Omit<any, 'id' | 'created_at' | 'updated_at'>) {
  try {
    if (useSQLite && sqliteService) {
      return await sqliteService.createCard(card);
    }
    
    // Validate input
    if (!validateCard(card)) {
      throw new Error('Invalid card data');
    }
    
    const newCard = {
      ...card,
      id: Date.now() + Math.random(), // More unique ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockDb.cards.push(newCard);
    scheduleAutoSave();
    
    console.log('Card created:', newCard.id);
    return newCard.id;
  } catch (error) {
    console.error('Create card error:', error);
    throw error;
  }
}

export async function createMultipleCards(cards: Omit<any, 'id' | 'created_at' | 'updated_at'>[]): Promise<number[]> {
  try {
    const newCards = cards
      .filter(validateCard)
      .map(card => ({
        ...card,
        id: Date.now() + Math.random(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    
    mockDb.cards.push(...newCards);
    scheduleAutoSave();
    
    console.log(`Created ${newCards.length} cards in batch`);
    return newCards.map(card => card.id);
  } catch (error) {
    console.error('Batch create error:', error);
    throw error;
  }
}

export async function getAllCards() {
  if (useSQLite && sqliteService) {
    return await sqliteService.getAllCards();
  }
  
  loadMockData(); // Ensure fresh data
  return mockDb.cards.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getCardsBySubject(subject: string) {
  loadMockData();
  return mockDb.cards
    .filter(card => card.subject === subject)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateCard(id: number, updates: Partial<any>) {
  try {
    loadMockData();
    const index = mockDb.cards.findIndex(card => card.id === id);
    if (index !== -1) {
      mockDb.cards[index] = {
        ...mockDb.cards[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      scheduleAutoSave();
      console.log('Card updated:', id);
    }
    return true;
  } catch (error) {
    console.error('Update card error:', error);
    throw error;
  }
}

export async function deleteCard(id: number) {
  try {
    loadMockData();
    const initialLength = mockDb.cards.length;
    mockDb.cards = mockDb.cards.filter(card => card.id !== id);
    
    if (mockDb.cards.length < initialLength) {
      scheduleAutoSave();
      console.log('Card deleted:', id);
    }
    
    return true;
  } catch (error) {
    console.error('Delete card error:', error);
    throw error;
  }
}

// Session işlemleri
export async function createSession(session: Omit<any, 'id'>) {
  try {
    const newSession = {
      ...session,
      id: Date.now() + Math.random()
    };
    
    mockDb.sessions.push(newSession);
    scheduleAutoSave();
    
    return newSession.id;
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  }
}

export async function endSession(sessionId: number, correctAnswers: number) {
  try {
    const index = mockDb.sessions.findIndex(session => session.id === sessionId);
    if (index !== -1) {
      mockDb.sessions[index] = {
        ...mockDb.sessions[index],
        ended_at: new Date().toISOString(),
        correct_answers: correctAnswers
      };
      scheduleAutoSave();
    }
    return true;
  } catch (error) {
    console.error('End session error:', error);
    throw error;
  }
}

export async function recordAttempt(attempt: Omit<any, 'id' | 'attempted_at'>) {
  try {
    const newAttempt = {
      ...attempt,
      id: Date.now() + Math.random(),
      attempted_at: new Date().toISOString()
    };
    
    mockDb.attempts.push(newAttempt);
    
    // Card stats güncelle
    await updateCardStats(attempt.card_id, attempt.is_correct);
    
    scheduleAutoSave();
    return newAttempt.id;
  } catch (error: any) {
    console.error('Record attempt error:', error);
    throw error;
  }
}

// Enhanced SM-2 implementation
export async function updateCardStats(cardId: number, isCorrect: boolean) {
  try {
    loadMockData();
    
    let stat = mockDb.stats.find(s => s.card_id === cardId);
    
    if (!stat) {
      stat = {
        id: Date.now() + Math.random(),
        card_id: cardId,
        total_attempts: 0,
        correct_attempts: 0,
        last_attempt: null,
        next_review: new Date().toISOString(),
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0
      };
      mockDb.stats.push(stat);
    }
    
    stat.total_attempts += 1;
    if (isCorrect) {
      stat.correct_attempts += 1;
      stat.repetitions += 1;
      
      // Enhanced SM-2 algorithm
      if (stat.repetitions === 1) {
        stat.interval_days = 1;
      } else if (stat.repetitions === 2) {
        stat.interval_days = 6;
      } else {
        stat.interval_days = Math.round(stat.interval_days * stat.ease_factor);
      }
      
      stat.ease_factor = Math.max(1.3, stat.ease_factor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)));
    } else {
      stat.repetitions = 0;
      stat.interval_days = 1;
      stat.ease_factor = Math.max(1.3, stat.ease_factor - 0.2);
    }
    
    stat.last_attempt = new Date().toISOString();
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + stat.interval_days);
    stat.next_review = nextReview.toISOString();
    
    scheduleAutoSave();
  } catch (error) {
    console.error('Update card stats error:', error);
    throw error;
  }
}

// Enhanced statistics
export async function getSubjectStats() {
  try {
    loadMockData();
    console.log('📊 getSubjectStats çağrıldı. Mock data:', {
      cards: mockDb.cards.length,
      sessions: mockDb.sessions.length,
      attempts: mockDb.attempts.length,
      stats: mockDb.stats.length
    });
    
    const subjects: { [key: string]: any } = {};
    
    mockDb.cards.forEach(card => {
      if (!subjects[card.subject]) {
        subjects[card.subject] = {
          name: card.subject,
          total_cards: 0,
          accuracy: 0,
          last_studied: null,
          total_attempts: 0,
          correct_attempts: 0
        };
      }
      subjects[card.subject].total_cards += 1;
    });
    
    // Calculate accuracy from attempts table (primary source)
    mockDb.attempts.forEach(attempt => {
      const card = mockDb.cards.find(c => c.id === attempt.card_id);
      if (card && subjects[card.subject]) {
        subjects[card.subject].total_attempts += 1;
        if (attempt.is_correct) {
          subjects[card.subject].correct_attempts += 1;
        }
        
        if (!subjects[card.subject].last_studied || 
            new Date(attempt.attempted_at) > new Date(subjects[card.subject].last_studied)) {
          subjects[card.subject].last_studied = attempt.attempted_at;
        }
      }
    });

    // Also check stats table as fallback (for older data)
    mockDb.stats.forEach(stat => {
      const card = mockDb.cards.find(c => c.id === stat.card_id);
      if (card && subjects[card.subject] && stat.total_attempts > 0) {
        // Only use if no attempts data exists for this subject
        if (subjects[card.subject].total_attempts === 0) {
          subjects[card.subject].total_attempts += stat.total_attempts;
          subjects[card.subject].correct_attempts += stat.correct_attempts;
          
          if (!subjects[card.subject].last_studied || 
              new Date(stat.last_attempt) > new Date(subjects[card.subject].last_studied)) {
            subjects[card.subject].last_studied = stat.last_attempt;
          }
        }
      }
    });
    
    // Calculate final accuracy with safe math
    Object.values(subjects).forEach((subject: any) => {
      // Use safe percentage calculation to prevent NaN
      subject.accuracy = safePercentage(
        subject.correct_attempts, 
        subject.total_attempts, 
        0
      );
    });
    
    return Object.values(subjects);
  } catch (error) {
    console.error('Get subject stats error:', error);
    return [];
  }
}

export async function getDailyStats(days: number = 30) {
  try {
    loadMockData();
    
    const stats: { [key: string]: any } = {};
    const today = new Date();
    
    // Initialize empty stats for last X days
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      stats[dateStr] = {
        date: dateStr,
        questions_answered: 0,
        correct_answers: 0,
        accuracy: 0,
        study_time: 0,
        cards_created: 0
      };
    }
    
    // Add attempt data
    mockDb.attempts.forEach(attempt => {
      const dateStr = attempt.attempted_at.split('T')[0];
      if (stats[dateStr]) {
        stats[dateStr].questions_answered += 1;
        if (attempt.is_correct) {
          stats[dateStr].correct_answers += 1;
        }
        stats[dateStr].study_time += (attempt.time_spent || 30) / 60; // minutes
      }
    });
    
    // Add card creation data
    mockDb.cards.forEach(card => {
      const dateStr = card.created_at.split('T')[0];
      if (stats[dateStr]) {
        stats[dateStr].cards_created += 1;
      }
    });
    
    // Calculate accuracy with safe math
    Object.values(stats).forEach((stat: any) => {
      // Use safe percentage calculation to prevent NaN
      stat.accuracy = safePercentage(
        stat.correct_answers, 
        stat.questions_answered, 
        0
      );
      
      // Safe study time rounding
      const studyTime = Number(stat.study_time) || 0;
      stat.study_time = studyTime > 0 ? safeRound(studyTime, 1) : 0;
    });
    
    return Object.values(stats)
      .filter((stat: any) => {
        const statDate = new Date(stat.date);
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - days);
        return statDate >= cutoff;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Get daily stats error:', error);
    return [];
  }
}

// Data integrity check
export function checkDataIntegrity(): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  try {
    loadMockData();
    
    // Check cards
    const validCards = mockDb.cards.filter(validateCard);
    if (validCards.length !== mockDb.cards.length) {
      issues.push(`${mockDb.cards.length - validCards.length} invalid cards found`);
    }
    
    // Check for orphaned stats
    const cardIds = new Set(mockDb.cards.map(card => card.id));
    const orphanedStats = mockDb.stats.filter(stat => !cardIds.has(stat.card_id));
    if (orphanedStats.length > 0) {
      issues.push(`${orphanedStats.length} orphaned stats found`);
    }
    
    // Check for orphaned attempts
    const orphanedAttempts = mockDb.attempts.filter(attempt => !cardIds.has(attempt.card_id));
    if (orphanedAttempts.length > 0) {
      issues.push(`${orphanedAttempts.length} orphaned attempts found`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  } catch (error) {
    return {
      isValid: false,
      issues: ['Data integrity check failed: ' + (error as any)?.message || 'Bilinmeyen hata']
    };
  }
}

// Clean up orphaned data
export function cleanupDatabase(): number {
  try {
    loadMockData();
    
    const cardIds = new Set(mockDb.cards.map(card => card.id));
    const initialStatsLength = mockDb.stats.length;
    const initialAttemptsLength = mockDb.attempts.length;
    
    // Remove orphaned stats
    mockDb.stats = mockDb.stats.filter(stat => cardIds.has(stat.card_id));
    
    // Remove orphaned attempts
    mockDb.attempts = mockDb.attempts.filter(attempt => cardIds.has(attempt.card_id));
    
    const cleaned = (initialStatsLength - mockDb.stats.length) + (initialAttemptsLength - mockDb.attempts.length);
    
    if (cleaned > 0) {
      saveMockData();
      console.log(`Cleaned up ${cleaned} orphaned records`);
    }
    
    return cleaned;
  } catch (error) {
    console.error('Cleanup error:', error);
    return 0;
  }
}