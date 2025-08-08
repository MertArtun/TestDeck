import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { createCard } from '../database/database';
import { 
  Plus, 
  Save, 
  RotateCcw, 
  Zap, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  BookOpen,
  Sparkles,
  Copy,
  Lightbulb,
  ArrowRight,
  Keyboard
} from 'lucide-react';
import { useI18n } from '../i18n';

interface QuickCardData {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  subject: string;
  difficulty: 1 | 2 | 3;
}

interface QuickCardAddProps {
  onClose?: () => void;
  defaultSubject?: string;
  defaultDifficulty?: number;
}

const QuickCardAdd = ({ onClose, defaultSubject = '', defaultDifficulty = 1 }: QuickCardAddProps) => {
  const { addCard } = useAppStore();
  const { t } = useI18n();
  const questionRef = useRef<HTMLTextAreaElement>(null);
  
  // Form data with auto-save to localStorage
  const [formData, setFormData] = useState<QuickCardData>(() => {
    // Auto-restore from localStorage if available
    try {
      const saved = localStorage.getItem('quick-card-draft');
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
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      option_e: '',
      correct_answer: 'A' as const,
      subject: defaultSubject,
      difficulty: defaultDifficulty as 1 | 2 | 3
    };
  });

  const [cardCount, setCardCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('quick-card-count') || '0');
    } catch {
      return 0;
    }
  });
  
  const [recentCards, setRecentCards] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('quick-recent-cards') || '[]');
    } catch {
      return [];
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCardAdded, setLastCardAdded] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('quick-card-draft', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Save card count and recent cards
  useEffect(() => {
    localStorage.setItem('quick-card-count', cardCount.toString());
    localStorage.setItem('quick-recent-cards', JSON.stringify(recentCards));
  }, [cardCount, recentCards]);

  // Focus question input on mount
  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.focus();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter = Save and new
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(true);
      }
      
      // Ctrl/Cmd + R = Reset form
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetForm();
      }
      
      // Escape = Close if onClose provided
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
      }
      
      // F1 = Show keyboard help
      if (e.key === 'F1') {
        e.preventDefault();
        setShowKeyboardHelp(!showKeyboardHelp);
      }
      
      // Number keys 1-5 for correct answer (when not in input)
      if (['1', '2', '3', '4', '5'].includes(e.key) && 
          !(e.target as HTMLElement).matches('input, textarea, select')) {
        e.preventDefault();
        const answers = ['A', 'B', 'C', 'D', 'E'];
        setFormData(prev => ({ 
          ...prev, 
          correct_answer: answers[parseInt(e.key) - 1] as any 
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showKeyboardHelp]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'difficulty' ? parseInt(value) : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Soru metni gerekli';
    }

    if (!formData.option_a.trim()) newErrors.option_a = 'A seçeneği gerekli';
    if (!formData.option_b.trim()) newErrors.option_b = 'B seçeneği gerekli';
    if (!formData.option_c.trim()) newErrors.option_c = 'C seçeneği gerekli';
    if (!formData.option_d.trim()) newErrors.option_d = 'D seçeneği gerekli';

    if (!formData.subject.trim()) {
      newErrors.subject = 'Konu gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    const subjectToKeep = formData.subject;
    const difficultyToKeep = formData.difficulty;
    
    setFormData({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      option_e: '',
      correct_answer: 'A',
      subject: subjectToKeep,
      difficulty: difficultyToKeep
    });
    
    setErrors({});
    
    // Clear draft
    try {
      localStorage.removeItem('quick-card-draft');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
    
    // Focus question input
    setTimeout(() => {
      if (questionRef.current) {
        questionRef.current.focus();
      }
    }, 100);
  };

  const handleSubmit = async (continueAdding: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cardData = {
        ...formData,
        image_path: ''
      };

      const cardId = await createCard(cardData);
      
      const newCard = {
        id: cardId,
        ...cardData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      addCard(newCard);

      // Update stats
      const newCount = cardCount + 1;
      setCardCount(newCount);
      
      const questionPreview = formData.question.substring(0, 50) + (formData.question.length > 50 ? '...' : '');
      setLastCardAdded(questionPreview);
      setRecentCards(prev => [questionPreview, ...prev.slice(0, 4)]);

      // Show success
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      if (continueAdding) {
        resetForm();
      } else if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }

    } catch (error) {
      console.error('Kart oluşturma hatası:', error);
      alert('Kart oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyFromTemplate = (template: QuickCardData) => {
    setFormData(template);
    setTimeout(() => {
      if (questionRef.current) {
        questionRef.current.focus();
        questionRef.current.select();
      }
    }, 100);
  };

  const templates: QuickCardData[] = [
    {
      question: "Aşağıdakilerden hangisi doğrudur?",
      option_a: "Seçenek A",
      option_b: "Seçenek B", 
      option_c: "Seçenek C",
      option_d: "Seçenek D",
      option_e: "Seçenek E",
      correct_answer: 'A',
      subject: formData.subject,
      difficulty: formData.difficulty
    },
    {
      question: "_______ nedir?",
      option_a: "Tanım A",
      option_b: "Tanım B",
      option_c: "Tanım C", 
      option_d: "Tanım D",
      option_e: "Tanım E",
      correct_answer: 'A',
      subject: formData.subject,
      difficulty: formData.difficulty
    }
  ];

  const difficultyLabels: Record<1 | 2 | 3, { label: string; color: string; bg: string }> = {
    1: { label: 'Kolay', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    2: { label: 'Orta', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    3: { label: 'Zor', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 4px 0'
              }}>
                {t('quick.title')}
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                margin: 0
              }}>
                {cardCount} kart eklendi • {formData.subject || 'Konu seçin'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
              title="Klavye Kısayolları (F1)"
            >
              <Keyboard style={{ width: '16px', height: '16px' }} />
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Success Animation */}
        {showSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'pulse 0.5s ease-in-out'
          }}>
            <CheckCircle2 style={{ width: '20px', height: '20px', color: '#10b981' }} />
            <span style={{ color: '#10b981', fontWeight: '600' }}>
              Kart başarıyla eklendi: {lastCardAdded}
            </span>
          </div>
        )}

        {/* Keyboard Help */}
        {showKeyboardHelp && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '16px' }}>
              ⌨️ Klavye Kısayolları
            </h4>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
              <p style={{ margin: '4px 0' }}><strong>Ctrl+Enter:</strong> Kartı kaydet ve yeni kart ekle</p>
              <p style={{ margin: '4px 0' }}><strong>Ctrl+R:</strong> Formu temizle</p>
              <p style={{ margin: '4px 0' }}><strong>1-5 tuşları:</strong> Doğru cevabı seç (A-E)</p>
              <p style={{ margin: '4px 0' }}><strong>Esc:</strong> Kapat</p>
              <p style={{ margin: '4px 0' }}><strong>F1:</strong> Bu yardımı göster/gizle</p>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px'
        }}>
          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Question */}
            <div>
              <label style={{
                display: 'block',
                color: 'white',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                {t('quick.question')}
              </label>
              <textarea
                ref={questionRef}
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="Sorunuzu buraya yazın..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: errors.question ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              {errors.question && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.question}
                </p>
              )}
            </div>

            {/* Options */}
              <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {(['A', 'B', 'C', 'D', 'E'] as const).map((option) => (
                <div key={option}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        correct_answer: option as any 
                      }))}
                      style={{
                        width: '24px',
                        height: '24px',
                        background: formData.correct_answer === option 
                          ? 'linear-gradient(45deg, #10b981, #14b8a6)'
                          : 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {option}
                    </button>
                      <label style={{
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                        {t('quick.option')} {option}
                      {formData.correct_answer === option && ' ✓'}
                    </label>
                  </div>
                  <input
                    type="text"
                    name={`option_${option.toLowerCase()}`}
                    value={formData[`option_${option.toLowerCase()}` as keyof QuickCardData] as string}
                    onChange={handleInputChange}
                    placeholder={`${option} seçeneği`}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: errors[`option_${option.toLowerCase()}`] ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      padding: '8px',
                      color: 'white',
                      fontSize: '13px'
                    }}
                  />
                  {errors[`option_${option.toLowerCase()}`] && (
                    <p style={{ color: '#ef4444', fontSize: '10px', margin: '2px 0 0 0' }}>
                      {errors[`option_${option.toLowerCase()}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Subject & Difficulty */}
              <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontWeight: '600',
                  marginBottom: '6px',
                  fontSize: '12px'
                }}>
                  {t('quick.subject')}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Örn: Matematik"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: errors.subject ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '8px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
                {errors.subject && (
                  <p style={{ color: '#ef4444', fontSize: '10px', margin: '2px 0 0 0' }}>
                    {errors.subject}
                  </p>
                )}
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontWeight: '600',
                  marginBottom: '6px',
                  fontSize: '12px'
                }}>
                  {t('quick.difficulty')}
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {([1, 2, 3] as Array<1 | 2 | 3>).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, difficulty: level as any }))}
                      style={{
                        flex: 1,
                        padding: '8px',
                       background: formData.difficulty === level 
                          ? difficultyLabels[level as 1 | 2 | 3].bg
                          : 'rgba(255, 255, 255, 0.1)',
                       border: formData.difficulty === level 
                          ? `1px solid ${difficultyLabels[level as 1 | 2 | 3].color}`
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                       color: formData.difficulty === level 
                          ? difficultyLabels[level as 1 | 2 | 3].color
                          : 'rgba(255, 255, 255, 0.7)',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {difficultyLabels[level as 1 | 2 | 3].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
              <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '8px'
            }}>
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #10b981, #14b8a6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                  {isSubmitting ? '...' : t('quick.addAndContinue')}
              </button>
              
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                  {t('quick.save')}
              </button>
              
              <button
                onClick={resetForm}
                disabled={isSubmitting}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
                  title={t('quick.resetForm')}
              >
                <RotateCcw style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Stats */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h4 style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                {t('quick.thisSession')}
              </h4>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                  {t('quick.cardsAdded')}
                </span>
                <span style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>
                  {cardCount}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                  {t('quick.activeSubject')}
                </span>
                <span style={{ color: '#3b82f6', fontWeight: '600', fontSize: '12px' }}>
                  {formData.subject || t('quick.notSelected')}
                </span>
              </div>
            </div>

            {/* Recent Cards */}
            {recentCards.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '16px'
              }}>
              <h4 style={{
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Clock style={{ width: '16px', height: '16px', color: '#10b981' }} />
                {t('quick.recent')}
                </h4>
                
                {recentCards.slice(0, 3).map((card, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '11px',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {index + 1}. {card}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Templates */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h4 style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Lightbulb style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                {t('quick.templates')}
              </h4>
              
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => copyFromTemplate(template)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer',
                    marginBottom: '6px',
                    textAlign: 'left'
                  }}
                >
                  <p style={{
                    color: 'white',
                    fontSize: '11px',
                    margin: '0 0 4px 0',
                    fontWeight: '500'
                  }}>
                    Şablon {index + 1}
                  </p>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '10px',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {template.question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCardAdd;