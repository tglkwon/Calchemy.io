import Papa from 'papaparse';

/**
 * Parses CSV content into Card Definitions.
 * @param {string} csvText 
 * @returns {Object} CardDefinitions map
 */
export const parseCardCSV = (csvText) => {
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const definitions = {};

                results.data.forEach(row => {
                    // Map CSV columns to Card Definition structure
                    // Assuming CSV columns: ID, Name, Type, Grade, Description, BingoDescription, ...
                    // We need to adapt this based on the actual CSV structure.
                    // For now, I'll map based on the sample structure I saw earlier.

                    if (!row.ID) return; // Skip invalid rows

                    definitions[row.ID] = {
                        id: row.ID,
                        name: row.Name || row.이름,
                        type: mapType(row.Type || row.속성),
                        grade: row.Grade || row.등급,
                        description: row.Description || row.설명,
                        bingoDescription: row.BingoEffect || row.빙고효과,
                        effectParams: parseEffectParams(row.EffectParams || row.효과파라미터)
                    };
                });

                resolve(definitions);
            },
            error: (err) => {
                reject(err);
            }
        });
    });
};

const mapType = (typeStr) => {
    if (!typeStr) return 'FIRE'; // Default
    const t = typeStr.toUpperCase();
    if (t.includes('FIRE') || t.includes('불')) return 'FIRE';
    if (t.includes('EARTH') || t.includes('대지')) return 'EARTH';
    if (t.includes('WATER') || t.includes('물')) return 'WATER';
    if (t.includes('WIND') || t.includes('바람')) return 'WIND';
    return 'FIRE';
};

const parseEffectParams = (paramStr) => {
    if (!paramStr) return {};
    try {
        // Try JSON parse first
        return JSON.parse(paramStr);
    } catch (e) {
        // If not JSON, maybe key:value format? 
        // For now return empty or simple object if needed.
        console.warn("Failed to parse effect params:", paramStr);
        return {};
    }
};
