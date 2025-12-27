import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { RoomType } from '../systems/MapGenerator';
import './MapPage.css';

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
        }
        // Other room types handled by selectMapNode
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

    if (!mapData) return <div className="map-page-container">Loading Map...</div>;

    const visitedSet = new Set(visitedNodeIds);
    const reachableNodes = mapData.nodes
        .filter(n => gameEngine.isNodeReachable(n.id))
        .map(n => n.id);

    // Offset coordinates to center the map in the viewport
    const offsetX = viewportWidth / 2 - ((mapData.mapWidth - 1) * 100) / 2;
    const offsetY = 50;

    return (
        <div className="map-page-container">
            <header className="map-header">
                <h1 className="map-title">세상 끝의 기도</h1>
                <p className="text-gray-400">당신의 여정을 선택하십시오.</p>
            </header>

            <div className="map-controls">
                <button className="regenerate-btn" onClick={generateNewMap}>
                    여정 초기화 (전체 재생성)
                </button>
            </div>

            <div className="map-viewport">
                <svg className="map-svg-overlay">
                    {mapData.nodes.map(node => (
                        node.outgoing.map(targetId => {
                            const target = mapData.nodes.find(n => n.id === targetId);
                            if (!target) return null;
                            const isPathActive = visitedSet.has(node.id) && visitedSet.has(targetId);
                            return (
                                <line
                                    key={`${node.id}-${targetId}`}
                                    x1={node.position.x + offsetX}
                                    y1={1200 - (node.position.y + offsetY)}
                                    x2={target.position.x + offsetX}
                                    y2={1200 - (target.position.y + offsetY)}
                                    className={`path-line ${isPathActive ? 'active' : ''}`}
                                />
                            );
                        })
                    ))}
                </svg>

                {mapData.nodes.map(node => {
                    const isVisited = visitedSet.has(node.id);
                    const isCurrent = node.id === currentNodeId;
                    const isReachable = reachableNodes.includes(node.id);

                    return (
                        <div
                            key={node.id}
                            className="map-node-container"
                            style={{
                                left: node.position.x + offsetX,
                                top: 1200 - (node.position.y + offsetY)
                            }}
                            onClick={() => isReachable && handleNodeClick(node)}
                        >
                            <div
                                className={`map-node ${node.roomType.toLowerCase()} ${isVisited ? 'visited' : ''} ${isCurrent ? 'current' : ''} ${isReachable ? 'reachable cursor-pointer' : 'grayscale opacity-50 cursor-not-allowed'}`}
                                title={node.roomType}
                            >
                                {getRoomIcon(node.roomType)}
                                {isCurrent && <div className="absolute -top-8 text-yellow-400 font-bold animate-bounce">YOU</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MapPage;
