import gameData from '../generated/gameData.json';

export class RelicSystem {
    constructor() {
        this.relicDefinitions = gameData.artifacts || [];
        this.relics = {}; // { id: boolean }

        // Initialize all as inactive
        this.relicDefinitions.forEach(r => {
            this.relics[r.id] = false;
        });

        // Map for quick lookup by ID or ArtifactID?
        // CSV has 'id' (No) and 'artifactId' (ART_GREED).
        // Let's support lookup by artifactId for code readability.
        this.relicMap = {};
        this.relicDefinitions.forEach(r => {
            if (r.artifactId) this.relicMap[r.artifactId] = r;
            this.relicMap[r.id] = r; // Fallback
        });
    }

    getAllRelics() {
        return this.relicDefinitions.map(r => ({
            ...r,
            isActive: !!this.relics[r.id] || !!this.relics[r.artifactId]
        }));
    }

    isActive(relicId) {
        // Check both ID and CodeName
        if (this.relics[relicId]) return true;
        // Maybe relicId is the code name? find the internal ID?
        // Our storage uses 'r.id' (numeric likely).
        // If toggleRelic uses 'ART_GREED', we need to map it.
        const def = this.relicMap[relicId];
        if (def) return !!this.relics[def.id];
        return false;
    }

    toggleRelic(relicId) {
        // Resolve ID
        const def = this.relicMap[relicId];
        if (!def) {
            console.warn(`Relic definitions not found for ${relicId}`);
            return false;
        }

        const internalId = def.id;
        this.relics[internalId] = !this.relics[internalId];
        console.log(`Relic ${def.name} (${relicId}) toggled to ${this.relics[internalId]}`);
        return true;
    }

    getActiveRelicIds() {
        return Object.keys(this.relics).filter(id => this.relics[id]);
    }

    /**
     * Checks all active relics for a specific trigger condition.
     * @param {string} trigger - e.g. "TurnStart", "BattleStart"
     * @param {object} context - context data (optional)
     * @returns {Array} List of active relics matching the trigger
     */
    getRelicsByTrigger(trigger) {
        return this.relicDefinitions.filter(r => {
            return (this.relics[r.id] && r.triggerCondition === trigger);
        });
    }

    /**
     * Get random relics for treasure chest selection
     * @param {number} count - Number of random relics to select
     * @returns {Array} Array of random relic definitions
     */
    getRandomRelics(count = 3) {
        // Filter out already active relics
        const availableRelics = this.relicDefinitions.filter(r => !this.relics[r.id]);

        if (availableRelics.length === 0) {
            console.warn('No available relics to offer');
            return [];
        }

        // Shuffle and take count items
        const shuffled = [...availableRelics].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    /**
     * Activate a relic (set to active without toggling)
     * @param {string} relicId - ID or artifactId of the relic
     * @returns {boolean} Success status
     */
    activateRelic(relicId) {
        const def = this.relicMap[relicId];
        if (!def) {
            console.warn(`Relic not found: ${relicId}`);
            return false;
        }

        this.relics[def.id] = true;
        console.log(`Relic ${def.name} activated`);
        return true;
    }
}

