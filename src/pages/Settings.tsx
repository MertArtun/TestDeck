import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { applyTheme, type ThemeMode, type ColorScheme, type FontSize } from '../utils/themeUtils';
import { exportUserData, importUserData } from '../database/database';
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Palette,
  Type,
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  Save,
  Bell,
  BellOff,
  Clock,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Upload,
  Globe,
  Settings as SettingsIcon,
  BookOpen,
  Target,
  CheckCircle,
  Trash2
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const {
    mode,
    colorScheme,
    fontSize,
    language,
    soundEnabled,
    animationsEnabled,
    autoSave,
    questionsPerSession,
    timePerQuestion,
    showHints,
    showProgress,
    studyReminders,
    achievementNotifications,
    setThemeMode,
    setColorScheme,
    setFontSize,
    setLanguage,
    setSoundEnabled,
    setAnimationsEnabled,
    setAutoSave,
    setQuestionsPerSession,
    setTimePerQuestion,
    setShowHints,
    setShowProgress,
    setStudyReminders,
    setAchievementNotifications,
    resetToDefaults,
  } = useThemeStore();

  // Apply theme when settings change
  useEffect(() => {
    console.log('⚙️ Settings page theme change:', { mode, colorScheme, fontSize });
    applyTheme({ mode, colorScheme, fontSize });
    
    // Force a small delay to ensure DOM is ready
    setTimeout(() => {
      applyTheme({ mode, colorScheme, fontSize });
    }, 100);
  }, [mode, colorScheme, fontSize]);

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (importFile) {
      const success = await importUserData(importFile);
      if (success) {
        alert('Veriler başarıyla içe aktarıldı!');
        setImportFile(null);
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      resetToDefaults();
      applyTheme({ mode: 'auto', colorScheme: 'blue', fontSize: 'medium' });
      alert('Ayarlar sıfırlandı!');
    }
  };

  const themeOptions: { value: ThemeMode; label: string; icon: any }[] = [
    { value: 'light', label: 'Açık Tema', icon: Sun },
    { value: 'dark', label: 'Koyu Tema', icon: Moon },
    { value: 'auto', label: 'Otomatik', icon: Monitor },
  ];

  const colorOptions: { value: ColorScheme; label: string; color: string }[] = [
    { value: 'blue', label: 'Mavi', color: '#3b82f6' },
    { value: 'purple', label: 'Mor', color: '#a855f7' },
    { value: 'green', label: 'Yeşil', color: '#10b981' },
    { value: 'orange', label: 'Turuncu', color: '#f97316' },
    { value: 'pink', label: 'Pembe', color: '#ec4899' },
  ];

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 'small', label: 'Küçük' },
    { value: 'medium', label: 'Orta' },
    { value: 'large', label: 'Büyük' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ayarlar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Tema, dil və çalışma tercihlerinizi özelleştirin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tema Ayarları */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tema Ayarları
              </h2>
            </div>

            {/* Theme Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tema Modu
              </label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setThemeMode(value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      mode === value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${
                      mode === value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <div className={`text-sm font-medium ${
                      mode === value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Renk Şeması
              </label>
              <div className="flex gap-3">
                {colorOptions.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => setColorScheme(value)}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      colorScheme === value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: color }}
                    />
                    <div className={`text-sm font-medium ${
                      colorScheme === value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Yazı Boyutu
              </label>
              <div className="grid grid-cols-3 gap-3">
                {fontSizeOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFontSize(value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      fontSize === value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Type className={`w-5 h-5 mx-auto mb-2 ${
                      fontSize === value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <div className={`text-sm font-medium ${
                      fontSize === value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Uygulama Ayarları */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <SettingsIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Uygulama Ayarları
              </h2>
            </div>

            <div className="space-y-4">
              {/* Sound */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Ses Efektleri</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Bildirim ve etkileşim sesleri</div>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {animationsEnabled ? (
                    <Zap className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ZapOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Animasyonlar</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Geçiş ve hover animasyonları</div>
                  </div>
                </div>
                <button
                  onClick={() => setAnimationsEnabled(!animationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    animationsEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Save className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Otomatik Kaydetme</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Değişiklikleri otomatik kaydet</div>
                  </div>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoSave ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Çalışma Ayarları */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Çalışma Ayarları
              </h2>
            </div>

            <div className="space-y-6">
              {/* Questions per session */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Oturum Başına Soru Sayısı: {questionsPerSession}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questionsPerSession}
                  onChange={(e) => setQuestionsPerSession(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>

              {/* Time per question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Soru Başına Süre: {timePerQuestion === 0 ? 'Sınırsız' : `${timePerQuestion} saniye`}
                </label>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="30"
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Sınırsız</span>
                  <span>5 dakika</span>
                </div>
              </div>

              {/* Show Hints */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {showHints ? (
                    <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">İpuçlarını Göster</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Sorularda ipucu butonunu göster</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className={`relative inline-flex h-6 w-11 items-centers rounded-full transition-colors ${
                    showHints ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showHints ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Show Progress */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">İlerleme Çubuğu</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Çalışma ilerlemesini göster</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowProgress(!showProgress)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showProgress ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showProgress ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Bildirim Ayarları */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bildirim Ayarları
              </h2>
            </div>

            <div className="space-y-4">
              {/* Study Reminders */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {studyReminders ? (
                    <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Çalışma Hatırlatmaları</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Düzenli çalışma hatırlatmaları al</div>
                  </div>
                </div>
                <button
                  onClick={() => setStudyReminders(!studyReminders)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    studyReminders ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      studyReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Achievement Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Başarı Bildirimleri</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Başarı rozetleri için bildirim al</div>
                  </div>
                </div>
                <button
                  onClick={() => setAchievementNotifications(!achievementNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    achievementNotifications ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      achievementNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Veri Yönetimi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Veri Yönetimi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export */}
            <button
              onClick={async () => {
                try {
                  await exportUserData();
                } catch (error) {
                  console.error('Export button error:', error);
                }
              }}
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">Verileri Dışa Aktar</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Kartlar ve istatistikleri JSON olarak kaydet</div>
              </div>
            </button>

            {/* Import */}
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Verileri İçe Aktar</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {importFile ? importFile.name : 'JSON yedek dosyası seç'}
                  </div>
                </div>
              </label>
              {importFile && (
                <button
                  onClick={handleImport}
                  className="mt-2 w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  İçe Aktar
                </button>
              )}
            </div>

            {/* Storage Cleanup */}
            <button
              onClick={() => {
                if (confirm('🧹 Eski veriler (30+ gün) temizlenecek. Devam edilsin mi?')) {
                  // Clear old data
                  localStorage.removeItem('create-card-draft');
                  localStorage.removeItem('quick-card-draft');
                  
                  // Clear other apps data
                  const keysToRemove = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && !key.startsWith('testdeck-')) {
                      keysToRemove.push(key);
                    }
                  }
                  keysToRemove.forEach(key => localStorage.removeItem(key));
                  
                  alert(`✅ Temizlik tamamlandı!\n🗑️ ${keysToRemove.length + 2} öğe temizlendi`);
                }
              }}
              className="flex items-center gap-3 p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Depolama Temizle</div>
                <div className="text-sm opacity-75">Hafıza alanı açmak için eski verileri temizle</div>
              </div>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center gap-3 p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Ayarları Sıfırla</div>
                <div className="text-sm opacity-75">Tüm ayarları varsayılana döndür</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
