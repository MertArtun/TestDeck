// Enhanced Import Utilities with Smart Text Parsing
// Çoklu format desteği ve akıllı metin ayrıştırma

export interface ParsedCard {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  subject: string;
  difficulty: 1 | 2 | 3;
  image_path?: string;
}

export interface ImportResult {
  success: boolean;
  cards: ParsedCard[];
  errors: string[];
  warnings: string[];
  totalProcessed: number;
}

// Smart text parser for combined options
function parseOptionsFromText(text: string): { option_a: string; option_b: string; option_c: string; option_d: string; option_e: string } {
  const result = {
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    option_e: ''
  };

  if (!text) return result;

  // Clean up text
  let cleanText = text.trim();
  
  // Remove question part if it exists (everything before first option)
  const questionMatch = cleanText.match(/^(.*?)([a-e]\.|\([a-e]\)|[A-E]\.|\([A-E]\))/i);
  if (questionMatch) {
    cleanText = cleanText.substring(questionMatch[1].length);
  }

  // Different patterns to try
  const patterns = [
    // a. option b. option c. option d. option e. option
    /([a-e])\.\s*([^a-e]*?)(?=\s*[a-e]\.|$)/gi,
    // (a) option (b) option (c) option (d) option (e) option
    /\(([a-e])\)\s*([^(]*?)(?=\s*\([a-e]\)|$)/gi,
    // A. option B. option C. option D. option E. option
    /([A-E])\.\s*([^A-E]*?)(?=\s*[A-E]\.|$)/gi,
    // (A) option (B) option (C) option (D) option (E) option
    /\(([A-E])\)\s*([^(]*?)(?=\s*\([A-E]\)|$)/gi,
    // Split by common separators and try to match
    null // Special case for split-based parsing
  ];

  let parsed = false;

  for (const pattern of patterns) {
    if (!pattern) {
      // Try split-based parsing
      const splitAttempts = [
        cleanText.split(/\s+[a-e]\.\s*/i),
        cleanText.split(/\s+\([a-e]\)\s*/i),
        cleanText.split(/\s+[A-E]\.\s*/i),
        cleanText.split(/\s+\([A-E]\)\s*/i),
        cleanText.split(/\s*\|\s*/),
        cleanText.split(/\s*;\s*/),
        cleanText.split(/\s*,(?=\s*[a-eA-E])/),
      ];

      for (const parts of splitAttempts) {
        if (parts.length >= 4) {
          // Remove first part if it's empty or looks like question remainder
          const options = parts[0].trim() === '' ? parts.slice(1) : parts;
          
          if (options.length >= 4) {
            result.option_a = options[0]?.trim() || '';
            result.option_b = options[1]?.trim() || '';
            result.option_c = options[2]?.trim() || '';
            result.option_d = options[3]?.trim() || '';
            result.option_e = options[4]?.trim() || '';
            parsed = true;
            break;
          }
        }
      }
      if (parsed) break;
      continue;
    }

    const matches = Array.from(cleanText.matchAll(pattern));
    if (matches.length >= 4) {
      matches.forEach((match) => {
        const letter = match[1].toLowerCase();
        const option = match[2].trim();
        
        switch (letter) {
          case 'a':
            result.option_a = option;
            break;
          case 'b':
            result.option_b = option;
            break;
          case 'c':
            result.option_c = option;
            break;
          case 'd':
            result.option_d = option;
            break;
          case 'e':
            result.option_e = option;
            break;
        }
      });
      parsed = true;
      break;
    }
  }

  // Fallback: try to extract any meaningful options
  if (!parsed && cleanText.length > 0) {
    // Last resort: split by common words and patterns
    const fallbackSplits = [
      cleanText.split(/\s+(?=\d+[.\)])/), // Numbers
      cleanText.split(/\s+(?=[A-Z][a-z])/), // Capital letters
      cleanText.split(/\s{2,}/), // Multiple spaces
    ];

    for (const parts of fallbackSplits) {
      if (parts.length >= 4) {
        result.option_a = parts[0]?.trim() || '';
        result.option_b = parts[1]?.trim() || '';
        result.option_c = parts[2]?.trim() || '';
        result.option_d = parts[3]?.trim() || '';
        result.option_e = parts[4]?.trim() || '';
        break;
      }
    }
  }

  return result;
}

// Clean and extract question from combined text
function extractQuestion(text: string): string {
  if (!text) return '';
  
  // Look for question part (everything before first option marker)
  const patterns = [
    /^(.*?)(?:\s*[a-e]\.\s*)/i,
    /^(.*?)(?:\s*\([a-e]\)\s*)/i,
    /^(.*?)(?:\s*[A-E]\.\s*)/i,
    /^(.*?)(?:\s*\([A-E]\)\s*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }

  // If no pattern found, take first reasonable portion
  const sentences = text.split(/[.!?]+/);
  if (sentences.length > 0 && sentences[0].length > 10) {
    return sentences[0].trim() + (sentences[0].endsWith('.') ? '' : '?');
  }

  return text.trim();
}

// Validate card data
function validateCard(card: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!card.question || typeof card.question !== 'string' || card.question.trim().length === 0) {
    errors.push('Soru metni eksik veya geçersiz');
  }
  
  if (!card.option_a || typeof card.option_a !== 'string' || card.option_a.trim().length === 0) {
    errors.push('A seçeneği eksik');
  }
  
  if (!card.option_b || typeof card.option_b !== 'string' || card.option_b.trim().length === 0) {
    errors.push('B seçeneği eksik');
  }
  
  if (!card.option_c || typeof card.option_c !== 'string' || card.option_c.trim().length === 0) {
    errors.push('C seçeneği eksik');
  }
  
  if (!card.option_d || typeof card.option_d !== 'string' || card.option_d.trim().length === 0) {
    errors.push('D seçeneği eksik');
  }
  
  if (!card.correct_answer || !['A', 'B', 'C', 'D', 'E'].includes(card.correct_answer)) {
    errors.push('Doğru cevap geçersiz (A, B, C, D veya E olmalı)');
  }
  
  if (!card.subject || typeof card.subject !== 'string' || card.subject.trim().length === 0) {
    errors.push('Konu alanı eksik');
  }
  
  const difficulty = parseInt(card.difficulty);
  if (isNaN(difficulty) || difficulty < 1 || difficulty > 3) {
    errors.push('Zorluk seviyesi geçersiz (1, 2 veya 3 olmalı)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Smart normalize card data with intelligent parsing
function normalizeCard(card: any): ParsedCard {
  let question = String(card.question || '').trim();
  let options = {
    option_a: String(card.option_a || '').trim(),
    option_b: String(card.option_b || '').trim(),
    option_c: String(card.option_c || '').trim(),
    option_d: String(card.option_d || '').trim(),
    option_e: String(card.option_e || '').trim()
  };

  // Check if we have a combined text situation
  const allOptionsEmpty = !options.option_a && !options.option_b && !options.option_c && !options.option_d;
  const hasEmbeddedOptions = question.includes('a.') || question.includes('b.') || question.includes('c.') || question.includes('d.');

  if (allOptionsEmpty && hasEmbeddedOptions) {
    // Parse combined question+options text
    const extractedQuestion = extractQuestion(question);
    const parsedOptions = parseOptionsFromText(question);
    
    question = extractedQuestion;
    options = parsedOptions;
  } else if (allOptionsEmpty) {
    // Check if any field contains all the data
    const allText = [card.question, card.option_a, card.option_b, card.option_c, card.option_d, card.option_e, card.text, card.content].join(' ');
    if (allText.includes('a.') || allText.includes('b.')) {
      const extractedQuestion = extractQuestion(allText);
      const parsedOptions = parseOptionsFromText(allText);
      
      question = extractedQuestion;
      options = parsedOptions;
    }
  }

  // Clean up options
  Object.keys(options).forEach(key => {
    let option = options[key as keyof typeof options];
    
    // Remove option prefixes (a., b., etc.)
    option = option.replace(/^[a-eA-E][\.\)]\s*/, '');
    option = option.replace(/^\([a-eA-E]\)\s*/, '');
    
    // Clean up common artifacts
    option = option.replace(/^[-•*]\s*/, ''); // Remove bullet points
    option = option.trim();
    
    options[key as keyof typeof options] = option;
  });

  return {
    question: question,
    option_a: options.option_a,
    option_b: options.option_b,
    option_c: options.option_c,
    option_d: options.option_d,
    option_e: options.option_e,
    correct_answer: String(card.correct_answer || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E',
    subject: String(card.subject || '').trim(),
    difficulty: Math.min(3, Math.max(1, parseInt(card.difficulty) || 1)) as 1 | 2 | 3,
    image_path: String(card.image_path || '').trim()
  };
}

// JSON Parser
function parseJSON(content: string): ImportResult {
  const result: ImportResult = {
    success: false,
    cards: [],
    errors: [],
    warnings: [],
    totalProcessed: 0
  };
  
  try {
    const data = JSON.parse(content);
    
    // Support different JSON structures
    let cardsArray: any[] = [];
    
    if (Array.isArray(data)) {
      cardsArray = data;
    } else if (data.cards && Array.isArray(data.cards)) {
      cardsArray = data.cards;
    } else if (data.questions && Array.isArray(data.questions)) {
      cardsArray = data.questions;
    } else {
      result.errors.push('JSON formatı tanınmıyor. Array veya {cards: []} formatı bekleniyor.');
      return result;
    }
    
    result.totalProcessed = cardsArray.length;
    
    cardsArray.forEach((item, index) => {
      try {
        const normalizedCard = normalizeCard(item);
        const validation = validateCard(normalizedCard);
        
        if (validation.isValid) {
          result.cards.push(normalizedCard);
        } else {
          result.warnings.push(`Kart ${index + 1}: ${validation.errors.join(', ')}`);
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        result.warnings.push(`Kart ${index + 1}: Ayrıştırma hatası - ${msg}`);
      }
    });
    
    result.success = result.cards.length > 0;
    
    if (result.cards.length === 0) {
      result.errors.push('Geçerli kart bulunamadı');
    }
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.errors.push('JSON ayrıştırma hatası: ' + msg);
  }
  
  return result;
}

// XML Parser
function parseXML(content: string): ImportResult {
  const result: ImportResult = {
    success: false,
    cards: [],
    errors: [],
    warnings: [],
    totalProcessed: 0
  };
  
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      result.errors.push('XML ayrıştırma hatası');
      return result;
    }
    
    // Support different XML structures
    let cardElements: Element[] = [];
    
    // Try different tag names
    const possibleTags = ['card', 'question', 'item', 'q'];
    for (const tag of possibleTags) {
      const elements = xmlDoc.getElementsByTagName(tag);
      if (elements.length > 0) {
        cardElements = Array.from(elements);
        break;
      }
    }
    
    if (cardElements.length === 0) {
      result.errors.push('XML\'de kart bulunamadı. <card>, <question>, <item> veya <q> etiketleri bekleniyor.');
      return result;
    }
    
    result.totalProcessed = cardElements.length;
    
    cardElements.forEach((element, index) => {
      try {
        const card: any = {};
        
        // Extract data from XML element
        const getElementText = (tagName: string) => {
          const el = element.getElementsByTagName(tagName)[0];
          return el ? el.textContent || '' : '';
        };
        
        card.question = getElementText('question') || getElementText('q') || getElementText('text');
        card.option_a = getElementText('option_a') || getElementText('a') || getElementText('optionA');
        card.option_b = getElementText('option_b') || getElementText('b') || getElementText('optionB');
        card.option_c = getElementText('option_c') || getElementText('c') || getElementText('optionC');
        card.option_d = getElementText('option_d') || getElementText('d') || getElementText('optionD');
        card.option_e = getElementText('option_e') || getElementText('e') || getElementText('optionE');
        card.correct_answer = getElementText('correct_answer') || getElementText('answer') || getElementText('correct');
        card.subject = getElementText('subject') || getElementText('category') || getElementText('topic');
        card.difficulty = getElementText('difficulty') || getElementText('level') || '1';
        card.image_path = getElementText('image_path') || getElementText('image') || '';

        // If we don't have separate options, try to get from combined text
        if (!card.option_a && !card.option_b && !card.option_c && !card.option_d) {
          const combinedText = getElementText('options') || getElementText('choices') || card.question;
          if (combinedText) {
            card.question = combinedText;
          }
        }
        
        const normalizedCard = normalizeCard(card);
        const validation = validateCard(normalizedCard);
        
        if (validation.isValid) {
          result.cards.push(normalizedCard);
        } else {
          result.warnings.push(`Kart ${index + 1}: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        result.warnings.push(`Kart ${index + 1}: Ayrıştırma hatası - ${msg}`);
      }
    });
    
    result.success = result.cards.length > 0;
    
    if (result.cards.length === 0) {
      result.errors.push('Geçerli kart bulunamadı');
    }
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.errors.push('XML işleme hatası: ' + msg);
  }
  
  return result;
}

// CSV Parser
function parseCSV(content: string): ImportResult {
  const result: ImportResult = {
    success: false,
    cards: [],
    errors: [],
    warnings: [],
    totalProcessed: 0
  };
  
  try {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      result.errors.push('CSV dosyası en az 2 satır içermelidir (başlık + veri)');
      return result;
    }
    
    // Parse header
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().replace(/['"]/g, '').toLowerCase());
    
    // Map headers to expected field names
    const fieldMap: { [key: string]: string } = {
      'question': 'question',
      'soru': 'question',
      'q': 'question',
      'text': 'question',
      'content': 'question',
      'option_a': 'option_a',
      'a': 'option_a',
      'secenek_a': 'option_a',
      'choice_a': 'option_a',
      'option_b': 'option_b',
      'b': 'option_b',
      'secenek_b': 'option_b',
      'choice_b': 'option_b',
      'option_c': 'option_c',
      'c': 'option_c',
      'secenek_c': 'option_c',
      'choice_c': 'option_c',
      'option_d': 'option_d',
      'd': 'option_d',
      'secenek_d': 'option_d',
      'choice_d': 'option_d',
      'option_e': 'option_e',
      'e': 'option_e',
      'secenek_e': 'option_e',
      'choice_e': 'option_e',
      'correct_answer': 'correct_answer',
      'dogru_cevap': 'correct_answer',
      'answer': 'correct_answer',
      'correct': 'correct_answer',
      'key': 'correct_answer',
      'subject': 'subject',
      'konu': 'subject',
      'category': 'subject',
      'topic': 'subject',
      'difficulty': 'difficulty',
      'zorluk': 'difficulty',
      'level': 'difficulty',
      'image_path': 'image_path',
      'image': 'image_path',
      'gorsel': 'image_path',
      'options': 'question', // Combined options field
      'choices': 'question'  // Combined choices field
    };
    
    const mappedHeaders = headers.map(h => fieldMap[h] || h);
    
    result.totalProcessed = lines.length - 1;
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        if (values.length !== headers.length) {
          result.warnings.push(`Satır ${i + 1}: Sütun sayısı uyumsuz (${values.length} vs ${headers.length})`);
          // Try to continue with available data
        }
        
        const card: any = {};
        
        for (let j = 0; j < Math.min(mappedHeaders.length, values.length); j++) {
          const field = mappedHeaders[j];
          const value = values[j];
          if (card[field]) {
            card[field] += ' ' + value; // Combine if duplicate field
          } else {
            card[field] = value;
          }
        }
        
        const normalizedCard = normalizeCard(card);
        const validation = validateCard(normalizedCard);
        
        if (validation.isValid) {
          result.cards.push(normalizedCard);
        } else {
          result.warnings.push(`Satır ${i + 1}: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        result.warnings.push(`Satır ${i + 1}: Ayrıştırma hatası - ${msg}`);
      }
    }
    
    result.success = result.cards.length > 0;
    
    if (result.cards.length === 0) {
      result.errors.push('Geçerli kart bulunamadı');
    }
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.errors.push('CSV işleme hatası: ' + msg);
  }
  
  return result;
}

// Parse CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Main import function
export async function importCards(file: File): Promise<ImportResult> {
  try {
    const content = await file.text();
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'json':
        return parseJSON(content);
      case 'xml':
        return parseXML(content);
      case 'csv':
      case 'txt':
        return parseCSV(content);
      default:
        return {
          success: false,
          cards: [],
          errors: [`Desteklenmeyen dosya formatı: ${extension}. Desteklenen formatlar: JSON, XML, CSV`],
          warnings: [],
          totalProcessed: 0
        };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      cards: [],
      errors: ['Dosya okuma hatası: ' + msg],
      warnings: [],
      totalProcessed: 0
    };
  }
}

// Sample format generators
export function generateSampleJSON(): string {
  const sample = {
    cards: [
      {
        question: "JavaScript'te değişken tanımlamak için hangi anahtar kelime kullanılır?",
        option_a: "var",
        option_b: "let",
        option_c: "const",
        option_d: "Hepsi",
        option_e: "Hiçbiri",
        correct_answer: "D",
        subject: "JavaScript",
        difficulty: 1
      },
      {
        question: "React'te state yönetimi için hangi hook kullanılır?",
        option_a: "useEffect",
        option_b: "useState",
        option_c: "useContext",
        option_d: "useReducer",
        option_e: "useMemo",
        correct_answer: "B",
        subject: "React",
        difficulty: 2
      }
    ]
  };
  
  return JSON.stringify(sample, null, 2);
}

export function generateSampleXML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<testdeck>
  <card>
    <question>JavaScript'te değişken tanımlamak için hangi anahtar kelime kullanılır?</question>
    <option_a>var</option_a>
    <option_b>let</option_b>
    <option_c>const</option_c>
    <option_d>Hepsi</option_d>
    <option_e>Hiçbiri</option_e>
    <correct_answer>D</correct_answer>
    <subject>JavaScript</subject>
    <difficulty>1</difficulty>
  </card>
  <card>
    <question>React'te state yönetimi için hangi hook kullanılır?</question>
    <option_a>useEffect</option_a>
    <option_b>useState</option_b>
    <option_c>useContext</option_c>
    <option_d>useReducer</option_d>
    <option_e>useMemo</option_e>
    <correct_answer>B</correct_answer>
    <subject>React</subject>
    <difficulty>2</difficulty>
  </card>
</testdeck>`;
}

export function generateSampleCSV(): string {
  return `question,option_a,option_b,option_c,option_d,option_e,correct_answer,subject,difficulty
"JavaScript'te değişken tanımlamak için hangi anahtar kelime kullanılır?",var,let,const,Hepsi,Hiçbiri,D,JavaScript,1
"React'te state yönetimi için hangi hook kullanılır?",useEffect,useState,useContext,useReducer,useMemo,B,React,2
"CSS'te flex container'ın ana ekseni nasıl değiştirilir?",flex-direction,flex-wrap,justify-content,align-items,align-content,A,CSS,1

BİRLEŞİK FORMAT ÖRNEĞİ (Seçenekler tek alanda):
question,correct_answer,subject,difficulty
"Aşağıdakilerden hangisi BCD kodu değildir? a. 0111 b. 1010 c. 100 d. 0000",B,Mantık Devreleri,2
"JavaScript'te dizi oluşturmak için hangisi kullanılır? a. [] b. {} c. () d. <>",A,JavaScript,1`;
}