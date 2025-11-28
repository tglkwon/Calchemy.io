import React from 'react';
import { useGame } from '../context/GameContext';
import AssetDisplay from '../components/AssetDisplay';

const RelicPage = () => {
    const { gameState, gameEngine } = useGame();
    const { relics } = gameState;

    return (
        <div className="h-full p-4 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-yellow-500">유물 구성 (Relic Configuration)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relics.map(relic => (
                    <div
                        key={relic.id}
                        onClick={() => gameEngine.toggleRelic(relic.id)}
                        className={`
                            p-4 rounded border cursor-pointer transition-all duration-200 flex items-start gap-4
                            ${relic.isActive
                                ? 'bg-gray-800 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                : 'bg-gray-900 border-gray-700 opacity-60 hover:opacity-80 hover:border-gray-500'}
                        `}
                    >
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border
                            ${relic.isActive ? 'bg-gray-700 border-yellow-500' : 'bg-gray-800 border-gray-600'}
                        `}>
                            <AssetDisplay id={relic.id} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold ${relic.isActive ? 'text-white' : 'text-gray-400'}`}>{relic.name}</h3>
                                <span className={`text-[10px] px-1 rounded border ${relic.rarity === 'RARE' ? 'border-purple-500 text-purple-400' : 'border-gray-500 text-gray-400'}`}>
                                    {relic.rarity}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">{relic.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelicPage;
