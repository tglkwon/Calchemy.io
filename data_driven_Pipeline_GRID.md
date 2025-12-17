그리드 기반 효과 데이터 주도형 구현 지침 (Data-Driven Grid Manipulation Effects)1. 개요 및 목표현재 시스템은 카드와 키워드의 단순 수치 기반 효과(Damage, Heal, Block 등)를 CSV JSON 로직을 통해 처리하고 있습니다. 이제 빙고 그리드 내부의 카드 위치, 타입, 상태 등을 조작하는 복잡한 효과들을 하드코딩 없이 데이터 주도형(Data-Driven)으로 구현하는 것이 목표입니다.이를 위해 새로운 효과 타입 GRID_MANIPULATION을 도입하고, 그 하위의 액션(Action)과 타겟(Target)을 JSON 스키마로 표준화합니다.2. JSON 데이터 스키마 정의 (CSV Logic 컬럼 입력값)기획자는 연금술 오토 배틀러 컨텐츠 - 카드.csv 파일의 Single_Logic 또는 Bingo_Logic 컬럼에 다음과 같은 JSON 구조를 입력해야 합니다.JSON Key (Korean/Internal)Internal Effect Type설명"그리드조작"GRID_MANIPULATION그리드 내부의 상태를 변경하는 모든 행위를 포함합니다.GRID_MANIPULATION 액션 스키마 (Action Schema)GRID_MANIPULATION 타입은 action, target, count 속성을 필수로 가집니다.{
  "GRID_MANIPULATION": {
    "action": "[ACTION_TYPE]", 
    "target": "[TARGET_SELECTOR]", 
    "count": [NUMBER],          
    // 선택적 파라미터:
    "toType": "[ELEMENT_TYPE]",  // TRANSFORM 액션 시 필요
    "condition": "[CONDITION_TYPE]" // 특정 조건의 카드만 대상으로 할 때 사용
  }
}
필드타입설명예시 값actionString수행할 원자적 그리드 조작 명령"TRANSFORM", "SWAP", "UPGRADE", "DISCARD"targetString조작의 대상이 되는 카드 선택 방식"RANDOM", "ADJACENT", "SAME_TYPE", "FRONT"countNumber조작할 카드의 개수 (SWAP 시 쌍의 개수)1, 2, 4toTypeStringTRANSFORM 액션 시, 변경될 카드의 속성"FIRE", "WATER", "WIND"conditionString타겟팅 시 적용할 추가 조건 (선택 사항)"NOT_FIRE", "RARE"3. 구현 요구사항 및 변경 지점다음 파일들의 수정 및 확장이 필요합니다.3.1. src/systems/EffectSystem.js 수정요구사항 1: 새로운 이펙트 타입 및 한글 매핑 추가EffectType과 KoreanLogicMap에 그리드 조작 관련 상수를 추가합니다.// src/systems/EffectSystem.js (부분 수정)

// 1. Effect Types (Internal Constants) 확장
export const EffectType = {
    // ... 기존 타입들 (ATTACK, HEAL, BLOCK, ...)
    GRID_MANIPULATION: 'GRID_MANIPULATION' 
};

// 2. Korean Key Mapping (For parsing JSON logic from CSV) 확장
export const KoreanLogicMap = {
    // ... 기존 매핑들 ("공격", "회복", ...)
    "그리드조작": EffectType.GRID_MANIPULATION
};
요구사항 2: executeEffect 내 GRID_MANIPULATION 로직 구현executeEffect 함수 내에 새로운 case를 추가하여 그리드 조작 로직을 CardSystem에 위임합니다.// src/systems/EffectSystem.js (executeEffect 함수 내부)

export const executeEffect = (effect, gameState, targetUnit = null) => {
    // ...
    // NOTE: gameState 객체는 CardSystem 인스턴스를 포함해야 합니다.
    const { golem, minions, engine, cardSystem } = gameState; // cardSystem 추가

    switch (effect.type) {
        // ... 기존 ATTACK, HEAL, BLOCK 로직

        case EffectType.GRID_MANIPULATION: {
            const params = effect.value; // GRID_ACTION의 세부 파라미터
            const { action, target, count, toType } = params; 
            
            // 이 부분이 데이터를 로직(그리드 조작)으로 변환하는 핵심부입니다.
            if (cardSystem) {
                const log = cardSystem.executeGridAction(action, target, count, toType);
                return `✨ 그리드 조작: ${log}`;
            }
            return `⚠️ 그리드 조작: CardSystem이 없어 실행 실패.`;
        }

        default:
            // ...
            break;
    }
    // ...
};
3.2. src/systems/CardSystem.js 수정요구사항 3: 그리드 조작 위임 함수 구현 (executeGridAction)EffectSystem에서 위임받은 액션을 처리하는 메인 함수를 구현합니다. 이 함수는 타겟팅과 액션 실행을 분리하여 처리해야 합니다.// src/systems/CardSystem.js (새로운 메서드 추가)

export class CardSystem {
    // ... 기존 메서드 (constructor, initDeck, shuffle, drawGrid, ...)

    /**
     * EffectSystem에서 호출되어 데이터 기반의 그리드 조작을 실행합니다.
     * @param {string} actionType - TRANSFORM, SWAP, UPGRADE 등
     * @param {string} targetSelector - RANDOM, ADJACENT 등 타겟 선택 방식
     * @param {number} count - 조작할 카드의 수
     * @param {string} toType - TRANSFORM 시 변경될 카드 타입
     * @returns {string} 실행 로그
     */
    executeGridAction(actionType, targetSelector, count, toType) {
        const targetIndices = this.getTargetIndices(targetSelector, count);

        if (targetIndices.length === 0) {
            return `대상이 없어 (${actionType}) 실행되지 않았습니다.`;
        }
        
        // 1. Action 분기 처리
        let logs = [];
        switch (actionType) {
            case 'TRANSFORM':
                targetIndices.forEach(idx => {
                    this.transformCard(idx, toType);
                    logs.push(`(${idx})번 카드가 ${toType}으로 변환.`);
                });
                break;
            case 'SWAP':
                // SWAP 로직은 count를 짝지어 줘야 하므로 별도의 로직 필요
                // this.swapCards(targetIndices);
                logs.push(`미구현 액션: SWAP`);
                break;
            // ... 기타 액션 (UPGRADE, DISCARD) 구현
            default:
                logs.push(`알 수 없는 액션 타입: ${actionType}`);
        }

        return logs.join(' ');
    }

    /**
     * [원자적 함수] 특정 인덱스의 카드 타입을 강제로 변경합니다.
     * @param {number} index - 그리드 인덱스 (0-15)
     * @param {string} newType - 변경될 요소 타입 (FIRE, WATER 등)
     */
    transformCard(index, newType) {
        if (this.grid[index]) {
            // 카드의 기본 정의를 찾거나, 최소한 타입만 변경
            this.grid[index] = {
                ...this.grid[index],
                type: newType,
                // 인스턴스 ID 변경으로 React/UI가 강제 업데이트 되도록 유도
                instanceId: `${newType}_TR_${Date.now()}_${index}` 
            };
        }
    }

    /**
     * [원자적 함수] 타겟 셀렉터에 따라 대상 카드의 인덱스를 반환합니다.
     * @param {string} selector - 타겟 선택 방식 (RANDOM, ADJACENT 등)
     * @param {number} count - 필요한 카드의 수
     * @returns {number[]} 대상 인덱스 배열
     */
    getTargetIndices(selector, count) {
        const indices = this.grid.map((_, i) => i);
        
        switch (selector) {
            case 'RANDOM':
                // 무작위 count 개 선택
                return indices.sort(() => 0.5 - Math.random()).slice(0, count);
            case 'FRONT':
                // 전열 (0, 4, 8, 12) 중 하나
                const frontIndices = [0, 4, 8, 12];
                return frontIndices.sort(() => 0.5 - Math.random()).slice(0, 1); // 1개만 반환
            // ... ADJACENT, SAME_TYPE 등 추가 타겟팅 로직 구현 필요
            default:
                return [];
        }
    }
}
4. gameState 컨텍스트 업데이트 지침executeEffect가 cardSystem을 참조할 수 있도록, 게임 상태를 관리하는 상위 컨텍스트(GameProvider.jsx 또는 GameContext.js)에서 CardSystem 인스턴스를 gameState 객체에 포함시켜야 합니다.// GameProvider.jsx (또는 유사 파일) 내부

// ...
const cardSystem = useMemo(() => new CardSystem(), []);
// ...

const gameState = {
    golem: golemState,
    minions: minionsState,
    engine: gameEngine,
    cardSystem: cardSystem, // CardSystem 인스턴스 추가
};
// ...
