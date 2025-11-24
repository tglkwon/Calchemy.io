/**
 * AssetManager.js
 * Handles storage and retrieval of game assets (Images vs Emojis).
 */

export class AssetManager {
    constructor() {
        this.mode = 'EMOJI'; // 'EMOJI' or 'IMAGE'
        this.assets = {
            // Elements
            'FIRE': { emoji: '🔥', image: 'assets/images/card_fire.png', color: 'text-red-500' },
            'EARTH': { emoji: '🌱', image: 'assets/images/card_earth.png', color: 'text-green-500' },
            'WATER': { emoji: '💧', image: 'assets/images/card_water.png', color: 'text-blue-500' },
            'WIND': { emoji: '🍃', image: 'assets/images/card_wind.png', color: 'text-gray-300' },

            // Units
            'GOLEM': { emoji: '🗿', image: 'assets/images/golem.png' },
            'MINION_1': { emoji: '👾', image: 'assets/images/minion_1.png' },
            'MINION_2': { emoji: '💀', image: 'assets/images/minion_2.png' },
            'MINION_3': { emoji: '👿', image: 'assets/images/minion_3.png' },

            // Intents
            'INTENT_ATTACK': { emoji: '⚔️', image: null },
            'INTENT_DEFEND': { emoji: '🛡️', image: null },
            'INTENT_BUFF': { emoji: '💪', image: null },
        };
    }

    /**
     * Toggles the asset mode between EMOJI and IMAGE.
     * @returns {string} The new mode.
     */
    toggleMode() {
        this.mode = this.mode === 'EMOJI' ? 'IMAGE' : 'EMOJI';
        console.log(`Asset Mode switched to: ${this.mode}`);
        return this.mode;
    }

    /**
     * Returns the asset for the given key based on current mode.
     * @param {string} key - The asset key (e.g., 'FIRE', 'GOLEM').
     * @returns {string|object} The emoji string or image path.
     */
    get(key) {
        const asset = this.assets[key];
        if (!asset) return '?';

        if (this.mode === 'IMAGE' && asset.image) {
            return `<img src="${asset.image}" alt="${key}" class="w-full h-full object-contain drop-shadow-md">`;
        }

        // Default to Emoji with color class if available
        const colorClass = asset.color || '';
        return `<span class="text-4xl ${colorClass}">${asset.emoji}</span>`;
    }

    /**
     * Helper to get raw data if needed
     */
    getData(key) {
        return this.assets[key];
    }
}
