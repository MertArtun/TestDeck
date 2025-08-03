import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Card } from '../types/database';
import { getAllCards, getCardsBySubject, createSession, endSession, recordAttempt, updateCard, getDatabase } from '../database/database';
import { safePercentage } from '../utils/safeMath';
import { Play, ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw, BarChart3, AlertCircle } from 'lucide-react';

type StudyMode = 'setup' | 'studying' | 'results';

const Study = () => {
  const navigate = useNavigate();
  const {
    cards,
    setCards,
    currentSession,
    sessionCards,
    currentQuestionIndex,
    userAnswers,
    startSession,
    answerQuestion,
    nextQuestion,
    endSession: endCurrentSession,
    setLoading,
    updateCard: updateStoreCard
  } = useAppStore();

  const [mode, setMode] = useState<StudyMode>('setup');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sessionType, setSessionType] = useState<'practice' | 'test'>('practice');
  const [questionCount, setQuestionCount] = useState(10);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [subjects, setSubjects] = useState<string[]>([]);
  const [localSessionCards, setLocalSessionCards] = useState<Card[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([]);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    // Konuları çıkar
    const uniqueSubjects = [...new Set(cards.map(card => card.subject))];
    setSubjects(uniqueSubjects);
  }, [cards]);

  // Sync global session cards with local state
  useEffect(() => {
    setLocalSessionCards(sessionCards);
  }, [sessionCards]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const cardsData = await getAllCards();
      console.log('🃏 Kartlar yüklendi:', cardsData);
      const imageCards = cardsData.filter(c => c.image_path && c.image_path.trim());
      console.log(`🖼️ ${imageCards.length} adet görselli kart bulundu.`, imageCards);
      setCards(cardsData);
    } catch (error) {
      console.error('Kartları yüklerken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudy = async () => {
    try {
      setLoading(true);
      
      let selectedCards = cards;
      
      if (selectedSubject !== 'all') {
        selectedCards = await getCardsBySubject(selectedSubject);
      }

      // Zorluğa göre filtrele
      if (selectedDifficulties.length > 0) {
        selectedCards = selectedCards.filter(card => selectedDifficulties.includes(card.difficulty));
      }

      if (selectedCards.length === 0) {
        alert('Seçilen kriterlere uygun kart bulunamadı!');
        setLoading(false);
        return;
      }

      // Kartları karıştır (Fisher-Yates shuffle)
      const shuffledCards = [...selectedCards];
      for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
      }

      let studyCards = [...shuffledCards];

      // Eğer istenen soru sayısı mevcut kartlardan fazlaysa, rastgele kartları tekrarla
      if (questionCount > shuffledCards.length) {
        console.log(`📚 TEKRAR MODU: İstenen ${questionCount} soru > Mevcut ${shuffledCards.length} kart`);
        
        const remainingQuestions = questionCount - shuffledCards.length;
        
        // Rastgele kartları seçip tekrarla
        for (let i = 0; i < remainingQuestions; i++) {
          const randomIndex = Math.floor(Math.random() * shuffledCards.length);
          const randomCard = { ...shuffledCards[randomIndex] };
          // Her tekrarlanan karta özgün bir ID vererek karışıklığı önle
          randomCard.id = randomCard.id + (i + 1) * 10000; // Geçici ID
          studyCards.push(randomCard);
        }
        
        console.log(`✅ SONUÇ: ${shuffledCards.length} farklı kart + ${remainingQuestions} rastgele tekrar = ${studyCards.length} toplam`);
      } else if (questionCount === shuffledCards.length) {
        // Tam eşitlik: Tüm kartlar bir kez
        studyCards = shuffledCards;
        console.log(`🎯 MÜKEMMEL EŞLEME: ${questionCount} soru = ${shuffledCards.length} kart (hiç tekrar yok)`);
      } else {
        // Normal durum: istenen sayıya kısıtla
        studyCards = shuffledCards.slice(0, questionCount);
        console.log(`📝 NORMAL MOD: ${questionCount} farklı soru seçildi (${shuffledCards.length} karttan)`);
      }

      console.log('🔀 Final kartlar:', {
        totalCards: studyCards.length,
        uniqueCards: shuffledCards.length,
        requestedCount: questionCount
      });

      // Session başlat
      startSession(studyCards, sessionType);
      setStartTime(new Date());
      setQuestionStartTime(new Date());
      setMode('studying');

    } catch (error) {
      console.error('Çalışma başlatma hatası:', error);
      alert('Çalışma başlatılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: 'A' | 'B' | 'C' | 'D' | 'E' | string) => {
    if (!sessionCards[currentQuestionIndex]) return;

    const currentCard = sessionCards[currentQuestionIndex];
    answerQuestion(currentCard.id, answer);
    
    // Sonraki soruya geç veya bitir
    setTimeout(() => {
      if (currentQuestionIndex < sessionCards.length - 1) {
        nextQuestion();
        setQuestionStartTime(new Date());
      } else {
        handleEndSession();
      }
    }, 2500); // Kullanıcının cevabı ve zorluk seçeneklerini görmesi için bekleme süresi artırıldı (1s -> 2.5s)
  };

  const handleEndSession = async () => {
    try {
      if (!currentSession) {
        return;
      }

      setLoading(true);

      // Session'ı veritabanında oluştur
      const sessionId = await createSession({
        started_at: startTime.toISOString(),
        total_questions: sessionCards.length,
        session_type: sessionType
      });
      
      if (!sessionId) {
        return;
      }

      // Cevapları kaydet
      let correctCount = 0;
      
      for (const card of sessionCards) {
        const userAnswer = userAnswers[card.id];
        
        // Soru tipine göre doğru cevap kontrolü
        let isCorrect = false;
        if (card.question_type === 'fill_in_blank' && card.blank_answer) {
          // Boşluk doldurma için blank_answer ile karşılaştır
          const correctAnswers = card.blank_answer.toLowerCase().split(',').map(a => a.trim());
          const userAnswerLower = (userAnswer || '').toString().toLowerCase().trim();
          isCorrect = correctAnswers.includes(userAnswerLower);
          
          console.log('🔍 Boşluk doldurma cevap kontrolü:', {
            cardId: card.id,
            userAnswer: userAnswerLower,
            correctAnswers,
            isCorrect
          });
        } else {
          // Çoktan seçmeli için normal karşılaştırma
          isCorrect = userAnswer === card.correct_answer;
          
          console.log('🔍 Çoktan seçmeli cevap kontrolü:', {
            cardId: card.id,
            userAnswer,
            correctAnswer: card.correct_answer,
            isCorrect
          });
        }
        
        if (isCorrect) correctCount++;
        
        try {
          await recordAttempt({
            card_id: card.id,
            session_id: sessionId,
            user_answer: userAnswer,
            is_correct: isCorrect,
            time_spent: 30 // Ortalama süre, gerçek uygulamada hesaplanacak
          });
        } catch (error) {
          console.error('❌ Attempt kaydetme hatası:', error, { cardId: card.id });
        }
      }

      // Session'ı sonlandır
      await endSession(sessionId, correctCount);
      
      setMode('results');

    } catch (error) {
      console.error('Session sonlandırma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDifficulty = async (cardId: number, difficulty: number) => {
    try {
      // 1. Update local state for immediate UI feedback
      setLocalSessionCards(prev => 
        prev.map(card => 
          card.id === cardId ? { ...card, difficulty } : card
        )
      );

      // 2. Update global state (Zustand)
      const cardToUpdate = cards.find(c => c.id === cardId);
      if (cardToUpdate) {
        updateStoreCard({ ...cardToUpdate, difficulty });
      }

      // 3. Persist change in the database
      await updateCard(cardId, { difficulty });

      console.log(`✅ Kart ID ${cardId} zorluğu ${difficulty} olarak güncellendi.`);
    } catch (error) {
      console.error('Zorluk güncellenirken hata:', error);
    }
  };

  const handleRetryIncorrect = () => {
    const incorrectCards = localSessionCards.filter(card => {
      const userAnswer = userAnswers[card.id];
      if (userAnswer === undefined) return false;

      if (card.question_type === 'fill_in_blank' && card.blank_answer) {
        const correctAnswers = card.blank_answer.toLowerCase().split(',').map(a => a.trim());
        const userAnswerLower = (userAnswer || '').toString().toLowerCase().trim();
        return !correctAnswers.includes(userAnswerLower);
      } else {
        return userAnswer !== card.correct_answer;
      }
    });

    if (incorrectCards.length > 0) {
      console.log(`🔄 Yanlış bilinen ${incorrectCards.length} kart ile yeni oturum başlatılıyor...`);
      // Mevcut oturum bilgilerini temizlemeden doğrudan yeni oturumu başlat
      endCurrentSession(); // Önceki oturum state'ini temizle
      startSession(incorrectCards, 'practice'); // Yeni oturumu başlat
      setStartTime(new Date());
      setQuestionStartTime(new Date());
      setMode('studying');
    }
  };

  const restartStudy = () => {
    // Store'u temizle
    endCurrentSession();
    setMode('setup');
    setQuestionCount(10);
    setSelectedSubject('all');
  };

  const currentCard = localSessionCards[currentQuestionIndex];
  const progress = safePercentage(currentQuestionIndex + 1, localSessionCards.length);
  const userAnswer = currentCard ? userAnswers[currentCard.id] : null;
  const isAnswered = userAnswer !== undefined;

  // Setup Mode
  if (mode === 'setup') {
    return (
      <div 
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem'
        }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center">
          <button
            onClick={() => {
              endCurrentSession();
              navigate(-1);
            }}
            className="mr-4 p-3 hover:bg-white/20 rounded-xl transition-all duration-200"
            style={{ color: 'white' }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Çalışma Oturumu</h1>
            <p className="text-white/80 text-lg">Çalışma parametrelerinizi seçin</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Konu Seçimi */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              📚 Hangi Konuyu Çalışacaksın?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedSubject('all')}
                className="p-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
                style={{
                  background: selectedSubject === 'all'
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(255, 255, 255, 0.2)',
                  border: selectedSubject === 'all'
                    ? '3px solid #3b82f6'
                    : '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: selectedSubject === 'all' 
                    ? '0 20px 40px rgba(59, 130, 246, 0.3)'
                    : '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <div className={`text-lg font-bold mb-2 ${
                    selectedSubject === 'all' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Karışık Çalış
                  </div>
                  <div className={`text-sm ${
                    selectedSubject === 'all' ? 'text-gray-600' : 'text-white/80'
                  }`}>
                    Tüm konular • {cards.length} kart
                  </div>
                  {selectedSubject === 'all' && (
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                        ✨ Seçili
                      </span>
                    </div>
                  )}
                </div>
              </button>
              
              {subjects.map((subject, index) => {
                const subjectEmojis = ['📐', '🧪', '📖', '🌍', '🎨', '💼', '⚖️', '🔬', '💻', '🏛️'];
                const emoji = subjectEmojis[index % subjectEmojis.length];
                const subjectCards = cards.filter(card => card.subject === subject);
                
                return (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className="p-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
                    style={{
                      background: selectedSubject === subject
                        ? 'rgba(255, 255, 255, 0.9)'
                        : 'rgba(255, 255, 255, 0.2)',
                      border: selectedSubject === subject
                        ? '3px solid #10b981'
                        : '2px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: selectedSubject === subject 
                        ? '0 20px 40px rgba(16, 185, 129, 0.3)'
                        : '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3">{emoji}</div>
                      <div className={`text-lg font-bold mb-2 ${
                        selectedSubject === subject ? 'text-gray-800' : 'text-white'
                      }`}>
                        {subject}
                      </div>
                      <div className={`text-sm ${
                        selectedSubject === subject ? 'text-gray-600' : 'text-white/80'
                      }`}>
                        {subjectCards.length} kart mevcut
                      </div>
                      {selectedSubject === subject && (
                        <div className="mt-3">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                            ✨ Seçili
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {subjects.length === 0 && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📖</div>
                <p className="text-white/80 text-lg mb-4">Henüz konu yok, hemen oluşturun!</p>
                <button
                  onClick={() => navigate('/create')}
                  className="px-6 py-3 rounded-2xl font-bold text-gray-800 transition-all duration-300 transform hover:scale-105"
                  style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                >
                  🎯 İlk Kartını Oluştur
                </button>
              </div>
            )}
          </div>

          {/* Zorluk Seviyesi */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">Zorluk Seviyesi</h3>
            <div className="flex gap-4">
              {[
                { label: 'Tümü', value: [], color: 'from-blue-500 to-blue-600' },
                { label: 'Kolay', value: [1], color: 'from-green-500 to-green-600' },
                { label: 'Orta', value: [2], color: 'from-yellow-500 to-orange-500' },
                { label: 'Zor', value: [3], color: 'from-red-500 to-red-600' }
              ].map(({ label, value, color }) => {
                const isSelected = JSON.stringify(selectedDifficulties.sort()) === JSON.stringify(value.sort());
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedDifficulties(value)}
                    className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
                      isSelected ? 'ring-4 ring-white/50' : ''
                    }`}
                    style={{
                      background: isSelected 
                        ? `linear-gradient(135deg, var(--tw-gradient-stops))` 
                        : 'rgba(255, 255, 255, 0.2)',
                      backgroundImage: isSelected ? `linear-gradient(135deg, ${color.includes('blue') ? '#3b82f6, #2563eb' : color.includes('green') ? '#10b981, #059669' : color.includes('yellow') ? '#f59e0b, #ea580c' : '#ef4444, #dc2626'})` : undefined
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Soru Sayısı */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">Soru Sayısı</h3>
            <div className="flex items-center gap-6">
              <input
                type="range"
                min="5"
                max={(() => {
                  let availableCards = cards;
                  if (selectedSubject !== 'all') {
                    availableCards = availableCards.filter(card => card.subject === selectedSubject);
                  }
                  if (selectedDifficulties.length > 0) {
                    availableCards = availableCards.filter(card => selectedDifficulties.includes(card.difficulty));
                  }
                  return availableCards.length > 0 ? Math.max(50, availableCards.length) : 50;
                })()}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="flex-1 h-3 bg-white/30 rounded-full appearance-none cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  height: '12px',
                  borderRadius: '6px'
                }}
              />
              <div 
                className="text-3xl font-bold text-white px-6 py-3 rounded-2xl min-w-[80px] text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {questionCount}
              </div>
            </div>
            
            {(() => {
              let availableCards = cards;
              if (selectedSubject !== 'all') {
                availableCards = availableCards.filter(card => card.subject === selectedSubject);
              }
              if (selectedDifficulties.length > 0) {
                availableCards = availableCards.filter(card => selectedDifficulties.includes(card.difficulty));
              }
              const availableCardCount = availableCards.length;
              
              if (availableCardCount === 0) {
                return (
                  <div 
                    className="mt-4 p-4 rounded-2xl text-white font-medium flex items-center gap-3"
                    style={{ background: 'rgba(239, 68, 68, 0.3)', border: '1px solid rgba(239, 68, 68, 0.5)' }}
                  >
                    <AlertCircle className="w-5 h-5" />
                    Bu kriterlere uygun hiç kart bulunamadı.
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Çalışma Tipi */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h3 className="text-xl font-semibold text-white mb-6">Çalışma Tipi</h3>
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setSessionType('practice')}
                className={`p-8 rounded-3xl transition-all duration-200 transform hover:scale-105 ${
                  sessionType === 'practice' ? 'ring-4 ring-white/50' : ''
                }`}
                style={{
                  background: sessionType === 'practice' 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      background: sessionType === 'practice' 
                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                        : 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <RotateCcw className={`w-8 h-8 ${sessionType === 'practice' ? 'text-white' : 'text-white/80'}`} />
                  </div>
                  <div className={`text-xl font-bold mb-2 ${sessionType === 'practice' ? 'text-gray-800' : 'text-white'}`}>
                    Pratik
                  </div>
                  <div className={`text-sm ${sessionType === 'practice' ? 'text-gray-600' : 'text-white/80'}`}>
                    Spaced repetition ile öğren
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSessionType('test')}
                className={`p-8 rounded-3xl transition-all duration-200 transform hover:scale-105 ${
                  sessionType === 'test' ? 'ring-4 ring-white/50' : ''
                }`}
                style={{
                  background: sessionType === 'test' 
                    ? 'rgba(255, 255, 255, 0.9)' 
                    : 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      background: sessionType === 'test' 
                        ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' 
                        : 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <Clock className={`w-8 h-8 ${sessionType === 'test' ? 'text-white' : 'text-white/80'}`} />
                  </div>
                  <div className={`text-xl font-bold mb-2 ${sessionType === 'test' ? 'text-gray-800' : 'text-white'}`}>
                    Test
                  </div>
                  <div className={`text-sm ${sessionType === 'test' ? 'text-gray-600' : 'text-white/80'}`}>
                    Hızlı çözüm
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Başlat Butonu */}
          <div className="flex justify-center pt-8">
            <button
              onClick={handleStartStudy}
              disabled={cards.length === 0}
              className="px-16 py-6 rounded-3xl font-black text-2xl text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 shadow-2xl"
              style={{
                background: cards.length > 0 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                  : 'rgba(255, 255, 255, 0.3)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: cards.length > 0 ? '0 25px 50px rgba(103, 126, 234, 0.4)' : 'none'
              }}
            >
              {cards.length > 0 ? (
                <>
                  <Play className="w-8 h-8" />
                  🚀 Hadi Başlayalım!
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8" />
                  ⚠️ Kart Yok
                </>
              )}
            </button>
          </div>
          
          {cards.length > 0 && (
            <div className="text-center mt-6 text-white/80 text-lg">
              <span className="font-bold">
                {(() => {
                  let availableCards = cards;
                  if (selectedSubject !== 'all') {
                    availableCards = availableCards.filter(card => card.subject === selectedSubject);
                  }
                  if (selectedDifficulties.length > 0) {
                    availableCards = availableCards.filter(card => selectedDifficulties.includes(card.difficulty));
                  }
                  return Math.min(questionCount, availableCards.length);
                })()}
              </span> kart ile çalışmaya hazırsın! 🎯
            </div>
          )}

          {cards.length === 0 && (
            <div 
              className="text-center p-6 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <p className="text-white/90 text-lg">
                Çalışmaya başlamak için önce kart oluşturmalısınız.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Studying Mode
  if (mode === 'studying' && currentCard) {
    return (
      <div 
        className="min-h-screen p-8"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Header with back button and progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                endCurrentSession();
                setMode('setup');
              }}
              className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Çıkış</span>
            </button>
            
            <div className="text-white/90 text-sm font-medium">
              {sessionType === 'practice' ? '🎯 Pratik Modu' : '⚡ Test Modu'}
            </div>
          </div>

          {/* Modern Progress Bar */}
          <div 
            className="p-6 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/90 font-medium">
                Soru {currentQuestionIndex + 1} / {localSessionCards.length}
              </span>
              <span className="text-white/90 font-medium">
                %{Math.round(progress)} tamamlandı
              </span>
            </div>
            
            <div 
              className="w-full rounded-full h-3"
              style={{ background: 'rgba(255, 255, 255, 0.2)' }}
            >
              <div
                className="h-3 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #10b981, #059669)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div 
            className="p-8 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Subject and Difficulty Tags */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span 
                  className="px-4 py-2 rounded-2xl text-sm font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white'
                  }}
                >
                  📚 {currentCard.subject}
                </span>
                
                <span 
                  className="px-4 py-2 rounded-2xl text-sm font-semibold"
                  style={{
                    background: currentCard.difficulty === 1 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : currentCard.difficulty === 2 
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white'
                  }}
                >
                  {currentCard.difficulty === 1 ? '🟢 Kolay' : currentCard.difficulty === 2 ? '🟡 Orta' : '🔴 Zor'}
                </span>
              </div>

              <div 
                className="px-4 py-2 rounded-2xl text-sm font-medium"
                style={{
                  background: 'rgba(103, 126, 234, 0.1)',
                  color: '#667eea'
                }}
              >
                {currentCard.question_type === 'fill_in_blank' ? '✏️ Boşluk Doldurma' : '📋 Çoktan Seçmeli'}
              </div>
            </div>

            {/* Görsel varsa göster */}
            {currentCard.image_path && (
              <div className="mb-8">
                <div 
                  className="p-4 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }}
                >
                  <img
                    src={currentCard.image_path}
                    alt="Soru görseli"
                    className="max-w-full h-64 object-contain mx-auto rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Soru */}
            <div className="mb-10">
              <div 
                className="p-8 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                  border: '1px solid rgba(148, 163, 184, 0.2)'
                }}
              >
                {currentCard.question_type === 'fill_in_blank' ? (
                  <h2 
                    className="text-2xl font-bold text-gray-800 leading-relaxed text-center"
                    dangerouslySetInnerHTML={{
                      __html: currentCard.question.replace(/_____/g, 
                        isAnswered && userAnswer ? 
                          `<span style="background: ${userAnswer === currentCard.blank_answer ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'}; color: white; padding: 8px 16px; border-radius: 12px; font-weight: bold; display: inline-block; margin: 0 8px;">${userAnswer}</span>` :
                          '<span style="border-bottom: 3px solid #667eea; display: inline-block; min-width: 120px; height: 35px; margin: 0 8px; background: rgba(103, 126, 234, 0.1); border-radius: 8px;"></span>'
                      )
                    }}
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800 leading-relaxed text-center">
                    {currentCard.question}
                  </h2>
                )}
              </div>
            </div>

            {/* Çoktan seçmeli sorular */}
            <div className="space-y-4">
              {['A', 'B', 'C', 'D', 'E'].map((option) => {
                const optionValue = currentCard[`option_${option.toLowerCase()}` as keyof typeof currentCard];
                
                // Eğer seçenek boşsa gösterme
                if (!optionValue || (typeof optionValue === 'string' && !optionValue.trim())) {
                  return null;
                }
                
                const isSelected = userAnswer === option;
                const isCorrect = currentCard.correct_answer === option;
                
                let buttonStyle = {};
                let buttonClass = 'w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02]';
                
                if (!isAnswered) {
                  buttonStyle = {
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid rgba(148, 163, 184, 0.3)',
                    backdropFilter: 'blur(10px)'
                  };
                  buttonClass += ' hover:shadow-lg';
                } else {
                  if (isSelected && isCorrect) {
                    buttonStyle = {
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: '2px solid #059669',
                      color: 'white'
                    };
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = {
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: '2px solid #dc2626',
                      color: 'white'
                    };
                  } else if (isCorrect) {
                    buttonStyle = {
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: '2px solid #059669',
                      color: 'white'
                    };
                  } else {
                    buttonStyle = {
                      background: 'rgba(148, 163, 184, 0.2)',
                      border: '2px solid rgba(148, 163, 184, 0.3)',
                      color: '#64748b'
                    };
                  }
                }

                return (
                  <button
                    key={option}
                    onClick={() => !isAnswered && handleAnswer(option as any)}
                    disabled={isAnswered}
                    className={buttonClass}
                    style={buttonStyle}
                  >
                    <div className="flex items-center">
                      <div 
                        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-6"
                        style={{
                          background: !isAnswered || (isSelected && isCorrect) || (!isSelected && isCorrect) 
                            ? 'rgba(255, 255, 255, 0.3)' 
                            : isSelected && !isCorrect 
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(148, 163, 184, 0.3)',
                          color: !isAnswered ? '#667eea' : 'inherit'
                        }}
                      >
                        {option}
                      </div>
                      <span className="flex-1 text-lg font-medium leading-relaxed">{optionValue}</span>
                      {isAnswered && isSelected && (
                        <div className="ml-4">
                          {isCorrect ? (
                            <CheckCircle className="w-8 h-8 text-white" />
                          ) : (
                            <XCircle className="w-8 h-8 text-white" />
                          )}
                        </div>
                      )}
                      {isAnswered && !isSelected && isCorrect && (
                        <div className="ml-4">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div 
                className="mt-8 p-6 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  border: '1px solid rgba(148, 163, 184, 0.2)'
                }}
              >
                <div className="flex items-center justify-center">
                  {(() => {
                    // Soru tipine göre doğru cevap kontrolü
                    let isCorrect = false;
                    let correctAnswer = '';
                    
                    if (currentCard.question_type === 'fill_in_blank' && currentCard.blank_answer) {
                      const correctAnswers = currentCard.blank_answer.toLowerCase().split(',').map(a => a.trim());
                      const userAnswerLower = (userAnswer || '').toString().toLowerCase().trim();
                      isCorrect = correctAnswers.includes(userAnswerLower);
                      correctAnswer = currentCard.blank_answer;
                    } else {
                      isCorrect = userAnswer === currentCard.correct_answer;
                      correctAnswer = currentCard.correct_answer;
                    }
                    
                    return (
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-3">
                          {isCorrect ? (
                            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                          ) : (
                            <XCircle className="w-8 h-8 text-red-600 mr-3" />
                          )}
                          <span className="text-xl font-bold text-gray-800">
                            {isCorrect ? '🎉 Harika! Doğru cevap!' : '❌ Yanlış cevap'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <p className="text-gray-600 text-lg">
                            Doğru cevap: <span className="font-semibold text-green-600">{correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Zorluk güncelleme butonları */}
            {isAnswered && (
              <div className="mt-8 text-center">
                <h4 className="text-lg font-semibold text-gray-700 mb-6">Bu soru sizin için nasıldı?</h4>
                <div className="flex justify-center items-center gap-4">
                  {[
                    { label: '🟢 Kolay', value: 1, color: 'linear-gradient(135deg, #10b981, #059669)' },
                    { label: '🟡 Orta', value: 2, color: 'linear-gradient(135deg, #f59e0b, #d97706)' },
                    { label: '🔴 Zor', value: 3, color: 'linear-gradient(135deg, #ef4444, #dc2626)' }
                  ].map(({ label, value, color }) => (
                    <button
                      key={value}
                      onClick={() => handleUpdateDifficulty(currentCard.id, value)}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                        currentCard.difficulty === value
                          ? 'shadow-lg scale-105'
                          : 'hover:shadow-md'
                      }`}
                      style={{
                        background: currentCard.difficulty === value 
                          ? color 
                          : 'rgba(255, 255, 255, 0.8)',
                        border: currentCard.difficulty === value 
                          ? '2px solid rgba(255, 255, 255, 0.3)' 
                          : '2px solid rgba(148, 163, 184, 0.3)',
                        color: currentCard.difficulty === value ? 'white' : '#374151'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // Results Mode
  if (mode === 'results' && currentSession) {
    const correctAnswers = localSessionCards.reduce((count, card) => {
      const userAnswer = userAnswers[card.id];
      let isCorrect = false;
      
      if (card.question_type === 'fill_in_blank' && card.blank_answer) {
        const correctAnswers = card.blank_answer.toLowerCase().split(',').map(a => a.trim());
        const userAnswerLower = (userAnswer || '').toString().toLowerCase().trim();
        isCorrect = correctAnswers.includes(userAnswerLower);
      } else {
        isCorrect = userAnswer === card.correct_answer;
      }
      
      return isCorrect ? count + 1 : count;
    }, 0);
    
    const incorrectAnswers = localSessionCards.length - correctAnswers;
    const accuracy = safePercentage(correctAnswers, localSessionCards.length);
    const timeTaken = currentSession.ended_at ? 
      (new Date(currentSession.ended_at).getTime() - new Date(currentSession.started_at).getTime()) / 1000 : 0;

    return (
      <div 
        className="min-h-screen p-8"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div 
            className="text-center mb-12 p-8 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              🎉 Çalışma Tamamlandı!
            </h1>
            <p className="text-white/90 text-xl">
              Harika iş çıkardınız. İşte sonuçlarınız:
            </p>
          </div>

          {/* Sonuç kartları */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div 
              className="text-center p-8 rounded-3xl transition-all duration-300 transform hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {correctAnswers}
              </div>
              <div className="text-gray-600 font-medium">✅ Doğru Cevap</div>
            </div>

            <div 
              className="text-center p-8 rounded-3xl transition-all duration-300 transform hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {incorrectAnswers}
              </div>
              <div className="text-gray-600 font-medium">❌ Yanlış Cevap</div>
            </div>

            <div 
              className="text-center p-8 rounded-3xl transition-all duration-300 transform hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {localSessionCards.length}
              </div>
              <div className="text-gray-600 font-medium">📊 Toplam Soru</div>
            </div>

            <div 
              className="text-center p-8 rounded-3xl transition-all duration-300 transform hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: accuracy >= 70 ? 'linear-gradient(135deg, #10b981, #059669)' : 
                            accuracy >= 50 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                            'linear-gradient(135deg, #ef4444, #dc2626)'
                }}
              >
                <span className="text-white font-bold">%</span>
              </div>
              <div className={`text-3xl font-bold mb-2 ${
                accuracy >= 70 ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                %{accuracy}
              </div>
              <div className="text-gray-600 font-medium">🎯 Başarı Oranı</div>
            </div>
          </div>

          {/* Detaylı sonuçlar */}
          <div 
            className="p-8 rounded-3xl mb-12"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              📋 Soru Bazlı Sonuçlar
            </h3>
            <div className="space-y-3">
              {localSessionCards.map((card, index) => {
                const userAnswer = userAnswers[card.id];
                
                // Soru tipine göre doğru cevap kontrolü
                let isCorrect = false;
                let correctAnswer = '';
                
                if (card.question_type === 'fill_in_blank' && card.blank_answer) {
                  const correctAnswers = card.blank_answer.toLowerCase().split(',').map(a => a.trim());
                  const userAnswerLower = (userAnswer || '').toString().toLowerCase().trim();
                  isCorrect = correctAnswers.includes(userAnswerLower);
                  correctAnswer = card.blank_answer;
                } else {
                  isCorrect = userAnswer === card.correct_answer;
                  correctAnswer = card.correct_answer;
                }
                
                return (
                  <div
                    key={card.id}
                    className="p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: isCorrect 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
                      border: isCorrect 
                        ? '2px solid rgba(16, 185, 129, 0.3)'
                        : '2px solid rgba(239, 68, 68, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-bold mr-3"
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: 'white'
                            }}
                          >
                            Soru {index + 1}
                          </span>
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              background: 'rgba(148, 163, 184, 0.2)',
                              color: '#475569'
                            }}
                          >
                            📚 {card.subject}
                          </span>
                        </div>
                        <div className="font-bold text-gray-800 mb-4 text-lg">
                          {card.question.length > 120 ? `${card.question.substring(0, 120)}...` : card.question}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-gray-600 font-medium mr-2">Verdiğiniz cevap:</span>
                            <span 
                              className="px-3 py-1 rounded-xl font-bold text-white"
                              style={{
                                background: isCorrect 
                                  ? 'linear-gradient(135deg, #10b981, #059669)'
                                  : 'linear-gradient(135deg, #ef4444, #dc2626)'
                              }}
                            >
                              {userAnswer}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-center">
                              <span className="text-gray-600 font-medium mr-2">Doğru cevap:</span>
                              <span 
                                className="px-3 py-1 rounded-xl font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                              >
                                {correctAnswer}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                          style={{
                            background: isCorrect 
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : 'linear-gradient(135deg, #ef4444, #dc2626)'
                          }}
                        >
                          {isCorrect ? (
                            <CheckCircle className="w-7 h-7 text-white" />
                          ) : (
                            <XCircle className="w-7 h-7 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aksiyon butonları */}
          <div 
            className="p-8 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={restartStudy}
                className="flex items-center px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <RotateCcw className="w-6 h-6 mr-3" />
                🔄 Tekrar Çalış
              </button>
              
              {incorrectAnswers > 0 && (
                <button
                  onClick={handleRetryIncorrect}
                  className="flex items-center px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                  <AlertCircle className="w-6 h-6 mr-3" />
                  ❌ Yanlışları Tekrar Et ({incorrectAnswers})
                </button>
              )}

              <button
                onClick={() => navigate('/statistics')}
                className="flex items-center px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
              >
                <BarChart3 className="w-6 h-6 mr-3" />
                📊 İstatistikleri Gör
              </button>

              <button
                onClick={() => {
                  endCurrentSession();
                  navigate('/');
                }}
                className="flex items-center px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                🏠 Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Study;
