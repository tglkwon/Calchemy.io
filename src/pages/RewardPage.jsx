import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';

const RewardPage = () => {
    const navigate = useNavigate();
    const { gameState, gameEngine } = useGame();
    const { activeRewards, gold: currentGold } = gameState; // Access activeRewards
    const [showCardModal, setShowCardModal] = useState(false);
    const [showRelicModal, setShowRelicModal] = useState(false);

    // Redirect if no rewards (e.g. refreshed page without state persistence or accessed directly)
    useEffect(() => {
        if (!activeRewards) {
            navigate('/map');
        }
    }, [activeRewards, navigate]);

    if (!activeRewards) return null;

    const handleClaimGold = () => {
        gameEngine.claimReward('GOLD');
    };

    const handleClaimPotion = (potion) => {
        gameEngine.claimReward('POTION', potion);
    };

    const handleOpenCardDraft = () => {
        if (!activeRewards.isClaimed.cards) {
            setShowCardModal(true);
        }
    };

    const handleSelectCard = (card) => {
        gameEngine.claimReward('CARD', card);
        setShowCardModal(false);
    };

    const handleSkipCard = () => {
        gameEngine.skipReward('CARD');
        setShowCardModal(false);
    };

    const handleOpenRelicDraft = () => {
        if (!activeRewards.isClaimed.relics) {
            setShowRelicModal(true);
        }
    };

    const handleSelectRelic = (relic) => {
        gameEngine.claimReward('RELIC', relic);
        setShowRelicModal(false);
    };

    // Return to Map
    const handleReturnToMap = () => {
        gameEngine.completeRewards(); // Clear rewards
        navigate('/map');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 relative overflow-hidden"
            style={{
                backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/parchment_bg.jpg)`,
                backgroundSize: 'cover'
            }}>

            <div className="bg-black/80 p-8 rounded-lg max-w-2xl w-full text-center relative z-10 shadow-2xl border border-gray-600">
                <h1 className="text-4xl font-bold mb-8 text-yellow-500 animate-pulse">
                    🏆 승리!
                </h1>

                <div className="space-y-6">
                    {/* Gold Reward */}
                    <RewardItem
                        icon="💰"
                        label={`${activeRewards.gold} 골드`}
                        isClaimed={activeRewards.isClaimed.gold}
                        onClick={handleClaimGold}
                    />

                    {/* Card Reward */}
                    {activeRewards.cards && activeRewards.cards.length > 0 && (
                        <RewardItem
                            icon="🃏"
                            label="새로운 카드 획득"
                            subLabel="(3개 중 1개 선택)"
                            isClaimed={activeRewards.isClaimed.cards}
                            onClick={handleOpenCardDraft}
                        />
                    )}

                    {/* Relic Reward */}
                    {activeRewards.relics && activeRewards.relics.length > 0 && (
                        <RewardItem
                            icon="🏺"
                            label="유물 획득"
                            subLabel="(선택)"
                            isClaimed={activeRewards.isClaimed.relics}
                            onClick={handleOpenRelicDraft}
                        />
                    )}

                    {/* Potion Rewards */}
                    {activeRewards.potions && activeRewards.potions.map((potion, idx) => (
                        <RewardItem
                            key={`potion-${idx}`}
                            icon="🧪"
                            label={`포션: ${potion.name}`}
                            isClaimed={false} // Potions are individual? Logic in engine removes them from list.
                            // Accessing rewards.potions directly means they disappear when claimed.
                            // So we technically don't need 'isClaimed' flag for list items if they vanish.
                            // But usually list items stay and look 'dimmed' or 'checked'.
                            // My engine implementation removes it from array:
                            // activeRewards.potions = activeRewards.potions.filter(...)
                            // So it will just disappear. That's fine.
                            onClick={() => handleClaimPotion(potion)}
                        />
                    ))}
                    {activeRewards.potions.length === 0 && gameState.activeRewards.potions_claimed_placeholder && (
                        // Optional: Show claimed state if we stored it
                        <div></div>
                    )}

                </div>

                <div className="mt-12">
                    <button
                        onClick={handleReturnToMap}
                        className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded shadow-lg transition-transform hover:scale-105"
                    >
                        지도 복귀
                    </button>
                </div>
            </div>

            {/* Card Draft Modal */}
            {showCardModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                    <h2 className="text-3xl font-bold text-white mb-8">카드 선택</h2>
                    <div className="flex gap-4 mb-12 flex-wrap justify-center">
                        {activeRewards.cards.map((card, idx) => (
                            <div key={idx} className="cursor-pointer transform hover:scale-110 transition-transform"
                                onClick={() => handleSelectCard(card)}>
                                <Card card={card} isPlayable={false} />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleSkipCard}
                        className="px-6 py-2 border border-gray-500 text-gray-400 hover:text-white hover:border-white rounded"
                    >
                        카드 건너뛰기
                    </button>
                </div>
            )}

            {/* Relic Draft Modal */}
            {showRelicModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                    <h2 className="text-3xl font-bold text-white mb-8">유물 선택</h2>
                    <div className="flex gap-4 mb-12 flex-wrap justify-center">
                        {activeRewards.relics.map((relic, idx) => (
                            <div key={idx}
                                className="cursor-pointer bg-gray-800 p-6 rounded-lg hover:bg-gray-700 border border-gray-600 w-64 flex flex-col items-center gap-4"
                                onClick={() => handleSelectRelic(relic)}>
                                <div className="text-4xl">🏺</div>
                                <h3 className="text-xl font-bold text-yellow-400">{relic.name}</h3>
                                <p className="text-sm text-gray-300 text-center">{relic.desc || relic.effect}</p>
                            </div>
                        ))}
                    </div>
                    {/* Relics usually mandatory in some games, but maybe skippable? Let's assume mandatory for now or click outside to close (but closing means not claiming). */}
                </div>
            )}

        </div>
    );
};

const RewardItem = ({ icon, label, subLabel, isClaimed, onClick }) => {
    return (
        <div
            onClick={!isClaimed ? onClick : undefined}
            className={`
                flex items-center justify-between p-4 rounded border 
                ${isClaimed
                    ? 'bg-gray-800 border-gray-700 opacity-50 cursor-default'
                    : 'bg-gray-700/50 border-gray-500 hover:bg-gray-600 cursor-pointer hover:border-yellow-400'
                }
                transition-all
            `}
        >
            <div className="flex items-center gap-4">
                <span className="text-2xl">{icon}</span>
                <div className="flex flex-col items-start">
                    <span className={`font-bold ${isClaimed ? 'text-gray-500' : 'text-white'}`}>
                        {label} {isClaimed && "(수령함)"}
                    </span>
                    {subLabel && <span className="text-xs text-gray-400">{subLabel}</span>}
                </div>
            </div>
            {!isClaimed && (
                <div className="animate-bounce-x">
                    👈
                </div>
            )}
        </div>
    );
};

export default RewardPage;
