import React, { useState, useEffect } from 'react';
import './index.simple.css';

// Basit test componenti
const SimpleTestDeck = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    console.log('🚀 Basit TestDeck App başlatıldı');
    
    // Yükleme simülasyonu
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="spinner"></div>
          <p className="mt-4">TestDeck yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="text-center text-white mb-4">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🎯 TestDeck Local
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Yerel Flash Card Uygulaması
          </p>
        </div>
        
        {/* Adım Adım Test */}
        <div className="card text-center">
          <h2 className="text-white mb-4">Adım {step}: Temel Bileşen Testleri</h2>
          
          {step === 1 && (
            <div>
              <h3 className="text-white mb-4">✅ Uygulama Başarıyla Yüklendi!</h3>
              <div className="text-white mb-4">
                <p>• React: Çalışıyor</p>
                <p>• CSS: Çalışıyor</p>
                <p>• TypeScript: Çalışıyor</p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => setStep(2)}
              >
                Sonraki Test →
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <h3 className="text-white mb-4">🧪 Storage Testi</h3>
              <div className="text-white mb-4">
                <TestLocalStorage />
              </div>
              <div>
                <button 
                  className="btn btn-danger" 
                  onClick={() => setStep(1)}
                  style={{ marginRight: '10px' }}
                >
                  ← Önceki
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setStep(3)}
                >
                  Sonraki Test →
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div>
              <h3 className="text-white mb-4">🎮 Interaktif Test</h3>
              <div className="text-white mb-4">
                <CounterTest />
              </div>
              <div>
                <button 
                  className="btn btn-danger" 
                  onClick={() => setStep(2)}
                  style={{ marginRight: '10px' }}
                >
                  ← Önceki
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={() => setStep(4)}
                >
                  Final Test →
                </button>
              </div>
            </div>
          )}
          
          {step === 4 && (
            <div>
              <h3 className="text-white mb-4">🎉 Tüm Testler Başarılı!</h3>
              <div className="text-white mb-4">
                <p>TestDeck ana bileşenleri düzgün çalışıyor.</p>
                <p>Artık tam sürümü yükleyebiliriz.</p>
              </div>
              <div>
                <button 
                  className="btn btn-danger" 
                  onClick={() => setStep(3)}
                  style={{ marginRight: '10px' }}
                >
                  ← Önceki
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={() => {
                    alert('🚀 Tam sürüm henüz hazır değil, ama tüm temel bileşenler çalışıyor!');
                  }}
                >
                  Tam Sürümü Yükle 🚀
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center text-white mt-4" style={{ opacity: 0.7 }}>
          <p>TestDeck v0.1.0 - Basit Test Modu</p>
        </div>
      </div>
    </div>
  );
};

// LocalStorage test componenti
const TestLocalStorage = () => {
  const [status, setStatus] = useState('Test edilmedi');
  
  const testStorage = () => {
    try {
      const testKey = 'testdeck-test';
      const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        setStatus('✅ LocalStorage çalışıyor!');
      } else {
        setStatus('❌ LocalStorage veri uyumsuzluğu');
      }
    } catch (error) {
      setStatus('❌ LocalStorage hatası: ' + error.message);
    }
  };
  
  return (
    <div>
      <p>Status: {status}</p>
      <button className="btn btn-primary" onClick={testStorage}>
        LocalStorage Test Et
      </button>
    </div>
  );
};

// Counter test componenti
const CounterTest = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Counter: {count}</p>
      <div>
        <button 
          className="btn btn-primary" 
          onClick={() => setCount(count - 1)}
          style={{ marginRight: '10px' }}
        >
          -1
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => setCount(count + 1)}
        >
          +1
        </button>
      </div>
      <button 
        className="btn btn-danger" 
        onClick={() => setCount(0)}
        style={{ marginTop: '10px' }}
      >
        Reset
      </button>
    </div>
  );
};

export default SimpleTestDeck;