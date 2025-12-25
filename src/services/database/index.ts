// Re-export types from central location
export * from '../../types/database';

// Re-export database functions from existing location (temporary)
export {
  initDatabase,
  getDatabase,
  createCard,
  createMultipleCards,
  getAllCards,
  getCardsBySubject,
  updateCard,
  deleteCard,
  deleteAllCards,
  createSession,
  endSession,
  recordAttempt,
  updateCardStats,
  getSubjectStats,
  getDailyStats,
  exportUserData,
  importUserData,
  checkDataIntegrity,
  cleanupDatabase,
} from '../../database/database';
