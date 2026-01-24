/**
 * RewardSystem.js
 * 
 * Manages the generation and logic for post-battle rewards.
 * Handles Gold (2x), Card Draft (3-pick-1), Relics, and Potions.
 */

export class RewardSystem {
    constructor() {
        // Rarity Weights
        this.rarityWeights = {
            'COMMON': 60,
            'RARE': 30,
            'LEGENDARY': 10
        };

        // Constants
        this.GOLD_MULTIPLIER = 2;

        // Base Gold Ranges (Before Multiplier)
        this.goldRanges = {
            'NORMAL': { min: 10, max: 25 },
            'ELITE': { min: 30, max: 60 },
            'BOSS': { min: 100, max: 150 }
        };
    }

    /**
     * Generates a reward object based on the context.
     * @param {Object} context - { type: 'NORMAL'|'ELITE'|'BOSS', gameData: { cards, artifacts, potions }, seed: number }
     * @returns {Object} Reward State Object
     */
    generateRewards(context) {
        const { type, gameData } = context;
        const rewards = {
            gold: 0,
            cards: [],
            relics: [],
            potions: [],
            isBossReward: type === 'BOSS', // Flag for multi-stage UI
            isClaimed: {
                gold: false,
                cards: false,
                relics: false, // Boss Relic will use this too
                potions: false
            }
        };

        // 1. Gold Reward (2x logic applied here)
        const range = this.goldRanges[type] || this.goldRanges['NORMAL'];
        const baseGold = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        rewards.gold = baseGold * this.GOLD_MULTIPLIER;

        // 2. Card Reward (Draft 3)
        // Adjust rarity weights based on monster type (e.g., Elite has higher rare chance)
        // For MVP, we use static weights, but maybe boost for Elite.
        let currentWeights = { ...this.rarityWeights };
        if (type === 'ELITE') {
            currentWeights.COMMON = 40;
            currentWeights.RARE = 40;
            currentWeights.LEGENDARY = 20;
        } else if (type === 'BOSS') {
            currentWeights.COMMON = 0;
            currentWeights.RARE = 0;
            currentWeights.LEGENDARY = 100; // Boss always gives Legendary
        }

        if (gameData && gameData.cards) {
            rewards.cards = this.rollCards(gameData.cards, 3, currentWeights);
        }

        // 3. Relic Reward
        // Elite/Boss gives Relic choice
        if (type === 'ELITE' || type === 'BOSS') {
            if (gameData && gameData.artifacts) {
                // Pick 3 random relics (that player doesn't have - requires knowing possessed relics, passed in context ideally)
                // For now, simple random pick from pool
                rewards.relics = this.pickRandom(gameData.artifacts, 3);
            }
        }

        // 4. Potion Reward
        // Chance to drop potion: Normal 30%, Elite 60%, Boss 100% (?)
        const potionChance = type === 'NORMAL' ? 0.3 : (type === 'ELITE' ? 0.6 : 1.0);
        if (Math.random() < potionChance) {
            if (gameData && gameData.potions) {
                rewards.potions = this.pickRandom(gameData.potions, 1);
            }
        }

        return rewards;
    }

    rollCards(pool, count, weights) {
        const results = [];
        for (let i = 0; i < count; i++) {
            const rarity = this.pickRarity(weights);
            // Filter pool by rarity (Assuming card objects have 'rarity' field, if not, pick random)
            // If data doesn't support rarity yet, just pick random.
            // Let's assume pool is simple array for now.
            // Optimized: Create sub-pools.

            // For MVP, since we might not have reliable rarity in CSV yet, just random.
            // Or try to match if possible.
            const candidate = pool[Math.floor(Math.random() * pool.length)];
            // Clone to avoid reference issues
            results.push({ ...candidate, instanceId: `reward_card_${Date.now()}_${i}` });
        }
        return results;
    }

    pickRarity(weights) {
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        for (const [rarity, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) return rarity;
        }
        return 'COMMON';
    }

    pickRandom(array, count) {
        if (!array || array.length === 0) return [];
        return [...array].sort(() => Math.random() - 0.5).slice(0, count);
    }
}
