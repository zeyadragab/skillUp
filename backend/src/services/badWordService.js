/**
 * Bad Word Detection Service
 * Detects offensive/inappropriate language in chat messages.
 * Handles case-insensitivity, leetspeak substitutions, and partial word matches.
 */

// Curated list of offensive/bad words (sanitized for source code — stored as fragments)
const BAD_WORDS = [
  // Profanity
  'fuck', 'fucker', 'fucking', 'fucked', 'fucks',
  'shit', 'shitting', 'shitty', 'bullshit',
  'ass', 'asshole', 'asses',
  'bitch', 'bitches', 'bitching',
  'bastard', 'bastards',
  'cunt', 'cunts',
  'damn', 'damned',
  'hell', // contextual — kept at low severity
  'crap', 'crappy',
  'piss', 'pissed', 'pissing',
  'dick', 'dicks', 'dickhead',
  'cock', 'cocks',
  'pussy', 'pussies',
  'slut', 'sluts',
  'whore', 'whores',
  'motherfucker', 'motherfucking',
  // Hate speech / slurs (high severity triggers)
  'nigger', 'nigga',
  'faggot', 'fag',
  'retard', 'retarded',
  'kike',
  'spic', 'spics',
  'chink', 'chinks',
  'wetback',
  'cracker',
  'dyke',
  // Sexual / explicit
  'porn', 'porno',
  'blowjob', 'handjob',
  'masturbat',  // prefix match covers masturbate/masturbating
  'dildo',
  'rape', 'raping', 'rapist',
  // Violence / threats
  'kill yourself', 'kys',
  'go die',
  'suicide',
];

// High-severity keywords that alone bump severity to 'high'
const HIGH_SEVERITY_KEYWORDS = [
  'nigger', 'nigga', 'faggot', 'kike', 'spic', 'chink', 'wetback',
  'rape', 'raping', 'rapist', 'kill yourself', 'kys', 'go die',
];

/**
 * Normalise a string by reversing common leetspeak substitutions so that
 * detection still fires on things like "f4ck", "sh1t", "a$$hole", etc.
 *
 * Substitutions handled:
 *   @ → a   3 → e   1 → i   0 → o   $ → s   4 → a   5 → s   7 → t
 *   ! → i   ph → f  (ck / k overlap already handled by word list)
 */
function normaliseLeet(text) {
  return text
    .toLowerCase()
    .replace(/@/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/\$/g, 's')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/ph/g, 'f');
}

/**
 * Replace a bad word inside a string with asterisks, keeping the first
 * letter visible: "fuck" → "f***", "shit" → "s***".
 */
function asteriskWord(word) {
  if (word.length <= 1) return '*';
  return word[0] + '*'.repeat(word.length - 1);
}

/**
 * Detect bad words in a message.
 *
 * @param {string} message - Raw chat message text.
 * @returns {{
 *   hasBadWords: boolean,
 *   flaggedWords: string[],
 *   severity: 'low'|'medium'|'high',
 *   cleanedMessage: string
 * }}
 */
export function detectBadWords(message) {
  if (!message || typeof message !== 'string') {
    return { hasBadWords: false, flaggedWords: [], severity: 'low', cleanedMessage: message || '' };
  }

  const normalised = normaliseLeet(message);
  const flaggedWords = [];
  let cleanedMessage = message;
  let hasHighSeverity = false;

  for (const badWord of BAD_WORDS) {
    // Build a regex that:
    //   - is case-insensitive
    //   - matches the bad word as a substring (partial match within longer words)
    //   - uses a word-boundary on the LEFT so "class" doesn't trigger "ass",
    //     but "asshole" still triggers "ass"  (right side intentionally open)
    // For multi-word phrases (e.g. "kill yourself") we skip word boundaries.
    const isPhrase = badWord.includes(' ');
    const pattern = isPhrase
      ? new RegExp(normaliseLeet(badWord).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      : new RegExp(`\\b${normaliseLeet(badWord).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');

    // Test against the normalised message so leet variants are caught,
    // but record/replace against the original so the cleaned message makes sense.
    if (pattern.test(normalised)) {
      flaggedWords.push(badWord);

      if (HIGH_SEVERITY_KEYWORDS.includes(badWord)) {
        hasHighSeverity = true;
      }

      // Replace occurrences in the original message (case-insensitive).
      // We rebuild the regex without the normalised form to operate on original text.
      const originalPattern = isPhrase
        ? new RegExp(badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        : new RegExp(`\\b${badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');

      cleanedMessage = cleanedMessage.replace(originalPattern, (match) => asteriskWord(match));
    }
  }

  const hasBadWords = flaggedWords.length > 0;

  let severity = 'low';
  if (hasHighSeverity || flaggedWords.length >= 4) {
    severity = 'high';
  } else if (flaggedWords.length >= 2) {
    severity = 'medium';
  }

  return { hasBadWords, flaggedWords, severity, cleanedMessage };
}

export default { detectBadWords };
