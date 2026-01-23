import React, { createContext, useContext, useEffect, useState } from 'react';
import staticGameData from '../generated/gameData.json';

const GameDataContext = createContext(null);

/* eslint-disable react-refresh/only-export-components */
export const useGameData = () => useContext(GameDataContext);

export const GameDataProvider = ({ children }) => {
    const [gameData, setGameData] = useState({ cards: [], keywords: [], artifacts: [], potions: [], enhancements: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // In Phase 4, we use the imported JSON directly.
        // We simulate an async structure just to keep the API consistent if needed,
        // or simply set it immediately.
        const loadData = async () => {
            try {
                console.log("[GameDataProvider] Loading Static Game Data (Build-Time Generated)...");

                // Validate if data exists
                if (!staticGameData || !staticGameData.cards) {
                    throw new Error("Static Game Data is missing or invalid.");
                }

                setGameData(staticGameData);

                console.log("[GameDataProvider] Data Loaded Successfully", {
                    cards: staticGameData.cards.length,
                    version: staticGameData.generatedAt
                });

            } catch (err) {
                console.error("Failed to load game data:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl font-bold text-yellow-500 bg-gray-950">
                Loading Alchemy Data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500 bg-gray-950">
                Error loading game resources: {error.message}
            </div>
        );
    }

    return (
        <GameDataContext.Provider value={{ gameData, loading, error }}>
            {children}
        </GameDataContext.Provider>
    );
};
