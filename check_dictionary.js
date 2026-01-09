import words from 'an-array-of-english-words';

const checkWords = ['done', 'rose', 'test', 'hello'];
const wordSet = new Set(words);

console.log('Total words:', words.length);
checkWords.forEach(word => {
    console.log(`Word '${word}' exists:`, wordSet.has(word));
});

// Check case sensitivity
console.log(`Word 'DONE' (uppercase) exists in raw list:`, words.includes('DONE'));
console.log(`Word 'done' (lowercase) exists in raw list:`, words.includes('done'));
