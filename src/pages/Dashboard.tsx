import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, BookOpen, Layers, Zap, TrendingUp, Clock, Target, Award, Calendar, Plus, Play } from 'lucide-react';
import { initDatabase, getSubjectStats, getDailyStats, getAllCards } from '../database/database';
import { useThemeStore } from '../store/themeStore';
import { SkeletonCard } from '../components/Skeleton';
import { useI18n } from '../i18n';

// Define types for our stats to avoid using 'any'
interface SubjectStats {
  subject: string;
  totalCards: number;
  correctPercentage: number;
  lastStudied: string | null;
}

  interface DailyStat {
    date: string;
    questions_answered: number;
    accuracy?: number;
  }

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
  trend?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, colorClass, trend, subtitle }) => (
  <div 
    className="p-6 rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
    style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
    }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div 
          className="p-4 rounded-2xl text-white mr-6 shadow-lg"
          style={{
            background: colorClass.includes('blue') ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' :
                       colorClass.includes('green') ? 'linear-gradient(135deg, #10b981, #059669)' :
                       colorClass.includes('orange') ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                       'linear-gradient(135deg, #8b5cf6, #7c3aed)'
          }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {trend && (
        <div className="text-right">
          <span className="text-sm text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full">{trend}</span>
        </div>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const [subjects, setSubjects] = useState<SubjectStats[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [dailyActivity, setDailyActivity] = useState<DailyStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({ studied: 0, accuracy: 0 });
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const { language } = useThemeStore();
  const { t, locale } = useI18n();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await initDatabase();
        
        // Kartları yükle
        const allCards = await getAllCards();
        
        // Konu istatistiklerini yükle
        const subjectStats = await getSubjectStats();
        
        // Günlük istatistikleri yükle
        const dailyStats = await getDailyStats(7);

        // Toplam hesaplamalar
        const total = subjectStats.reduce((acc, s) => acc + (s.totalCards || 0), 0);
        const weightedAccuracy = subjectStats.reduce((acc, s) => acc + ((s.correctPercentage || 0) * (s.totalCards || 0)), 0);
        
        // Bugünkü aktivite
        const today = new Date().toISOString().split('T')[0];
        const todayStat = dailyStats.find(stat => stat.date === today);
        
        // Haftalık seri hesapla
        let streak = 0;
        for (let i = dailyStats.length - 1; i >= 0; i--) {
          if ((dailyStats[i] as any).questions_answered > 0) {
            streak++;
          } else {
            break;
          }
        }
        
        setSubjects(subjectStats);
        setTotalCards(Math.max(total, allCards.length));
        setOverallAccuracy(total > 0 ? Math.round(weightedAccuracy / total) : 0);
        setDailyActivity(dailyStats);
        setTodayStats({
           studied: todayStat?.questions_answered || 0,
           accuracy: todayStat ? Math.round((todayStat as any).accuracy || 0) : 0
        });
        setWeeklyStreak(streak);
        
      } catch (error) {
        console.error("Dashboard verileri yüklenirken hata oluştu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div 
        className="min-h-screen p-8"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const tx = {
    dashboard: t('dash.title'),
    welcome: t('dash.welcome'),
    totalCards: t('dash.totalCards'),
    todayStudied: t('dash.todayStudied'),
    weeklyStreak: t('dash.weeklyStreak'),
    overallAccuracy: t('dash.overallAccuracy'),
    decks: t('dash.decks'),
    studyNow: t('dash.studyNow'),
    viewAll: t('dash.viewAll'),
    noDecks: t('dash.noDecks'),
    createFirstDeck: t('dash.createFirstDeck'),
    weeklyActivity: t('dash.weeklyActivity'),
    quickActions: t('dash.quickActions'),
    createCard: t('dash.createCard'),
    startStudying: t('dash.startStudying'),
    viewStats: t('dash.viewStats'),
    recentActivity: t('dash.recentActivity', {}, 'Recent Activity'),
  } as const;

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="mb-12 p-8 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <h1 className="text-5xl font-bold text-white mb-3">
            🎯 {tx.dashboard}
          </h1>
          <p className="text-xl text-white/90">{tx.welcome}</p>
        </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard 
            icon={<Layers size={24} />} 
            label={tx.totalCards} 
          value={totalCards} 
          colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            subtitle={`${language === 'en' ? '' : ''}${t('dash.cardsCreatedSuffix')}`}
        />
        <StatCard 
          icon={<Target size={24} />} 
            label={tx.todayStudied} 
          value={todayStats.studied} 
          colorClass="bg-gradient-to-r from-green-500 to-green-600"
            trend={todayStats.studied > 0 ? `%${todayStats.accuracy}` : undefined}
        />
        <StatCard 
          icon={<Zap size={24} />} 
            label={tx.weeklyStreak} 
            value={`${weeklyStreak} ${t('common.days')}`} 
          colorClass="bg-gradient-to-r from-orange-500 to-orange-600"
            subtitle={weeklyStreak > 0 ? t('dash.ongoing') : t('dash.start')}
        />
        <StatCard 
          icon={<Award size={24} />} 
            label={tx.overallAccuracy} 
          value={`%${overallAccuracy}`} 
          colorClass="bg-gradient-to-r from-purple-500 to-purple-600"
            subtitle={language === 'tr' ? 'genel başarı oranı' : 'overall success'}
        />
      </div>

      {/* Quick Actions */}
      <div 
        className="mb-12 p-8 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <h2 className="text-3xl font-bold text-white mb-6">⚡ {tx.quickActions}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/create" 
            className="p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 group"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center">
              <div 
                className="p-4 rounded-xl mr-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{tx.createCard}</h3>
                <p className="text-sm text-gray-600">{t('dash.createCard.desc')}</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/study/all" 
            className="p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 group"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center">
              <div 
                className="p-4 rounded-xl mr-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{tx.startStudying}</h3>
                <p className="text-sm text-gray-600">{t('dash.startStudying.desc')}</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/stats" 
            className="p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 group"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center">
              <div 
                className="p-4 rounded-xl mr-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
              >
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{tx.viewStats}</h3>
                <p className="text-sm text-gray-600">{t('dash.viewStats.desc')}</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Subjects/Decks Section */}
      <div 
        className="mb-12 p-8 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">📚 {tx.decks}</h2>
          <Link 
            to="/manager" 
            className="px-4 py-2 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {tx.viewAll}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.slice(0, 6).map((subject) => (
              <div 
                key={subject.subject} 
                className="rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 truncate">{subject.subject}</h3>
                    <span 
                      className="text-xs font-bold text-white px-3 py-1 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                    >
                      {subject.totalCards} {t('common.cards')}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-600 font-medium">{t('subject.successRate')}</span>
                      <span className="font-bold text-gray-800">{Math.round(subject.correctPercentage || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-500 shadow-lg" 
                        style={{ 
                          width: `${Math.min(subject.correctPercentage || 0, 100)}%`,
                          background: 'linear-gradient(135deg, #10b981, #059669)'
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {subject.lastStudied && (
                    <p className="text-sm text-gray-500 mb-6 font-medium">
                      📅 {t('subject.lastStudied')} {new Date(subject.lastStudied).toLocaleDateString(locale)}
                    </p>
                  )}
                </div>
                
                <div className="px-8 pb-8">
                  <Link 
                    to={`/study/${encodeURIComponent(subject.subject)}`} 
                    className="block w-full text-center font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                  >
                    🚀 {tx.studyNow}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="p-16 text-center rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
            >
              <Layers size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🎯 {tx.noDecks}</h3>
            <p className="text-gray-600 mb-8 text-lg">{tx.createFirstDeck}</p>
            <Link 
              to="/create" 
              className="inline-flex items-center text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
            >
              <Plus className="w-6 h-6 mr-3" />
              ✨ {tx.createCard}
            </Link>
          </div>
        )}
      </div>

      {/* Weekly Activity Chart */}
      {dailyActivity.length > 0 && (
        <div 
          className="p-8 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Calendar className="w-7 h-7 mr-3" />
            📊 {tx.weeklyActivity}
          </h3>
          <div className="flex items-end space-x-3 h-40 bg-gray-50 rounded-2xl p-4">
             {dailyActivity.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full rounded-t-xl transition-all duration-500 hover:scale-110 shadow-lg"
                  style={{ 
                    height: `${Math.max((day.questions_answered / Math.max(...dailyActivity.map(d => d.questions_answered))) * 100, day.questions_answered > 0 ? 12 : 0)}%`,
                    minHeight: day.questions_answered > 0 ? '12px' : '4px',
                    background: day.questions_answered > 0 ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#e5e7eb'
                  }}
                ></div>
                <span className="text-sm text-gray-600 mt-3 font-medium">
                  {new Date(day.date).toLocaleDateString(locale, { weekday: 'short' })}
                </span>
                <span className="text-xs text-gray-500">
                  {day.questions_answered}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;