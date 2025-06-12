import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { createCard } from '../database/database';
import { 
  Save, 
  RotateCcw, 
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Type,
  Eye,
  EyeOff,
  Copy,
  Sparkles
} from 'lucide-react';

interface FillInBlankCardProps {
  onClose?: () => void;
  defaultSubject?: string;
  defaultDifficulty?: 1 | 2 | 3;
}

interface FillInBlankData {
  question: string;
  blank_answer: string;
  hints: string;
  subject: string;
  difficulty: 1 | 2 | 3;
}

const FillInBlankCard = ({ onClose, defaultSubject = '', defaultDifficulty = 1 }: FillInBlankCardProps) => {
  const { addCard } = useAppStore();
  const questionRef = useRef<HTMLTextAreaElement>(null);
  
  // Form data with auto-save to localStorage
  const [formData, setFormData] = useState<FillInBlankData>(() => {
    try {
      const saved = localStorage.getItem('fill-blank-draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          subject: defaultSubject || parsed.subject,
          difficulty: defaultDifficulty || parsed.difficulty
        };
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
    
    return {
      question: '',
      blank_answer: '',
      hints: '',
      subject: defaultSubject,
      difficulty: defaultDifficulty as 1 | 2 | 3
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('fill-blank-draft', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Focus on question field when component mounts
  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.focus();
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Soru metni gereklidir';
    } else if (!formData.question.includes('_____')) {
      newErrors.question = 'Soruda en az bir boşluk (_____ - 5 alt çizgi) bulunmalıdır';
    }

    if (!formData.blank_answer.trim()) {
      newErrors.blank_answer = 'Boşluk cevabı gereklidir';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Konu gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const cardData = {
        question: formData.question.trim(),
        option_a: '', // Boşluk doldurma için kullanılmayacak
        option_b: '',
        option_c: '',
        option_d: '',
        option_e: '',
        correct_answer: 'A' as const, // Placeholder
        subject: formData.subject.trim(),
        difficulty: formData.difficulty,
        question_type: 'fill_in_blank' as const,
        blank_answer: formData.blank_answer.trim(),
        hints: formData.hints.trim()
      };

      const cardId = await createCard(cardData);
      
      // Add to store
      addCard({
        ...cardData,
        id: cardId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      setShowSuccess(true);
      
      // Clear draft
      localStorage.removeItem('fill-blank-draft');
      
      // Reset form
      setTimeout(() => {
        setFormData({
          question: '',
          blank_answer: '',
          hints: '',
          subject: formData.subject, // Keep subject
          difficulty: formData.difficulty // Keep difficulty
        });
        setShowSuccess(false);
        if (questionRef.current) {
          questionRef.current.focus();
        }
      }, 2000);

    } catch (error) {
      console.error('Kart oluşturma hatası:', error);
      setErrors({ submit: 'Kart oluşturulurken bir hata oluştu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      question: '',
      blank_answer: '',
      hints: '',
      subject: formData.subject,
      difficulty: formData.difficulty
    });
    setErrors({});
    localStorage.removeItem('fill-blank-draft');
    if (questionRef.current) {
      questionRef.current.focus();
    }
  };

  const insertBlank = () => {
    if (questionRef.current) {
      const textarea = questionRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      const newText = before + '_____' + after;
      setFormData(prev => ({ ...prev, question: newText }));
      
      // Set cursor position after the blank
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 5, start + 5);
      }, 0);
    }
  };

  const processQuestionForPreview = (question: string) => {
    return question.replace(/_____/g, showAnswer ? 
      `<span style="background: #fbbf24; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${formData.blank_answer}</span>` :
      '<span style="border-bottom: 2px solid #3b82f6; display: inline-block; min-width: 60px; height: 20px; margin: 0 4px;"></span>'
    );
  };

  const templates = [
    {
      question: "_____ programlama dilinde değişken tanımlamak için _____ anahtar kelimesi kullanılır.",
      blank_answer: "JavaScript, var/let/const",
      hints: "Web programlama dili, ES6 ile gelen yeni özellikler",
      subject: "Web Programlama"
    },
    {
      question: "HTML'de _____ etiketi sayfa başlığını belirtmek için kullanılır.",
      blank_answer: "<title>",
      hints: "Head bölümünde yer alır, tarayıcı sekmesinde görünür",
      subject: "Web Programlama"
    },
    {
      question: "PHP'de dizi elemanlarını listelemek için _____ döngüsü en uygun seçenektir.",
      blank_answer: "foreach",
      hints: "Dizinin tüm elemanları üzerinde gezinir",
      subject: "Web Programlama"
    }
  ];

  const difficultyLabels = {
    1: { label: 'Kolay', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    2: { label: 'Orta', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    3: { label: 'Zor', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Boşluk Doldurma Sorusu</h2>
              <p className="text-purple-200">Öğrencilerin analitik düşünme becerisini geliştirir</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800 font-medium">
              ✨ Boşluk doldurma sorusu başarıyla oluşturuldu!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol taraf - Form */}
            <div className="space-y-6">
              {/* Soru */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Soru Metni
                  </label>
                  <button
                    type="button"
                    onClick={insertBlank}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    _____ Ekle
                  </button>
                </div>
                <textarea
                  ref={questionRef}
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Sorunuzu yazın... Boşluk için _____ (5 alt çizgi) kullanın"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${
                    errors.question ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={4}
                />
                {errors.question && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.question}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  💡 Boşluk için _____ (5 alt çizgi) kullanın. Birden fazla boşluk ekleyebilirsiniz.
                </p>
              </div>

              {/* Cevap */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Boşluk Cevabı
                </label>
                <input
                  type="text"
                  value={formData.blank_answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, blank_answer: e.target.value }))}
                  placeholder="Doğru cevabı yazın"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.blank_answer ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.blank_answer && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.blank_answer}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Birden fazla boşluk varsa, virgülle ayırarak yazabilirsiniz: cevap1, cevap2
                </p>
              </div>

              {/* İpuçları */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İpuçları (Opsiyonel)
                </label>
                <textarea
                  value={formData.hints}
                  onChange={(e) => setFormData(prev => ({ ...prev, hints: e.target.value }))}
                  placeholder="Öğrencilere yardımcı olacak ipuçları yazın..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows={2}
                />
              </div>

              {/* Konu ve Zorluk */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Konu adı"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.subject ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zorluk</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: parseInt(e.target.value) as 1 | 2 | 3 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={1}>Kolay</option>
                    <option value={2}>Orta</option>
                    <option value={3}>Zor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sağ taraf - Önizleme */}
            <div className="space-y-6">
              {/* Preview Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Önizleme</h3>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showPreview ? 'Gizle' : 'Göster'}
                </button>
              </div>

              {showPreview && formData.question && (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                      {formData.subject || 'Konu'}
                    </span>
                    <div 
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        color: difficultyLabels[formData.difficulty].color,
                        backgroundColor: difficultyLabels[formData.difficulty].bg
                      }}
                    >
                      {difficultyLabels[formData.difficulty].label}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div 
                      className="text-lg leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: processQuestionForPreview(formData.question) 
                      }}
                    />
                  </div>

                  {formData.hints && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">İpucu</span>
                      </div>
                      <p className="text-sm text-blue-700">{formData.hints}</p>
                    </div>
                  )}

                  {formData.blank_answer && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cevabı göster:</span>
                      <button
                        type="button"
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        {showAnswer ? 'Gizle' : 'Göster'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Şablonlar */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Hazır Şablonlar</h4>
                <div className="space-y-2">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        question: template.question,
                        blank_answer: template.blank_answer,
                        hints: template.hints,
                        subject: template.subject
                      }))}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {template.question.substring(0, 50)}...
                      </div>
                      <div className="text-xs text-gray-600">
                        {template.subject} • {template.blank_answer}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={clearForm}
                className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Temizle
              </button>
            </div>

            <div className="flex space-x-3">
              {errors.submit && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.submit}
                </p>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Soruyu Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FillInBlankCard; 