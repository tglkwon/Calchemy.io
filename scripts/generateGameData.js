import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

// Helper for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const DATA_DIR = path.join(__dirname, '../public/data');
const OUTPUT_DIR = path.join(__dirname, '../src/generated');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'gameData.json');

// Manual Definitions
import { CardDefinitions } from '../src/systems/CardDefinitions.js';

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Logic Mapping
const KoreanLogicMap = {
    "공격": "ATTACK",
    "회복": "HEAL",
    "방어": "BLOCK",
    "버프": "BUFF",
    "디버프": "DEBUFF",
    "드로우": "DRAW",
    "특수": "SPECIAL"
};

const KoreanElementMap = {
    "불": "FIRE",
    "물": "WATER",
    "흙": "EARTH",
    "바람": "WIND"
};

// --- Parsers ---

function parseLogicString(logicString) {
    if (!logicString || typeof logicString !== 'string') return null;
    try {
        return JSON.parse(logicString);
    } catch (e) {
        return null;
    }
}

function normalizeLogic(effectObj) {
    if (!effectObj) return [];
    if (Array.isArray(effectObj)) return effectObj;

    const normalized = [];
    for (const [key, value] of Object.entries(effectObj)) {
        const type = KoreanLogicMap[key] || key;
        if (typeof value === 'object' && value !== null) {
            normalized.push({ type, ...value });
        } else {
            normalized.push({ type, value });
        }
    }
    return normalized;
}

function parseEffectText(text) {
    if (!text) return [];
    const effects = [];

    if (text.includes("피해")) {
        const match = text.match(/(\d+)\s*피해/);
        if (match) effects.push({ type: 'ATTACK', value: parseInt(match[1]) });
    }
    if (text.includes("방어도")) {
        const match = text.match(/방어도\s*(\d+)/) || text.match(/(\d+)\s*방어도/);
        if (match) effects.push({ type: 'BLOCK', value: parseInt(match[1]) });
    }
    if (text.includes("회복")) {
        const match = text.match(/(\d+)\s*회복/);
        if (match) effects.push({ type: 'HEAL', value: parseInt(match[1]) });
    }

    return effects;
}


// --- Main Loader ---

async function loadAndProcessCSV(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found: ${filePath}`);
        return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });

    return data;
}

async function generate() {
    console.log("Starting Build-Time Data Generation...");

    try {
        // 1. Load CSVs
        const cardData = await loadAndProcessCSV('연금술 오토 배틀러 컨텐츠 - 카드.csv');
        const keywordDataRaw = await loadAndProcessCSV('연금술 오토 배틀러 컨텐츠 - 키워드.csv');
        const keywordData = keywordDataRaw.filter(k => k.No !== "고유 번호" && k.No !== "No" && k.No !== undefined);
        const artifactData = await loadAndProcessCSV('연금술 오토 배틀러 컨텐츠 - 유물.csv');
        const potionData = await loadAndProcessCSV('연금술 오토 배틀러 컨텐츠 - 포션.csv');
        const enhancementData = await loadAndProcessCSV('연금술 오토 배틀러 컨텐츠 - 강화.csv');
        const eventData = await loadAndProcessCSV('연금술 오토 배틀러 컨텐츠 - 이벤트.csv');

        // 2. Process Cards
        const processedCards = cardData.map(rawCard => {
            const id = String(rawCard['No.'] || rawCard['No'] || rawCard.id);
            const element = rawCard.Element;
            const card = {
                id: id,
                name: rawCard.Name,
                grade: rawCard.Rarity,
                element: element,
                type: KoreanElementMap[element] || "NONE", // Normalize type based on element
                description: rawCard.Single_Desc,
                bingoDescription: rawCard.Bingo_Desc,
                cost: rawCard.Cost || 0,
            };

            let singleEffects = [];
            const singleJson = parseLogicString(rawCard.Single_Logic);
            if (singleJson) {
                singleEffects = normalizeLogic(singleJson);
            } else {
                singleEffects = parseEffectText(rawCard.Single_Desc);
            }
            card.singleEffects = singleEffects;

            let bingoEffects = [];
            const bingoJson = parseLogicString(rawCard.Bingo_Logic);
            if (bingoJson) {
                bingoEffects = normalizeLogic(bingoJson);
            } else {
                bingoEffects = parseEffectText(rawCard.Bingo_Desc);
            }
            card.bingoEffects = bingoEffects;

            return card;
        }).filter(c => c.id !== "undefined" && c.id !== "번호" && c.id !== "No" && c.id !== "No.");

        // 3. Process Artifacts (Relics)
        const processedArtifacts = artifactData.map(raw => {
            return {
                id: String(raw.No || raw.Artifact_ID),
                artifactId: raw.Artifact_ID || `ART_${raw.No}`,
                name: raw.Name_KR || raw.Name,
                rarity: raw.Rarity,
                passiveKey: raw.Passive_Key,
                triggerCondition: raw.Trigger_Cond,
                description: raw.Description
            };
        }).filter(a => a.id !== "undefined" && a.id !== "고유 번호" && a.id !== "No");

        // 4. Process Potions
        const processedPotions = potionData.map(raw => {
            return {
                id: String(raw.No),
                potionId: raw.Potion_ID,
                name: raw.Name_KR,
                rarity: raw.Rarity,
                effectKey: raw.Effect_Key,
                effectValue: raw.Effect_Value,
                price: raw.Gold_Price,
                description: raw.Description
            };
        }).filter(p => p.id !== "undefined" && p.id !== "고유 번호" && p.id !== "No");

        // 5. Process Enhancements
        const processedEnhancements = enhancementData.map(raw => {
            return {
                id: String(raw.No),
                name: raw.Name,
                type: raw.Type,
                field: raw.Field,
                value: raw.Value,
                description: raw.Description,
                icon: raw.Icon
            };
        }).filter(e => e.id !== "undefined" && e.id !== "No");

        // 6. Process Events
        let lastRange = "모든 막"; // Default fallback
        const processedEvents = eventData.map(raw => {
            // Handle merged cells (empty range inherits from previous)
            let range = raw['등장 구간'];
            if (range && range.trim() !== "" && range !== "-") {
                lastRange = range;
            } else {
                range = lastRange;
            }

            const name = raw['이벤트명'];
            if (!name) return null; // Skip invalid rows

            return {
                id: `EVENT_${name}`, // Simple ID generation
                name: name,
                range: range,
                summary: raw['주요 선택지 및 효과'],
                // Attempt to parse simple choices if delimiters exist
                choices: raw['주요 선택지 및 효과'] ? raw['주요 선택지 및 효과'].split(/ \/ | 또는 | vs /).map(s => s.trim()) : [],
                condition: raw['특이사항 / 등장 조건'] || "-"
            };
        }).filter(e => e !== null);

        // 6. Merge with Manual Definitions
        const mergedCards = processedCards.map(csvCard => {
            const manualDef = CardDefinitions[csvCard.id];
            if (manualDef) {
                const merged = { ...csvCard, ...manualDef };
                // Ensure CSV element still dictates the type if it was set
                if (csvCard.element && csvCard.type !== "NONE") {
                    merged.type = csvCard.type;
                }
                return merged;
            }
            return csvCard;
        });

        // Add missing manual definitions
        Object.values(CardDefinitions).forEach(manualCard => {
            const exists = mergedCards.find(c => c.id === manualCard.id);
            if (!exists) {
                mergedCards.push(manualCard);
            }
        });

        // 6. Construct Final Data Object
        const finalData = {
            cards: mergedCards,
            keywords: keywordData,
            artifacts: processedArtifacts,
            potions: processedPotions,
            enhancements: processedEnhancements,
            events: processedEvents,
            generatedAt: new Date().toISOString()
        };

        // 7. Write to File
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2), 'utf8');
        console.log(`Successfully generated game data to ${OUTPUT_FILE}`);
        console.log(`Total Cards: ${mergedCards.length}`);
        console.log(`Total Artifacts: ${processedArtifacts.length}`);
        console.log(`Total Potions: ${processedPotions.length}`);
        console.log(`Total Events: ${processedEvents.length}`);

    } catch (error) {
        console.error("Error generating game data:", error);
        process.exit(1);
    }
}

generate();
