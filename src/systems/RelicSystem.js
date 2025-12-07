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
}

