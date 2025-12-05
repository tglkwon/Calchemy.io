import { GameEngine } from './src/core/GameEngine.js';

const engine = new GameEngine();

// Mock notify to avoid errors if it expects UI
engine.notify = () => { };

console.log("Starting Test...");
engine.startBattle();

// Force draw specific cards to test effects
// We can manipulate the deck or grid directly for testing
console.log("Deck size:", engine.cardSystem.deck.length);

// Find specific cards
const findCard = (id) => engine.cardSystem.deck.find(c => c.id === id);

const card1 = findCard("1"); // Ember
const card2 = findCard("2"); // Oil Barrel
const card3 = findCard("3"); // Fireball

if (card1) {
    console.log("Testing Card 1 (Ember)...");
    engine.triggerCardEffect(card1);
} else {
    console.log("Card 1 not found in deck");
}

if (card2) {
    console.log("Testing Card 2 (Oil Barrel)...");
    engine.triggerCardEffect(card2);
}

if (card3) {
    console.log("Testing Card 3 (Fireball)...");
    engine.triggerCardEffect(card3);
}

// Test Bingo Effect
console.log("Testing Bingo Effect...");
const bingo = {
    type: 'FIRE',
    ids: [card1.instanceId, card2.instanceId, card3.instanceId] // Fake IDs
};

// We need to put these cards in grid for applyBingoEffects to find them
engine.cardSystem.grid = [card1, card2, card3];

engine.applyBingoEffects([bingo]).then(() => {
    console.log("Bingo effects applied.");
    console.log("Logs:", engine.logs.map(l => l.message));
});
