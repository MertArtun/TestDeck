import React from 'react';

const MinimalApp = () => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    console.log('✅ React Minimal App başarıyla yüklendi!');
  }, []);
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{ marginBottom: '20px' }}>🎉 TestDeck Minimal Test</h1>
        
        <div style={{ marginBottom: '30px' }}>
          <p>✅ React çalışıyor!</p>
          <p>✅ Vite çalışıyor!</p>
          <p>✅ CSS çalışıyor!</p>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <p>Counter Test: {count}</p>
          <button 
            onClick={() => setCount(count + 1)}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              margin: '5px'
            }}
          >
            Sayacı Artır
          </button>
        </div>
        
        <div>
          <button 
            onClick={() => {
              try {
                localStorage.setItem('test', 'OK');
                alert('LocalStorage çalışıyor: ' + localStorage.getItem('test'));
                localStorage.removeItem('test');
              } catch (e) {
                alert('LocalStorage hatası: ' + e.message);
              }
            }}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              margin: '5px'
            }}
          >
            LocalStorage Test
          </button>
          
          <button 
            onClick={() => {
              window.location.reload();
            }}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              margin: '5px'
            }}
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimalApp;