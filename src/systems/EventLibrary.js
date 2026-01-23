import { EffectType } from './EffectSystem';

/**
 * Event Library
 * 
 * Maps Event IDs (from gameData.json) to executable logic.
 * Each entry provides:
 * - title: Override title (optional)
 * - description: Context text (optional, defaults to generic)
 * - choices: Array of { text, tooltip, effect } objects
 * 
 * Logic design:
 * The 'effect' in a choice can be:
 * 1. A simple object `{ type: 'HEAL', value: 10 }` which is processed by EffectSystem.
 * 2. A function `(gameState) => { ... }` for complex logic.
 */

const GenericEventLogic = {
    choices: [
        {
            text: "떠나기",
            tooltip: "아무 일도 일어나지 않습니다.",
            effect: { type: EffectType.NONE }
        }
    ]
};

// Prototype: Heal Event (matching an ID from CSV if possible, otherwise generic)
const HealEvent = {
    title: "성직자",
    description: "낡은 성소를 지키는 성직자가 당신을 바라봅니다. \"치료가 필요하신가요?\"",
    choices: [
        {
            text: "치료 받기 (20 골드)",
            tooltip: "체력을 20 회복합니다. (골드 20 소모)",
            condition: (gameState) => gameState.gold >= 20,
            effect: { type: "EVENT_HEAL_PAID", value: 20, cost: 20 }
        },
        {
            text: "무시하기",
            tooltip: "그냥 지나칩니다.",
            effect: { type: EffectType.NONE }
        }
    ]
};

// Example: Dangerous Event
const TrapEvent = {
    title: "함정",
    description: "바닥이 수상해보입니다.",
    choices: [
        {
            text: "해체 시도",
            tooltip: "50% 확률로 50골드를 얻거나, 10 피해를 입습니다.",
            effect: (gameState) => {
                if (Math.random() < 0.5) {
                    gameState.gainGold(50);
                    return "성공! 50골드를 얻었습니다.";
                } else {
                    gameState.takeDaamge(10);
                    return "실패! 10의 피해를 입었습니다.";
                }
            }
        }
    ]
};

export const EventLibrary = {
    // Mapping IDs from the generated JSON
    "EVENT_성직자": HealEvent,

    // Default fallback
    "DEFAULT": GenericEventLogic
};

export const getEventLogic = (eventId) => {
    return EventLibrary[eventId] || EventLibrary["DEFAULT"];
};
