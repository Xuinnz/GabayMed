export const checkSafetyNet = (input) => {
    // English & Tagalog keywords for IMMEDIATE EMERGENCY
    // Uses Negative Lookbehind to ignore "No bleeding", "Walang dugo"
    const EMERGENCY_REGEX = [
      /(?<!\b(no|not|without|wala|di|hindi)\s+)\b(unconscious|bleeding|chest pain|stroke|heart attack|dugo|hingal|himatay|baril|saksak)\b/i
    ];
  
    // .some() returns true if any pattern matches
    return EMERGENCY_REGEX.some(pattern => pattern.test(input));
};