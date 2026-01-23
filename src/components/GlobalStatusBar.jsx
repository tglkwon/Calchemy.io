import React from 'react';
import { useGame } from '../context/GameContext';
import AssetDisplay from './AssetDisplay';

const GlobalStatusBar = () => {
    const { gameState, gameEngine } = useGame();
    const {
        golem,
        gold,
        potions = [],
        maxPotions = 3,
        relics = []
    } = gameState;

    // Filter active relics for display
    const activeRelics = relics.filter(r => r.isActive);

    const handleUsePotion = (index) => {
        // Optional: Add confirmation or checking if in battle
        // For MVP, just use it
        gameEngine.usePotion(index);
    };

    return (
        <div className="w-full h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 z-40 shadow-md">
            {/* Left: Vital Stats */}
            <div className="flex items-center gap-6">
                {/* HP */}
                <div className="flex items-center gap-2 text-red-500 font-bold text-lg" title="체력">
                    <span>❤️</span>
                    <span>{golem ? `${golem.hp}/${golem.maxHp}` : '0/0'}</span>
                </div>

                {/* Gold */}
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg" title="골드">
                    <span>💰</span>
                    <span>{gold}</span>
                </div>
            </div>

            {/* Center: Potions */}
            <div className="flex items-center gap-2">
                {Array.from({ length: maxPotions }).map((_, i) => {
                    const potion = potions[i];
                    return (
                        <div
                            key={i}
                            onClick={() => potion && handleUsePotion(i)}
                            className={`
                                w-10 h-10 rounded-full border-2 flex items-center justify-center relative transition-all
                                ${potion
                                    ? 'bg-purple-900/50 border-purple-400 cursor-pointer hover:scale-110 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                                    : 'bg-slate-800 border-slate-700 opacity-50'
                                }
                            `}
                            title={potion ? `${potion.name}\n${potion.summary || '클릭하여 사용'}` : '빈 포션 슬롯'}
                        >
                            {potion ? (
                                <span className="text-xl">🧪</span>
                            ) : (
                                <span className="text-xs text-slate-600 font-bold">{i + 1}</span>
                            )}

                            {/* Simple tooltip on hover for potion name */}
                            {potion && (
                                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs p-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                                    {potion.name}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Right: Relics */}
            <div className="flex items-center gap-2">
                {activeRelics.length === 0 && <span className="text-slate-600 text-sm italic">유물 없음</span>}
                {activeRelics.map(relic => (
                    <div
                        key={relic.id}
                        className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-yellow-600/50 text-base relative group cursor-help hover:border-yellow-400 transition-colors"
                    >
                        <AssetDisplay id={relic.id} />
                        {/* Tooltip */}
                        <div className="absolute top-full mt-2 right-0 w-48 bg-black/95 text-xs text-gray-200 p-2 rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                            <div className="font-bold text-yellow-500 mb-1">{relic.name}</div>
                            {relic.description}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GlobalStatusBar;
