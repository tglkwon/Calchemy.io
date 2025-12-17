/**
 * CardSystem.js
 * Manages the Deck, Grid, and Bingo logic.
 */

import { CardDefinitions } from './CardDefinitions.js';

export class CardSystem {
    constructor() {
        this.elements = ['FIRE', 'EARTH', 'WATER', 'WIND'];
        this.deck = [];
        this.discardPile = [];
        this.grid = []; // 16 cards
        this.initDeck();
    }

    /**
     * Initializes the deck with 32 cards (8 of each element).
     * Uses definitions "FIRE", "WATER", "EARTH", "WIND" if they exist.
     */
    initDeck() {
        this.deck = [];
        this.discardPile = [];
        for (const el of this.elements) {
            for (let i = 0; i < 8; i++) {
                // If a definition exists for the element name (e.g. "FIRE"), use it.
                // Otherwise fallback to generic construction.
                const defId = el;
                if (CardDefinitions[defId]) {
                    const def = CardDefinitions[defId];
                    this.deck.push({
                        ...def,
                        instanceId: `${def.id}_${i}_${Date.now()}` // Unique Instance ID
                    });
                } else {
                    // Legacy Fallback if definition not found
                    const id = `${el}_${i}`;
                    this.deck.push({ type: el, id: id, instanceId: `${id}_${Date.now()}` });
                }
            }
        }
        this.shuffle(this.deck);
    }

    /**
     * Shuffles the current deck.
     */
    shuffleDeck() {
        this.shuffle(this.deck);
    }

    /**
     * Shuffles an array in place.
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Draws 16 cards to fill the grid.
     * Reshuffles discard pile if deck is empty.
     */
    drawGrid() {
        this.grid = [];
        for (let i = 0; i < 16; i++) {
            if (this.deck.length === 0) {
                if (this.discardPile.length === 0) {
                    // Should not happen in normal play with 32 cards and 16 grid
                    console.warn("Deck and Discard empty! Resetting.");
                    this.initDeck();
                } else {
                    this.deck = [...this.discardPile];
                    this.discardPile = [];
                    this.shuffle(this.deck);
                }
            }
            if (this.deck.length > 0) {
                this.grid.push(this.deck.pop());
            }
        }
        return this.grid;
    }

    /**
     * Moves current grid cards to discard pile.
     */
    discardGrid() {
        this.discardPile.push(...this.grid);
        this.grid = [];
    }

    /**
     * Returns all cards currently in the game (Deck + Discard + Grid).
     */
    getAllCards() {
        return [...this.deck, ...this.discardPile, ...this.grid];
    }

    /**
     * Adds a card to the deck.
     * @param {string} typeOrId - Element type or Card Definition ID
     */
    addCard(typeOrId) {
        // Check if it's a specific card ID
        if (CardDefinitions[typeOrId]) {
            const def = CardDefinitions[typeOrId];
            this.deck.push({
                ...def,
                instanceId: `${def.type}_${def.id}_${Date.now()}`
            });
        } else {
            // Fallback for generic element type
            const type = typeOrId;
            const id = `${type}_${Date.now()}`;
            this.deck.push({ type, id, instanceId: id });
        }
    }

    /**
     * Removes a card by instanceId from wherever it is (Deck, Discard, or Grid).
     * @param {string} instanceId 
     */
    removeCard(instanceId) {
        // Try Deck
        let idx = this.deck.findIndex(c => c.instanceId === instanceId);
        if (idx !== -1) {
            this.deck.splice(idx, 1);
            return;
        }

        // Try Discard
        idx = this.discardPile.findIndex(c => c.instanceId === instanceId);
        if (idx !== -1) {
            this.discardPile.splice(idx, 1);
            return;
        }

        // Try Grid
        idx = this.grid.findIndex(c => c.instanceId === instanceId);
        if (idx !== -1) {
            this.grid.splice(idx, 1);
            return;
        }
    }

    checkBingos() {
        const lines = [];

        // Rows
        for (let r = 0; r < 4; r++) {
            lines.push(this.grid.slice(r * 4, r * 4 + 4));
        }
        // Cols
        for (let c = 0; c < 4; c++) {
            lines.push([this.grid[c], this.grid[c + 4], this.grid[c + 8], this.grid[c + 12]]);
        }
        // Diagonals
        lines.push([this.grid[0], this.grid[5], this.grid[10], this.grid[15]]);
        lines.push([this.grid[3], this.grid[6], this.grid[9], this.grid[12]]);

        const results = [];

        for (const line of lines) {
            // Check Element Bingo (All same)
            const firstType = line[0].type;
            if (line.every(card => card.type === firstType)) {
                results.push({
                    type: firstType,
                    ids: line.map(c => c.instanceId)
                });
                continue; // Cannot be harmony if all same
            }

            // Check Harmony Bingo (All 4 types present)
            const types = new Set(line.map(c => c.type));
            if (types.has('FIRE') && types.has('EARTH') && types.has('WATER') && types.has('WIND')) {
                results.push({
                    type: 'HARMONY',
                    ids: line.map(c => c.instanceId)
                });
            }
        }

        return results;
    }

    /**
     * Returns all available card definitions for the library.
     */
    getLibraryCards() {
        return Object.values(CardDefinitions);
    }

    /**
     * Loads dynamic definitions from CSV or other sources.
     * @param {Object|Array} newDefinitions 
     */
    loadDefinitions(newDefinitions) {
        // Convert Array to Object Map if input is Array
        let defsToMerge = newDefinitions;
        if (Array.isArray(newDefinitions)) {
            defsToMerge = {};
            newDefinitions.forEach(card => {
                if (card.id) {
                    defsToMerge[card.id] = card;
                }
            });
        }

        // Merge into the existing CardDefinitions object
        Object.assign(CardDefinitions, defsToMerge);
        console.log("CardSystem: Definitions updated", Object.keys(defsToMerge));

        // Re-init deck to reflect new definitions immediately
        this.initDeck();
        // Clear grid to force redraw with new cards
        this.grid = [];
        this.drawGrid();
    }
    /**
     * Executes a data-driven grid manipulation action.
     * @param {string} actionType - TRANSFORM, SWAP, etc.
     * @param {string} targetSelector - RANDOM, FRONT, etc.
     * @param {number} count - Number of cards to affect
     * @param {string} toType - Target type for TRANSFORM
     * @returns {string} Log message result
     */
    executeGridAction(actionType, targetSelector, count, toType) {
        const targetIndices = this.getTargetIndices(targetSelector, count);

        if (targetIndices.length === 0) {
            return `대상이 없어 (${actionType}) 실행되지 않았습니다.`;
        }

        // 1. Action 분기 처리
        let logs = [];
        switch (actionType) {
            case 'TRANSFORM':
                targetIndices.forEach(idx => {
                    this.transformCard(idx, toType);
                    // logs.push(`(${idx})번 카드가 ${toType}으로 변환.`);
                });
                logs.push(`${targetIndices.length}장의 카드가 ${toType} 속성으로 변환되었습니다.`);
                break;
            case 'SWAP':
                // SWAP 로직은 count를 짝지어 줘야 하므로 별도의 로직 필요
                // this.swapCards(targetIndices);
                logs.push(`미구현 액션: SWAP`);
                break;
            // ... 기타 액션 (UPGRADE, DISCARD) 구현
            default:
                logs.push(`알 수 없는 액션 타입: ${actionType}`);
        }

        return logs.join(' ');
    }

    /**
     * [Atomic] Force changes a card's type at a specific index.
     * @param {number} index - Grid index (0-15)
     * @param {string} newType - New element type (FIRE, WATER, etc.)
     */
    transformCard(index, newType) {
        if (this.grid[index]) {
            // Update type and regenerate instanceId to force React re-render
            this.grid[index] = {
                ...this.grid[index],
                type: newType,
                instanceId: `${newType}_TR_${Date.now()}_${index}`
            };
        }
    }

    /**
     * [Atomic] Returns target indices based on selector.
     * @param {string} selector - Target selection method
     * @param {number} count - Number of targets
     * @returns {number[]} Array of target indices
     */
    getTargetIndices(selector, count) {
        const indices = this.grid.map((_, i) => i);

        switch (selector) {
            case 'RANDOM':
                // Randomly select 'count' unique indices
                return indices.sort(() => 0.5 - Math.random()).slice(0, count);
            case 'FRONT':
                // Front row usually means index 0-3 (if row 0 is top) or first encountered?
                // Depending on UI, let's assume Row 0 (0,1,2,3) is front? 
                // Or maybe the "Front" relative to enemy?
                // Let's assume indices 0-3 are Row 0.
                const frontIndices = [0, 1, 2, 3];
                // Select 'count' from front row randomly? or just first 'count'?
                return frontIndices.sort(() => 0.5 - Math.random()).slice(0, count);
            // ... ADJACENT, SAME_TYPE etc.
            default:
                return [];
        }
    }
}
