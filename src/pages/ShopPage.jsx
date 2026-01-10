import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useGameData } from '../context/GameDataProvider';
import AssetDisplay from '../components/AssetDisplay';

const ShopPage = () => {
    const { gameState, gameEngine } = useGame();
    const { gameData } = useGameData();
    const navigate = useNavigate();
    const [removingCard, setRemovingCard] = useState(false);
    const [shakeItemId, setShakeItemId] = useState(null);

    const { gold, shopInventory, shopRemovalCost, golem, turnCount } = gameState;

    useEffect(() => {
        // Generate shop inventory every time the user enters the shop
        gameEngine.generateShopInventory(gameData);
    }, [gameEngine, gameData]);

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

        // Safety mapper for any remaining Korean elements
        if (displayId === '불') displayId = 'FIRE';
        else if (displayId === '물') displayId = 'WATER';
        else if (displayId === '흙') displayId = 'EARTH';
        else if (displayId === '바람') displayId = 'WIND';

        // Override icons for Potions and Relics as requested
        const renderIcon = () => {
            if (type === 'potion') return <span className="text-4xl">🧪</span>;
            if (type === 'relic') return <span className="text-4xl">🎁</span>;
            return <AssetDisplay id={displayId} />;
        };

        return (
            <div
                className={`
                    relative p-4 parchment-panel flex flex-col items-center gap-2 border-2 transition-all duration-200 cursor-pointer hover:scale-110 hover:z-20 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]
                    ${isShaking ? 'animate-unaffordable-shake border-red-500' : 'border-transparent'}
                `}
                onClick={() => handleBuy(type, item)}
            >
                {item.onSale && (
                    <div className="absolute -top-2.5 -right-1 z-10 bg-red-600 text-white px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-bold shadow-sm">
                        할인
                    </div>
                )}
                <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center text-3xl shadow-inner">
                    {renderIcon()}
                </div>
                <div className="text-center">
                    <div className="font-bold text-sm leading-tight text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-800/70 mt-1 line-clamp-2 h-6">{item.description}</div>
                </div>
                <div className={`
                    mt-2 px-2 py-0.5 rounded flex items-center gap-1 font-bold text-xs shadow-sm border border-black/10 bg-black/10
                    ${isAffordable ? 'text-yellow-600' : 'text-red-600'}
                `}>
                    <span className="drop-shadow-sm">💰</span>
                    {item.onSale && <span className="line-through text-[10px] opacity-50 mr-1">{item.originalPrice}</span>}
                    {item.price}
                </div>
            </div>
        );
    };

    return (
        <div className="shop-bg h-full p-8 border-[12px] border-shop-border relative overflow-y-auto text-slate-900">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8 bg-black/60 p-4 rounded-lg border border-shop-border/50 text-white backdrop-blur-sm">
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
                <h1 className="text-3xl font-serif font-bold text-yellow-500 tracking-widest uppercase drop-shadow-md">연금술 상점</h1>
            </div>

            <div className="max-w-6xl mx-auto flex flex-col gap-10">
                {/* Section 1: Main Products (Cards) */}
                <div className="bg-black/5 p-6 rounded-xl border border-shop-border/20">
                    <div className="grid grid-cols-4 gap-4">
                        {shopInventory.cards.map(card => (
                            <ItemCard key={card.id} type="card" item={card} />
                        ))}
                    </div>
                </div>

                {/* Section 2: Bottom Row (Services & Miscellaneous) */}
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Station: Card Removal */}
                    <div className="col-span-4">
                        <div
                            className="parchment-panel h-full p-6 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-shop-border/30 hover:border-shop-border/60 cursor-pointer transition-all group shadow-lg"
                            onClick={() => setRemovingCard(true)}
                        >
                            <div className="text-6xl group-hover:scale-110 transition-transform drop-shadow-md">🗑️</div>
                            <div className="text-center">
                                <div className="font-bold text-xl text-slate-900 mb-1">카드 제거</div>
                                <div className="text-xs text-slate-800/60 leading-tight">덱에서 원하지 않는 카드를<br />영구적으로 제거합니다.</div>
                            </div>
                            <div className={`
                                mt-2 px-4 py-1.5 rounded-full flex items-center gap-1 font-bold shadow-md border border-black/10 bg-black/20
                                ${gold >= shopRemovalCost ? 'text-yellow-600' : 'text-red-600'}
                            `}>
                                <span className="drop-shadow-sm">💰</span>
                                {shopRemovalCost}
                            </div>
                        </div>
                    </div>

                    {/* Right Station: Relics & Potions */}
                    <div className="col-span-8 flex flex-col gap-4 bg-black/5 p-6 rounded-xl border border-shop-border/20">
                        <div className="grid grid-cols-3 gap-4">
                            {shopInventory.relics.map(relic => (
                                <ItemCard key={relic.id || relic.artifactId} type="relic" item={relic} />
                            ))}
                            {shopInventory.potions.map(potion => (
                                <ItemCard key={potion.id} type="potion" item={potion} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Exit Button */}
            <div className="mt-10 mb-6 flex justify-center">
                <button
                    onClick={() => navigate('/map')}
                    className="bg-shop-border border-2 border-shop-border/50 text-parchment-gold px-12 py-3 rounded-full font-serif font-bold text-xl uppercase tracking-widest shadow-xl transition-all hover:bg-shop-border/80 hover:scale-105 active:scale-95"
                >
                    상점 나가기
                </button>
            </div>


            {/* Card Removal Modal Overlay */}
            {removingCard && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 backdrop-blur-sm">
                    <div className="max-w-4xl w-full bg-shop-dark border-4 border-shop-border p-8 flex flex-col h-[80vh] shadow-2xl">
                        <div className="flex justify-between items-center mb-8 border-b border-shop-border/50 pb-4">
                            <div>
                                <h3 className="text-3xl font-serif font-bold text-yellow-500">덱 정화 (카드 제거)</h3>
                                <p className="text-slate-400 text-sm mt-1">선택한 카드가 덱에서 영구적으로 제거됩니다.</p>
                            </div>
                            <button
                                onClick={() => setRemovingCard(false)}
                                className="text-slate-500 hover:text-white text-3xl leading-none transition-colors"
                            >✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-shop-border/50">
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
                                            className="w-24 h-32 bg-parchment-gold rounded border-2 border-transparent hover:border-red-600 hover:scale-110 transition-all cursor-pointer group relative shadow-lg overflow-hidden"
                                        >
                                            <div className="flex flex-col items-center justify-center h-full p-2 text-center text-slate-950">
                                                <div className="text-3xl mb-2 drop-shadow-sm"><AssetDisplay id={displayId} /></div>
                                                <div className="text-[10px] font-bold leading-tight">{card.name || card.type}</div>
                                            </div>
                                            <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/20 transition-colors pointer-events-none" />
                                            <div className="absolute -top-1 -right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-md">✕</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-shop-border/50 flex justify-center">
                            <button
                                onClick={() => setRemovingCard(false)}
                                className="px-10 py-2 border border-shop-border text-slate-400 hover:text-white hover:bg-shop-border/30 transition-all rounded-lg font-semibold"
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

