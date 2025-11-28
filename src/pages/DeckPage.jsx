import React from 'react';
import { useGame } from '../context/GameContext';
import AssetDisplay from '../components/AssetDisplay';

const DeckPage = () => {
    const { gameEngine } = useGame();

    // Get ALL cards
    const allCards = gameEngine.cardSystem.getAllCards();
    const elements = gameEngine.cardSystem.elements;

    return (
        <div className="h-full p-4 overflow-hidden flex gap-4">
            {/* Total Deck (70%) */}
            <div className="w-[70%] bg-gray-900 p-4 rounded border border-gray-700 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 text-blue-400">
                    전체 덱 ({allCards.length}장)
                    <span className="text-xs text-gray-500 font-normal ml-2">(클릭하여 제거)</span>
                </h2>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="flex flex-wrap gap-2 content-start">
                        {allCards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => gameEngine.removeCardFromDeck(card.id)}
                                className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center border border-gray-600 hover:border-red-500 cursor-pointer transition-colors flex-shrink-0"
                            >
                                <div className="text-xl"><AssetDisplay id={card.type} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Library (30%) */}
            <div className="w-[30%] bg-gray-800 p-4 rounded border border-gray-600 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 text-green-400">
                    라이브러리
                    <span className="text-xs text-gray-500 font-normal ml-2">(추가)</span>
                </h2>

                <div className="flex flex-wrap gap-2 content-start overflow-y-auto">
                    {elements.map((el) => (
                        <div
                            key={el}
                            onClick={() => gameEngine.addCardToDeck(el)}
                            className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center border border-gray-500 hover:border-green-400 cursor-pointer transition-colors"
                            title={el} // Add tooltip for accessibility since text is removed
                        >
                            <div className="text-xl"><AssetDisplay id={el} /></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeckPage;
