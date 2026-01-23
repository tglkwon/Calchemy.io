# 데이터 스키마 규칙 (Data Schema Rules)

## 1. CSV 파일 구조
### cards.csv
- `ID`: 고유 식별자
- `Type`: 원소 속성 (FIRE, WATER, EARTH, WIND)
- `S_Logic`: 단일 발동 시 효과 (JSON)
- `B_Logic`: 빙고 시 추가 효과 (JSON)

### relics.csv
- `ID`, `Name`, `Trigger` (ON_BINGO, ON_TURN_START 등), `Effect_Logic` (JSON)

## 2. JSON 로직 키워드
- `ATTACK`: 피해량 (정수)
- `BLOCK`: 방어도 (정수)
- `HEAL`: 회복량 (정수)
- `GRID_MANIPULATION`: 그리드 조작 객체

## 3. 작성 주의사항
- JSON 필드 내의 따옴표와 중괄호 형식을 엄격히 준수해야 합니다.
- 수치와 액션 ID는 `EffectRegistry`에 정의된 것과 일치해야 합니다.
