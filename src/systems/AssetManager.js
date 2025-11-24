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

            RELIC_START_SWORD: {
                emoji: '⚔️',
                image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M12 52 L52 12 M20 52 L12 60 L4 52 L12 44 Z M44 20 L52 12 L60 20 L52 28 Z" stroke="%239CA3AF" stroke-width="6" stroke-linecap="round"/><path d="M12 52 L52 12" stroke="%23D1D5DB" stroke-width="2"/></svg>',
                color: 'text-gray-300'
            },
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
        if (asset.emoji) {
            const colorClass = asset.color || '';
            return `<span class="text-4xl ${colorClass}">${asset.emoji}</span>`;
        }

        // Fallback for simple string assets (if any remain)
        return `<span class="text-4xl">${asset}</span>`;
    }

    /**
     * Helper to get raw data if needed
     */
    getData(key) {
        return this.assets[key];
    }
}
