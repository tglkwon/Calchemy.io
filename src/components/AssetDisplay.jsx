import React from 'react';
import { useAsset } from '../context/AssetContext';

const AssetDisplay = ({ id, className = "" }) => {
    const { getAsset } = useAsset();
    const asset = getAsset(id);

    if (asset.type === 'image') {
        return <img src={asset.content} alt={id} className={`object-contain drop-shadow-md ${className}`} />;
    }

    return (
        <span className={`${asset.color || 'text-white'} ${className}`}>
            {asset.content}
        </span>
    );
};

export default AssetDisplay;
