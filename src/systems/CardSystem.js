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
     * Helper: Validates if coordinate is within 4x4 grid
     */
    isValidCoord(x, y) {
        return x >= 0 && x < 4 && y >= 0 && y < 4;
    }

    /**
     * Helper: Convert grid index to x,y coordinates
     */
    getCoord(index) {
        return { x: index % 4, y: Math.floor(index / 4) };
    }

    /**
     * Helper: Convert x,y coordinates to grid index
     */
    getIndex(x, y) {
        return y * 4 + x;
    }

    /**
     * Executes a data-driven grid manipulation action.
     * @param {string} actionType - TRANSFROM, SWAP, REPLACE, UPGRADE
     * @param {string} targetSelector - UP, DOWN, LEFT, RIGHT, NEAR_4, NEAR_8, RANDOM, ALL
     * @param {number} count - Number of cards to affect
     * @param {string} toType - Target type for TRANSFORM (or 'ORIGIN')
     * @param {number} originIdx - Index of the card triggering the effect
     * @param {string} condition - Filter condition (SAME_TYPE, etc.)
     * @returns {string} Log message result
     */
    executeGridAction(actionType, targetSelector, count, toType, originIdx, condition) {
        // Fallback for missing origin (e.g. global effect)
        if (originIdx === undefined || originIdx === null) originIdx = -1;

        // 1. Get Initial Candidates
        let candidates = this.getTargetIndices(targetSelector, count, originIdx);

        // 2. Filter Candidates
        let finalTargets = this.filterTargets(candidates, condition, originIdx);

        // 3. Limit count
        // For Random/All, we might have many candidates, slice to count.
        // For Directional, getTargetIndices usually returns 1 (or 0), but we check limit anyway.
        if (targetSelector === 'RANDOM' || targetSelector === 'ALL' || condition) {
            // For random selector, we shuffle first then slice if we have too many
            if (targetSelector === 'RANDOM') {
                this.shuffle(finalTargets);
            }
            finalTargets = finalTargets.slice(0, count);
        } else {
            finalTargets = finalTargets.slice(0, count);
        }

        if (finalTargets.length === 0) {
            return `대상이 없어 (${actionType}) 실행되지 않았습니다.`;
        }

        // 4. Execute Action on Targets
        let logs = [];
        finalTargets.forEach(tIdx => {
            // Safety check
            if (!this.grid[tIdx]) return;

            if (actionType === 'SWAP') {
                // Swap logic: origin vs target
                // If origin is valid, swap with origin. If origin is -1 (global), swap with what?
                // Usually SWAP is "Me <-> Target".
                if (originIdx !== -1 && this.grid[originIdx]) {
                    [this.grid[originIdx], this.grid[tIdx]] = [this.grid[tIdx], this.grid[originIdx]];
                    // Refresh instanceIds to trigger React key updates if needed, but simple swap might reuse keys. 
                    // Best practice: treat as move.
                }
            } else if (actionType === 'REPLACE') {
                this.replaceCard(tIdx);
            } else if (actionType === 'TRANSFORM') {
                let type = toType;
                if (toType === 'ORIGIN' && originIdx !== -1 && this.grid[originIdx]) {
                    type = this.grid[originIdx].type;
                }
                // If type is still invalid, ignore or default
                if (type) {
                    this.grid[tIdx] = {
                        ...this.grid[tIdx],
                        type: type,
                        instanceId: `${type}_TR_${Date.now()}_${tIdx}` // Force re-render
                    };
                }
            } else if (actionType === 'UPGRADE') {
                // upgrade logic stub
                this.grid[tIdx] = {
                    ...this.grid[tIdx],
                    grade: (this.grid[tIdx].grade || 0) + 1,
                    instanceId: `${this.grid[tIdx].type}_UP_${Date.now()}_${tIdx}`
                };
            }
        });

        // Force grid array update reference
        this.grid = [...this.grid];

        return `그리드 조작: ${actionType} (${finalTargets.length}장)`;
    }

    /**
     * Replaces a card at index with one from the deck.
     * Moves old card to discard pile.
     */
    replaceCard(index) {
        if (this.grid[index]) {
            this.discardPile.push(this.grid[index]);
            if (this.deck.length === 0) {
                // Shuffle discard into deck if empty
                if (this.discardPile.length > 0) {
                    this.deck = [...this.discardPile];
                    this.discardPile = [];
                    this.shuffle(this.deck);
                } else {
                    console.warn("No cards left to replace!");
                    // Fallback check?
                }
            }

            if (this.deck.length > 0) {
                const newCard = this.deck.pop();
                // Ensure new unique ID for the slot
                this.grid[index] = { ...newCard, instanceId: `REP_${Date.now()}_${index}` };
            }
        }
    }

    /**
     * Filters target indices based on condition.
     */
    filterTargets(indices, condition, originIdx) {
        if (!condition) return indices;

        const originCard = (originIdx !== -1) ? this.grid[originIdx] : null;

        return indices.filter(idx => {
            if (idx === originIdx) return false; // Self exclusion by default? MD says explicit filtering.

            const targetCard = this.grid[idx];
            if (!targetCard) return false;

            switch (condition) {
                case 'SAME_TYPE':
                    return originCard && targetCard.type === originCard.type;
                case 'DIFF_TYPE':
                    return originCard && targetCard.type !== originCard.type;
                case 'BASIC_ONLY':
                    // Assuming 'grade' 0 or undefined is basic
                    return !targetCard.grade || targetCard.grade === 0;
                case 'UPGRADED':
                    return targetCard.grade > 0;
                case 'NOT_UPGRADED':
                    return !targetCard.grade || targetCard.grade === 0;
                case 'IS_EDGE': {
                    const { x, y } = this.getCoord(idx);
                    return x === 0 || x === 3 || y === 0 || y === 3;
                }
                // Complex conditions like MOST_FREQUENT need pre-calculation on the whole set, 
                // which is hard in a simple filter.
                // For MVP, we'll skip global count analysis logic inside per-card filter 
                // or implement it separately if needed.
                // Let's implement simple ones first.
                default:
                    return true;
            }
        });
    }

    /**
     * Returns target indices based on selector and origin.
     * Implements Reflection Logic.
     */
    getTargetIndices(selector, count, originIdx = -1) {
        // If origin unspecified for relative selector, we can't do much.
        // We'll treat originIdx 0 if -1 provided for safety, or return empty?
        // MD implies origin is needed for UP/DOWN/etc.

        const indices = []; // results

        if (originIdx === -1 && ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(selector)) {
            return [];
        }

        const { x, y } = (originIdx !== -1) ? this.getCoord(originIdx) : { x: 0, y: 0 };
        let tx = x, ty = y;

        // Valid candidates collection
        let candidateIndices = [];

        switch (selector) {
            case 'UP':
                ty = y - 1;
                if (!this.isValidCoord(tx, ty)) ty = y + 1; // Reflection
                if (this.isValidCoord(tx, ty)) candidateIndices.push(this.getIndex(tx, ty));
                break;
            case 'DOWN':
                ty = y + 1;
                if (!this.isValidCoord(tx, ty)) ty = y - 1;
                if (this.isValidCoord(tx, ty)) candidateIndices.push(this.getIndex(tx, ty));
                break;
            case 'LEFT':
                tx = x - 1;
                if (!this.isValidCoord(tx, ty)) tx = x + 1;
                if (this.isValidCoord(tx, ty)) candidateIndices.push(this.getIndex(tx, ty));
                break;
            case 'RIGHT':
                tx = x + 1;
                if (!this.isValidCoord(tx, ty)) tx = x - 1;
                if (this.isValidCoord(tx, ty)) candidateIndices.push(this.getIndex(tx, ty));
                break;
            case 'NEAR_4':
                // Up, Down, Left, Right
                [[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]].forEach(([nx, ny]) => {
                    if (this.isValidCoord(nx, ny)) candidateIndices.push(this.getIndex(nx, ny));
                });
                break;
            case 'NEAR_8':
                // All 8 neighbors
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        if (this.isValidCoord(x + dx, y + dy)) candidateIndices.push(this.getIndex(x + dx, y + dy));
                    }
                }
                break;
            case 'RANDOM':
            case 'ALL':
                // Return all exclude self
                candidateIndices = this.grid.map((_, i) => i).filter(i => i !== originIdx);
                break;
            default:
                // Unknown selector
                return [];
        }

        return candidateIndices;
    }
}
