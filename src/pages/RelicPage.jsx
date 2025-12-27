import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import AssetDisplay from '../components/AssetDisplay';

const RelicPage = () => {
    const navigate = useNavigate();
    const { gameState, gameEngine } = useGame();
    const { relics, treasureSelectionMode, offeredRelics } = gameState;

    const activeRelics = relics.filter(r => r.isActive);

    const handleTreasureSelect = (relicId) => {
        gameEngine.selectTreasureRelic(relicId);
        navigate('/map');
    };

    const handleSkipTreasure = () => {
        gameEngine.skipTreasureSelection();
        navigate('/map');
    };

    return (
        <div className="h-full p-4 overflow-y-auto">
            {/* Section 1: Active Relics */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-yellow-500">활성 유물 (Active Relics)</h2>
                {activeRelics.length === 0 ? (
                    <p className="text-gray-500 italic">아직 활성화된 유물이 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {activeRelics.map(relic => (
                            <div
                                key={relic.id}
                                className="p-3 rounded border bg-gray-800 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 bg-gray-700 border border-yellow-500">
                                    <AssetDisplay id={relic.id} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white text-sm truncate">{relic.name}</h3>
                                    <span className={`text-[9px] px-1 rounded border ${relic.rarity === 'RARE' ? 'border-purple-500 text-purple-400' : 'border-gray-500 text-gray-400'}`}>
                                        {relic.rarity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 2: Treasure Selection (conditional) */}
            {treasureSelectionMode && offeredRelics.length > 0 && (
                <div className="mb-8 p-6 rounded-lg border-2 border-yellow-500 bg-gradient-to-br from-gray-900 to-gray-800 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                    <h2 className="text-3xl font-bold mb-2 text-yellow-400 text-center">🎁 보물 상자</h2>
                    <p className="text-center text-gray-400 mb-6">유물 중 하나를 선택하세요</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {offeredRelics.map(relic => (
                            <button
                                key={relic.id}
                                onClick={() => handleTreasureSelect(relic.id)}
                                className="p-4 rounded-lg border-2 border-yellow-600 bg-gray-800 hover:bg-gray-700 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all duration-200 cursor-pointer group"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gray-700 border-2 border-yellow-500 group-hover:scale-110 transition-transform">
                                        <AssetDisplay id={relic.id} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-white mb-1">{relic.name}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${relic.rarity === 'RARE' ? 'border-purple-500 text-purple-400 bg-purple-900/20' : 'border-gray-500 text-gray-400'}`}>
                                            {relic.rarity}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-2">{relic.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleSkipTreasure}
                            className="px-6 py-2 rounded border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            건너뛰기
                        </button>
                    </div>
                </div>
            )}

            {/* Section 3: All Relics (Toggle functionality) */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-400">전체 유물 리스트 (All Relics)</h2>
                <p className="text-sm text-gray-500 mb-4 italic">클릭하여 활성/비활성 전환 (개발자 모드)</p>
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
        </div>
    );
};

export default RelicPage;
