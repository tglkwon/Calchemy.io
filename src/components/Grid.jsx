import React from 'react';
import AssetDisplay from './AssetDisplay';

const Grid = ({ grid, activeCardId, bingoCardIds }) => {
    return (
        <div className="grid grid-cols-4 gap-2 w-full max-w-md mx-auto aspect-square bg-gray-900 p-2 rounded-lg border border-gray-700">
            {grid.map((card) => {
                const isActive = activeCardId === card.id;
                const isBingo = bingoCardIds.includes(card.id);

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
                        key={card.id}
                        className={`
                            relative flex items-center justify-center rounded border-2 transition-all duration-300
                            ${borderClass} ${bgClass} ${scaleClass}
                        `}
                    >
                        <div className="text-4xl">
                            <AssetDisplay id={card.type} />
                        </div>
                        {/* ID Debug (Optional) */}
                        {/* <span className="absolute bottom-0 right-0 text-[8px] text-gray-600">{card.id}</span> */}
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
