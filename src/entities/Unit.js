/**
 * Unit.js
 * Base class for all combat units (Golem, Minions).
 */

export class Unit {
    constructor(name, maxHp, baseBlock = 0) {
        this.name = name;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.block = baseBlock;

        // Base Stats
        this.baseAttack = 0;
        this.baseDefense = 0; // For minions mostly
        this.baseShield = 0;  // For golem

        // Buffs/Debuffs
        this.attackDebuffs = 0; // Minion
        this.attackBuffs = 0; // Golem (Added based on usage in GameEngine)
        this.swordBonus = 0; // Golem
        this.shieldBonus = 0; // Golem

        // Turn Stats
        this.totalDamageThisTurn = 0;
        this.intent = null;

        // Status
        this.isAlive = true;
        this.statuses = {}; // { BURN: 0, OIL: 0, THORNS: 0 }
    }

    /**
     * Resets turn-based stats.
     */
    resetTurnStats() {
        this.block = 0;
        this.totalDamageThisTurn = 0;
        // Note: Buffs/Debuffs logic might differ per unit type, handled in subclasses or game loop
    }

    /**
     * Applies damage to the unit.
     * @param {number} amount - Raw damage amount.
     * @param {Object} source - The unit dealing damage (optional, for Thorns).
     * @param {Object} options - { ignoreBlock: boolean }
     * @returns {number} Actual damage taken to HP.
     */
    takeDamage(amount, source = null, options = {}) {
        if (!this.isAlive) return 0;

        let finalAmount = amount;

        // 0. Apply Vulnerable (+50% damage taken if status exists)
        if (this.statuses['VULNERABLE'] > 0) {
            finalAmount = Math.floor(finalAmount * 1.5);
        }

        let remainingDamage = finalAmount;

        // 1. Thorns Reflection (If unit has THORNS and source exists)
        if (this.statuses['THORNS'] > 0 && source && source.isAlive) {
            const reflect = this.statuses['THORNS'];
            source.takeDamage(reflect);
            console.log(`${this.name} reflected ${reflect} damage to ${source.name}`);
        }

        // 2. Apply to Block first (unless ignoreBlock is true)
        if (!options.ignoreBlock && this.block > 0) {
            if (this.block >= remainingDamage) {
                this.block -= remainingDamage;
                remainingDamage = 0;
            } else {
                remainingDamage -= this.block;
                this.block = 0;
            }
        }

        // 3. Apply to HP
        if (remainingDamage > 0) {
            this.hp -= remainingDamage;
            if (this.hp <= 0) {
                this.hp = 0;
                this.die();
            }
        }

        return remainingDamage; // Return damage that penetrated block
    }

    /**
     * Heals the unit.
     * @param {number} amount 
     * @returns {number} Amount actually healed.
     */
    heal(amount) {
        if (!this.isAlive) return 0;

        const oldHp = this.hp;
        this.hp = Math.min(this.hp + amount, this.maxHp);
        return this.hp - oldHp;
    }

    /**
     * Adds block.
     * @param {number} amount 
     */
    addBlock(amount) {
        if (!this.isAlive) return;
        this.block += amount;
    }

    addStatus(type, value) {
        if (!this.statuses[type]) this.statuses[type] = 0;
        this.statuses[type] += value;
    }

    die() {
        this.isAlive = false;
        console.log(`${this.name} has died.`);
    }

    /**
     * Returns the current state as a plain object (for UI sync).
     */
    getState() {
        return {
            name: this.name,
            hp: this.hp,
            maxHp: this.maxHp,
            block: this.block,
            isAlive: this.isAlive,
            intent: this.intent,
            statuses: this.statuses
        };
    }

    /**
     * Updates stats from an external state object (Stat Editor).
     * @param {object} newState 
     */
    syncState(newState) {
        // Only update properties that exist in newState and are safe to update
        if (newState.hp !== undefined) this.hp = newState.hp;
        if (newState.maxHp !== undefined) this.maxHp = newState.maxHp;
        if (newState.block !== undefined) this.block = newState.block;
        if (newState.baseAttack !== undefined) this.baseAttack = newState.baseAttack;
        if (newState.baseDefense !== undefined) this.baseDefense = newState.baseDefense;
        if (newState.baseShield !== undefined) this.baseShield = newState.baseShield;
        if (newState.swordBonus !== undefined) this.swordBonus = newState.swordBonus;
        if (newState.shieldBonus !== undefined) this.shieldBonus = newState.shieldBonus;
        if (newState.attackBuffs !== undefined) this.attackBuffs = newState.attackBuffs;
        if (newState.attackDebuffs !== undefined) this.attackDebuffs = newState.attackDebuffs;
        if (newState.statuses !== undefined) this.statuses = newState.statuses;

        // Re-check life status
        if (this.hp <= 0) this.isAlive = false;
        else this.isAlive = true;
    }
}
