/**
 * Manages the 12-step progression logic for the English coach sessions.
 */
function shouldAdvanceStep(aiResponse) {
  const triggers = [
    "let's move", 
    "let's go to", 
    "next step", 
    "moving on", 
    "let's try something", 
    "good, now",
    "accha, let's",
    "alright, let's"
  ];
  
  const text = aiResponse.toLowerCase();
  return triggers.some(trigger => text.includes(trigger));
}

/**
 * Returns a description for a given step number.
 */
function getStepDescription(stepNumber) {
  const steps = {
    1: "Introduction to today's topic",
    2: "Explain the concept with examples",
    3: "Demonstrate correct vs incorrect usage",
    4: "Guided practice (you give a prompt, they respond)",
    5: "Correction and feedback on Step 4",
    6: "Free practice (open conversation on the topic)",
    7: "Grammar focus (one specific rule from the lesson)",
    8: "Pronunciation tip (one word or phrase)",
    9: "Real-world scenario roleplay",
    10: "Evaluation of the roleplay",
    11: "Summary of what was learned today",
    12: "Preview of tomorrow's lesson + encouragement"
  };
  return steps[stepNumber] || "Lesson in progress";
}

module.exports = { shouldAdvanceStep, getStepDescription };
