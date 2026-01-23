# 그리드 로직 엔진 (Grid Logic Engine)

## 1. 좌표 시스템
- 4x4 그리드: 인덱스 0~15.
- `isValidCoord(x, y)`: 0~3 범위 체크.
- `getIndex(x, y)`, `getCoord(index)` 유틸리티 활용.

## 2. 타겟 셀렉터 및 반사 로직
- **방향**: UP, DOWN, LEFT, RIGHT.
- **반사(Reflection)**: 경계 도달 시 반대 방향으로 전환 (예: 최상단에서 UP 선택 시 DOWN 자동 타겟팅).
- **범위**: NEAR_4 (상하좌우), NEAR_8 (주변 8칸), ALL (전체).

## 3. 핵심 액션 (Grid Actions)
- **SWAP**: 두 카드의 위치 교환.
- **REPLACE**: 카드를 버림더미로 보내고 덱에서 새 카드를 뽑아 배치.
- **TRANSFORM**: 카드 ID는 유지하고 속성(Type)만 변경.
- **UPGRADE**: 카드 등급 상승.

## 4. 필터링 조건 (Conditions)
- `SAME_TYPE`, `DIFF_TYPE`, `BASIC_ONLY`, `MOST_FREQUENT`, `IS_EDGE` 등을 통해 타겟을 정밀하게 필터링.
