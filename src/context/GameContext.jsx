import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { GameEngine } from '../core/GameEngine';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    // Use ref to keep the engine instance stable across renders
    const engineRef = useRef(new GameEngine());
    const [gameState, setGameState] = useState(engineRef.current.getGameState());

    useEffect(() => {
        const engine = engineRef.current;

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
    }, []);

    return (
        <GameContext.Provider value={{ gameState, gameEngine: engineRef.current }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
};
