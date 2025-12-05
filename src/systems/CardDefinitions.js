export const CardDefinitions = {
    "1": {
        id: "1",
        name: "불씨",
        type: "FIRE",
        grade: "Common",
        description: "{피해} 5, {화상} 2",
        bingoDescription: "[점화] 적 화상 × 10% 추뎀",
        effectParams: { damage: 5, burn: 2 }
    },
    "2": {
        id: "2",
        name: "기름통",
        type: "FIRE",
        grade: "Common",
        description: "적 1명 '기름'(불피해 2배)",
        bingoDescription: "[확산] 단일 피해 ➔ 광역(AoE) 변경",
        effectParams: { status: 'OIL', duration: 2 }
    },
    "3": {
        id: "3",
        name: "화염구",
        type: "FIRE",
        grade: "Common",
        description: "피해 12",
        bingoDescription: "[폭발] 인접한 적에게 50% 스플래시",
        effectParams: { damage: 12 }
    },
    "4": {
        id: "4",
        name: "연쇄 폭발",
        type: "FIRE",
        grade: "Uncommon",
        description: "피해 8. 전 카드가 불이면 2회",
        bingoDescription: "[유폭] 이 줄 불 카드 재발동",
        effectParams: { damage: 8, condition: 'PREV_FIRE', repeat: 2 }
    },
    "5": {
        id: "5",
        name: "용암 갑옷",
        type: "FIRE",
        grade: "Uncommon",
        description: "화염 가시(반사) 5",
        bingoDescription: "[융해] 적 방어도 0 + 취약",
        effectParams: { thorns: 5 }
    },
    "6": {
        id: "6",
        name: "불사조",
        type: "FIRE",
        grade: "Rare",
        description: "체력 10% 소모, 500% 피해",
        bingoDescription: "[환생] 처치 시 체력 회복",
        effectParams: { hpCostPercent: 0.1, damageMultiplier: 5.0 }
    },
    "7": {
        id: "7",
        name: "초신성",
        type: "FIRE",
        grade: "Legendary",
        description: "전체 피해 30. 소멸",
        bingoDescription: "[대폭발] 데미지 지수함수 증가",
        effectParams: { damage: 30, aoe: true, exhaust: true }
    },
    "8": {
        id: "8",
        name: "방화광",
        type: "FIRE",
        grade: "Uncommon",
        description: "매 턴 무작위 적 화상 2",
        bingoDescription: "[광기] 화상 10 이상인 적 즉사",
        effectParams: { passiveBurn: 2 }
    },
    "9": {
        id: "9",
        name: "화염 채찍",
        type: "FIRE",
        grade: "Common",
        description: "전열 피해 10",
        bingoDescription: "[강타] 전열 피해 2배",
        effectParams: { damage: 10, target: 'FRONT' }
    },
    "10": {
        id: "10",
        name: "마그마",
        type: "FIRE",
        grade: "Rare",
        description: "그리드 2장 불로 변경",
        bingoDescription: "[분출] 변경된 수 × 10 피해",
        effectParams: { changeCount: 2, changeType: 'FIRE' }
    },
    "FIRE": {
        id: "FIRE",
        name: "불",
        type: "FIRE",
        grade: "Basic",
        description: "기본 공격 피해",
        bingoDescription: "불 빙고: 추가 피해",
        effectParams: {}
    },
    "EARTH": {
        id: "EARTH",
        name: "대지",
        type: "EARTH",
        grade: "Basic",
        description: "방어도 획득",
        bingoDescription: "대지 빙고: 추가 방어도",
        effectParams: {}
    },
    "WATER": {
        id: "WATER",
        name: "물",
        type: "WATER",
        grade: "Basic",
        description: "체력 회복",
        bingoDescription: "물 빙고: 추가 회복",
        effectParams: {}
    },
    "WIND": {
        id: "WIND",
        name: "바람",
        type: "WIND",
        grade: "Basic",
        description: "공격력 버프 또는 적 디버프",
        bingoDescription: "바람 빙고: 공격력 증가",
        effectParams: {}
    }
};
