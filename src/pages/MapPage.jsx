import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { RoomType } from '../systems/MapGenerator';

const MapPage = () => {
    const navigate = useNavigate();
    const { gameState, gameEngine } = useGame();
    const { mapData, currentNodeId, visitedNodeIds } = gameState;
    const [viewportWidth, setViewportWidth] = useState(800);

    const generateNewMap = () => {
        gameEngine.generateNewMap();
    };

    const handleNodeClick = (node) => {
        const result = gameEngine.selectMapNode(node.id);

        if (result === true) {
            // Battle nodes - navigate to battle page
            navigate('/');
        } else if (node.roomType === RoomType.TREASURE) {
            // Treasure chest - start treasure selection and navigate to relic page
            gameEngine.startTreasureSelection();
            navigate('/relic');
        } else if (node.roomType === RoomType.SHOP) {
            // Shop node - navigate to shop page
            navigate('/shop');
        } else if (node.roomType === RoomType.EVENT) {
            navigate('/event');
        }
    };

    useEffect(() => {
        if (!mapData) {
            generateNewMap();
        }

        const handleResize = () => {
            const viewport = document.querySelector('.map-viewport');
            if (viewport) {
                setViewportWidth(viewport.clientWidth);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [mapData, gameEngine]);

    const getRoomIcon = (type) => {
        switch (type) {
            case RoomType.MONSTER: return '⚔️';
            case RoomType.ELITE: return '👹';
            case RoomType.SHOP: return '💰';
            case RoomType.REST: return '🔥';
            case RoomType.TREASURE: return '💎';
            case RoomType.EVENT: return '❓';
            case RoomType.BOSS: return '🐉';
            default: return '⚪';
        }
    };

    if (!mapData) return <div className="h-full flex items-center justify-center map-bg text-white">Loading Map...</div>;

    const visitedSet = new Set(visitedNodeIds);
    const reachableNodes = mapData.nodes
        .filter(n => gameEngine.isNodeReachable(n.id))
        .map(n => n.id);

    // Offset coordinates to center the map in the viewport
    const offsetX = viewportWidth / 2 - ((mapData.mapWidth - 1) * 100) / 2;
    const offsetY = 50;
    const totalHeight = (mapData.mapHeight + 1) * 100 + offsetY * 2;

    const getNodeColorClass = (type) => {
        switch (type) {
            case RoomType.MONSTER: return 'text-slate-300 border-slate-500';
            case RoomType.ELITE: return 'text-red-500 border-red-700';
            case RoomType.SHOP: return 'text-yellow-400 border-yellow-600';
            case RoomType.REST: return 'text-green-500 border-green-700';
            case RoomType.TREASURE: return 'text-blue-400 border-blue-600';
            case RoomType.EVENT: return 'text-purple-400 border-purple-700';
            case RoomType.BOSS: return 'text-orange-500 border-orange-700';
            default: return 'text-gray-400 border-gray-600';
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center map-bg overflow-y-auto py-10 px-5 relative select-none">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-yellow-500 mb-2 drop-shadow-[0_0_15px_rgba(241,196,15,0.4)]">세상 끝의 기도</h1>
                <p className="text-gray-400">당신의 여정을 선택하십시오.</p>
            </header>

            <div className="mb-5">
                <button
                    className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-5 py-2 rounded-lg font-semibold hover:bg-yellow-500 hover:text-slate-900 transition-all shadow-[0_0_20px_rgba(241,196,15,0.3)]"
                    onClick={generateNewMap}
                >
                    여정 초기화 (전체 재생성)
                </button>
            </div>

            <div className="map-viewport relative w-full max-w-3xl" style={{ minHeight: `${totalHeight}px` }}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {mapData.nodes.map(node => (
                        node.outgoing.map(targetId => {
                            const target = mapData.nodes.find(n => n.id === targetId);
                            if (!target) return null;
                            const isPathActive = visitedSet.has(node.id) && visitedSet.has(targetId);
                            return (
                                <line
                                    key={`${node.id}-${targetId}`}
                                    x1={node.position.x + offsetX}
                                    y1={node.position.y + offsetY}
                                    x2={target.position.x + offsetX}
                                    y2={target.position.y + offsetY}
                                    className={`stroke-[3] line-cap-round transition-all duration-500 ${isPathActive ? 'stroke-yellow-500/40 stroke-[4]' : 'stroke-white/5'}`}
                                />
                            );
                        })
                    ))}
                </svg>

                {mapData.nodes.map(node => {
                    const isVisited = visitedSet.has(node.id);
                    const isCurrent = node.id === currentNodeId;
                    const isReachable = reachableNodes.includes(node.id);
                    const isBoss = node.roomType === RoomType.BOSS;

                    return (
                        <div
                            key={node.id}
                            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-transform hover:scale-110"
                            style={{
                                left: node.position.x + offsetX,
                                top: node.position.y + offsetY
                            }}
                        >
                            <div
                                onClick={() => handleNodeClick(node)}
                                className={`
                                    flex items-center justify-center border-3 rounded-full bg-slate-800 shadow-[0_4px_15px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer
                                    ${isBoss ? 'w-24 h-24 text-5xl animate-pulse-boss' : 'w-12 h-12 text-2xl'}
                                    ${getNodeColorClass(node.roomType)}
                                    ${isVisited ? 'opacity-60 border-slate-800 shadow-none grayscale-[0.5]' : ''}
                                    ${isCurrent ? 'border-yellow-500 shadow-[0_0_30px_rgba(241,196,15,0.8)] scale-110 z-30' : ''}
                                    ${isReachable ? 'animate-pulse-reachable' : 'animate-pulse-reachable'}
                                    hover:scale-125 hover:shadow-[0_0_25px_currentColor] hover:border-white
                                `}
                                title={node.roomType}
                            >
                                {getRoomIcon(node.roomType)}
                                {isCurrent && <div className="absolute -top-10 text-yellow-400 font-bold animate-bounce drop-shadow-[0_0_5px_rgba(0,0,0,1)]">YOU</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default MapPage;
