/**
 * Filters AI responses to enforce personality rules and avoid repetition.
 */
function filterInterviewResponse(text, recentResponses) {
  let filtered = text.trim();

  // 1. BANNED OPENERS
  const banned = [
    "Great!", "Excellent!", "Great question!", 
    "That's a great", "Absolutely!", "Certainly!", 
    "Of course!", "Sure!", "As an AI", "I'm an AI",
    "I don't have", "Thank you for"
  ];

  const replacements = [
    "Okay so —", "Right,", "Hmm,", 
    "Got it —", "Yeah,", "Alright,", "Interesting,",
    "Fair enough —", "Nice."
  ];

  for (const phrase of banned) {
    if (filtered.startsWith(phrase)) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      filtered = filtered.replace(phrase, replacement);
      break; // Only replace the first one found
    }
  }

  // 2. REPETITION CHECK (Overlap comparison)
  if (recentResponses && recentResponses.length > 0) {
    const getWords = (s) => new Set(s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/));
    const newWords = getWords(filtered);
    
    let isTooSimilar = false;
    for (const pastResponse of recentResponses) {
      const pastWords = getWords(pastResponse);
      const intersection = new Set([...newWords].filter(w => pastWords.has(w)));
      const union = new Set([...newWords, ...pastWords]);
      const overlap = intersection.size / union.size;

      if (overlap > 0.65) {
        isTooSimilar = true;
        break;
      }
    }

    if (isTooSimilar) {
      console.warn('[AI] High repetition detected, appending different angle.');
      filtered += " — actually, let me push a bit further on that. What happens when we consider the trade-offs here?";
    }
  }

  // 3. SENTENCE LIMIT
  const sentences = filtered.split(/([.!?])\s+/).filter(s => s.length > 2);
  // Simple check for explanation (looking for code blocks or common technical keywords)
  const isExplanation = filtered.includes('```') || filtered.includes('const ') || filtered.includes('function');
  
  if (sentences.length > 4 && !isExplanation) {
    // Reconstruct first 3 sentences
    const limited = sentences.slice(0, 6).join(' '); // Sentences + their punctuation
    filtered = limited;
  }

  return filtered;
}

module.exports = { filterInterviewResponse };
