import React, { useEffect, useState } from 'react';
import { GameEngine } from '../core/GameEngine';
import { GameContext } from './GameContext';

export const GameProvider = ({ children }) => {
    // Use state to keep the engine instance stable across renders
    // Initialize lazily to ensure it's created only once
    const [gameEngine] = useState(() => new GameEngine());

    // Initialize gameState from the engine
    const [gameState, setGameState] = useState(() => gameEngine.getGameState());

    useEffect(() => {
        const engine = gameEngine;

        // Subscribe to engine updates
        const unsubscribe = engine.subscribe((newState) => {
            setGameState({ ...newState }); // Spread to ensure new object reference
        });

        // Initial render
        // engine.startBattle(); // Maybe don't start immediately, let UI trigger it?
        // Let's start it for now to match legacy behavior or wait for user.
        // Legacy started on button click.

        return () => {
            unsubscribe();
            engine.stop();
        };
    }, [gameEngine]);

    return (
        <GameContext.Provider value={{ gameState, gameEngine }}>
            {children}
        </GameContext.Provider>
    );
};
