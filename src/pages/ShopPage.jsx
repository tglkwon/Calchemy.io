import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useGameData } from '../context/GameDataProvider';
import AssetDisplay from '../components/AssetDisplay';
import './ShopPage.css';

const ShopPage = () => {
    const { gameState, gameEngine } = useGame();
    const { gameData } = useGameData();
    const navigate = useNavigate();
    const [removingCard, setRemovingCard] = useState(false);
    const [shakeItemId, setShakeItemId] = useState(null);

    const { gold, shopInventory, shopRemovalCost, golem, turnCount } = gameState;

    useEffect(() => {
        // Generate shop inventory if it's currently empty
        if (shopInventory.cards.length === 0 && shopInventory.relics.length === 0 && shopInventory.potions.length === 0) {
            gameEngine.generateShopInventory(gameData);
        }
    }, [gameEngine, gameData, shopInventory.cards.length, shopInventory.relics.length, shopInventory.potions.length]);

    const handleBuy = (type, item) => {
        const success = gameEngine.buyItem(type, item);
        if (!success) {
            setShakeItemId(item.id || item.instanceId);
            setTimeout(() => setShakeItemId(null), 500);
        }
    };

    const handleRemoveCard = (instanceId) => {
        const success = gameEngine.removeCardInShop(instanceId);
        if (success) {
            setRemovingCard(false);
        }
    };

    const ItemCard = ({ type, item, showSale = false }) => {
        const isAffordable = gold >= item.price;
        const isShaking = shakeItemId === (item.id || item.instanceId);

        // Card specific icon logic
        let displayId = item.type || item.id;

        // Safety mapper for any remaining Korean elements if fallback is needed, 
        // though Option C should have handled this in gameData.json
        if (displayId === '불') displayId = 'FIRE';
        else if (displayId === '물') displayId = 'WATER';
        else if (displayId === '흙') displayId = 'EARTH';
        else if (displayId === '바람') displayId = 'WIND';

        return (
            <div
                className={`item-card p-4 parchment-panel flex flex-col items-center gap-2 border-2 ${isShaking ? 'unaffordable-shake border-red-500' : 'border-transparent'}`}
                onClick={() => handleBuy(type, item)}
            >
                {item.onSale && <div className="on-sale-badge">할인</div>}
                <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center text-3xl shadow-inner">
                    <AssetDisplay id={displayId} />
                </div>
                <div className="text-center">
                    <div className="font-bold text-sm leading-tight">{item.name}</div>
                    <div className="text-[10px] opacity-70 mt-1 line-clamp-2 h-6">{item.description}</div>
                </div>
                <div className={`price-tag mt-2 ${isAffordable ? 'affordable' : 'unaffordable'}`}>
                    <span className="gold-icon">💰</span>
                    {item.onSale && <span className="line-through text-xs opacity-50 mr-1">{item.originalPrice}</span>}
                    {item.price}
                </div>
            </div>
        );
    };

    return (
        <div className="shop-background h-full text-[#2c1e12]">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-12 bg-black/40 p-4 rounded-lg border border-[#4a3728] text-white">
                <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-500 font-bold">💰 골드:</span>
                        <span className="text-xl font-mono">{gold}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">❤️ 체력:</span>
                        <span className="text-xl font-mono">{golem.hp} / {golem.maxHp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-bold">📍 층:</span>
                        <span className="text-xl font-mono">{turnCount || 1}</span>
                    </div>
                </div>
                <h1 className="text-3xl font-serif font-bold text-yellow-600 tracking-widest uppercase">연금술 상점</h1>
            </div>

            <div className="grid grid-cols-12 gap-8 max-w-6xl mx-auto">
                {/* Main Card Section (8장: 4x2) */}
                <div className="col-span-8 flex flex-col gap-4">
                    <h2 className="text-xl font-serif font-bold border-b-2 border-[#4a3728]/30 mb-2">추천 카드</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {shopInventory.cards.map(card => (
                            <ItemCard key={card.id} type="card" item={card} />
                        ))}
                    </div>
                </div>

                {/* Right Items & Service Section */}
                <div className="col-span-4 flex flex-col gap-8">
                    {/* Card Removal Service */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-serif font-bold border-b-2 border-[#4a3728]/30 mb-2">상점 서비스</h2>
                        <div
                            className="parchment-panel p-6 flex flex-col items-center gap-4 border-2 border-dashed border-[#4a3728]/50 hover:border-[#4a3728] cursor-pointer transition-all group"
                            onClick={() => setRemovingCard(true)}
                        >
                            <div className="text-5xl group-hover:scale-110 transition-transform">🗑️</div>
                            <div className="text-center">
                                <div className="font-bold text-lg">카드 제거</div>
                                <div className="text-xs opacity-60">덱에서 원하지 않는 카드를 영구적으로 제거합니다.</div>
                            </div>
                            <div className={`price-tag ${gold >= shopRemovalCost ? 'affordable' : 'unaffordable'}`}>
                                <span className="gold-icon">💰</span>
                                {shopRemovalCost}
                            </div>
                        </div>
                    </div>

                    {/* Relics & Potions */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl font-serif font-bold border-b-2 border-[#4a3728]/30 mb-2">유물 및 비약</h2>
                        <div className="grid grid-cols-3 gap-2">
                            {shopInventory.relics.map(relic => (
                                <ItemCard key={relic.id || relic.artifactId} type="relic" item={relic} />
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {shopInventory.potions.map(potion => (
                                <ItemCard key={potion.id} type="potion" item={potion} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Exit Button */}
            <div className="mt-12 flex justify-center">
                <button
                    onClick={() => navigate('/map')}
                    className="shop-exit-btn px-12 py-3 rounded-full font-serif font-bold text-xl uppercase tracking-widest shadow-lg"
                >
                    상점 나가기
                </button>
            </div>

            {/* Card Removal Modal Overlay */}
            {removingCard && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8">
                    <div className="max-w-4xl w-full bg-[#1a1510] border-4 border-[#3d2b1f] p-8 flex flex-col h-[80vh]">
                        <div className="flex justify-between items-center mb-8 border-b border-[#3d2b1f] pb-4">
                            <div>
                                <h3 className="text-3xl font-serif font-bold text-yellow-600">덱 정화 (카드 제거)</h3>
                                <p className="text-gray-400 text-sm mt-1">선택한 카드가 덱에서 영구적으로 제거됩니다.</p>
                            </div>
                            <button
                                onClick={() => setRemovingCard(false)}
                                className="text-gray-500 hover:text-white text-2xl"
                            >✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4">
                            <div className="flex flex-wrap gap-4 justify-center">
                                {gameEngine.cardSystem.getAllCards().map(card => {
                                    let displayId = card.type;
                                    if (displayId === '불') displayId = 'FIRE';
                                    else if (displayId === '물') displayId = 'WATER';
                                    else if (displayId === '흙') displayId = 'EARTH';
                                    else if (displayId === '바람') displayId = 'WIND';

                                    return (
                                        <div
                                            key={card.instanceId}
                                            onClick={() => handleRemoveCard(card.instanceId)}
                                            className="w-24 h-32 bg-[#c2b280] rounded border-2 border-transparent hover:border-red-600 hover:scale-110 transition-all cursor-pointer group relative shadow-lg"
                                        >
                                            <div className="flex flex-col items-center justify-center h-full p-2 text-center text-[#2c1e12]">
                                                <div className="text-3xl mb-2"><AssetDisplay id={displayId} /></div>
                                                <div className="text-[10px] font-bold leading-tight">{card.name || card.type}</div>
                                            </div>
                                            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/20 transition-colors pointer-events-none" />
                                            <div className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-[#3d2b1f] flex justify-center">
                            <button
                                onClick={() => setRemovingCard(false)}
                                className="px-8 py-2 border border-[#4a3728] text-gray-400 hover:text-white hover:bg-[#3d2b1f] transition-all rounded"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopPage;
