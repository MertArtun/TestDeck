import React from "react";
import ReactDOM from "react-dom/client";
import MinimalApp from "./MinimalApp";

console.log('🚀 Minimal TestDeck başlatılıyor...');

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element bulunamadı!");
}

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <MinimalApp />
    </React.StrictMode>
  );
  console.log('✅ React başarıyla render edildi!');
} catch (error) {
  console.error('❌ React render hatası:', error);
  
  // Fallback HTML
  root.innerHTML = `
    <div style="
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.1);
        padding: 40px;
        border-radius: 20px;
      ">
        <h1>❌ React Hatası</h1>
        <p>React render edilirken hata oluştu:</p>
        <p style="color: #fca5a5;">${error.message}</p>
        <button onclick="window.location.reload()" style="
          background: #ef4444;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        ">Sayfayı Yenile</button>
      </div>
    </div>
  `;
}