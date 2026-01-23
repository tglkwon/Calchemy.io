/**
 * EffectSystem.js
 * 
 * Manages the definition, mapping, and execution of game effects.
 * Acts as the "Registry" for all potential actions in the game.
 */

// 1. Effect Types (Internal Constants)
export const EffectType = {
    ATTACK: 'ATTACK',
    HEAL: 'HEAL',
    BLOCK: 'BLOCK',
    BUFF: 'BUFF',
    DEBUFF: 'DEBUFF',
    GAIN_ENERGY: 'GAIN_ENERGY',
    SPECIAL: 'SPECIAL',
    GRID_MANIPULATION: 'GRID_MANIPULATION',
    EVENT_GAIN_GOLD: 'EVENT_GAIN_GOLD',
    EVENT_LOSE_HP: 'EVENT_LOSE_HP',
    EVENT_HEAL_PAID: 'EVENT_HEAL_PAID',
    // Add more as needed
    NONE: 'NONE'
};

// 2. Korean Key Mapping (For parsing JSON logic from CSV)
export const KoreanLogicMap = {
    "공격": EffectType.ATTACK,
    "회복": EffectType.HEAL,
    "방어": EffectType.BLOCK,
    "버프": EffectType.BUFF,
    "디버프": EffectType.DEBUFF,
    "드로우": EffectType.DRAW,
    "특수": EffectType.SPECIAL
};

/**
 * Maps a raw Korean key from CSV Logic to an internal EffectType.
 * @param {string} key 
 * @returns {string} EffectType or EffectType.SPECIAL if unknown.
 */
export const mapKoreanKeyToEffectType = (key) => {
    return KoreanLogicMap[key] || EffectType.SPECIAL;
};

/**
 * Executes a single effect.
 * This is a stub implementation that logs the action.
 * In the future, this will modify the GameState directly.
 * 
 * @param {Object} effect - { type, value, target, ... }
 * @param {Object} gameState - Current game state (optional for now)
 * @param {Object} target - Target unit (optional for now)
 */
/**
 * Executes a single effect on the game state.
 * @param {Object} effect - { type, value, target, ... }
 * @param {Object} gameState - Container with { golem, minions, engine }
 * @param {Object} targetUnit - Explicit target unit (optional)
 * @returns {string|null} Log message or null
 */
export const executeEffect = (effect, gameState, targetUnit = null) => {
    if (!effect || !effect.type) return null;
    if (!gameState) return null;

    const { golem, minions, engine } = gameState;
    let logMsg = null;

    // Helper to get random alive target if none provided
    const getTarget = () => {
        if (targetUnit) return targetUnit;
        const aliveMinions = minions.filter(m => m.isAlive);
        if (aliveMinions.length === 0) return null;
        return aliveMinions[Math.floor(Math.random() * aliveMinions.length)];
    };

    switch (effect.type) {
        case EffectType.ATTACK: {
            const target = getTarget();
            if (target && target.isAlive) {
                const dmg = effect.value || 0;
                // If value is string like "2^4", it should have been handled by caller or calc engine. 
                // For now assuming simple numbers for MVP.
                const actualDmg = target.takeDamage(dmg);

                // Track total damage in golem (optional, based on legacy engine logic)
                if (golem) golem.totalDamageThisTurn += actualDmg;

                logMsg = `⚔️ 공격: ${target.name}에게 ${actualDmg} 피해`;
            } else {
                logMsg = `⚔️ 공격: 대상이 없습니다.`;
            }
            break;
        }

        case EffectType.HEAL: {
            // Usually heals Golem
            if (golem && golem.isAlive) {
                const amount = effect.value || 0;
                const healed = golem.heal(amount);
                logMsg = `💧 회복: 골렘 체력 +${healed}`;
            }
            break;
        }

        case EffectType.BLOCK: {
            if (golem && golem.isAlive) {
                const amount = effect.value || 0;
                golem.addBlock(amount);
                logMsg = `🛡️ 방어: 골렘 방어도 +${amount}`;
            }
            break;
        }

        case EffectType.BUFF: {
            // Assuming "value" is the amount, but what buff?
            // CSV might say "공격력 25% 증가" -> Parser might fail or handle specifically.
            // For now, simple attack buff support
            if (golem) {
                golem.attackBuffs = (golem.attackBuffs || 0) + 1;
                logMsg = `💪 버프: 골렘 공격력 증가`;
            }
            break;
        }

        case EffectType.DRAW: {
            if (engine) {
                // engine.drawCard(); // If engine has this method
                logMsg = `🃏 드로우: (미구현)`;
            }
            break;
        }

        // --- Event Specific Effects ---
        case EffectType.EVENT_GAIN_GOLD: {
            if (engine) {
                engine.addGold(effect.value);
                logMsg = `💰 골드 획득: +${effect.value}`;
            }
            break;
        }

        case EffectType.EVENT_LOSE_HP: {
            if (golem && golem.isAlive) {
                const dmg = effect.value || 0;
                // Direct HP reduction, not blockable? Usually events are direct damage.
                // Using takeDamage might trigger block. 
                // If we want "Lose HP" (unblockable), we modify hp directly or use a specific method.
                // For now, let's use takeDamage for consistency, or check if we need unblockable.
                // Slay the Spire "Lose HP" ignores block.
                golem.hp -= dmg;
                if (golem.hp < 0) golem.hp = 0;
                logMsg = `💔 체력 손실: -${dmg}`;
            }
            break;
        }

        case EffectType.EVENT_HEAL_PAID: {
            // value = heal amount, cost = gold cost
            if (engine && golem && golem.isAlive) {
                if (engine.gold >= effect.cost) {
                    engine.addGold(-effect.cost);
                    const healed = golem.heal(effect.value);
                    logMsg = `✨ 치료 완료: 체력 +${healed} (골드 -${effect.cost})`;
                } else {
                    logMsg = `❌ 골드 부족!`;
                }
            }
            break;
        }

        default:
            // console.warn(`Unimplemented effect type: ${effect.type}`);
            break;
    }

    return logMsg;
};

/**
 * Standardizes a logic object (from CSV JSON) into an internal Effect object.
 * @param {Object} rawLogic - e.g. { "공격": 5 } or { "회복": 2 }
 * @returns {Array<Object>}
 */
export const normalizeLogic = (rawLogic) => {
    if (!rawLogic) return [];

    return Object.entries(rawLogic).map(([key, value]) => {
        const type = mapKoreanKeyToEffectType(key);
        return {
            type,
            value: value, // Can be number or string (e.g. "B_ATTACK")
            rawKey: key
        };
    });
};
