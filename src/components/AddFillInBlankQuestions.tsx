import React, { useState } from 'react';
import { createMultipleCards, initDatabase } from '../database/database';

const fillInBlankQuestions = [
  {
    question: "HTML'de _____ etiketi sayfa başlığını belirtmek için kullanılır.",
    blank_answer: "<title>",
    hints: "Head bölümünde yer alır, tarayıcı sekmesinde görünür",
    subject: "Web Programlama",
    difficulty: 1,
    question_type: 'fill_in_blank'
  },
  {
    question: "PHP'de _____ döngüsü dizi elemanlarını listelemek için en uygun seçenektir.",
    blank_answer: "foreach",
    hints: "Dizinin tüm elemanları üzerinde gezinir",
    subject: "Web Programlama", 
    difficulty: 2,
    question_type: 'fill_in_blank'
  },
  {
    question: "_____ programlama dilinde değişken tanımlamak için _____ anahtar kelimeleri kullanılır.",
    blank_answer: "JavaScript, var/let/const",
    hints: "Web programlama dili, ES6 ile gelen yeni özellikler",
    subject: "Web Programlama",
    difficulty: 2,
    question_type: 'fill_in_blank'
  },
  {
    question: "CSS'de _____ özelliği bir elementin arka plan rengini belirtmek için kullanılır.",
    blank_answer: "background-color",
    hints: "Renk değerleri hex, rgb veya isimleriyle verilebilir",
    subject: "Web Programlama",
    difficulty: 1,
    question_type: 'fill_in_blank'
  },
  {
    question: "MySQL'de _____ komutu veritabanından veri seçmek için kullanılır.",
    blank_answer: "SELECT",
    hints: "En temel SQL sorgu komutu",
    subject: "Veritabanı",
    difficulty: 1,
    question_type: 'fill_in_blank'
  },
  {
    question: "Bootstrap'da _____ sınıfı responsive grid sistemi oluşturmak için kullanılır.",
    blank_answer: "container",
    hints: "Sayfanın ana kapsayıcısı",
    subject: "Web Programlama",
    difficulty: 2,
    question_type: 'fill_in_blank'
  },
  {
    question: "Python'da _____ fonksiyonu kullanıcıdan giriş almak için kullanılır.",
    blank_answer: "input",
    hints: "Kullanıcı girişini string olarak döndürür",
    subject: "Programlama",
    difficulty: 1,
    question_type: 'fill_in_blank'
  },
  {
    question: "Java'da _____ anahtar kelimesi bir sınıftan nesne oluşturmak için kullanılır.",
    blank_answer: "new",
    hints: "Nesne yönelimli programlamanın temel kavramı",
    subject: "Programlama",
    difficulty: 2,
    question_type: 'fill_in_blank'
  },
  {
    question: "Git'de _____ komutu dosyaları staging area'ya eklemek için kullanılır.",
    blank_answer: "git add",
    hints: "Commit öncesi gerekli adım",
    subject: "Versiyon Kontrol",
    difficulty: 1,
    question_type: 'fill_in_blank'
  },
  {
    question: "Linux'ta _____ komutu dosya ve klasörleri listelemek için kullanılır.",
    blank_answer: "ls",
    hints: "List files kısaltması",
    subject: "İşletim Sistemi",
    difficulty: 1,
    question_type: 'fill_in_blank'
  }
];

const AddFillInBlankQuestions = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddQuestions = async () => {
    try {
      setIsAdding(true);
      await initDatabase();
      
      const questionsToAdd = fillInBlankQuestions.map(q => ({
        ...q,
        option_a: '', // Boşluk doldurma için gereksiz
        option_b: '',
        option_c: '',
        option_d: '',
        option_e: '',
        correct_answer: 'A' as const // Placeholder
      }));
      
      await createMultipleCards(questionsToAdd);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Boşluk doldurma soruları eklenirken hata:', error);
      alert('Sorular eklenirken bir hata oluştu!');
    } finally {
      setIsAdding(false);
    }
  };

  const gorselCikmisFillInBlankQuestions = [
    {
      question: "Veritabanı bağlantısını _____ sınıfı ile kontrol edebiliriz.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "SqlConnection",
      hints: "SQL Server veritabanı bağlantısı için kullanılan temel sınıf",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    },
    {
      question: "Filedialog pencerelerinde _____ özelliği ile diyalog penceresinde gösterilecek dosya türleri ayarlanabilir.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "Filter",
      hints: "Dosya seçim pencerelerinde hangi dosya türlerinin görüneceğini belirler",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    },
    {
      question: "Bağlantılı veritabanı yapısında _____ nesnesi sorgu sonucunu satır satır okur.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "DataReader",
      hints: "Veritabanından gelen verileri forward-only şekilde okur",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    },
    {
      question: "Richtext nesnesinde _____ özelliği ile seçilen yazıtipi uygulanır.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "SelectionFont",
      hints: "RichTextBox'ta seçili metnin font özelliklerini değiştirir",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    },
    {
      question: "Datagridview'de satırlara ulaşmak için kullanılan koleksiyon _____ özelliğidir.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "Rows",
      hints: "DataGridView'deki tüm satırları içeren koleksiyon",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    },
    {
      question: "Veritabanı sunucusuna açılan bağlantı durumunu _____ ile kontrol edebiliriz.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "State",
      hints: "Connection nesnesinin açık/kapalı durumunu gösterir",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    },
    {
      question: "Richtext'te seçilen fontu uygulamak için _____ özelliğinden faydalanılır.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "SelectionFont",
      hints: "RichTextBox'ta seçili alanın font özelliklerini değiştirir",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    },
    {
      question: "Form'a eklenen tüm bileşenler _____ dizisi içinde bulunur.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "Controls",
      hints: "Form üzerindeki tüm kontrollerin listesi",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    },
    {
      question: "Seçilen dosya _____ metodu ile Richtext'e yüklenir.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "LoadFile",
      hints: "RichTextBox'a dosya içeriğini yükleyen metod",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    },
    {
      question: "Datagridview'de _____ özelliği aktif satırı işaret eder.",
      subject: "Görsel Çıkmış",
      difficulty: 2,
      question_type: 'fill_in_blank' as const,
      blank_answer: "CurrentRow",
      hints: "DataGridView'de o anda seçili olan satır",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      option_e: "",
      correct_answer: "A" as 'A' | 'B' | 'C' | 'D' | 'E'
    }
  ];

  const addGorselCikmisFillInBlankQuestions = async () => {
    setIsAdding(true);
    setSuccess(false);
    
    try {
      const cardIds = await createMultipleCards(gorselCikmisFillInBlankQuestions);
      setSuccess(true);
      console.log(`✅ ${cardIds.length} Görsel Çıkmış boşluk doldurma sorusu başarıyla eklendi!`);
    } catch (error) {
      console.error('Boşluk doldurma soruları eklenirken hata:', error);
      setSuccess(false);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '16px',
      margin: '20px 0'
    }}>
      {success && (
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          color: '#166534',
          fontWeight: '500'
        }}>
          ✅ Boşluk doldurma soruları başarıyla eklendi!
        </div>
      )}
      
      <button
        onClick={handleAddQuestions}
        disabled={isAdding}
        style={{
          padding: '12px 24px',
          backgroundColor: isAdding ? '#9ca3af' : '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isAdding ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
      >
        {isAdding ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ffffff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Ekleniyor...
          </>
        ) : (
          <>
            ✏️ {fillInBlankQuestions.length} Boşluk Doldurma Sorusu Ekle
          </>
        )}
      </button>
      
      <p style={{ 
        color: '#6b7280', 
        fontSize: '14px', 
        textAlign: 'center',
        maxWidth: '400px',
        margin: 0
      }}>
        Web Programlama, Veritabanı, Programlama konularında hazır boşluk doldurma soruları
      </p>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Görsel Çıkmış Boşluk Doldurma Soruları */}
      <button
        onClick={addGorselCikmisFillInBlankQuestions}
        disabled={isAdding}
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          color: 'white',
          border: 'none',
          padding: '16px 24px',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '14px',
          cursor: isAdding ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          transition: 'all 0.3s ease',
          minWidth: '260px',
          textAlign: 'center',
          opacity: isAdding ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isAdding) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isAdding) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
          }
        }}
      >
        {isAdding ? '⏳ Ekleniyor...' : '📱✏️ Görsel Çıkmış Boşluk Doldurma (10)'}
      </button>
    </div>
  );
};

export default AddFillInBlankQuestions; 