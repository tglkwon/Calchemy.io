/**
 * KeywordSystem.js
 * Centralizes the logic for executing game effects (Keywords).
 * Part of the Systems layer, handling specific mechanic logic.
 */

export class KeywordSystem {
    constructor() {
    }

    /**
     * Executes a list of effects based on card parameters.
     * @param {Object} card - The card object containing effect params.
     * @param {Object} context - Game context (golem, minions, helpers like log).
     * @returns {string[]} Logs generated during execution.
     */
    /**
     * Executes a list of effects based on card parameters.
     * @param {Object} card - The card object containing effect params.
     * @param {Object} context - Game context (golem, minions, helpers like log).
     * @returns {string[]} Logs generated during execution.
     */
    processCardEffects(card, context) {
        const logs = [];

        // 1. Data-Driven Effects (New Pipeline)
        if (card.singleEffects && Array.isArray(card.singleEffects) && card.singleEffects.length > 0) {
            // Find valid origin index for Grid Manipulation
            const originIdx = context.cardSystem ? context.cardSystem.grid.findIndex(c => c.instanceId === card.instanceId) : -1;

            for (const effect of card.singleEffects) {
                const result = this.executeSingleEffect(effect, context, card, originIdx);
                if (result) logs.push(result);
            }
            return logs;
        }

        // 2. Legacy Effects (effectParams)
        // Keep existing logic for backward compatibility or manual definitions
        return this.processLegacyEffects(card, context);
    }

    /**
     * Executes a single normalized effect.
     */
    executeSingleEffect(effect, context, card, originIdx) {
        if (!effect) return null;

        switch (effect.type) {
            case 'ATTACK': {
                const target = this.getTarget(effect.target || 'RANDOM_ENEMY', context);
                if (target) {
                    let dmg = effect.value;

                    // Apply WEAK debuff (-25% damage dealt)
                    if (context.golem && context.golem.statuses['WEAK'] > 0) {
                        dmg = Math.max(0, Math.floor(dmg * 0.75));
                    }

                    const taken = target.takeDamage(dmg, context.golem, { ignoreBlock: effect.ignoreBlock });
                    if (context.golem) context.golem.totalDamageThisTurn += taken;

                    const weakIcon = (context.golem && context.golem.statuses['WEAK'] > 0) ? ' (약화)' : '';
                    const pierceIcon = effect.ignoreBlock ? ' (관통)' : '';
                    return `⚔️ [${card.name}] ${target.name}에게 ${taken} 피해${weakIcon}${pierceIcon}`;
                }
                return `⚔️ [${card.name}] 공격 대상이 없습니다.`;
            }
            case 'BLOCK': {
                const amt = effect.value;
                if (context.golem) {
                    context.golem.addBlock(amt);
                    return `🛡️ [${card.name}] 골렘 방어도 +${amt}`;
                }
                break;
            }
            case 'HEAL': {
                const amt = effect.value;
                if (context.golem) {
                    const healed = context.golem.heal(amt);
                    return `💧 [${card.name}] 체력 ${healed} 회복`;
                }
                break;
            }
            case 'BUFF': {
                const target = this.getTarget(effect.target || 'SELF', context);
                if (target) {
                    const subType = effect.subType;
                    const val = effect.value;
                    if (subType === 'THORNS') {
                        target.addStatus('THORNS', val);
                        return `🌵 [${card.name}] ${target.name} 가시 ${val} 획득`;
                    }
                    // Default attack buff
                    target.attackBuffs = (target.attackBuffs || 0) + 1;
                    return `💪 [${card.name}] ${target.name} 공격력 증가`;
                }
                break;
            }
            case 'DEBUFF': {
                const target = this.getTarget(effect.target || 'RANDOM_ENEMY', context);
                if (target) {
                    const subType = effect.subType; // WEAK, VULNERABLE, POISON
                    const val = effect.value;
                    target.addStatus(subType, val);
                    const iconMap = { 'WEAK': '💢', 'VULNERABLE': '💔', 'POISON': '🧪' };
                    return `${iconMap[subType] || '💀'} [${card.name}] ${target.name}에게 ${subType} ${val}`;
                }
                break;
            }
            case 'SPECIAL': {
                const subType = effect.subType;
                const val = effect.value;

                if (subType === 'LIFESTEAL') {
                    // This is usually passive, but if it's an effect: "Deal damage and heal"
                    // Or if it's "Heal % of damage dealt this turn"
                    // CSV implies it's an effect. Let's assume it heals based on current turn's dmg.
                    if (context.golem) {
                        const healAmt = Math.floor(context.golem.totalDamageThisTurn * (val / 100));
                        const healed = context.golem.heal(healAmt);
                        return `🩸 [${card.name}] 흡혈로 ${healed} 체력 회복`;
                    }
                }
                if (subType === 'CATALYST') {
                    const target = this.getTarget(effect.target || 'RANDOM_ENEMY', context);
                    if (target) {
                        // Double the highest status or all? Catalyst usually doubles Poison/Burn
                        ['POISON', 'BURN'].forEach(st => {
                            if (target.statuses[st] > 0) {
                                target.statuses[st] *= val;
                            }
                        });
                        return `🧪 [${card.name}] 촉매! 상태 이상 수치 증가`;
                    }
                }
                break;
            }
            case 'CONDITIONAL': {
                if (this.checkCondition(effect.condition, context, card)) {
                    // Recursive call for the actual effect
                    const result = this.executeSingleEffect(effect.effects, context, card, originIdx);
                    return result ? `🔍 [${card.name}] 조건 충족: ${result}` : null;
                }
                return null;
            }
            case 'GRID_MANIPULATION': {
                if (context.cardSystem) {
                    // Extract params from the effect object (which flattened the JSON)
                    // Schema: { type: 'GRID_MANIPULATION', action, target, count, toType, condition }
                    const resultLog = context.cardSystem.executeGridAction(
                        effect.action,
                        effect.target,
                        effect.count,
                        effect.toType,
                        originIdx,
                        effect.condition
                    );
                    return `✨ [${card.name}] ${resultLog}`;
                }
                return `⚠️ [${card.name}] Grid System Missing`;
            }
            default:
                return null;
        }
    }

    /**
     * Checks if a condition is met.
     */
    checkCondition(condition, context, card) {
        if (!condition) return true;

        const statValue = this.evaluateStat(condition.stat, context, card);
        const op = condition.op;
        const targetValue = condition.value;

        switch (op) {
            case '>=': return statValue >= targetValue;
            case '<=': return statValue <= targetValue;
            case '>': return statValue > targetValue;
            case '<': return statValue < targetValue;
            case '=':
            case '==': return statValue === targetValue;
            default: return false;
        }
    }

    /**
     * Evaluates a stat key into a numeric value.
     */
    evaluateStat(statKey, context, card) {
        switch (statKey) {
            case 'SAME_ELEM_COUNT':
                if (context.cardSystem && card.element) {
                    return context.cardSystem.grid.filter(c => c && c.element === card.element).length;
                }
                return 0;
            case 'ENEMY_COUNT':
                return context.minions.filter(m => m.isAlive).length;
            case 'DEBUFF_COUNT': {
                const target = context.golem; // Usually checks Golem for 'CALM'
                if (!target) return 0;
                // Count negative statuses
                const debuffs = ['WEAK', 'VULNERABLE', 'POISON', 'BURN', 'OIL'];
                return debuffs.reduce((acc, st) => acc + (target.statuses[st] > 0 ? 1 : 0), 0);
            }
            case 'MISSING_HP':
                if (context.golem) {
                    return context.golem.maxHp - context.golem.hp;
                }
                return 0;
            default:
                return 0;
        }
    }

    /**
     * Legacy Processing mainly for hardcoded logic or old manual definitions
     */
    processLegacyEffects(card, context) {
        const logs = [];
        const params = card.effectParams || {};

        // 1. Basic Damage
        if (params.damage) {
            const target = this.getTarget(params.target, context);
            if (target) {
                const dmg = params.damage;
                const taken = target.takeDamage(dmg);
                // Record damage for stats if needed (context.golem.totalDamageThisTurn += taken)
                if (context.golem) context.golem.totalDamageThisTurn += taken;
                logs.push(`⚔️ [${card.name}] ${target.name}에게 ${taken} 피해`);
            }
        }

        // 2. Block / Shield
        if (params.block || params.defense) {
            const amt = params.block || params.defense;
            if (context.golem) {
                context.golem.addBlock(amt);
                logs.push(`🛡️ [${card.name}] 골렘 방어도 +${amt}`);
            }
        }

        // 3. Heal
        if (params.heal) {
            const amt = params.heal;
            if (context.golem) {
                const healed = context.golem.heal(amt);
                logs.push(`💧 [${card.name}] 체력 ${healed} 회복`);
            }
        }

        // 4. Burn (Status)
        if (params.burn) {
            const target = this.getTarget('RANDOM_ENEMY', context); // Default to random enemy if not specified
            if (target) {
                target.addStatus('BURN', params.burn);
                logs.push(`🔥 [${card.name}] ${target.name}에게 화상 ${params.burn}`);
            }
        }

        // 5. Thorns (Status)
        if (params.thorns) {
            if (context.golem) {
                context.golem.addStatus('THORNS', params.thorns);
                logs.push(`🌵 [${card.name}] 가시 ${params.thorns} 획득`);
            }
        }

        // 6. AoE Damage
        if (params.aoe && params.damage) {
            // ... (Same as before)
        }

        // --- Specific Card Logic Handling (Legacy Support) ---

        // ID: 7 (Supernova) - AoE
        if (card.id === "7") {
            const dmg = params.damage || 30;
            let totalTaken = 0;
            context.minions.forEach(m => {
                if (m.isAlive) {
                    totalTaken += m.takeDamage(dmg);
                }
            });
            if (context.golem) context.golem.totalDamageThisTurn += totalTaken;
            logs.push(`🌟 [${card.name}] 전체 ${dmg} 피해!`);
        }

        // ID: 2 (Oil)
        if (card.id === "2") {
            const target = this.getTarget('RANDOM_ENEMY', context);
            if (target) {
                target.addStatus('OIL', params.duration || 2);
                logs.push(`🛢️ [${card.name}] ${target.name}에게 기름칠`);
            }
        }

        // Fallback for Element Cards (Basic) if no specific params
        if (!card.effectParams || Object.keys(card.effectParams).length === 0) {
            if (card.type === 'FIRE') {
                const t = this.getTarget('RANDOM_ENEMY', context);
                if (t) {
                    const dmg = 2; // Default
                    const taken = t.takeDamage(dmg);
                    logs.push(`🔥 [${card.type}] ${t.name}에게 ${taken} 피해`);
                }
            } else if (card.type === 'EARTH') {
                if (context.golem) {
                    context.golem.addBlock(2);
                    logs.push(`🛡️ [${card.type}] 방어도 +2`);
                }
            } else if (card.type === 'WATER') {
                if (context.golem) {
                    context.golem.heal(2);
                    logs.push(`💧 [${card.type}] 체력 회복 +2`);
                }
            } else if (card.type === 'WIND') {
                logs.push(`🍃 [${card.type}] 바람이 분다...`);
            }
        }

        // Legacy GRID_MANIPULATION check
        if (params.type === 'GRID_MANIPULATION' && context.cardSystem) {
            const resultLog = context.cardSystem.executeGridAction(
                params.action,
                params.target,
                params.count,
                params.toType,
                -1, // Origin unknown in legacy
                null // Condition unknown
            );
            logs.push(`✨ [${card.name}] ${resultLog}`);
        }

        return logs;
    }

    getTarget(targetType, context) {
        if (!targetType || targetType === 'RANDOM_ENEMY') {
            const alive = context.minions.filter(m => m.isAlive);
            if (alive.length === 0) return null;
            return alive[Math.floor(Math.random() * alive.length)];
        }
        if (targetType === 'ALL_ENEMIES') {
            // Helper for single target return? No, this returns one.
            // Caller needs to handle multi-target if requesting array.
            return null;
        }
        if (targetType === 'FRONT') {
            const front = context.minions[0];
            return (front && front.isAlive) ? front : null;
        }
        return null;
    }
}
