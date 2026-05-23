import React from 'react';
import AssetDisplay from './AssetDisplay';

const Card = ({ card, isActive = false, isBingo = false, onClick }) => {
    if (!card) return <div className="w-20 h-20 bg-gray-800 rounded border border-gray-700"></div>;

    const isEmpty = card.type === 'EMPTY';

    let borderClass = isEmpty ? 'border-dashed border-gray-700/50' : 'border-gray-600';
    let bgClass = isEmpty ? 'bg-black/30' : 'bg-gray-800';
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
            onClick={onClick}
            className={`
                relative flex items-center justify-center rounded border-2 transition-all duration-300 group w-24 h-24
                ${borderClass} ${bgClass} ${scaleClass}
                ${isEmpty ? 'cursor-default' : 'cursor-help hover:border-white hover:scale-105'}
            `}
        >
            {!isEmpty && (
                <div className="text-4xl">
                    <AssetDisplay id={card.type || card.id} />
                </div>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 text-xs text-gray-200 p-2 rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                <div className="font-bold text-yellow-500 mb-1">
                    {isEmpty ? '빈 슬롯 (Empty Slot)' : card.name}
                </div>
                <div className="mb-1">
                    {isEmpty ? '덱에 카드를 더 추가하여 그리드를 채우세요. 빈 슬롯이 포함된 라인은 빙고가 불가능합니다.' : (card.description || card.desc)}
                </div>
                {!isEmpty && card.bingoDescription && (
                    <div className="text-blue-300 text-[10px]">
                        <span className="font-bold">Bingo:</span> {card.bingoDescription}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;
