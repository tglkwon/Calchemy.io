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
            'INTENT_ATTACK': { emoji: '⚔️', color: 'text-red-500' },
            'INTENT_DEFEND': { emoji: '🛡️', color: 'text-blue-500' },
            'INTENT_BUFF': { emoji: '💪', color: 'text-yellow-500' },

            // Relics (using emoji for now as fallback)
            'RELIC_T_SPIN': { emoji: '🧩', color: 'text-purple-400' },
            'RELIC_L_STEP': { emoji: '👢', color: 'text-orange-400' },
            'RELIC_O_BLOCK': { emoji: '📦', color: 'text-yellow-400' },
            'RELIC_FIRE_BOOST': { emoji: '🔥', color: 'text-red-500' },
            'RELIC_START_SWORD': { emoji: '🗡️', color: 'text-gray-300' },
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
     * Returns the asset data for the given key.
     * @param {string} key 
     * @returns {object} { type: 'emoji'|'image', content: string, color?: string }
     */
    get(key) {
        const asset = this.assets[key];
        if (!asset) return { type: 'text', content: '?' };

        if (this.mode === 'IMAGE' && asset.image) {
            return { type: 'image', content: asset.image };
        }

        return { type: 'emoji', content: asset.emoji || '?', color: asset.color };
    }
}
