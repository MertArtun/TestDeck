import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Lightbulb, Send } from 'lucide-react';

interface FillInBlankAnswerSectionProps {
  card: any;
  userAnswer?: string;
  isAnswered: boolean;
  onAnswer: (answer: string) => void;
}

const FillInBlankAnswerSection = ({ card, userAnswer, isAnswered, onAnswer }: FillInBlankAnswerSectionProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAnswered && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAnswered]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isAnswered) {
      onAnswer(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const checkAnswer = (userInput: string, correctAnswer: string): boolean => {
    // Normalize strings for comparison
    const normalizeString = (str: string) => 
      str.toLowerCase()
         .replace(/[.,;:!?]/g, '') // Remove punctuation
         .trim();
    
    const normalizedUser = normalizeString(userInput);
    const normalizedCorrect = normalizeString(correctAnswer);
    
    // Check if answers match
    if (normalizedUser === normalizedCorrect) return true;
    
    // Check if correct answer contains multiple options (comma separated)
    if (correctAnswer.includes(',')) {
      const options = correctAnswer.split(',').map(opt => normalizeString(opt));
      return options.some(option => normalizedUser === option);
    }
    
    return false;
  };

  const isCorrect = userAnswer ? checkAnswer(userAnswer, card.blank_answer) : false;

  return (
    <div className="space-y-6">
      {/* Cevap girme bölümü */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={isAnswered ? (userAnswer || '') : inputValue}
            onChange={(e) => !isAnswered && setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cevabınızı yazın..."
            disabled={isAnswered}
            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
              isAnswered
                ? isCorrect
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-red-500 bg-red-50 text-red-800'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          
          {!isAnswered && (
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Gönder
            </button>
          )}
        </div>
        
        {!isAnswered && (
          <p className="text-sm text-gray-600">
            💡 Enter tuşuna basarak da cevabınızı gönderebilirsiniz
          </p>
        )}
      </form>

      {/* İpucu bölümü */}
      {card.hints && !isAnswered && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">İpucu mevcut</span>
          </div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            {showHint ? 'Gizle' : 'Göster'}
          </button>
        </div>
      )}

      {/* İpucu içeriği */}
      {showHint && card.hints && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">{card.hints}</p>
        </div>
      )}

      {/* Sonuç bölümü */}
      {isAnswered && (
        <div className={`p-4 rounded-lg border-2 ${
          isCorrect 
            ? 'border-green-500 bg-green-50' 
            : 'border-red-500 bg-red-50'
        }`}>
          <div className="flex items-center mb-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 mr-2" />
            )}
            <span className={`font-semibold ${
              isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {isCorrect ? '🎉 Doğru!' : '❌ Yanlış!'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                Sizin cevabınız: <strong>{userAnswer}</strong>
              </span>
            </div>
            
            {!isCorrect && (
              <div>
                <span className="text-green-700">
                  Doğru cevap: <strong>{card.blank_answer}</strong>
                </span>
              </div>
            )}
            
            {card.hints && !showHint && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">İpucu</span>
                </div>
                <p className="text-sm text-blue-700">{card.hints}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FillInBlankAnswerSection; 