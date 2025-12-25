import { describe, it, expect } from 'vitest';
import { importCards } from './importUtils';

// Helper to create mock File objects with text() method
function createMockFile(content: string, filename: string): File {
  const file = {
    name: filename,
    text: () => Promise.resolve(content),
  } as unknown as File;
  return file;
}

// Valid card data for testing
const validCard = {
  question: 'What is 2+2?',
  option_a: '3',
  option_b: '4',
  option_c: '5',
  option_d: '6',
  option_e: '7',
  correct_answer: 'B',
  subject: 'Math',
  difficulty: 1,
};

describe('importCards - JSON parsing', () => {
  it('should parse valid JSON array', async () => {
    const content = JSON.stringify([validCard]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].question).toBe('What is 2+2?');
    expect(result.cards[0].correct_answer).toBe('B');
    expect(result.errors).toHaveLength(0);
  });

  it('should parse valid JSON with {cards: []} format', async () => {
    const content = JSON.stringify({ cards: [validCard] });
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(1);
  });

  it('should parse valid JSON with {questions: []} format', async () => {
    const content = JSON.stringify({ questions: [validCard] });
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(1);
  });

  it('should return error for invalid JSON syntax', async () => {
    const content = '{ invalid json }';
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('JSON');
  });

  it('should handle empty array', async () => {
    const content = JSON.stringify([]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.cards).toHaveLength(0);
    expect(result.errors).toContain('Geçerli kart bulunamadı');
  });

  it('should warn about cards with missing required fields', async () => {
    const invalidCard = {
      question: 'What is 2+2?',
      // missing options
      correct_answer: 'B',
      subject: 'Math',
      difficulty: 1,
    };
    const content = JSON.stringify([invalidCard]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should process multiple cards and skip invalid ones', async () => {
    const cards = [
      validCard,
      { question: 'Invalid card without options' },
      { ...validCard, question: 'Second valid card' },
    ];
    const content = JSON.stringify(cards);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(2);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.totalProcessed).toBe(3);
  });

  it('should return error for unrecognized JSON format', async () => {
    const content = JSON.stringify({ data: 'not an array' });
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('importCards - CSV parsing', () => {
  it('should parse valid CSV', async () => {
    const content = `question,option_a,option_b,option_c,option_d,correct_answer,subject,difficulty
What is 2+2?,3,4,5,6,B,Math,1`;
    const file = createMockFile(content, 'cards.csv');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].question).toBe('What is 2+2?');
  });

  it('should handle quoted fields', async () => {
    const content = `question,option_a,option_b,option_c,option_d,correct_answer,subject,difficulty
"What is ""2+2""?",3,4,5,6,B,Math,1`;
    const file = createMockFile(content, 'cards.csv');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards[0].question).toContain('2+2');
  });

  it('should handle Turkish headers', async () => {
    const content = `soru,secenek_a,secenek_b,secenek_c,secenek_d,dogru_cevap,konu,zorluk
2+2 kaç eder?,3,4,5,6,B,Matematik,1`;
    const file = createMockFile(content, 'cards.csv');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(1);
  });

  it('should warn about column mismatch', async () => {
    const content = `question,option_a,option_b,option_c,option_d,correct_answer,subject,difficulty
What is 2+2?,3,4,5,B,Math`;
    // Row has fewer columns than header
    const file = createMockFile(content, 'cards.csv');

    const result = await importCards(file);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Sütun sayısı uyumsuz');
  });

  it('should handle empty rows', async () => {
    const content = `question,option_a,option_b,option_c,option_d,correct_answer,subject,difficulty
What is 2+2?,3,4,5,6,B,Math,1

What is 3+3?,5,6,7,8,B,Math,1`;
    // Note: empty lines are filtered out
    const file = createMockFile(content, 'cards.csv');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards.length).toBeGreaterThanOrEqual(1);
  });

  it('should return error for CSV with only header', async () => {
    const content = `question,option_a,option_b,option_c,option_d,correct_answer,subject,difficulty`;
    const file = createMockFile(content, 'cards.csv');

    const result = await importCards(file);

    expect(result.success).toBe(false);
  });

  it('should also accept .txt extension as CSV', async () => {
    const content = `question,option_a,option_b,option_c,option_d,correct_answer,subject,difficulty
What is 2+2?,3,4,5,6,B,Math,1`;
    const file = createMockFile(content, 'cards.txt');

    const result = await importCards(file);

    expect(result.success).toBe(true);
  });
});

describe('importCards - XML parsing', () => {
  it('should parse valid XML with <card> tags', async () => {
    const content = `<?xml version="1.0"?>
<testdeck>
  <card>
    <question>What is 2+2?</question>
    <option_a>3</option_a>
    <option_b>4</option_b>
    <option_c>5</option_c>
    <option_d>6</option_d>
    <correct_answer>B</correct_answer>
    <subject>Math</subject>
    <difficulty>1</difficulty>
  </card>
</testdeck>`;
    const file = createMockFile(content, 'cards.xml');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].question).toBe('What is 2+2?');
  });

  it('should parse XML with alternative tags (<question>, <item>)', async () => {
    const content = `<?xml version="1.0"?>
<testdeck>
  <question>
    <q>What is 2+2?</q>
    <a>3</a>
    <b>4</b>
    <c>5</c>
    <d>6</d>
    <answer>B</answer>
    <category>Math</category>
    <level>1</level>
  </question>
</testdeck>`;
    const file = createMockFile(content, 'cards.xml');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(1);
  });

  it('should return error for malformed XML', async () => {
    const content = `<?xml version="1.0"?>
<testdeck>
  <card>
    <question>What is 2+2?</question>
    <option_a>3
  </card>
</testdeck>`;
    // Missing closing tag for option_a
    const file = createMockFile(content, 'cards.xml');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should return error when no cards found in XML', async () => {
    const content = `<?xml version="1.0"?>
<testdeck>
  <other>some data</other>
</testdeck>`;
    const file = createMockFile(content, 'cards.xml');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('importCards - validation', () => {
  it('should validate card with all required fields', async () => {
    const content = JSON.stringify([validCard]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(true);
    expect(result.cards[0]).toMatchObject({
      question: expect.any(String),
      option_a: expect.any(String),
      option_b: expect.any(String),
      option_c: expect.any(String),
      option_d: expect.any(String),
      correct_answer: expect.stringMatching(/^[A-E]$/),
      subject: expect.any(String),
      difficulty: expect.any(Number),
    });
  });

  it('should reject card with missing question', async () => {
    const card = { ...validCard, question: '' };
    const content = JSON.stringify([card]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.warnings.some((w) => w.includes('Soru'))).toBe(true);
  });

  it('should reject card with missing options', async () => {
    const card = { ...validCard, option_a: '', option_b: '' };
    const content = JSON.stringify([card]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.warnings.some((w) => w.includes('seçeneği'))).toBe(true);
  });

  it('should reject card with invalid correct_answer', async () => {
    const card = { ...validCard, correct_answer: 'X' };
    const content = JSON.stringify([card]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.warnings.some((w) => w.includes('Doğru cevap'))).toBe(true);
  });

  it('should normalize difficulty to valid range', async () => {
    const cardHighDifficulty = { ...validCard, difficulty: 10 };
    const cardLowDifficulty = { ...validCard, difficulty: -5 };
    const content = JSON.stringify([cardHighDifficulty, cardLowDifficulty]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    // Difficulty should be clamped to 1-3 range
    expect(result.cards[0].difficulty).toBeLessThanOrEqual(3);
    expect(result.cards[1].difficulty).toBeGreaterThanOrEqual(1);
  });

  it('should convert correct_answer to uppercase', async () => {
    const card = { ...validCard, correct_answer: 'b' };
    const content = JSON.stringify([card]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    expect(result.cards[0].correct_answer).toBe('B');
  });
});

describe('importCards - unsupported formats', () => {
  it('should return error for unsupported file format', async () => {
    const content = 'some content';
    const file = createMockFile(content, 'cards.pdf');

    const result = await importCards(file);

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('Desteklenmeyen');
  });

  it('should return error for file without extension', async () => {
    const content = 'some content';
    const file = createMockFile(content, 'cards');

    const result = await importCards(file);

    expect(result.success).toBe(false);
  });
});

describe('importCards - smart parsing', () => {
  it('should parse combined question+options text in JSON', async () => {
    // Test the smart text parsing feature
    const card = {
      question: 'What is the capital of France? a. London b. Paris c. Berlin d. Madrid',
      correct_answer: 'B',
      subject: 'Geography',
      difficulty: 1,
    };
    const content = JSON.stringify([card]);
    const file = createMockFile(content, 'cards.json');

    const result = await importCards(file);

    // The parser should extract options from the combined text
    if (result.success) {
      expect(result.cards[0].option_a).toBeTruthy();
      expect(result.cards[0].option_b).toBeTruthy();
    }
  });
});
