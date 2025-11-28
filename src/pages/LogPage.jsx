import React from 'react';
import { useGame } from '../context/GameContext';

const LogPage = () => {
    const { gameState, gameEngine } = useGame();
    const { logs } = gameState;

    return (
        <div className="h-full flex flex-col p-4 bg-gray-900 rounded border border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-yellow-500">전투 로그</h2>
                <button
                    onClick={() => gameEngine.restart()}
                    className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded text-sm"
                >
                    재시작
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-sm">
                {logs.map((log) => (
                    <div key={log.id} className="border-b border-gray-800 pb-1">
                        <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                        <span>{log.message}</span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="text-gray-600 text-center mt-10">로그가 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default LogPage;
