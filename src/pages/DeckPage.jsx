import React from 'react';
import { useGame } from '../context/GameContext';
import AssetDisplay from '../components/AssetDisplay';

const DeckPage = () => {
    const { gameEngine } = useGame();

    // Get ALL cards
    const allCards = gameEngine.cardSystem.getAllCards();
    // Get Library cards (Definitions)
    const libraryCards = gameEngine.cardSystem.getLibraryCards();

    return (
        <div className="h-full p-4 overflow-hidden flex gap-4">
            {/* Total Deck (60%) */}
            <div className="w-[60%] bg-gray-900 p-4 rounded border border-gray-700 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 text-blue-400">
                    전체 덱 ({allCards.length}장)
                    <span className="text-xs text-gray-500 font-normal ml-2">(클릭하여 제거)</span>
                </h2>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="flex flex-wrap gap-2 content-start">
                        {allCards.map((card) => (
                            <div
                                key={card.instanceId || card.id}
                                onClick={() => gameEngine.removeCardFromDeck(card.instanceId || card.id)}
                                className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center border border-gray-600 hover:border-red-500 cursor-pointer transition-colors shrink-0 relative group"
                            >
                                <div className="text-xl"><AssetDisplay id={card.type} /></div>
                                {/* Tooltip for Deck Cards */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 text-xs text-gray-200 p-2 rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    <div className="font-bold text-yellow-500 mb-1">{card.name || card.type}</div>
                                    {card.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Library (40%) */}
            <div className="w-[40%] bg-gray-800 p-4 rounded border border-gray-600 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 text-green-400">
                    라이브러리
                    <span className="text-xs text-gray-500 font-normal ml-2">(클릭하여 추가)</span>
                </h2>

                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
                    {libraryCards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => gameEngine.addCardToDeck(card.id)}
                            className="flex items-center gap-3 p-2 bg-gray-700 rounded border border-gray-600 hover:border-green-400 hover:bg-gray-600 cursor-pointer transition-all"
                        >
                            {/* Illustration / Icon */}
                            <div className="w-10 h-10 bg-gray-900 rounded flex items-center justify-center border border-gray-500 shrink-0">
                                <AssetDisplay id={card.type} />
                            </div>

                            {/* Card Details */}
                            <div className="flex flex-col overflow-hidden">
                                <div className="font-bold text-gray-200 text-sm">{card.name}</div>
                                <div className="text-xs text-gray-400 truncate">{card.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeckPage;
