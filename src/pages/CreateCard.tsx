import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, FileText, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { createCard, createMultipleCards } from '../database/database';
import { Card } from '../types/database';

interface JSONQuestion {
  question: string;
  options: string[];
  correct: number | string;
  explanation?: string;
  category?: string;
  difficulty?: string | number;
}

const CreateCard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Manual card creation state
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'fill_in_blank'>('multiple_choice');
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [optionE, setOptionE] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [blankAnswer, setBlankAnswer] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  
  // JSON import state
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [showJsonImport, setShowJsonImport] = useState(false);
  
  // Save status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const resetForm = () => {
    setQuestionType('multiple_choice');
    setQuestion('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setOptionE('');
    setCorrectAnswer('A');
    setBlankAnswer('');
    setSubject('');
    setDifficulty(1);
  };

  const handleManualSave = async () => {
    if (!question.trim()) {
      alert('Lütfen soru alanını doldurun.');
      return;
    }

    if (questionType === 'multiple_choice') {
      if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
        alert('Lütfen soru ve en az 4 seçenek doldurun.');
        return;
      }
    } else if (questionType === 'fill_in_blank') {
      if (!blankAnswer.trim()) {
        alert('Lütfen boşluk doldurma cevabını doldurun.');
        return;
      }
    }

    if (!subject.trim()) {
      alert('Lütfen konu alanını doldurun.');
      return;
    }

    setSaveStatus('saving');
    
    try {
      const newCard: Omit<Card, 'id' | 'created_at' | 'updated_at'> = {
        question: question.trim(),
        option_a: questionType === 'multiple_choice' ? optionA.trim() : '',
        option_b: questionType === 'multiple_choice' ? optionB.trim() : '',
        option_c: questionType === 'multiple_choice' ? optionC.trim() : '',
        option_d: questionType === 'multiple_choice' ? optionD.trim() : '',
        option_e: questionType === 'multiple_choice' ? optionE.trim() || '' : '',
        correct_answer: questionType === 'multiple_choice' ? correctAnswer : 'A',
        blank_answer: questionType === 'fill_in_blank' ? blankAnswer.trim() : undefined,
        subject: subject.trim(),
        difficulty,
        question_type: questionType
      };

      await createCard(newCard);
      setSaveStatus('success');
      resetForm();
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Kart kaydedilirken hata:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleJsonImport = async () => {
    if (!jsonText.trim()) {
      setImportStatus('error');
      setImportMessage('JSON metin alanı boş.');
      return;
    }

    try {
      let parsed = JSON.parse(jsonText);
      
      // Tek soru formatını da destekle
      let questions: JSONQuestion[];
      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (typeof parsed === 'object' && parsed.question) {
        questions = [parsed]; // Tek soruyu diziye çevir
      } else {
        throw new Error('JSON formatı geçersiz. Soru dizisi veya tek soru objesi bekleniyor.');
      }

      const cards: Omit<Card, 'id' | 'created_at' | 'updated_at'>[] = questions.map((q, index) => {
        if (!q.question) {
          throw new Error(`Soru ${index + 1}: 'question' alanı eksik.`);
        }

        // Farklı seçenek alan isimlerini destekle
        let options: string[] = [];
        if (q.options && Array.isArray(q.options)) {
          options = q.options;
        } else if ((q as any).choices && Array.isArray((q as any).choices)) {
          options = (q as any).choices;
        } else if ((q as any).answers && Array.isArray((q as any).answers)) {
          options = (q as any).answers;
        } else if ((q as any).secenekler && Array.isArray((q as any).secenekler)) {
          options = (q as any).secenekler;
        } else {
          // A, B, C, D ayrı alanları olarak kontrol et
          const optionA = (q as any).A || (q as any).option_a || (q as any).a;
          const optionB = (q as any).B || (q as any).option_b || (q as any).b;
          const optionC = (q as any).C || (q as any).option_c || (q as any).c;
          const optionD = (q as any).D || (q as any).option_d || (q as any).d;
          
          if (optionA && optionB && optionC && optionD) {
            options = [optionA, optionB, optionC, optionD];
            const optionE = (q as any).E || (q as any).option_e || (q as any).e;
            if (optionE) options.push(optionE);
          } else {
            throw new Error(`Soru ${index + 1}: Seçenekler bulunamadı. 'options', 'choices', 'answers' dizisi veya 'A', 'B', 'C', 'D' alanları gerekli.`);
          }
        }

        if (options.length < 4) {
          throw new Error(`Soru ${index + 1}: En az 4 seçenek gerekli, ${options.length} bulundu.`);
        }

        // Doğru cevap alanını bul (farklı isimler destekle)
        const correctValue = q.correct || (q as any).correct_answer || (q as any).answer || (q as any).dogruCevap;
        
        let correctIndex: number;
        if (typeof correctValue === 'number') {
          correctIndex = correctValue;
        } else if (typeof correctValue === 'string') {
          const parsed = parseInt(correctValue);
          if (!isNaN(parsed)) {
            correctIndex = parsed;
          } else {
            // If it's a letter like 'A', 'B', etc.
            const letter = correctValue.toUpperCase();
            if (['A', 'B', 'C', 'D', 'E'].includes(letter)) {
              correctIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0);
            } else {
              throw new Error(`Soru ${index + 1}: Doğru cevap formatı geçersiz. '${correctValue}' desteklenmiyor.`);
            }
          }
        } else {
          throw new Error(`Soru ${index + 1}: Doğru cevap belirtilmemiş.`);
        }

        if (correctIndex < 0 || correctIndex >= options.length) {
          throw new Error(`Soru ${index + 1}: Doğru cevap indeksi geçersiz. ${correctIndex} >= ${options.length}`);
        }

        const correctAnswerLetter = ['A', 'B', 'C', 'D', 'E'][correctIndex] as 'A' | 'B' | 'C' | 'D' | 'E';

        let difficultyNum = 1;
        if (typeof q.difficulty === 'number') {
          difficultyNum = q.difficulty;
        } else if (typeof q.difficulty === 'string') {
          const diffMap: { [key: string]: number } = { 'easy': 1, 'medium': 2, 'hard': 3, 'kolay': 1, 'orta': 2, 'zor': 3 };
          difficultyNum = diffMap[q.difficulty.toLowerCase()] || 2;
        }

        return {
          question: q.question,
          option_a: options[0] || '',
          option_b: options[1] || '',
          option_c: options[2] || '',
          option_d: options[3] || '',
          option_e: options[4] || '',
          correct_answer: correctAnswerLetter,
          subject: q.category || (q as any).subject || (q as any).konu || 'İçe Aktarılan',
          difficulty: difficultyNum,
          question_type: 'multiple_choice' as const
        };
      });

      await createMultipleCards(cards);
      
      setImportStatus('success');
      setImportMessage(`${cards.length} kart başarıyla içe aktarıldı.`);
      setJsonText('');
      setShowJsonImport(false);
      
      setTimeout(() => {
        setImportStatus('idle');
        setImportMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('JSON import hatası:', error);
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'JSON parse edilemedi.');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonText(content);
      setShowJsonImport(true);
    };
    reader.readAsText(file);
  };

  const exportSampleJson = () => {
    const sampleData = [
      {
        question: "Türkiye'nin başkenti neresidir?",
        options: ["İstanbul", "Ankara", "İzmir", "Bursa"],
        correct: 1,
        category: "Genel Kültür",
        difficulty: "easy"
      },
      {
        question: "Hangi gezegen Güneş'e en yakındır?",
        options: ["Venüs", "Mars", "Merkür", "Dünya"],
        correct: 2,
        category: "Bilim",
        difficulty: "medium"
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-questions.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCorrectAnswerIndex = () => {
    return correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
  };

  const setCorrectAnswerByIndex = (index: number) => {
    const letter = ['A', 'B', 'C', 'D', 'E'][index] as 'A' | 'B' | 'C' | 'D' | 'E';
    setCorrectAnswer(letter);
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="container mx-auto max-w-6xl">
        <div 
          className="mb-12 p-8 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            ✨ Kart Oluştur
          </h1>
          <p className="text-xl text-white/90">
            Yeni çalışma kartları oluşturun veya JSON dosyasından toplu olarak içe aktarın.
          </p>
        </div>

      {/* Status Messages */}
      {importStatus !== 'idle' && (
        <div className={`mb-6 flex items-center gap-2 rounded-lg p-4 ${
          importStatus === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {importStatus === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{importMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div 
        className="mb-12 p-8 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">⚡ Hızlı İşlemler</h2>
        <div className="flex flex-wrap gap-6">
          <button
            onClick={() => setShowJsonImport(!showJsonImport)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            <Upload size={24} />
            📄 JSON İçe Aktar
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <FileText size={24} />
            📁 Dosyadan Yükle
          </button>
          
          <button
            onClick={exportSampleJson}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
          >
            <Download size={24} />
            💾 Örnek JSON İndir
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
        </div>
      </div>

      {/* JSON Import Section */}
      {showJsonImport && (
        <div 
          className="mb-12 p-8 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              📄 JSON İçe Aktarma
            </h2>
            <button
              onClick={() => setShowJsonImport(false)}
              className="p-3 rounded-full transition-all duration-300 hover:scale-110 text-gray-600 hover:text-gray-800"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <X size={24} />
            </button>
          </div>
          
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="JSON verilerini buraya yapıştırın..."
            className="mb-6 h-48 w-full rounded-2xl p-6 font-mono text-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)'
            }}
          />
          
          <button
            onClick={handleJsonImport}
            disabled={!jsonText.trim()}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            <Upload size={24} />
            📤 İçe Aktar
          </button>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-semibold">JSON Formatı:</p>
            <code className="mt-1 block rounded bg-gray-100 p-2 dark:bg-gray-700">
              {`[{"question": "Soru?", "options": ["A", "B", "C", "D"], "correct": 0, "category": "Kategori"}]`}
            </code>
          </div>
        </div>
      )}

      {/* Manual Card Creation */}
      <div 
        className="p-8 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2 className="mb-8 text-3xl font-bold text-gray-800">✏️ Manuel Kart Oluşturma</h2>
        
        <div className="space-y-6">
          {/* Question Type */}
          <div>
            <label className="mb-4 block text-lg font-bold text-gray-800">
              📝 Soru Tipi *
            </label>
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setQuestionType('multiple_choice')}
                className="flex-1 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105"
                style={{
                  background: questionType === 'multiple_choice'
                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  border: questionType === 'multiple_choice'
                    ? '3px solid #1d4ed8'
                    : '2px solid rgba(148, 163, 184, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="text-center">
                  <div className={`text-xl font-bold mb-2 ${
                    questionType === 'multiple_choice' ? 'text-white' : 'text-gray-800'
                  }`}>
                    🔘 Çoktan Seçmeli
                  </div>
                  <div className={`text-sm ${
                    questionType === 'multiple_choice' ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    A, B, C, D seçenekleri
                  </div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setQuestionType('fill_in_blank')}
                className="flex-1 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105"
                style={{
                  background: questionType === 'fill_in_blank'
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'rgba(255, 255, 255, 0.8)',
                  border: questionType === 'fill_in_blank'
                    ? '3px solid #059669'
                    : '2px solid rgba(148, 163, 184, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="text-center">
                  <div className={`text-xl font-bold mb-2 ${
                    questionType === 'fill_in_blank' ? 'text-white' : 'text-gray-800'
                  }`}>
                    📝 Boşluk Doldurma
                  </div>
                  <div className={`text-sm ${
                    questionType === 'fill_in_blank' ? 'text-white/90' : 'text-gray-600'
                  }`}>
                    Metin tabanlı cevap
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Soru *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={questionType === 'fill_in_blank' 
                ? "Sorunuzu yazın... (Boşluğu _____ ile belirtin)" 
                : "Sorunuzu yazın..."
              }
              className="h-24 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            {questionType === 'fill_in_blank' && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                💡 İpucu: Boşluk bırakmak istediğiniz yeri <code className="bg-gray-100 px-1 dark:bg-gray-700">_____</code> ile işaretleyin
              </p>
            )}
          </div>

          {/* Multiple Choice Options */}
          {questionType === 'multiple_choice' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Seçenekler *
              </label>
              <div className="space-y-3">
                {/* Option A */}
                <div className="flex gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswer === 'A'}
                    onChange={() => setCorrectAnswer('A')}
                    className="mt-1"
                  />
                  <span className="mt-1 font-semibold text-gray-700 dark:text-gray-300">A)</span>
                  <input
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="Seçenek A"
                    className="flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Option B */}
                <div className="flex gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswer === 'B'}
                    onChange={() => setCorrectAnswer('B')}
                    className="mt-1"
                  />
                  <span className="mt-1 font-semibold text-gray-700 dark:text-gray-300">B)</span>
                  <input
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="Seçenek B"
                    className="flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Option C */}
                <div className="flex gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswer === 'C'}
                    onChange={() => setCorrectAnswer('C')}
                    className="mt-1"
                  />
                  <span className="mt-1 font-semibold text-gray-700 dark:text-gray-300">C)</span>
                  <input
                    type="text"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    placeholder="Seçenek C"
                    className="flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Option D */}
                <div className="flex gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswer === 'D'}
                    onChange={() => setCorrectAnswer('D')}
                    className="mt-1"
                  />
                  <span className="mt-1 font-semibold text-gray-700 dark:text-gray-300">D)</span>
                  <input
                    type="text"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    placeholder="Seçenek D"
                    className="flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Option E - Optional */}
                <div className="flex gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswer === 'E'}
                    onChange={() => setCorrectAnswer('E')}
                    className="mt-1"
                  />
                  <span className="mt-1 font-semibold text-gray-500 dark:text-gray-400">E)</span>
                  <input
                    type="text"
                    value={optionE}
                    onChange={(e) => setOptionE(e.target.value)}
                    placeholder="Seçenek E (isteğe bağlı)"
                    className="flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fill in Blank Answer */}
          {questionType === 'fill_in_blank' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Doğru Cevap *
              </label>
              <input
                type="text"
                value={blankAnswer}
                onChange={(e) => setBlankAnswer(e.target.value)}
                placeholder="Boşluğun doğru cevabını yazın..."
                className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                💡 İpucu: Birden fazla doğru cevap varsa virgülle ayırın (örn: "ankara,Ankara,ANKARA")
              </p>
            </div>
          )}

          {/* Subject and Difficulty */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Konu *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Örn: Matematik, Tarih, Coğrafya..."
                className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Zorluk
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value={1}>Kolay (1)</option>
                <option value={2}>Orta (2)</option>
                <option value={3}>Zor (3)</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleManualSave}
              disabled={saveStatus === 'saving' || !question.trim() || !subject.trim() || 
                (questionType === 'multiple_choice' && (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim())) ||
                (questionType === 'fill_in_blank' && !blankAnswer.trim())
              }
              className={`flex items-center gap-2 rounded-lg px-6 py-2 text-white transition-colors ${
                saveStatus === 'saving' ? 'bg-gray-400' :
                saveStatus === 'success' ? 'bg-green-600' :
                saveStatus === 'error' ? 'bg-red-600' :
                'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Kaydediliyor...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle size={20} />
                  Kaydedildi!
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle size={20} />
                  Hata!
                </>
              ) : (
                <>
                  <Save size={20} />
                  Kartı Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CreateCard; 