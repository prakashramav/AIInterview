/**
 * Filters and refines Priya's responses to ensure consistency and a human touch.
 */
function filterCoachResponse(text, recentResponses, session) {
  let filtered = text.trim();

  // 1. BANNED OPENERS
  const bannedMap = {
    "Great job!": "Okay,",
    "Well done!": "Good —",
    "Excellent!": "Alright,",
    "Perfect!": "Hmm,",
    "Wonderful!": "See,",
    "That's correct!": "Right,",
    "As an AI": "Now,",
    "I'm an AI": "Accha,",
    "Certainly!": "Okay,",
    "Absolutely!": "Right,"
  };

  for (const [banned, replacement] of Object.entries(bannedMap)) {
    if (filtered.startsWith(banned)) {
      filtered = filtered.replace(banned, replacement);
    }
  }

  // 2. LENGTH CONTROL
  const sentences = filtered.split(/([.!?])\s+/).filter(s => s.length > 2);
  const isExplanationStep = [2, 3, 11].includes(session.currentStep);

  if (sentences.length > 5 && !isExplanationStep) {
    // Trim to 4 sentences
    filtered = sentences.slice(0, 8).join(' ').trim(); // 4 sentences + their punctuation
  }

  // 3. ENDING CHECK
  if (!filtered.endsWith('?') && !filtered.toLowerCase().includes('try') && !filtered.toLowerCase().includes('repeat')) {
    filtered += " Go ahead and try.";
  }

  // 4. REPETITION GUARD
  if (recentResponses && recentResponses.length > 0) {
    const getWords = (s) => new Set(s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/));
    const newWords = getWords(filtered);
    
    let isTooSimilar = false;
    for (const pastResponse of recentResponses.slice(-2)) {
      const pastWords = getWords(pastResponse);
      const intersection = new Set([...newWords].filter(w => pastWords.has(w)));
      const union = new Set([...newWords, ...pastWords]);
      const overlap = intersection.size / union.size;

      if (overlap > 0.6) {
        isTooSimilar = true;
        break;
      }
    }

    if (isTooSimilar) {
      filtered += " — and remember, try to make it sound natural, like you'd say it in a real conversation.";
    }
  }

  return filtered;
}

module.exports = { filterCoachResponse };
