/**
 * Parses raw effect text into executable game effect objects.
 * @param {string} text - The effect description (e.g., "Deal 5 damage.")
 * @returns {Array<Object>} - Array of effect objects.
 */
export const parseEffectText = (text) => {
    if (!text) return [];

    const effects = [];
    // Split multiple sentences if needed, simplistic approach for now
    const sentences = text.split('.').map(s => s.trim()).filter(s => s.length > 0);

    sentences.forEach(sentence => {
        let matched = false;

        // Regex Patterns
        const patterns = [
            {
                // "Deal 5 damage", "Deal 10 damage to all enemies"
                regex: /Deal (\d+) damage(?: to (all enemies))?/i,
                handler: (match) => ({
                    type: 'DAMAGE',
                    value: parseInt(match[1], 10),
                    target: match[2] === 'all enemies' ? 'ALL_ENEMIES' : 'ENEMY'
                })
            },
            {
                // "Gain 5 Block"
                regex: /Gain (\d+) Block/i,
                handler: (match) => ({
                    type: 'BLOCK',
                    value: parseInt(match[1], 10),
                    target: 'SELF'
                })
            },
            {
                // "Heal 3 HP"
                regex: /Heal (\d+) HP/i,
                handler: (match) => ({
                    type: 'HEAL',
                    value: parseInt(match[1], 10),
                    target: 'SELF'
                })
            },
            {
                // "Apply 2 Weak"
                regex: /Apply (\d+) (.+)/i,
                handler: (match) => ({
                    type: 'APPLY_STATUS',
                    value: parseInt(match[1], 10),
                    status: match[2].trim(),
                    target: 'ENEMY'
                })
            },
            {
                // "Draw 1 card"
                regex: /Draw (\d+) card/i,
                handler: (match) => ({
                    type: 'DRAW',
                    value: parseInt(match[1], 10),
                    target: 'SELF'
                })
            },
            {
                // "Next turn gain 1 Energy"
                regex: /Next turn gain (\d+) Energy/i,
                handler: (match) => ({
                    type: 'GAIN_ENERGY',
                    value: parseInt(match[1], 10),
                    target: 'SELF',
                    timing: 'NEXT_TURN'
                })
            }
        ];

        for (const pattern of patterns) {
            const match = sentence.match(pattern.regex);
            if (match) {
                effects.push(pattern.handler(match));
                matched = true;
                break;
            }
        }

        if (!matched) {
            console.warn(`[TextParser] Unparsed sentence: "${sentence}"`);
            effects.push({ type: 'UNPARSED', raw: sentence });
        }
    });

    return effects;
};

/**
 * Extracts keywords enclosed in curly braces, e.g., "{Burn}".
 * @param {string} text 
 * @returns {Array<string>} - List of keyword IDs or Names.
 */
export const parseKeywords = (text) => {
    if (!text) return [];
    const regex = /\{([^}]+)\}/g;
    const keywords = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        keywords.push(match[1]);
    }
    return keywords;
};

/**
 * Attempts to parse a JSON-like string from the "Logic" columns of the CSV.
 * Handles potential formatting quirks if necessary.
 * @param {string} logicString 
 * @returns {Object|null} Parsed object or null if invalid.
 */
export const parseLogicString = (logicString) => {
    if (!logicString || typeof logicString !== 'string') return null;

    try {
        // First try standard JSON parse
        return JSON.parse(logicString);
    } catch {
        // If standard parse fails, try to be more lenient if needed
        // For now, just logging the failure and returning null to trigger fallback
        // console.warn("[TextParser] JSON Parse Failed (using text fallback):", logicString);
        return null;
    }
};
