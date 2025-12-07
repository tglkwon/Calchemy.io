import Papa from 'papaparse';

/**
 * Loads and parses a CSV file from the given path.
 * @param {string} filePath - Relative or absolute path to the CSV file.
 * @returns {Promise<Array>} - Resolves with an array of objects.
 */
export const loadCSV = async (filePath) => {
    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};

/**
 * Loads all game data (cards, keywords, artifacts).
 * @returns {Promise<Object>} - Object containing parsed data arrays.
 */
export const loadGameData = async () => {
    try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const [cards, keywords, artifacts, potions] = await Promise.all([
            loadCSV(`${baseUrl}data/연금술 오토 배틀러 컨텐츠 - 카드.csv`),
            loadCSV(`${baseUrl}data/연금술 오토 배틀러 컨텐츠 - 키워드.csv`),
            loadCSV(`${baseUrl}data/연금술 빙고 유물.csv`),
            loadCSV(`${baseUrl}data/연금술 빙고 포션.csv`),
        ]);

        console.log("Game Data Loaded:", { cards, keywords, artifacts, potions });
        return { cards, keywords, artifacts, potions };
    } catch (error) {
        console.error("Failed to load game data:", error);
        return { cards: [], keywords: [], artifacts: [] }; // Fallback
    }
};
