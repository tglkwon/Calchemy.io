import React from 'react';
import AssetDisplay from './AssetDisplay';

const Grid = ({ grid, activeCardId, bingoCardIds }) => {
    return (
        <div className="grid grid-cols-4 gap-2 w-full max-w-md mx-auto aspect-square bg-gray-900 p-2 rounded-lg border border-gray-700">
            {grid.map((card) => {
                const isActive = activeCardId === card.instanceId;
                const isBingo = bingoCardIds.includes(card.instanceId);

                let borderClass = 'border-gray-600';
                let bgClass = 'bg-gray-800';
                let scaleClass = 'scale-100';

                if (isActive) {
                    borderClass = 'border-yellow-400';
                    bgClass = 'bg-yellow-900/50';
                    scaleClass = 'z-20 animate-pulse-strong';
                } else if (isBingo) {
                    borderClass = 'border-blue-400';
                    bgClass = 'bg-blue-900/50';
                    scaleClass = 'z-20 animate-bingo-flash';
                }

                return (
                    <div
                        key={card.instanceId}
                        className={`
                            relative flex items-center justify-center rounded border-2 transition-all duration-300 group cursor-help
                            ${borderClass} ${bgClass} ${scaleClass}
                        `}
                    >
                        <div className="text-4xl">
                            <AssetDisplay id={card.type} />
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 text-xs text-gray-200 p-2 rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="font-bold text-yellow-500 mb-1">{card.name}</div>
                            <div className="mb-1">{card.description}</div>
                            {card.bingoDescription && (
                                <div className="text-blue-300 text-[10px]">
                                    <span className="font-bold">Bingo:</span> {card.bingoDescription}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            {grid.length === 0 && (
                <div className="col-span-4 row-span-4 flex items-center justify-center text-gray-600">
                    Waiting for Turn...
                </div>
            )}
        </div>
    );
};

export default Grid;
