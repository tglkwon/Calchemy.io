import React, { createContext, useContext, useState } from 'react';
import { AssetManager } from '../utils/AssetManager';

const AssetContext = createContext(null);

export const AssetProvider = ({ children }) => {
    const [manager] = useState(new AssetManager());
    const [mode, setMode] = useState(manager.mode);

    const toggleMode = () => {
        const newMode = manager.toggleMode();
        setMode(newMode);
    };

    const getAsset = (key) => {
        return manager.get(key);
    };

    return (
        <AssetContext.Provider value={{ mode, toggleMode, getAsset }}>
            {children}
        </AssetContext.Provider>
    );
};

export const useAsset = () => {
    const context = useContext(AssetContext);
    if (!context) {
        throw new Error("useAsset must be used within an AssetProvider");
    }
    return context;
};
