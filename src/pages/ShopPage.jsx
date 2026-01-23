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
    const [enhancingCard, setEnhancingCard] = useState(false);
    const [shakeItemId, setShakeItemId] = useState(null);

    const { gold, shopInventory, shopRemovalCost, shopEnhanceCost, golem, turnCount } = gameState;

    const enhancementsResource = gameData.enhancements && gameData.enhancements.length > 0
        ? gameData.enhancements
        : [
            { type: 'ENHANCEMENT', field: 'ATTACK', value: 10, name: '보너스 공격', description: '효과 수치 +10', icon: '⚔️' },
            { type: 'SEAL', field: 'BINGO', value: 1, name: '황금 인장', description: '빙고 보상 2배', icon: '🏷️' },
            { type: 'EDITION', field: 'EFFECT', value: 0.5, name: '홀로그램', description: '모든 피해 1.5배', icon: '✨' },
        ];

    useEffect(() => {
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

    const handleEnhanceCard = (instanceId) => {
        const randomEnh = enhancementsResource[Math.floor(Math.random() * enhancementsResource.length)];
        const success = gameEngine.enhanceCardInShop(instanceId, randomEnh);
        if (success) {
            setEnhancingCard(false);
        }
    };

    const ItemCard = ({ type, item }) => {
        const isAffordable = gold >= item.price;
        const isShaking = shakeItemId === (item.id || item.instanceId);

        let displayId = item.type || item.id;
        if (displayId === '불') displayId = 'FIRE';
        else if (displayId === '물') displayId = 'WATER';
        else if (displayId === '흙') displayId = 'EARTH';
        else if (displayId === '바람') displayId = 'WIND';

        const renderIcon = () => {
            if (type === 'potion') return <span className="text-4xl text-blue-400">🧪</span>;
            if (type === 'relic') return <span className="text-4xl text-amber-500">🎁</span>;
            return <AssetDisplay id={displayId} />;
        };

        return (
            <div
                className={`
                    relative p-3 parchment-panel flex flex-col items-center gap-1 border-2 transition-all duration-200 cursor-pointer hover:scale-110 hover:z-20 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]
                    ${isShaking ? 'animate-unaffordable-shake border-red-500' : 'border-transparent'}
                `}
                onClick={() => handleBuy(type, item)}
            >
                {item.onSale && (
                    <div className="absolute -top-2.5 -right-1 z-10 bg-red-600 text-white px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-bold shadow-sm animate-pulse">
                        할인
                    </div>
                )}
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center text-2xl shadow-inner">
                    {renderIcon()}
                </div>
                <div className="text-center">
                    <div className="font-bold text-xs leading-tight text-slate-900 line-clamp-1">{item.name}</div>
                    <div className="text-[9px] text-slate-800/70 mt-0.5 line-clamp-1 h-3">{item.description}</div>
                </div>
                <div className={`
                    mt-1 px-2 py-0.5 rounded flex items-center gap-1 font-bold text-[10px] shadow-sm border border-black/10 bg-black/10
                    ${isAffordable ? 'text-yellow-700' : 'text-red-600'}
                `}>
                    💰 {item.onSale && <span className="line-through text-[8px] opacity-50 mr-1">{item.originalPrice}</span>} {item.price}
                </div>
            </div>
        );
    };

    return (
        <div className="shop-bg h-full p-6 border-[12px] border-shop-border relative overflow-y-auto text-slate-900 bg-slate-900/40">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-6 bg-slate-900/80 p-4 rounded-xl border border-shop-border/50 text-white backdrop-blur-md shadow-2xl">
                <div className="flex gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">용병의 지갑</span>
                        <span className="text-2xl font-mono leading-none">💰 {gold}</span>
                    </div>
                    <div className="w-px h-8 bg-white/20 my-auto" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">생명력</span>
                        <span className="text-2xl font-mono leading-none">❤️ {golem.hp}</span>
                    </div>
                </div>
                <div className="text-center absolute left-1/2 -translate-x-1/2">
                    <h1 className="text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tracking-[0.2em] uppercase italic drop-shadow-lg">연금술 상점</h1>
                </div>
                <button
                    onClick={() => navigate('/map')}
                    className="bg-red-900/50 hover:bg-red-800 border border-red-500/50 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg active:scale-95"
                >
                    상점 나가기
                </button>
            </div>

            <div className="max-w-6xl mx-auto space-y-6">
                {/* 1-2단: 카드 판매대 (8장) */}
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-inner">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest">금주의 추천 연금 카드</h2>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {shopInventory.cards.map((card, idx) => (
                            <ItemCard key={card.instanceId || idx} type="card" item={card} />
                        ))}
                    </div>
                </div>

                {/* 3-4단 통합 구역 */}
                <div className="grid grid-cols-12 gap-6">
                    {/* 하단 좌측 (유물 & 포션) */}
                    <div className="col-span-8 space-y-4">
                        {/* 3단 좌측: 유물 */}
                        <div className="bg-slate-800/40 p-4 rounded-xl border border-amber-500/20">
                            <h3 className="text-[10px] font-bold text-amber-500/70 mb-3 uppercase tracking-widest">신비한 고대 유물</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {shopInventory.relics.map(relic => (
                                    <ItemCard key={relic.id || relic.artifactId} type="relic" item={relic} />
                                ))}
                            </div>
                        </div>
                        {/* 4단 좌측: 포션 */}
                        <div className="bg-slate-800/40 p-4 rounded-xl border border-blue-500/20">
                            <h3 className="text-[10px] font-bold text-blue-500/70 mb-3 uppercase tracking-widest">비상용 연금 포션</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {shopInventory.potions.map(potion => (
                                    <ItemCard key={potion.id} type="potion" item={potion} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 하단 우측 (카드 관리 섹션) */}
                    <div className="col-span-4 bg-slate-800/40 p-4 rounded-xl border border-indigo-500/20 shadow-xl flex flex-col">
                        <h3 className="text-[10px] font-bold text-indigo-500/70 mb-3 uppercase tracking-widest text-center">카드 관리 서비스</h3>

                        <div className="grid grid-cols-2 gap-3 flex-1">
                            {/* 카드 제거 */}
                            <div
                                className="parchment-panel p-3 flex flex-col items-center justify-between border-2 border-dashed border-red-500/20 hover:border-red-500/50 cursor-pointer transition-all hover:bg-red-500/5 group"
                                onClick={() => setRemovingCard(true)}
                            >
                                <div className="text-3xl py-2 group-hover:scale-110 transition-transform">🗑️</div>
                                <div className="text-center">
                                    <div className="font-bold text-xs text-slate-900">제거</div>
                                    <div className="text-[8px] text-slate-800/50 leading-none mt-0.5">덱 압축</div>
                                </div>
                                <div className={`
                                    mt-3 w-full py-1 rounded flex items-center justify-center gap-1 font-bold text-[10px]
                                    ${gold >= shopRemovalCost ? 'bg-yellow-500/20 text-yellow-700' : 'bg-red-500/20 text-red-600'}
                                `}>
                                    💰 {shopRemovalCost}
                                </div>
                            </div>

                            {/* 카드 강화 */}
                            <div
                                className="parchment-panel p-3 flex flex-col items-center justify-between border-2 border-dashed border-blue-500/20 hover:border-blue-500/50 cursor-pointer transition-all hover:bg-blue-500/5 group"
                                onClick={() => setEnhancingCard(true)}
                            >
                                <div className="text-3xl py-2 group-hover:scale-110 transition-transform">🔨</div>
                                <div className="text-center">
                                    <div className="font-bold text-xs text-slate-900">강화</div>
                                    <div className="text-[8px] text-slate-800/50 leading-none mt-0.5">랜덤 업그레이드</div>
                                </div>
                                <div className={`
                                    mt-3 w-full py-1 rounded flex items-center justify-center gap-1 font-bold text-[10px]
                                    ${gold >= shopEnhanceCost ? 'bg-blue-500/20 text-blue-700' : 'bg-red-500/20 text-red-600'}
                                `}>
                                    💰 {shopEnhanceCost}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals remain mostly the same but with enhancement support */}
            {removingCard && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-8 backdrop-blur-md">
                    <div className="max-w-4xl w-full bg-slate-900 border-4 border-shop-border p-8 flex flex-col h-[80vh] shadow-[0_0_50px_rgba(255,0,0,0.2)]">
                        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                            <div>
                                <h3 className="text-4xl font-serif font-bold text-red-500 uppercase tracking-tighter">덱 정화 (카드 제거)</h3>
                                <p className="text-slate-400 text-sm mt-2 font-light">제거할 카드를 선택하세요. 이 작업은 되돌릴 수 없습니다.</p>
                            </div>
                            <button onClick={() => setRemovingCard(false)} className="text-white/40 hover:text-white text-4xl leading-none">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-4 grid grid-cols-6 gap-4">
                            {gameEngine.cardSystem.getAllCards().map(card => (
                                <div
                                    key={card.instanceId}
                                    onClick={() => handleRemoveCard(card.instanceId)}
                                    className="aspect-[3/4] parchment-panel p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-110 hover:border-red-500 hover:z-10 transition-all group relative border-2 border-transparent"
                                >
                                    <div className="text-3xl mb-1"><AssetDisplay id={card.type} /></div>
                                    <div className="text-[10px] font-black text-slate-900 leading-none">{card.name || card.type}</div>
                                    <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/30 transition-colors flex items-center justify-center text-red-100 opacity-0 group-hover:opacity-100 font-bold text-xs">REMOVING</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {enhancingCard && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-8 backdrop-blur-md">
                    <div className="max-w-5xl w-full bg-slate-900 border-4 border-blue-500 p-8 flex flex-col h-[85vh] shadow-[0_0_50px_rgba(0,100,255,0.3)]">
                        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                            <div>
                                <h3 className="text-4xl font-serif font-bold text-blue-400 uppercase tracking-tighter">연금 강화 (카드 강화)</h3>
                                <p className="text-slate-400 text-sm mt-2 font-light">강화할 카드를 선택하세요. 무작위 강화 효과가 부여됩니다.</p>
                            </div>
                            <button onClick={() => { setEnhancingCard(false); }} className="text-white/40 hover:text-white text-4xl leading-none">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto grid grid-cols-6 gap-4 pr-4">
                            {gameEngine.cardSystem.getAllCards().map(card => (
                                <div
                                    key={card.instanceId}
                                    onClick={() => handleEnhanceCard(card.instanceId)}
                                    className="aspect-[3/4] parchment-panel p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-110 hover:border-blue-500 hover:z-10 transition-all border-2 border-transparent group relative"
                                >
                                    <div className="text-3xl mb-1 group-hover:animate-bounce"><AssetDisplay id={card.type} /></div>
                                    <div className="text-[10px] font-black text-slate-900 leading-none">{card.name || card.type}</div>
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors pointer-events-none flex items-center justify-center">
                                        <span className="text-blue-100 font-bold text-[10px] opacity-0 group-hover:opacity-100 uppercase tracking-tighter">Enhance</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopPage;

