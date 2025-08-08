import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getAllCards, 
  updateCard, 
  deleteCard 
} from '../database/database';
import { Card } from '../types/database';
import { 
  ArrowLeft, 
  Search, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Filter,
  Plus,
  BookOpen,
  Clock
} from 'lucide-react';
import { SkeletonCard } from '../components/Skeleton';
import { useToastStore } from '../store/toastStore';
import { useI18n } from '../i18n';

const CardManager = () => {
  const navigate = useNavigate();
  const { subject } = useParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subject || 'all');
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Card>>({});
  const [subjects, setSubjects] = useState<string[]>([]);
  const addToast = useToastStore((s) => s.addToast);
  const { t, locale } = useI18n();

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [cards, searchTerm, selectedSubject]);

  const loadCards = async () => {
    try {
      setLoading(true);
      // Her zaman tüm kartları yükle
      const allCards = await getAllCards();
      setCards(allCards);
      
      // Benzersiz konuları çıkar
      const uniqueSubjects = [...new Set(allCards.map((card: Card) => card.subject))] as string[];
      setSubjects(uniqueSubjects);
      
      // URL'den gelen subject parametresini kullan
      if (subject && subject !== 'all') {
        setSelectedSubject(subject);
      }
    } catch (error) {
      console.error('Kartlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCards = () => {
    let filtered = cards;

    // Konuya göre filtrele
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(card => card.subject === selectedSubject);
    }

    // Arama terimine göre filtrele
    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.option_a && card.option_a.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.option_b && card.option_b.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.option_c && card.option_c.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.option_d && card.option_d.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.blank_answer && card.blank_answer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCards(filtered);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card.id);
    setEditData(card);
  };

  const handleSave = async () => {
    if (!editingCard) return;

    try {
      await updateCard(editingCard, editData);
      await loadCards();
      setEditingCard(null);
      setEditData({});
    } catch (error) {
      console.error('Kart güncelleme hatası:', error);
      alert('Kart güncellenirken bir hata oluştu.');
    }
  };

  const handleCancel = () => {
    setEditingCard(null);
    setEditData({});
  };

  const handleDelete = async (cardId: number) => {
    if (!confirm('Bu kartı silmek istediğinizden emin misiniz?')) return;

    try {
      await deleteCard(cardId);
      await loadCards();
      addToast({ type: 'success', title: 'Silindi', message: `Kart ${cardId} silindi` });
    } catch (error) {
      console.error('Kart silme hatası:', error);
      addToast({ type: 'error', title: 'Hata', message: 'Kart silinirken bir hata oluştu.' });
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return { label: 'Kolay', color: 'bg-green-100 text-green-800' };
      case 2: return { label: 'Orta', color: 'bg-yellow-100 text-yellow-800' };
      case 3: return { label: 'Zor', color: 'bg-red-100 text-red-800' };
      default: return { label: 'Bilinmiyor', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getQuestionTypeLabel = (questionType?: string) => {
    switch (questionType) {
      case 'fill_in_blank': return { label: 'Boşluk Doldurma', color: 'bg-purple-100 text-purple-800', icon: '✏️' };
      default: return { label: 'Çoktan Seçmeli', color: 'bg-blue-100 text-blue-800', icon: '📝' };
    }
  };

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('manager.title')}</h1>
              <p className="text-gray-600 mt-1">
                {selectedSubject === 'all' 
                  ? `${t('manager.subtitle.all')} - ${filteredCards.length} ${t('common.cards')}` 
                  : `${selectedSubject} - ${filteredCards.length} ${t('common.cards')}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('manager.newCard')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('manager.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Subject Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[200px]"
            >
              <option value="all">{t('manager.allSubjects')}</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('manager.notFoundTitle')}</h3>
            <p className="text-gray-600">
              {searchTerm || selectedSubject !== 'all' ? t('manager.noResults') : t('manager.noCardsYet')}
            </p>
          </div>
        ) : (
          filteredCards.map(card => {
            const isEditing = editingCard === card.id;
            const difficultyInfo = getDifficultyLabel(card.difficulty);
            const questionTypeInfo = getQuestionTypeLabel(card.question_type);

            return (
              <div key={card.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${questionTypeInfo.color}`}>
                      {questionTypeInfo.icon} {questionTypeInfo.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyInfo.color}`}>
                      {difficultyInfo.label}
                    </span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                      {card.subject}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(card)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Question */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soru
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.question || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                    />
                  ) : (
                    <div 
                      className="text-gray-900 font-medium"
                      dangerouslySetInnerHTML={{
                        __html: card.question_type === 'fill_in_blank' 
                          ? card.question.replace(/_____/g, '<span class="bg-yellow-200 px-2 py-1 rounded">_____</span>')
                          : card.question
                      }}
                    />
                  )}
                </div>

                {/* Options or Fill-in-blank answer */}
                {card.question_type === 'fill_in_blank' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Doğru Cevap
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.blank_answer || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, blank_answer: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <span className="text-green-800 font-medium">{card.blank_answer}</span>
                        </div>
                      )}
                    </div>
                    {card.hints && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İpuçları
                        </label>
                        {isEditing ? (
                          <textarea
                            value={editData.hints || ''}
                            onChange={(e) => setEditData(prev => ({ ...prev, hints: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            rows={2}
                          />
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <span className="text-blue-800">{card.hints}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D', 'E'].map(option => {
                      const optionKey = `option_${option.toLowerCase()}` as keyof Card;
                      const optionValue = card[optionKey] as string;
                      const isCorrect = card.correct_answer === option;
                      
                      if (!optionValue && !isEditing) return null;

                      return (
                        <div key={option} className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seçenek {option}
                            {isCorrect && (
                          <span className="ml-2 text-green-600 text-xs">{t('manager.correctAnswer')}</span>
                            )}
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={(editData[optionKey] as string) || ''}
                              onChange={(e) => setEditData(prev => ({ 
                                ...prev, 
                                [optionKey]: e.target.value 
                              }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          ) : (
                            <div className={`p-3 rounded-lg border ${
                              isCorrect 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-gray-50 border-gray-200 text-gray-800'
                            }`}>
                              {optionValue}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Metadata */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(card.created_at).toLocaleDateString(locale)}
                      </span>
                      {card.updated_at !== card.created_at && (
                        <span className="flex items-center gap-1">
                          <Edit3 className="w-4 h-4" />
                          {new Date(card.updated_at).toLocaleDateString(locale)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">ID: {card.id}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CardManager; 