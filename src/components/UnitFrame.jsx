import React from 'react';
import AssetDisplay from './AssetDisplay';
import { useGame } from '../context/GameContext';

const ProgressBar = ({ value, max, colorClass }) => {
    const pct = max ? Math.min(100, (value / max) * 100) : Math.min(100, value);
    return (
        <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden mt-1">
            <div
                className={`h-full transition-all duration-300 ${colorClass}`}
                style={{ width: `${pct}%` }}
            ></div>
        </div>
    );
};

const StatInput = ({ label, value, onChange, disabled }) => (
    <div className="flex flex-col">
        <label className="text-[10px] text-gray-500">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className={`w-full bg-gray-700 border rounded px-1 text-white text-center font-mono focus:outline-none focus:border-yellow-500 ${disabled ? 'border-gray-600' : 'border-yellow-500'}`}
            disabled={disabled}
        />
    </div>
);

const UnitFrame = ({ unit, type, index, isPaused }) => {
    const { gameEngine } = useGame();

    const handleStatChange = (key, val) => {
        const newState = { ...unit, [key]: val };
        gameEngine.updateEntityState(type, index, newState);
    };

    if (!unit.isAlive) {
        return (
            <div className="p-4 rounded border border-red-900 bg-red-900/20 opacity-50 flex items-center justify-center h-full">
                <span className="text-red-500 font-bold text-xl">처치됨</span>
            </div>
        );
    }

    // Asset Key Logic
    let assetKey = 'GOLEM';
    if (type === 'minion') assetKey = `MINION_${index + 1}`;

    return (
        <div className={`p-4 rounded border ${type === 'golem' ? 'border-gray-700 bg-gray-800' : 'border-gray-600 bg-gray-800'}`}>
            <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">{unit.name}</span>
                <div className="w-12 h-12 flex items-center justify-center text-4xl">
                    <AssetDisplay id={assetKey} />
                </div>
            </div>

            {/* Intent (Minion Only) */}
            {unit.intent && (
                <div className="flex justify-between text-sm mb-2 bg-gray-900/50 p-1 rounded">
                    <span>의도:</span>
                    <div className="flex items-center gap-1">
                        <AssetDisplay id={`INTENT_${unit.intent}`} className="text-lg" />
                        <span className="text-xs text-gray-400">{unit.intent}</span>
                    </div>
                </div>
            )}

            {/* Bars */}
            <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>HP</span>
                    <span>{unit.hp}/{unit.maxHp}</span>
                </div>
                <ProgressBar value={unit.hp} max={unit.maxHp} colorClass="bg-red-600" />
            </div>
            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Block</span>
                    <span>{unit.block}</span>
                </div>
                <ProgressBar value={unit.block} max={100} colorClass="bg-blue-500" />
            </div>

            <div className="h-px bg-gray-700 my-2"></div>

            {/* Stats Editor */}
            <div className="grid grid-cols-2 gap-2">
                <StatInput label="공격력" value={unit.baseAttack} onChange={(v) => handleStatChange('baseAttack', v)} disabled={!isPaused} />
                {type === 'golem' ? (
                    <StatInput label="방어도" value={unit.baseShield} onChange={(v) => handleStatChange('baseShield', v)} disabled={!isPaused} />
                ) : (
                    <StatInput label="방어력" value={unit.baseDefense} onChange={(v) => handleStatChange('baseDefense', v)} disabled={!isPaused} />
                )}

                {type === 'golem' && (
                    <>
                        <StatInput label="검 보너스" value={unit.swordBonus} onChange={(v) => handleStatChange('swordBonus', v)} disabled={!isPaused} />
                        <StatInput label="방패 보너스" value={unit.shieldBonus} onChange={(v) => handleStatChange('shieldBonus', v)} disabled={!isPaused} />
                        <StatInput label="공격 버프" value={unit.attackBuffs} onChange={(v) => handleStatChange('attackBuffs', v)} disabled={!isPaused} />
                    </>
                )}
                {type === 'minion' && (
                    <StatInput label="디버프" value={unit.attackDebuffs} onChange={(v) => handleStatChange('attackDebuffs', v)} disabled={!isPaused} />
                )}
            </div>

            {type === 'golem' && (
                <div className="mt-4 text-center">
                    <span className="text-xs text-gray-500">이번 턴 피해량</span>
                    <div className="text-xl font-bold text-yellow-500">{unit.totalDamageThisTurn}</div>
                </div>
            )}
        </div>
    );
};

export default UnitFrame;
