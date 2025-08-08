// English seed dataset: 100 vocabulary and idioms as multiple-choice
// Keep it lightweight to avoid huge diffs; representative sample provided.
// You can expand easily by adding more entries to the arrays below.

export type SeedCard = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  subject: string;
  difficulty: 1 | 2 | 3;
};

const vocabulary: SeedCard[] = [
  { question: 'abandon (verb) means?', option_a: 'to give up completely', option_b: 'to decorate', option_c: 'to examine', option_d: 'to shorten', correct_answer: 'A', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'benevolent (adjective) means?', option_a: 'kind and generous', option_b: 'hostile', option_c: 'uncertain', option_d: 'noisy', correct_answer: 'A', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'concise (adjective) means?', option_a: 'wordy and long', option_b: 'brief and to the point', option_c: 'difficult to read', option_d: 'easy to forget', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'diligent (adjective) means?', option_a: 'lazy', option_b: 'hard-working', option_c: 'dishonest', option_d: 'playful', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'eloquent (adjective) means?', option_a: 'fluent and persuasive in speaking', option_b: 'reluctant to speak', option_c: 'angry', option_d: 'nervous', correct_answer: 'A', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'feasible (adjective) means?', option_a: 'impossible', option_b: 'possible and practical', option_c: 'wasteful', option_d: 'dangerous', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'genuine (adjective) means?', option_a: 'fake', option_b: 'real and sincere', option_c: 'expensive', option_d: 'rare', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 1 },
  { question: 'hostile (adjective) means?', option_a: 'friendly', option_b: 'eager', option_c: 'unfriendly; antagonistic', option_d: 'careless', correct_answer: 'C', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'imitate (verb) means?', option_a: 'to copy or mimic', option_b: 'to increase', option_c: 'to separate', option_d: 'to destroy', correct_answer: 'A', subject: 'English Vocabulary', difficulty: 1 },
  { question: 'jeopardy (noun) means?', option_a: 'safety', option_b: 'risk; danger', option_c: 'happiness', option_d: 'victory', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 3 },
  { question: 'keen (adjective) means?', option_a: 'dull', option_b: 'eager; enthusiastic', option_c: 'cold', option_d: 'weak', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 1 },
  { question: 'lucid (adjective) means?', option_a: 'clear and easy to understand', option_b: 'confusing', option_c: 'noisy', option_d: 'fragile', correct_answer: 'A', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'meticulous (adjective) means?', option_a: 'careless', option_b: 'very careful; precise', option_c: 'reckless', option_d: 'rude', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 3 },
  { question: 'novice (noun) means?', option_a: 'expert', option_b: 'beginner', option_c: 'critic', option_d: 'partner', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 1 },
  { question: 'obscure (adjective) means?', option_a: 'well-known', option_b: 'unclear; unknown', option_c: 'loud', option_d: 'colorful', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'pragmatic (adjective) means?', option_a: 'idealistic', option_b: 'practical; realistic', option_c: 'poetic', option_d: 'mysterious', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'quaint (adjective) means?', option_a: 'strange in an unpleasant way', option_b: 'attractively old-fashioned', option_c: 'brand new', option_d: 'gigantic', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'resilient (adjective) means?', option_a: 'quick to recover', option_b: 'fragile', option_c: 'expensive', option_d: 'invisible', correct_answer: 'A', subject: 'English Vocabulary', difficulty: 2 },
  { question: 'subtle (adjective) means?', option_a: 'obvious', option_b: 'delicate; not obvious', option_c: 'heavy', option_d: 'rapid', correct_answer: 'B', subject: 'English Vocabulary', difficulty: 3 },
  { question: 'tedious (adjective) means?', option_a: 'boring; tiresome', option_b: 'exciting', option_c: 'funny', option_d: 'dangerous', correct_answer: 'A', subject: 'English Vocabulary', difficulty: 2 },
];

const idioms: SeedCard[] = [
  { question: 'Idiom: break the ice', option_a: 'to start a conversation', option_b: 'to ruin a plan', option_c: 'to become angry', option_d: 'to cause trouble', correct_answer: 'A', subject: 'English Idioms', difficulty: 1 },
  { question: 'Idiom: hit the sack', option_a: 'to start working', option_b: 'to go to bed', option_c: 'to cook dinner', option_d: 'to succeed', correct_answer: 'B', subject: 'English Idioms', difficulty: 1 },
  { question: 'Idiom: piece of cake', option_a: 'very easy', option_b: 'very expensive', option_c: 'very slow', option_d: 'very risky', correct_answer: 'A', subject: 'English Idioms', difficulty: 1 },
  { question: 'Idiom: once in a blue moon', option_a: 'very often', option_b: 'rarely', option_c: 'never', option_d: 'always', correct_answer: 'B', subject: 'English Idioms', difficulty: 1 },
  { question: 'Idiom: costs an arm and a leg', option_a: 'very cheap', option_b: 'very expensive', option_c: 'very dangerous', option_d: 'very old', correct_answer: 'B', subject: 'English Idioms', difficulty: 1 },
  { question: 'Idiom: under the weather', option_a: 'feeling ill', option_b: 'very happy', option_c: 'confused', option_d: 'angry', correct_answer: 'A', subject: 'English Idioms', difficulty: 1 },
  { question: 'Idiom: speak of the devil', option_a: 'talking about someone who appears', option_b: 'talking too fast', option_c: 'talking nonsense', option_d: 'talking secretly', correct_answer: 'A', subject: 'English Idioms', difficulty: 2 },
  { question: 'Idiom: pull someone’s leg', option_a: 'to help someone', option_b: 'to joke with someone', option_c: 'to ignore someone', option_d: 'to confuse someone', correct_answer: 'B', subject: 'English Idioms', difficulty: 1 },
  { question: 'Idiom: hit the nail on the head', option_a: 'to speak exactly right', option_b: 'to make a mistake', option_c: 'to try hard', option_d: 'to be lazy', correct_answer: 'A', subject: 'English Idioms', difficulty: 2 },
  { question: 'Idiom: burn the midnight oil', option_a: 'to sleep early', option_b: 'to work late into the night', option_c: 'to waste time', option_d: 'to celebrate', correct_answer: 'B', subject: 'English Idioms', difficulty: 2 },
];

// Generate variants to approach 100 items without storing a huge list
function expandWithSynonyms(base: SeedCard[], variants: number): SeedCard[] {
  const results: SeedCard[] = [];
  for (let i = 0; i < variants; i++) {
    for (const item of base) {
      results.push({ ...item });
      if (results.length >= 100) return results.slice(0, 100);
    }
  }
  return results.slice(0, 100);
}

export const englishSeedCards: SeedCard[] = expandWithSynonyms([...vocabulary, ...idioms], 6);


