import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';

const RewardPage = () => {
    const navigate = useNavigate();
    const { gameState, gameEngine } = useGame();
    const { activeRewards } = gameState;

    // Phase: 0 = Loot (Gold/Cards), 1 = Relic (Boss Only), 2 = Victory (Boss Only)
    const [phase, setPhase] = useState(0);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showRelicModal, setShowRelicModal] = useState(false);
    const [confettiFired, setConfettiFired] = useState(false);

    // Redirect if no rewards
    useEffect(() => {
        if (!activeRewards) {
            navigate('/map');
        }
    }, [activeRewards, navigate]);

    // Boss Flow Management
    useEffect(() => {
        if (activeRewards?.isBossReward) {
            // Victory Phase Animation
            if (phase === 2 && !confettiFired) {
                import('canvas-confetti').then((confetti) => {
                    confetti.default({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }).catch(e => console.warn("Confetti failed", e));
                setConfettiFired(true);
            }
        }
    }, [phase, activeRewards, confettiFired]);

    if (!activeRewards) return null;

    const isBoss = activeRewards.isBossReward;

    // --- Actions ---

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
        // Normal/Elite: Just open modal to pick ANY (if implemented as draft) or just claim single
        // Current logic: Elite gives 3 random relics to choose 1 ??? 
        // Logic in RewardSystem: `rewards.relics` is array of 3.
        // So yes, it is a draft.
        if (!activeRewards.isClaimed.relics) {
            setShowRelicModal(true);
        }
    };

    const handleSelectRelic = (relic) => {
        gameEngine.claimReward('RELIC', relic);
        setShowRelicModal(false);

        // If Boss Phase 1 (Relic), auto-advance to Victory
        if (isBoss && phase === 1) {
            setPhase(2);
        }
    };

    // --- Navigation & Phase Control ---

    const canAdvanceFromLoot = () => {
        // Must claim Gold and (Claim or Skip) Cards
        const goldDone = activeRewards.isClaimed.gold;
        // Potion is optional
        const cardsDone = activeRewards.isClaimed.cards || (activeRewards.cards.length === 0);
        return goldDone && cardsDone;
    };

    const handleNextPhase = () => {
        if (isBoss) {
            if (phase === 0) setPhase(1); // Go to Relic
        } else {
            // Normal/Elite: Return to Map
            handleReturnToMap();
        }
    };

    const handleReturnToMap = () => {
        gameEngine.completeRewards();
        navigate('/map');
    };

    const handleRestart = () => {
        gameEngine.restart();
        navigate('/map'); // Or title screen? engine restart usually starts battle.
        // GameEngine.restart() starts battle immediately. We might want a full reset to title?
        // Current GameEngine.restart() resets everything and starts battle.
        // Maybe we want `generateNewMap()` first?
        gameEngine.generateNewMap(); // Reset Map
        navigate('/map');
    };


    // --- Render Helpers ---

    const renderLootPhase = () => (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl text-yellow-500 font-bold mb-4">
                {isBoss ? "전리품 획득" : "전투 보상"}
            </h2>

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
                    label="새로운 카드"
                    subLabel="(3장 중 1장 선택)"
                    isClaimed={activeRewards.isClaimed.cards}
                    onClick={handleOpenCardDraft}
                />
            )}

            {/* Elite/Normal Relic (If explicitly dropped in this phase, usually Elite) */}
            {/* If Boss, Relic is next phase, so hide here */}
            {!isBoss && activeRewards.relics && activeRewards.relics.length > 0 && (
                <RewardItem
                    icon="🏺"
                    label="유물 획득"
                    subLabel="(선택)"
                    isClaimed={activeRewards.isClaimed.relics}
                    onClick={handleOpenRelicDraft}
                />
            )}

            {/* Potions */}
            {activeRewards.potions && activeRewards.potions.map((potion, idx) => (
                <RewardItem
                    key={`potion-${idx}`}
                    icon="🧪"
                    label={`포션: ${potion.name}`}
                    isClaimed={false}
                    onClick={() => handleClaimPotion(potion)}
                />
            ))}
        </div>
    );

    const renderBossRelicPhase = () => (
        <div className="space-y-8 animate-fade-in-up flex flex-col items-center">
            <h2 className="text-3xl text-purple-400 font-bold mb-8">보스 유물 선택</h2>
            <div className="flex gap-6 flex-wrap justify-center">
                {activeRewards.relics.map((relic, idx) => (
                    <div key={idx}
                        onClick={() => handleSelectRelic(relic)}
                        className="w-64 p-6 bg-slate-900 border-2 border-slate-700 hover:border-purple-500 rounded-xl cursor-pointer hover:-translate-y-2 transition-transform shadow-xl flex flex-col items-center gap-4 group">
                        <div className="text-6xl group-hover:scale-110 transition-transform">🏺</div>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400">{relic.name}</h3>
                        <p className="text-sm text-gray-400 text-center">{relic.desc || relic.effect || "강력한 보스 유물입니다."}</p>
                    </div>
                ))}
            </div>
            <p className="text-gray-500 mt-4">신중하게 선택하세요. 단 하나만 가져갈 수 있습니다.</p>
        </div>
    );

    const renderVictoryPhase = () => (
        <div className="space-y-8 animate-fade-in-up text-center">
            <h1 className="text-6xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] mb-4">
                STAGE CLEARED!
            </h1>
            <div className="text-2xl text-white mb-8">
                축하합니다! 위대한 여정을 마쳤습니다.
            </div>

            {/* Simple Stats (Placeholder for now) */}
            <div className="bg-white/10 p-6 rounded-lg text-left inline-block min-w-[300px]">
                <h3 className="text-xl font-bold border-b border-white/20 pb-2 mb-4">여정 기록</h3>
                <p>💰 획득 골드: <span className="float-right font-bold text-yellow-400">{activeRewards.gold + 500} G</span></p>
                <p>🃏 덱 크기: <span className="float-right font-bold text-blue-400">15 장</span></p>
                <p>💀 처치한 적: <span className="float-right font-bold text-red-400">12 마리</span></p>
            </div>

            <div className="mt-12">
                <button
                    onClick={handleRestart}
                    className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-white text-xl font-bold rounded shadow-lg transition-transform hover:scale-105"
                >
                    처음부터 다시 하기
                </button>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 relative overflow-hidden"
            style={{
                backgroundImage: `url(${import.meta.env.BASE_URL}assets/images/parchment_bg.jpg)`,
                backgroundSize: 'cover'
            }}>

            <div className={`bg-black/85 p-10 rounded-lg w-full max-w-4xl min-h-[600px] flex flex-col items-center relative z-10 shadow-2xl border border-gray-600 transition-all duration-500
                ${phase === 2 ? 'bg-black/90 border-yellow-600' : ''}
            `}>

                {/* Header (Only show in non-victory phases) */}
                {phase !== 2 && (
                    <h1 className="text-4xl font-bold mb-10 text-yellow-500">
                        {isBoss ? (phase === 0 ? "⚔️ 보스 처치!" : "👑 보상 선택") : "🏆 승리!"}
                    </h1>
                )}

                {/* Content Area */}
                <div className="flex-1 w-full flex flex-col items-center justify-center">
                    {phase === 0 && renderLootPhase()}
                    {phase === 1 && isBoss && renderBossRelicPhase()}
                    {phase === 2 && isBoss && renderVictoryPhase()}
                </div>

                {/* Footer / Navigation */}
                {phase === 0 && (
                    <div className="mt-12 w-full flex justify-center">
                        <button
                            onClick={handleNextPhase}
                            disabled={!canAdvanceFromLoot()}
                            className={`
                                px-12 py-4 text-xl font-bold rounded shadow-lg transition-all
                                ${canAdvanceFromLoot()
                                    ? 'bg-green-700 hover:bg-green-600 hover:scale-105 text-white cursor-pointer'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            {isBoss ? "다음 (보스 유물) ➡" : "지도 복귀"}
                        </button>
                    </div>
                )}
            </div>

            {/* Modals - Only used in Phase 0 (Loot) usually, or Relic for Normal/Elite */}
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

            {/* Relic Draft Modal (For Normal/Elite usage, or if we used modal for Boss - but Boss uses Phase 1 inline) */}
            {/* Actually, Normal/Elite uses this modal. Boss uses Phase 1. */}
            {/* So check !isBoss or ensure Phase 1 logic doesn't trigger this modal. */}
            {showRelicModal && !isBoss && (
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
