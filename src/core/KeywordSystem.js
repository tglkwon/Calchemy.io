/**
 * KeywordSystem.js
 * Centralizes the logic for executing game effects (Keywords).
 * Located in Core as it defines the fundamental rules of effect execution.
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
    processCardEffects(card, context) {
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
            // If AOE is flagged, the damage block above might have handled single target.
            // But usually AOE is separate or overrides. 
            // In a better system, 'actions' is a list. Here we check params.
            // Let's assume if AOE is true, we hit ALL enemies.
            // Note: The simple `if (params.damage)` above picks one target. 
            // We should ideally separate "Actions". 
            // For this refactor, let's keep it simple: Overwrite standard damage logic if Aoe?
            // Or just handle specific keys.
        }

        // --- Specific Card Logic Handling (Legacy Support until full JSON migration) ---
        // This is where we handle the specific ID logic that was in GameEngine

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
