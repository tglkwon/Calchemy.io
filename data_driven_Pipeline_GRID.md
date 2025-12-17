그리드 기반 효과 데이터 주도형 구현 지침
1. 개요 및 목표
본 지침은 4x4 빙고 그리드 내에서 카드의 위치와 속성을 조작하는 효과를 **데이터 주도형(Data-Driven)**으로 구현하기 위한 통합 표준입니다. 기획자가 CSV 파일의 JSON 로직을 수정하는 것만으로 새로운 그리드 상호작용을 즉시 생성할 수 있도록 하며, 모든 조작 후에도 그리드는 항상 16장의 카드로 채워져 있어야 함을 원칙으로 합니다.
2. JSON 데이터 스키마 (CSV 입력 표준)
기획자는 CSV의 Single_Logic 또는 Bingo_Logic 컬럼에 아래의 스키마를 사용하여 효과를 정의합니다.
2.1. 기본 구조
{
  "GRID_MANIPULATION": {
    "action": "[ACTION_TYPE]", 
    "target": "[TARGET_SELECTOR]", 
    "count": [NUMBER],          
    "toType": "[ELEMENT_TYPE]",  
    "condition": "[CONDITION_KEY]"
  }
}



참고: 내부 시스템에서 "그리드조작" 키는 "GRID_MANIPULATION"으로 자동 매핑됩니다.
2.2. 액션 타입 (Action Type)
|
| 키워드 | 설명 | 구현 세부 로직 |
| TRANSFORM | 변환 | 대상 카드의 ID는 유지하되 type만 toType으로 변경합니다. |
| SWAP | 위치 교환 | **발동 카드(Origin)**와 **대상 카드(Target)**의 그리드 위치를 서로 맞바꿉니다. |
| REPLACE | 카드 교체 | 대상 카드를 제거(버림더미 이동)하고, 덱에서 새 카드를 1장 뽑아 그 자리에 즉시 채웁니다. |
| UPGRADE | 강화 | 대상 카드의 등급(grade) 또는 효과 수치를 상승시킵니다. |

2.3. 타겟 셀렉터 (Target Selector) 및 반사 로직
단일 방향 지정 시 경계에 도달하면 **반대 방향(Reflection)**으로 타겟을 자동 전환합니다.
| 키워드 | 설명 | 좌표 연산 | 경계 도달 시 반사(Fallback) |
| UP | 위 | (x, y - 1) | DOWN (x, y + 1) |
| DOWN | 아래 | (x, y + 1) | UP (x, y - 1) |
| LEFT | 왼쪽 | (x - 1, y) | RIGHT (x + 1, y) |
| RIGHT | 오른쪽 | (x + 1, y) | LEFT (x - 1, y) |
| NEAR_4 | 주변 4칸 | 상하좌우 4개 | 유효한 좌표만 필터링 |
| NEAR_8 | 주변 8칸 | 인접 8개 모든 칸 | 유효한 좌표만 필터링 |
| RANDOM | 랜덤 | 전체(자기 제외) | 무작위 인덱스 추출 |
| ALL | 전체 | 그리드 16칸 전체 | 모든 유효 인덱스 |

2.4. 타겟 필터링 조건 (Condition) 10선
선택된 타겟들 중 아래 조건에 부합하는 카드만 최종 확정합니다.
SAME_TYPE: 발동 카드와 속성(type)이 같은 카드.
DIFF_TYPE: 발동 카드와 속성이 다른 카드.
HIGHEST_GRADE: 후보군 중 등급(grade)이 가장 높은 카드 순.
BASIC_ONLY: 효과가 없는 '기본 속성 카드'만 대상.
MOST_FREQUENT: 현재 그리드에서 가장 많은 속성을 가진 카드군.
LEAST_FREQUENT: 현재 그리드에서 가장 적은 속성을 가진 카드군.
UPGRADED: 이미 강화(UPGRADE)된 이력이 있는 카드.
NOT_UPGRADED: 아직 강화되지 않은 순수 상태의 카드.
SAME_LINE: 발동 카드와 같은 행(Row) 또는 열(Column) 위치.
IS_EDGE: 그리드의 테두리(0, 3행 또는 0, 3열)에 위치한 카드.

3. 시스템 구현 가이드
3.1. 좌표 및 경계 유틸리티
const isValidCoord = (x, y) => x >= 0 && x < 4 && y >= 0 && y < 4;
const getIndex = (x, y) => y * 4 + x;
const getCoord = (index) => ({ x: index % 4, y: Math.floor(index / 4) });



3.2. CardSystem.js 핵심 로직
A. 타겟팅 및 반사 구현 (getTargetIndices)
getTargetIndices(selector, count, originIdx) {
    const { x, y } = getCoord(originIdx);
    let tx = x, ty = y;

    switch (selector) {
        case 'UP':    ty = y - 1; if(!isValidCoord(tx, ty)) ty = y + 1; break;
        case 'DOWN':  ty = y + 1; if(!isValidCoord(tx, ty)) ty = y - 1; break;
        case 'LEFT':  tx = x - 1; if(!isValidCoord(tx, ty)) tx = x + 1; break;
        case 'RIGHT': tx = x + 1; if(!isValidCoord(tx, ty)) tx = x - 1; break;
        // NEAR_4, NEAR_8 등은 기존의 필터링 방식 적용
    }
    return isValidCoord(tx, ty) ? [getIndex(tx, ty)] : [];
}



B. 카드 교체 구현 (replaceCard)
replaceCard(index) {
    if (this.grid[index]) {
        this.discardPile.push(this.grid[index]); // 버림더미 이동
        if (this.deck.length === 0) this.refillDeck(); // 셔플 로직
        const newCard = this.deck.pop();
        this.grid[index] = { ...newCard, instanceId: `REP_${Date.now()}_${index}` };
    }
}


C. 통합 실행 프로세스 (executeGridAction)
executeGridAction(action, selector, count, toType, originIdx, condition) {
    let candidates = this.getTargetIndices(selector, 16, originIdx);
    let finalTargets = this.filterTargets(candidates, condition, originIdx);
    finalTargets = finalTargets.slice(0, count);

    finalTargets.forEach(tIdx => {
        if (action === 'SWAP') {
            [this.grid[originIdx], this.grid[tIdx]] = [this.grid[tIdx], this.grid[originIdx]];
        } else if (action === 'REPLACE') {
            this.replaceCard(tIdx);
        } else if (action === 'TRANSFORM') {
            const type = (toType === 'ORIGIN') ? this.grid[originIdx].type : toType;
            this.grid[tIdx] = { ...this.grid[tIdx], type: type };
        }
    });
    this.grid = [...this.grid]; // 상태 갱신
    return `조작 완료 (대상: ${finalTargets.length})`;
}

4. 기획 적용 예시
바람의 교체 (Swap): "위쪽 카드와 위치를 바꿉니다. 위가 막혀있으면 아래와 바꿉니다."
{"action": "SWAP", "target": "UP", "count": 1}
원소 정화 (Replace): "그리드 전체에서 가장 흔한 속성의 카드 1장을 버리고 새로 뽑습니다."
{"action": "REPLACE", "target": "ALL", "condition": "MOST_FREQUENT", "count": 1}
심연의 부름 (Transform): "주변 8칸 중 기본 카드들을 모두 내 속성으로 바꿉니다."
{"action": "TRANSFORM", "target": "NEAR_8", "condition": "BASIC_ONLY", "toType": "ORIGIN"}

5. 최종 주의사항
빙고 체크 강제 실행: 모든 그리드 조작 액션이 끝난 직후 checkBingos()를 명시적으로 호출해야 합니다.
ID 재생성: REPLACE나 TRANSFORM 시 instanceId를 새롭게 할당하여 UI 컴포넌트(React 등)가 변경을 감지하게 하십시오.
자기 자신 제외: SWAP이나 REPLACE 타겟팅 시 originIdx가 결과에 포함되지 않도록 필터링하십시오.
