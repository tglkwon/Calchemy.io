import React, { useState } from 'react';
import { AssetManager } from '../utils/AssetManager';
import { AssetContext } from './AssetContext';

export const AssetProvider = ({ children }) => {
    // Initialize lazily
    const [manager] = useState(() => new AssetManager());
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
