import React from 'react';
import { getSubjectStats, getDailyStats } from '../database/database';

const DebugComponent = () => {
  const [logs, setLogs] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    // Console hatalarını yakala
    const originalError = console.error;
    const originalLog = console.log;
    const originalWarn = console.warn;
    
    const addLog = (type: string, ...args: any[]) => {
      const message = `[${type}] ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')}`;
      setLogs(prev => [message, ...prev].slice(0, 20)); // Son 20 log
    };
    
    console.error = (...args) => {
      addLog('ERROR', ...args);
      originalError(...args);
    };
    
    console.log = (...args) => {
      addLog('LOG', ...args);
      originalLog(...args);
    };
    
    console.warn = (...args) => {
      addLog('WARN', ...args);
      originalWarn(...args);
    };
    
    // Test log
    console.log('DebugComponent başlatıldı');
    
    return () => {
      console.error = originalError;
      console.log = originalLog;
      console.warn = originalWarn;
    };
  }, []);
  
  const debugStatistics = async () => {
    console.log('🔍 DEBUG: Manuel istatistik kontrolü başlıyor...');
    
    // localStorage kontrolü
    const localData = localStorage.getItem('testdeck-data');
    if (localData) {
      const parsed = JSON.parse(localData);
      console.log('💾 LocalStorage Ham Veri:', {
        cards: parsed.cards?.length || 0,
        sessions: parsed.sessions?.length || 0,
        attempts: parsed.attempts?.length || 0,
        stats: parsed.stats?.length || 0
      });
      
      if (parsed.attempts?.length > 0) {
        console.log('📝 Son 3 attempt:', parsed.attempts.slice(-3));
      }
    }
    
    // Fonksiyon testleri
    try {
      const subjects = await getSubjectStats();
      console.log('📚 getSubjectStats sonucu:', subjects);
      
      const daily = await getDailyStats(7);
      console.log('📅 getDailyStats sonucu (7 gün):', daily);
      
      const dailyWithData = daily.filter(d => d.questions_answered > 0);
      console.log('📊 Veri olan günler:', dailyWithData);
      
    } catch (error) {
      console.error('❌ Debug test hatası:', error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>🛠️ TestDeck Debug Modu</h1>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>✅ React çalışıyor:</strong> Bu metin görünüyorsa React çalışıyor
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>✅ CSS çalışıyor:</strong> Gradyan arka plan görünüyorsa CSS çalışıyor
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>🧪 localStorage Test:</strong>
          <button 
            onClick={() => {
              try {
                localStorage.setItem('test', 'OK');
                const value = localStorage.getItem('test');
                console.log('localStorage test:', value);
                alert('localStorage çalışıyor: ' + value);
              } catch (e) {
                console.error('localStorage hatası:', e);
                alert('localStorage hatası: ' + e.message);
              }
            }}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test Et
          </button>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>🌐 Tauri API Test:</strong>
          <button 
            onClick={async () => {
              try {
                // @ts-ignore
                const { tauri } = window.__TAURI__;
                console.log('Tauri API mevcut:', !!tauri);
                alert('Tauri API: ' + (tauri ? 'Mevcut' : 'Mevcut değil'));
              } catch (e) {
                console.error('Tauri API hatası:', e);
                alert('Tauri API hatası: ' + e.message);
              }
            }}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test Et
          </button>
        </div>
        
        <button 
          onClick={() => {
            // Ana uygulamaya geç için global değişken
            (window as any).switchToMainApp = true;
            window.location.reload();
          }}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Ana Uygulamayı Zorla Başlat
        </button>
      </div>
      
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '10px',
        padding: '20px',
        color: '#00ff00',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        <h3 style={{ color: '#00ff00', marginBottom: '15px' }}>📋 Console Logları:</h3>
        {logs.length === 0 ? (
          <div>Henüz log yok...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              fontSize: '12px',
              color: log.includes('[ERROR]') ? '#ff6b6b' : 
                     log.includes('[WARN]') ? '#ffd93d' : '#00ff00'
            }}>
              {log}
            </div>
          ))
        )}
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        color: 'white',
        marginTop: '20px'
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #fff, #e0e7ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🎉 TestDeck Çalışıyor!
        </h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
          Uygulama başarıyla yüklendi. Bu test komponenti çalışıyorsa, 
          CSS ve React düzgün çalışıyor demektir.
        </p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '15px',
          borderRadius: '10px',
          margin: '20px 0'
        }}>
          <p style={{ fontSize: '0.9rem' }}>
            ✅ React: Çalışıyor<br/>
            ✅ CSS: Çalışıyor<br/>
            ✅ Tailwind: Test ediliyor...
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            style={{
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onClick={() => alert('Butona tıklandı! React event handling çalışıyor.')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            Test Butonu
          </button>

          <button 
            style={{
              background: 'linear-gradient(45deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onClick={debugStatistics}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            🔍 İstatistik Debug
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugComponent;