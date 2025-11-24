/**
 * RelicSystem.js
 * Manages the list of relics and their active states.
 */

export const RELICS = {
    RELIC_T_SPIN: {
        id: 'RELIC_T_SPIN',
        name: 'T-스핀 유물',
        description: 'T자 모양(4칸)으로 같은 원소가 모이면 1-빙고로 인정됩니다.',
        icon: '🧩',
        rarity: 'RARE'
    },
    RELIC_L_STEP: {
        id: 'RELIC_L_STEP',
        name: 'L-스텝 유물',
        description: 'L자 모양(4칸)으로 같은 원소가 모이면 1-빙고로 인정됩니다.',
        icon: '👢',
        rarity: 'RARE'
    },
    RELIC_O_BLOCK: {
        id: 'RELIC_O_BLOCK',
        name: 'O-블록 유물',
        description: 'O자 모양(2x2)으로 같은 원소가 모이면 1-빙고로 인정됩니다.',
        icon: '📦',
        rarity: 'RARE'
    },
    RELIC_FIRE_BOOST: {
        id: 'RELIC_FIRE_BOOST',
        name: '화염의 정수',
        description: '불(FIRE) 빙고 발동 시, 무작위 적에게 5의 추가 피해를 입힙니다.',
        icon: '🔥',
        rarity: 'COMMON'
    },
    RELIC_START_SWORD: {
        id: 'RELIC_START_SWORD',
        name: '오래된 검',
        description: '전투 시작 시 검 보너스 +10을 가지고 시작합니다.',
        icon: '🗡️',
        rarity: 'COMMON'
    }
};

export class RelicSystem {
    constructor() {
        // Store acquired relics. For testing, we might want to start with some or all.
        // Structure: { id: boolean (isActive) }
        this.relics = {};

        // Initialize all as inactive for now, or active for testing?
        // Let's initialize all as inactive but available to be toggled.
        Object.values(RELICS).forEach(r => {
            this.relics[r.id] = false;
        });
    }

    getAllRelics() {
        return Object.values(RELICS).map(r => ({
            ...r,
            isActive: this.relics[r.id]
        }));
    }

    isActive(relicId) {
        return !!this.relics[relicId];
    }

    toggleRelic(relicId) {
        if (this.relics[relicId] !== undefined) {
            this.relics[relicId] = !this.relics[relicId];
            console.log(`Relic ${relicId} toggled to ${this.relics[relicId]}`);
            return true;
        }
        return false;
    }

    // Helper to get active relics for logic checks
    getActiveRelicIds() {
        return Object.keys(this.relics).filter(id => this.relics[id]);
    }
}
