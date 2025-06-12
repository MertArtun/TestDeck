import { createMultipleCards, initDatabase } from '../database/database';

// Web Programlama soruları
const webProgrammingQuestions = [
  {
    question: "Bir form submit edildiğinde gideceği sayfayı hangi özelliğindeki veriye bakarak karar verir?",
    option_a: "page",
    option_b: "method", 
    option_c: "action",
    option_d: "send",
    correct_answer: "C",
    explanation: "HTML <form> etiketinin action özelliği, formun gönderileceği hedef URL'yi belirtir."
  },
  {
    question: "PHP'de \"25 Mar 2024 22:19:04\" formatındaki bir tarih ve saat'i elde etmek için hangisi kullanılır?",
    option_a: "date(\"d M Y H:i:s\");",
    option_b: "date(\"D M Y H:İ:S\");",
    option_c: "date(\"d m Y H:i:s\");", 
    option_d: "date(\"d m y H:i:s\");",
    correct_answer: "A",
    explanation: "d: günü 2 haneli, M: ayın kısa metin gösterimi, Y: yılı 4 haneli, H: saati 24 saat formatında, i: dakika, s: saniye"
  },
  {
    question: "Müşteri siparişlerinin tutulduğu order tablosundan, sipariş miktarı (quantity) 26 olan müşterilerin sipariş bilgilerini getiren SQL cümlesi hangisidir?",
    option_a: "SELECT * FROM 'order' WHERE 'quantity' != 39 OR 'quantity' = 26 OR 'quantity' <> 41",
    option_b: "SELECT * FROM 'order' WHERE 'quantity' != 39 OR 'quantity' = 26 AND 'quantity' <> 41",
    option_c: "SELECT * FROM 'order' WHERE 'quantity' != 39 AND 'quantity' = 26 AND 'quantity' <> 41",
    option_d: "SELECT * FROM 'order' WHERE 'quantity' = 26 OR 'quantity' != 39 AND 'quantity' <> 41",
    correct_answer: "C",
    explanation: "Sadece quantity değeri 26 olan kayıtları istiyoruz. C şıkkındaki üç koşulun da aynı anda sağlanması gerekir."
  },
  {
    question: "PHP'de veri türü öğrendiğimiz fonksiyon hangisidir?",
    option_a: "getform",
    option_b: "typeof",
    option_c: "gettype", 
    option_d: "getcategory",
    correct_answer: "C",
    explanation: "PHP'de bir değişkenin veri türünü öğrenmek için gettype() fonksiyonu kullanılır."
  },
  {
    question: "$_FILES yöntemine ait özelliklerden biri hangisi değildir?",
    option_a: "name",
    option_b: "length",
    option_c: "type",
    option_d: "error", 
    correct_answer: "B",
    explanation: "$_FILES dizisi name, type, tmp_name, error ve size anahtarlarını içerir. length adında bir anahtar yoktur, dosya boyutu için size kullanılır."
  },
  {
    question: "Veritabanı yöneticilerinin karşılaştığı zorluklar arasında hangileri yer alır? I. Maliyet Artışı II. Veri Hacmi III. Talepler IV. Ölçekleme",
    option_a: "I ve III",
    option_b: "II, III ve IV",
    option_c: "I, II, III",
    option_d: "I, II ve IV",
    correct_answer: "B", 
    explanation: "Veritabanı yöneticileri artan veri hacmi, kullanıcı talepleri ve ölçekleme zorluklarıyla sürekli karşılaşırlar."
  },
  {
    question: "Bir dizinin bir elemanını silmek için hangi PHP işlevi kullanılabilir?",
    option_a: "delete",
    option_b: "unset",
    option_c: "undef",
    option_d: "shuffle",
    correct_answer: "B",
    explanation: "PHP'de bir değişkeni veya dizinin belirli bir elemanını yok etmek için unset() fonksiyonu kullanılır."
  },
  {
    question: "Hangisi bir veri tabanı türü değildir?",
    option_a: "Nesne odaklı",
    option_b: "Çoklu ortam", 
    option_c: "Grafik",
    option_d: "İlişkisel",
    correct_answer: "B",
    explanation: "Çoklu ortam, veri tabanında saklanan veri türüdür (resim, video, ses), temel bir veri tabanı modeli türü değildir."
  },
  {
    question: "PHP'de 7 yaşından büyük olanlar ancak 10 veya 12 yaşındakiler değil ifadesini denetleyen kontrol mekanizması hangisidir?",
    option_a: "if($age > 7 || $age != 10 && $age != 12)",
    option_b: "if($age > 7 && $age != 10 && $age != 12)",
    option_c: "if($age < 7 && $age != 10 && $age != 12)", 
    option_d: "if($age >= 7 && $age != 10 && $age != 12)",
    correct_answer: "B",
    explanation: "Üç koşulun aynı anda doğru olması gerekir: yaş 7'den büyük, 10'a eşit değil ve 12'ye eşit değil."
  },
  {
    question: "Hangisi bir web sunucusudur?",
    option_a: "XAMPP",
    option_b: "Mozilla Firefox",
    option_c: "Chrome",
    option_d: "Hiçbiri",
    correct_answer: "A",
    explanation: "XAMPP bir yazılım paketidir ve içinde Apache web sunucusunu barındırır."
  },
  {
    question: "PHP'de bir dizinin anahtarlarını ve değerlerini almak için hangi işlev kullanılır?",
    option_a: "while",
    option_b: "foreach",
    option_c: "for", 
    option_d: "do while",
    correct_answer: "B",
    explanation: "foreach döngüsü, bir dizinin tüm elemanları üzerinde gezinmek ve her elemanın anahtarını ve değerini almak için kullanılır."
  },
  {
    question: "PHP'de bir çerezi belirlemek için hangi işlev kullanılabilir?",
    option_a: "setcookie",
    option_b: "cookie",
    option_c: "defcookie",
    option_d: "session",
    correct_answer: "A",
    explanation: "Tarayıcıya bir çerez göndermek için PHP'de setcookie() fonksiyonu kullanılır."
  },
  {
    question: "Bir metni belirli bir karakter ile ayırıp dizi haline getirmek için hangisi kullanılır?",
    option_a: "substring",
    option_b: "implode", 
    option_c: "stringparse",
    option_d: "explode",
    correct_answer: "D", 
    explanation: "explode() fonksiyonu bir string'i belirtilen ayırıcıya göre bölerek bir dizi oluşturur."
  },
  {
    question: "Aşağıdakilerden hangisi veri tabanı sunucusudur?",
    option_a: "phpmyadmin",
    option_b: "xampp", 
    option_c: "mysql",
    option_d: "easyphp",
    correct_answer: "C",
    explanation: "MySQL, bir ilişkisel veri tabanı yönetim sistemi (RDBMS), yani bir veri tabanı sunucusudur."
  },
  {
    question: "Bir string'in başından ve sonundan boşlukları çıkarmak için hangi fonksiyon kullanılır?",
    option_a: "trim",
    option_b: "strip",
    option_c: "str",
    option_d: "implode",
    correct_answer: "A",
    explanation: "trim() fonksiyonu, bir string'in başındaki ve sonundaki boşluk karakterlerini temizler."
  },
  {
    question: "PHP'de \"31 May 2024 12:39:04\" formatındaki bir tarih ve saat'i elde etmek için hangisi kullanılır?",
    option_a: "date(\"D M Y H:İ:S\");",
    option_b: "date(\"d m Y H:i:s\");", 
    option_c: "date(\"d m y H:i:s\");",
    option_d: "date(\"d M Y H:i:s\");",
    correct_answer: "D",
    explanation: "d: günü 2 haneli, M: ayın kısa metin gösterimi, Y: yılı 4 haneli, H: saati 24 saat formatında, i: dakika, s: saniye"
  },
  {
    question: "URL'de ?apikey=user1234 şeklinde parametre gönderme yöntemi nedir?",
    option_a: "PUT",
    option_b: "POST",
    option_c: "GET", 
    option_d: "FTP",
    correct_answer: "C",
    explanation: "URL'nin sonuna ? işareti ile eklenen veriler HTTP GET yöntemiyle sunucuya gönderilir."
  },
  {
    question: "Tarayıcılarda veri saklayan yöntem hangisidir?",
    option_a: "$_COOKIE",
    option_b: "$_SESSION",
    option_c: "$_GET",
    option_d: "$_POST",
    correct_answer: "A", 
    explanation: "$_COOKIE, sunucu tarafından tarayıcıya gönderilen ve tarayıcının sakladığı küçük veri parçalarına erişmek için kullanılır."
  },
  {
    question: "Bilgi ve veri kolleksiyonundan oluşan yapıya ne denir?",
    option_a: "Veri tabanı",
    option_b: "Yapısal sorgu",
    option_c: "Veri yedekleme",
    option_d: "Veri erişimi",
    correct_answer: "A",
    explanation: "Bir veri tabanı, organize edilmiş bir bilgi ve veri koleksiyonudur."
  },
  {
    question: "Bir diziyi azalan düzende sıralamak için hangi fonksiyon kullanılır?",
    option_a: "sort()",
    option_b: "ksort()", 
    option_c: "arsort()",
    option_d: "krsort()",
    correct_answer: "C",
    explanation: "arsort() fonksiyonu, bir diziyi elemanlarının değerlerine göre azalan sırada sıralar ve anahtar-değer ilişkisini korur."
  },
  {
    question: "Okunabilir formatdaki bir zamanı unix zamanına dönüştüren fonksiyon hangisidir?",
    option_a: "localtime",
    option_b: "strtotime",
    option_c: "mktotime", 
    option_d: "gettime",
    correct_answer: "B",
    explanation: "strtotime() fonksiyonu, İngilizce formatında verilen tarih/saat ifadelerini Unix zaman damgasına dönüştürür."
  },
  {
    question: "PHP'de yorum belirtmenin bir yolu hangisi değildir?",
    option_a: "# yorum satırı",
    option_b: "// yorum satırı",
    option_c: "/* yorum satırı */", 
    option_d: "/!-- yorum satırı --/",
    correct_answer: "D",
    explanation: "PHP'de # veya // tek satırlık, /* */ çok satırlık yorumlar için kullanılır. /!-- --/ geçerli bir format değildir."
  },
  {
    question: "Bir dizinin sonuna bir değer ekleyen fonksiyon hangisidir?",
    option_a: "into_array()",
    option_b: "add_array()",
    option_c: "array_push()",
    option_d: "end_array()",
    correct_answer: "C",
    explanation: "array_push() fonksiyonu, bir veya daha fazla elemanı bir dizinin sonuna ekler."
  },
  {
    question: "Bu PHP kodunun çıktısı nedir? <?php $urun=\"Kahve\"; $fiyat=25; $kdv=7; echo '$urun $fiyat TL + $kdv TL dir.'; ?>",
    option_a: "$urun 25 TL + 7 TL dir.",
    option_b: "Kahve $fiyat TL + $kdv TL dir.",
    option_c: "Kahve 25 TL + 7 TL dir.",
    option_d: "$urun $fiyat TL + $kdv TL dir.",
    correct_answer: "D",
    explanation: "PHP'de tek tırnak içinde yazılan string'lerde değişkenler yorumlanmaz, olduğu gibi yazdırılır."
  },
  {
    question: "PHP'de bir dizi ters sırada almak için hangisi kullanılır?",
    option_a: "array_slice()",
    option_b: "array_shift()", 
    option_c: "array_reverse()",
    option_d: "is_array()",
    correct_answer: "C",
    explanation: "array_reverse() fonksiyonu, bir dizinin elemanlarının sırasını tersine çevirerek yeni bir dizi döndürür."
  },
  {
    question: "Sunucu bilgilerini veren tanımlı değişkenlerden biri hangisi değildir?",
    option_a: "$_SERVER['PHP_OS'];",
    option_b: "$_SERVER['REMOTE_ADDR'];", 
    option_c: "$_SERVER['HTTP_REFERER'];",
    option_d: "$_SERVER['SCRIPT_FILENAME'];",
    correct_answer: "A",
    explanation: "PHP_OS bir $_SERVER anahtarı değil, PHP'nin çalıştığı işletim sistemini veren tanımlı bir sabittir."
  },
  {
    question: "PHP'de bir sayfada oturum ne ile başlatılır?",
    option_a: "session_set",
    option_b: "session_begin",
    option_c: "session_start", 
    option_d: "session_commit",
    correct_answer: "C",
    explanation: "PHP'de oturum yönetimini kullanabilmek için session_start() fonksiyonunun çağrılması gerekir."
  },
  {
    question: "Bir Update ifadesinde hangisi yazılmazsa ilgili tablodaki kayıtların tümü güncellenir?",
    option_a: "Update",
    option_b: "Where",
    option_c: "Set",
    option_d: "Table",
    correct_answer: "B",
    explanation: "UPDATE ifadesinde WHERE yan cümlesi yazılmazsa, SET ile belirtilen güncelleme işlemi tablodaki tüm satırlara uygulanır."
  },
  {
    question: "Hangisi bir PHP sayfasını dahil etmek için kullanılır?",
    option_a: "insert",
    option_b: "include",
    option_c: "input", 
    option_d: "connect",
    correct_answer: "B",
    explanation: "PHP'de başka bir dosyanın içeriğini mevcut betiğe dahil etmek için include, require, include_once veya require_once ifadeleri kullanılır."
  },
  {
    question: "Süreli veya süresiz olarak kullanılabilen yöntem hangisidir?",
    option_a: "$_COOKIE",
    option_b: "$_SESSION", 
    option_c: "$_GET",
    option_d: "$_POST",
    correct_answer: "A",
    explanation: "setcookie() ile bir çerez oluşturulurken son kullanma tarihi belirtilebilir veya belirtilmeyerek süresiz gibi davranması sağlanabilir."
  },
  {
    question: "Dosya transfer protokolünün port numarası nedir?",
    option_a: "19",
    option_b: "21",
    option_c: "23",
    option_d: "25",
    correct_answer: "B",
    explanation: "FTP (File Transfer Protocol) için standart kontrol bağlantı noktası 21'dir."
  },
  {
    question: "Bir tablonun tanımını silmek için hangisi kullanılır?",
    option_a: "Delete",
    option_b: "Drop", 
    option_c: "Erase",
    option_d: "Terminate",
    correct_answer: "B",
    explanation: "SQL'de bir tablonun yapısını ve içerdiği tüm verileri tamamen silmek için DROP TABLE komutu kullanılır."
  },
  {
    question: "Sunucu bilgilerini veren tanımlı değişkenlerden biri hangisi değildir?",
    option_a: "$_SERVER['REMOTE_ADDR'];",
    option_b: "$_SERVER['SERVER_URL'];",
    option_c: "$_SERVER['HTTP_REFERER'];", 
    option_d: "$_SERVER['SERVER_PORT'];",
    correct_answer: "B",
    explanation: "SERVER_URL adında standart bir $_SERVER anahtarı yoktur. Sunucu adresi için SERVER_NAME veya HTTP_HOST kullanılır."
  },
  {
    question: "Linkteki ?sira=2&kod=kdm&islem=ekle parametrelerinden sira değerini deger değişkenine almak için hangisi kullanılır?",
    option_a: "$sira = $_POST[\"deger\"];",
    option_b: "$deger = $_GET[\"sira\"];", 
    option_c: "$sira = $_GET[\"deger\"];",
    option_d: "$deger = $_POST[\"sira\"];",
    correct_answer: "B",
    explanation: "Link parametreleri GET yöntemiyle gönderilir. sira parametresinin değerine $_GET['sira'] ile erişilir."
  },
  {
    question: "Linkteki ?sira=2&kod=kdm&islem=gunc parametrelerinden kod değeri (kdm) nasıl alınır?",
    option_a: "$kdm = $_POST[\"kdm\"];",
    option_b: "$kdm = $_POST[\"kod\"];",
    option_c: "$kod = $_GET[\"kod\"];", 
    option_d: "$kod = $_GET[\"kdm\"];",
    correct_answer: "C",
    explanation: "kod adındaki parametrenin değeri kdm'dir. Bu değere $_GET['kod'] ile erişilir."
  }
];

export async function addWebProgrammingQuestions() {
  try {
    await initDatabase();
    
    const cardsToAdd = webProgrammingQuestions.map(q => ({
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b, 
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      subject: "Web Programlama",
      difficulty: "orta",
      explanation: q.explanation
    }));

    const ids = await createMultipleCards(cardsToAdd);
    console.log(`✅ ${ids.length} Web Programlama sorusu başarıyla eklendi!`);
    return ids;
  } catch (error) {
    console.error('Sorular eklenirken hata:', error);
    throw error;
  }
}

// Script çalıştırma
if (typeof window !== 'undefined') {
  (window as any).addWebProgrammingQuestions = addWebProgrammingQuestions;
} 