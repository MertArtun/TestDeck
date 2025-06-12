import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { getSubjectStats, getDailyStats, getAllCards } from '../database/database';
import { safePercentage, safeRound } from '../utils/safeMath';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { ArrowLeft, TrendingUp, Calendar, Target, Award, BarChart3, PlayCircle, Clock, Zap, BookOpen, Brain } from 'lucide-react';

const Statistics = () => {
  const navigate = useNavigate();
  const { subjects, updateSubjects, dailyStats, updateDailyStats, setLoading } = useAppStore();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [totalStats, setTotalStats] = useState({
    totalQuestions: 0,
    totalCorrect: 0,
    averageAccuracy: 0,
    studyDays: 0,
    totalCards: 0,
    averageSessionTime: 0
  });

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      console.log('📊 İstatistikler yükleniyor...');

      // Önce localStorage'ı kontrol et
      const localData = localStorage.getItem('testdeck-data');
      if (localData) {
        const parsed = JSON.parse(localData);
        console.log('💾 LocalStorage verisi:', {
          cards: parsed.cards?.length || 0,
          sessions: parsed.sessions?.length || 0,
          attempts: parsed.attempts?.length || 0,
          stats: parsed.stats?.length || 0
        });
      } else {
        console.log('⚠️ LocalStorage\'da veri yok');
      }

      // Kartları yükle
      const allCards = await getAllCards();

      // Konu istatistiklerini yükle
      const subjectsData = await getSubjectStats();
      console.log('📚 Konu istatistikleri döndü:', subjectsData);
      updateSubjects(subjectsData);

      // Günlük istatistikleri yükle
      const dailyData = await getDailyStats(timeRange);
      console.log('📅 Günlük istatistikler döndü:', dailyData);
      updateDailyStats(dailyData);

      // Genel istatistikleri hesapla
      const totalQuestions = dailyData.reduce((sum, day) => sum + (day.questions_answered || 0), 0);
      const totalCorrect = dailyData.reduce((sum, day) => sum + (day.correct_answers || 0), 0);
      const totalStudyTime = dailyData.reduce((sum, day) => sum + (day.study_time || 0), 0);
      const validTotalQuestions = Number(totalQuestions) || 0;
      const validTotalCorrect = Number(totalCorrect) || 0;
      const studyDays = dailyData.filter(day => (Number(day.questions_answered) || 0) > 0).length;

      setTotalStats({
        totalQuestions: validTotalQuestions,
        totalCorrect: validTotalCorrect,
        averageAccuracy: safePercentage(validTotalCorrect, validTotalQuestions, 0),
        studyDays,
        totalCards: allCards.length,
        averageSessionTime: studyDays > 0 ? safeRound(totalStudyTime / studyDays, 1) : 0
      });

    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Grafik verileri
  const dailyChartData = dailyStats.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
    questions: stat.questions_answered || 0,
    accuracy: stat.accuracy || 0,
    correct: stat.correct_answers || 0,
    studyTime: stat.study_time || 0
  })).reverse();

  const subjectChartData = subjects.map(subject => ({
    name: subject.name || 'Bilinmeyen',
    accuracy: subject.accuracy || 0,
    total: subject.total_cards || 0,
    attempts: subject.total_attempts || 0
  }));

  const accuracyDistribution = [
    { name: 'Mükemmel (90-100%)', value: subjects.filter(s => (s.accuracy || 0) >= 90).length, color: '#10b981' },
    { name: 'İyi (70-89%)', value: subjects.filter(s => (s.accuracy || 0) >= 70 && (s.accuracy || 0) < 90).length, color: '#3b82f6' },
    { name: 'Orta (50-69%)', value: subjects.filter(s => (s.accuracy || 0) >= 50 && (s.accuracy || 0) < 70).length, color: '#f59e0b' },
    { name: 'Düşük (<50%)', value: subjects.filter(s => (s.accuracy || 0) < 50).length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const StatCard = ({ icon, title, value, subtitle, color }: any) => (
    <div 
      className="p-8 rounded-3xl transition-all duration-300 transform hover:scale-105"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-center">
        <div 
          className="p-5 rounded-2xl text-white mr-6 shadow-lg"
          style={{ background: color }}
        >
          {React.cloneElement(icon, { className: 'w-8 h-8' })}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-600 mb-1">{title}</p>
          <p className="text-4xl font-black text-gray-800">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-2 font-medium">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div 
          className="mb-12 p-8 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-6 p-4 rounded-2xl transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <ArrowLeft className="w-7 h-7 text-white" />
              </button>
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">📊 İstatistikler</h1>
                <p className="text-xl text-white/90">Çalışma performansınızı inceleyin</p>
              </div>
            </div>

            {/* Zaman aralığı seçici */}
            <div 
              className="flex rounded-2xl p-2"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days as any)}
                  className="px-6 py-3 rounded-xl text-lg font-bold transition-all duration-300"
                  style={{
                    background: timeRange === days
                      ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                      : 'transparent',
                    color: timeRange === days ? 'white' : 'rgba(255, 255, 255, 0.8)'
                  }}
                >
                  Son {days} gün
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Ana İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard
          icon={<Target />}
          title="Toplam Soru"
          value={totalStats.totalQuestions}
          subtitle={`${totalStats.studyDays} gün boyunca`}
          color="linear-gradient(135deg, #3b82f6, #1d4ed8)"
        />
        <StatCard
          icon={<Award />}
          title="Doğru Cevap"
          value={totalStats.totalCorrect}
          subtitle={`%${totalStats.averageAccuracy} başarı oranı`}
          color="linear-gradient(135deg, #10b981, #059669)"
        />
        <StatCard
          icon={<BookOpen />}
          title="Toplam Kart"
          value={totalStats.totalCards}
          subtitle={`${subjects.length} farklı konu`}
          color="linear-gradient(135deg, #8b5cf6, #7c3aed)"
        />
        <StatCard
          icon={<Clock />}
          title="Ortalama Süre"
          value={`${totalStats.averageSessionTime}dk`}
          subtitle="günlük çalışma"
          color="linear-gradient(135deg, #f59e0b, #d97706)"
        />
      </div>

      {/* Eğer veri yoksa demo göster */}
      {totalStats.totalQuestions === 0 && subjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center mb-8">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={40} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Henüz İstatistik Yok</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            İstatistikleri görmek için önce birkaç kart oluşturun ve test çözmeye başlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Kart Oluştur
            </Link>
            <Link
              to="/study/all"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Çalışmaya Başla
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Grafik Alanları */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Günlük Aktivite Grafiği */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Günlük Aktivite
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="questions"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Konu Başarı Grafiği */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Konulara Göre Başarı
              </h3>
              {subjectChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={subjectChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar 
                      dataKey="accuracy" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Henüz konu verisi yok</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Başarı Dağılımı ve Konu Detayları */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Başarı Dağılımı */}
            {accuracyDistribution.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Başarı Dağılımı
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={accuracyDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {accuracyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {accuracyDistribution.map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-600 dark:text-gray-400">{item.name}: </span>
                      <span className="font-medium text-gray-900 dark:text-white ml-1">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Konu Detayları */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Konu Detayları
              </h3>
              {subjects.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{subject.name || 'Bilinmeyen Konu'}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {subject.total_cards || 0} kart • {subject.total_attempts || 0} deneme
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          %{Math.round(subject.accuracy || 0)}
                        </div>
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(subject.accuracy || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Henüz konu verisi yok</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Statistics;
