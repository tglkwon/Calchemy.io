import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getEventLogic } from '../systems/EventLibrary';
import { executeEffect } from '../systems/EffectSystem';
import gameData from '../generated/gameData.json';

const EventPage = () => {
    const navigate = useNavigate();
    const { gameState, gameEngine } = useGame();
    const { mapData, currentNodeId, visitedNodeIds } = gameState;

    const [currentEvent, setCurrentEvent] = useState(null);
    const [eventLogic, setEventLogic] = useState(null);
    const [logMessage, setLogMessage] = useState(null);
    const [isResolved, setIsResolved] = useState(false);

    useEffect(() => {
        if (!mapData || !currentNodeId) {
            // If accessed directly without valid state, return to map
            navigate('/map');
            return;
        }

        const node = mapData.nodes.find(n => n.id === currentNodeId);
        if (!node) {
            navigate('/map');
            return;
        }

        // 1. Identify Event
        // If node has specific event ID, use it. Otherwise generic.
        const eventId = node.eventId || "EVENT_GENERIC";

        // 2. Fetch Static Data (from JSON)
        const staticData = gameData.events ? gameData.events.find(e => e.id === eventId) : null;

        // 3. Fetch Logic (from Library)
        let logic = getEventLogic(eventId);

        // Fallback: If logic is generic but we have parsed choices from CSV, use them
        if (logic === getEventLogic("DEFAULT") && staticData && staticData.choices && staticData.choices.length > 0) {
            logic = {
                ...logic,
                choices: staticData.choices.map(choiceText => ({
                    text: choiceText,
                    tooltip: "선택 시 결과가 발생합니다.",
                    effect: { type: "EVENT_GENERIC_LOG", value: choiceText } // Placeholder effect
                }))
            };
        }

        setCurrentEvent({
            title: staticData ? staticData.name : (logic.title || "알 수 없는 이벤트"),
            description: staticData ? (staticData.summary + "\n\n" + staticData.condition) : (logic.description || "기묘한 분위기가 감돕니다..."),
        });
        setEventLogic(logic);

    }, [mapData, currentNodeId, navigate]);

    const handleChoice = (choice) => {
        if (isResolved) return;

        // 1. Execute Logic
        let msg = "";

        // A. Functional Logic
        if (typeof choice.effect === 'function') {
            msg = choice.effect({ ...gameState, engine: gameEngine });
        }
        // B. Object Effect
        else if (choice.effect && typeof choice.effect === 'object') {
            const resultMsg = executeEffect(choice.effect, { ...gameState, engine: gameEngine });
            msg = resultMsg || "효과가 적용되었습니다.";
        }

        // 2. Update State
        setLogMessage(msg);
        setIsResolved(true);
    };

    const handleLeave = () => {
        navigate('/map');
    };

    if (!currentEvent || !eventLogic) {
        return <div className="text-white text-center mt-20">Loading Event...</div>;
    }

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden relative">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-slate-900 z-0 opacity-50 pointer-events-none" />

            {/* Top Section: Visual & Narrative */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 relative border-b border-purple-500/30 shadow-lg bg-slate-900/50 backdrop-blur-sm">
                {/* Event Icon / Image */}
                <div className="w-32 h-32 mb-6 rounded-full bg-purple-900/40 border-4 border-purple-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                    <span className="text-6xl filter drop-shadow-lg">❓</span>
                </div>

                <h1 className="text-4xl font-bold text-purple-300 mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {currentEvent.title}
                </h1>

                <div className="max-w-2xl text-center bg-slate-800/80 p-6 rounded-xl border border-slate-700 shadow-inner">
                    <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line">
                        {currentEvent.description}
                    </p>
                    {logMessage && (
                        <div className="mt-4 p-3 bg-slate-900/90 border border-yellow-500/50 rounded-lg text-yellow-400 font-semibold animate-bounce-short">
                            {logMessage}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Choices */}
            <div className="h-1/3 min-h-[300px] bg-slate-950 p-8 z-10 flex flex-col items-center justify-start gap-4 shadow-[#000_-10px_30px_10px_rgba(0,0,0,0.5)]">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
                    {isResolved ? "결과 확인" : "선택의 순간"}
                </h2>

                <div className="flex flex-col gap-3 w-full max-w-xl">
                    {!isResolved ? (
                        eventLogic.choices.map((choice, index) => {
                            // Check condition if exists
                            let isDisabled = false;
                            if (choice.condition && typeof choice.condition === 'function') {
                                isDisabled = !choice.condition({ ...gameState, engine: gameEngine });
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => !isDisabled && handleChoice(choice)}
                                    disabled={isDisabled}
                                    className={`
                                        group relative w-full p-4 rounded-lg border transition-all duration-300 text-left flex items-center justify-between
                                        ${isDisabled
                                            ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                                            : 'bg-slate-800/80 border-slate-600 hover:bg-purple-900/30 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                        }
                                    `}
                                >
                                    <div>
                                        <div className={`font-bold text-lg ${isDisabled ? 'text-slate-600' : 'text-slate-200 group-hover:text-white'}`}>
                                            {choice.text}
                                        </div>
                                        <div className={`text-sm ${isDisabled ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                            {choice.tooltip}
                                        </div>
                                    </div>
                                    {!isDisabled && <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">👉</span>}
                                </button>
                            );
                        })
                    ) : (
                        <button
                            onClick={handleLeave}
                            className="w-full p-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xl rounded-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>지도 복귀</span>
                            <span>🗺️</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventPage;
