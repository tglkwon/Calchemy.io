import { createContext, useContext } from 'react';

export const AssetContext = createContext(null);

export const useAsset = () => {
    const context = useContext(AssetContext);
    if (!context) {
        throw new Error("useAsset must be used within an AssetProvider");
    }
    return context;
};
