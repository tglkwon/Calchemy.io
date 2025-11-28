/**
 * CardSystem.js
 * Manages the Deck, Grid, and Bingo logic.
 */

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
     */
    initDeck() {
        this.deck = [];
        this.discardPile = [];
        for (const el of this.elements) {
            for (let i = 0; i < 8; i++) {
                this.deck.push({ type: el, id: `${el}_${i}` });
            }
        }
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
            this.grid.push(this.deck.pop());
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
     * Checks for Bingo lines (Rows, Cols, Diagonals).
     * Returns an object with bingo details.
     */
    /**
     * Returns all cards currently in the game (Deck + Discard + Grid).
     */
    getAllCards() {
        return [...this.deck, ...this.discardPile, ...this.grid];
    }

    /**
     * Adds a card to the deck.
     * @param {string} type - Element type (FIRE, WATER, etc.)
     */
    addCard(type) {
        const id = `${type}_${Date.now()}`; // Simple unique ID
        this.deck.push({ type, id });
    }

    /**
     * Removes a card by ID from wherever it is (Deck, Discard, or Grid).
     * @param {string} id 
     */
    removeCard(id) {
        // Try Deck
        let idx = this.deck.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.deck.splice(idx, 1);
            return;
        }

        // Try Discard
        idx = this.discardPile.findIndex(c => c.id === id);
        if (idx !== -1) {
            this.discardPile.splice(idx, 1);
            return;
        }

        // Try Grid
        idx = this.grid.findIndex(c => c.id === id);
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
                    ids: line.map(c => c.id)
                });
                continue; // Cannot be harmony if all same
            }

            // Check Harmony Bingo (All 4 types present)
            const types = new Set(line.map(c => c.type));
            if (types.has('FIRE') && types.has('EARTH') && types.has('WATER') && types.has('WIND')) {
                results.push({
                    type: 'HARMONY',
                    ids: line.map(c => c.id)
                });
            }
        }

        return results;
    }
}
