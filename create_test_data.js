// Mock test data generator
console.log('🧪 Test verileri oluşturuluyor...');

const testData = {
  cards: [
    {
      id: 1,
      question: "React nedir?",
      option_a: "Bir JavaScript kütüphanesi",
      option_b: "Bir veritabanı",
      option_c: "Bir işletim sistemi",
      option_d: "Bir web sunucusu",
      option_e: "Bir programlama dili",
      correct_answer: "A",
      subject: "Web Geliştirme",
      difficulty: 2,
      created_at: new Date().toISOString(),
      image_path: null
    }
  ],
  sessions: [
    {
      id: 1,
      started_at: new Date(Date.now() - 3600000).toISOString(), // 1 saat önce
      ended_at: new Date().toISOString(),
      total_questions: 1,
      correct_answers: 1,
      session_type: "practice"
    }
  ],
  attempts: [
    {
      id: 1,
      card_id: 1,
      session_id: 1,
      user_answer: "A",
      is_correct: true,
      attempted_at: new Date().toISOString(),
      time_spent: 30
    }
  ],
  stats: [
    {
      id: 1,
      card_id: 1,
      total_attempts: 1,
      correct_attempts: 1,
      last_attempt: new Date().toISOString(),
      next_review: new Date(Date.now() + 86400000).toISOString(), // 1 gün sonra
      ease_factor: 2.5,
      interval_days: 1,
      repetitions: 1
    }
  ],
  lastSaved: new Date().toISOString(),
  version: '1.0'
};

localStorage.setItem('testdeck-data', JSON.stringify(testData));
console.log('✅ Test verileri localStorage\'a kaydedildi');
console.log('🔄 Sayfayı yenileyin ve istatistikleri kontrol edin');
