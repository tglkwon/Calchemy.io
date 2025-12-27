import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import UnitFrame from '../components/UnitFrame';
import Grid from '../components/Grid';
import AssetDisplay from '../components/AssetDisplay';

const BattlePage = () => {
    const { gameState, gameEngine } = useGame();
    const { golem, minions, isPaused, turnCount, grid, activeCardId, bingoCardIds, gameOver, victory, relics } = gameState;
    const activeRelics = relics.filter(r => r.isActive);

    const [isBgmBlocked, setIsBgmBlocked] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = new Audio(`${import.meta.env.BASE_URL}assets/audio/BGM_Main_251108.wav`);
        audio.loop = true;
        audio.volume = 0.5;
        audioRef.current = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("BGM Autoplay prevented:", error);
                setIsBgmBlocked(true);
            });
        }

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);

    const enableBgm = () => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => setIsBgmBlocked(false))
                .catch(e => console.error("Manual play failed:", e));
        }
    };

    return (
        <div className="h-full flex gap-4 relative">
            {/* BGM Autoplay Blocked Warning */}
            {isBgmBlocked && (
                <button
                    onClick={enableBgm}
                    className="absolute top-2 right-2 z-50 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-lg animate-pulse flex items-center gap-2"
                >
                    <span>🔇</span> BGM 켜기
                </button>
            )}

            {/* Left Column: Golem */}
            <div className="w-1/4 flex flex-col gap-4 overflow-y-auto">
                <UnitFrame unit={golem} type="golem" index={0} isPaused={isPaused} />
            </div>

            {/* Center Column: Battle Area */}
            <div className="w-2/4 flex flex-col items-center gap-4">
                {/* Timer Bar (Visual Only for now) */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    {/* TODO: Connect to actual timer if needed, or CSS animation keyframes triggered by turn start */}
                    <div className="h-full bg-yellow-500 w-full animate-pulse"></div>
                </div>

                {/* Active Relics Display */}
                {activeRelics.length > 0 && (
                    <div className="flex gap-2 justify-center w-full">
                        {activeRelics.map(relic => (
                            <div
                                key={relic.id}
                                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-yellow-600 text-lg relative group cursor-help"
                            >
                                <AssetDisplay id={relic.id} />
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 text-xs text-gray-200 p-2 rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    <div className="font-bold text-yellow-500 mb-1">{relic.name}</div>
                                    {relic.description}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between w-full items-center px-4">
                    <div className="text-xl font-bold">Turn: {turnCount}</div>
                    <div className="flex gap-2">
                        {!isPaused && !gameOver && (
                            <button
                                onClick={() => gameEngine.togglePause()}
                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold"
                            >
                                일시정지
                            </button>
                        )}
                        {isPaused && !gameOver && (
                            <button
                                onClick={() => gameEngine.togglePause()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold"
                            >
                                재개
                            </button>
                        )}
                        {turnCount === 0 && !gameOver && (
                            <button
                                onClick={() => gameEngine.startBattle()}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-bold"
                            >
                                전투 시작
                            </button>
                        )}
                        <button
                            onClick={() => gameEngine.restart()}
                            className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded text-sm"
                        >
                            재시작
                        </button>
                    </div>
                </div>

                <Grid grid={grid} activeCardId={activeCardId} bingoCardIds={bingoCardIds} />

                {/* Game Over Overlay */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
                        <h2 className={`text-6xl font-bold mb-8 ${victory ? 'text-yellow-400' : 'text-red-500'}`}>
                            {victory ? "🏆 승리!" : "💀 패배!"}
                        </h2>
                        <div className="text-xl text-gray-300 mb-8">
                            총 빙고: <span className="text-white font-bold">{gameState.totalBingos}</span>회
                            (조화: <span className="text-purple-400 font-bold">{gameState.harmonyBingos}</span>회)
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => gameEngine.restart()}
                                className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-gray-200"
                            >
                                다시 하기
                            </button>
                            {victory && (
                                <Link
                                    to="/map"
                                    className="px-8 py-3 bg-yellow-600 text-white font-bold rounded hover:bg-yellow-500 transition-colors"
                                >
                                    지도로 돌아가기
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Minions */}
            <div className="w-1/4 flex flex-col gap-4 overflow-y-auto">
                {minions.map((minion, idx) => (
                    <UnitFrame key={idx} unit={minion} type="minion" index={idx} isPaused={isPaused} />
                ))}
            </div>
        </div>
    );
};

export default BattlePage;
