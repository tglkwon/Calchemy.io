import React, { useEffect, useState } from 'react';
import { GameEngine } from '../core/GameEngine';
import { GameContext } from './GameContext';
import { useGameData } from './GameDataProvider';

export const GameProvider = ({ children }) => {
    // Use state to keep the engine instance stable across renders
    // Initialize lazily to ensure it's created only once
    const [gameEngine] = useState(() => new GameEngine());

    // Initialize gameState from the engine
    const [gameState, setGameState] = useState(() => gameEngine.getGameState());

    // Access Data from DataProvider
    const { gameData } = useGameData();

    // Inject Data when loaded
    useEffect(() => {
        if (gameData && gameData.cards && gameData.cards.length > 0) {
            gameEngine.cardSystem.loadDefinitions(gameData.cards);
        }
    }, [gameData, gameEngine]);

    useEffect(() => {
        const engine = gameEngine;

        // Subscribe to engine updates
        const unsubscribe = engine.subscribe((newState) => {
            setGameState({ ...newState }); // Spread to ensure new object reference
        });

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
