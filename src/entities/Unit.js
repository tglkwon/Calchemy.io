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
     * @returns {number} Actual damage taken to HP.
     */
    takeDamage(amount) {
        if (!this.isAlive) return 0;

        let remainingDamage = amount;

        // 1. Apply to Block first
        if (this.block > 0) {
            if (this.block >= remainingDamage) {
                this.block -= remainingDamage;
                remainingDamage = 0;
            } else {
                remainingDamage -= this.block;
                this.block = 0;
            }
        }

        // 2. Apply to HP
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
            baseAttack: this.baseAttack,
            baseDefense: this.baseDefense,
            baseShield: this.baseShield,
            swordBonus: this.swordBonus,
            shieldBonus: this.shieldBonus,
            attackBuffs: this.attackBuffs,
            attackDebuffs: this.attackDebuffs,
            totalDamageThisTurn: this.totalDamageThisTurn,
            intent: this.intent,
            isAlive: this.isAlive
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

        // Re-check life status
        if (this.hp <= 0) this.isAlive = false;
        else this.isAlive = true;
    }
}
