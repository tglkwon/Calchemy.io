/**
 * Alchemist Auto-Battler v1.2 - Main Entry Point
 */

import { GameEngine } from './src/core/GameEngine.js';
import { UIManager } from './src/ui/UIManager.js';
import { AssetManager } from './src/systems/AssetManager.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Alchemist Auto-Battler v1.2...');

    // Initialize Systems
    const assetManager = new AssetManager();
    const uiManager = new UIManager(assetManager);
    const gameEngine = new GameEngine(uiManager);

    // Start the application
    gameEngine.init();
});
