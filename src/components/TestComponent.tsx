import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #fff, #e0e7ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🎉 TestDeck Çalışıyor!
        </h1>
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
      </div>
    </div>
  );
};

export default TestComponent;