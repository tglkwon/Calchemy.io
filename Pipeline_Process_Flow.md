# **데이터 파이프라인 및 로직 구현 흐름 (Pipeline & Logic Flow)**

이 문서는 CSV 데이터가 게임 내에서 실제 로직으로 작동하기까지의 **전체 흐름(Life Cycle)**을 설명합니다.

## **1. 파이프라인 개요 (Overview)**

시스템은 크게 두 단계로 나뉩니다:
1.  **빌드 타임 (Build Time):** `npm run gen-data` 명령어로 CSV를 JSON으로 변환.
2.  **런타임 (Run Time):** 게임 실행 시 JSON을 로드하고 `KeywordSystem`이 이를 해석하여 실행.

---

## **2. 단계별 상세 흐름 (Step-by-Step Flow)**

### **Step 1: 기획 데이터 작성 (Excel/CSV)**
기획자가 `public/data` 폴더에 CSV 파일을 작성합니다.
*   **cards.csv 예시:**
    *   `Single_Logic`: `{"GRID_MANIPULATION": {"action": "SWAP", "target": "UP"}}`
    *   `Bingo_Logic`: `{"ATTACK": 10}`

### **Step 2: 데이터 생성 (Build Time)**
개발자가 `npm run gen-data`를 실행하면 `scripts/generateGameData.js`가 작동합니다.
1.  **CSV 로딩:** `fs` 모듈로 파일을 읽습니다.
2.  **JSON 파싱:** `Single_Logic`, `Bingo_Logic` 컬럼의 문자열을 실제 JSON 객체로 변환합니다.
    *   *이 단계에서 유효성 검사 및 정규화(Normalization)가 수행됩니다.*
3.  **파일 생성:** 변환된 데이터를 `src/generated/gameData.json`으로 저장합니다.

### **Step 3: 게임 초기화 (Run Time - Init)**
게임(React App)이 시작될 때 `GameProvider.jsx`가 작동합니다.
1.  **데이터 로드:** `src/generated/gameData.json`을 import 합니다.
2.  **시스템 주입:** `gameEngine.loadDefinitions(gameData)`를 호출하여 카드, 유물 데이터를 메모리에 등록합니다.

### **Step 4: 로직 실행 (Run Time - Execution)**
카드가 발동되거나 빙고가 완성되면 `KeywordSystem.js`가 호출됩니다.

#### **A. 실행 트리거**
*   **카드 발동:** `GameEngine` -> `triggerCardEffect(card)` -> `keywordSystem.processCardEffects(card)`
*   **빙고 달성:** `GameEngine` -> `applyBingoEffects(bingo)` -> `keywordSystem.processCardEffects(bingoCard)`

#### **B. 효과 분기 (Dispatcher)**
`KeywordSystem.js`의 `executeSingleEffect` 함수가 JSON 키 값에 따라 적절한 시스템을 호출합니다.

| JSON Key | 담당 시스템 | 실행 함수 |
| :--- | :--- | :--- |
| `GRID_MANIPULATION` | `CardSystem` | `executeGridAction(action, target...)` |
| `ATTACK` | `GameEngine` | `applyDamage(target, amount)` |
| `BLOCK` | `GameEngine` | `addShield(amount)` |
| `HEAL` | `GameEngine` | `healPlayer(amount)` |

#### **C. 실제 구현 (Implementation)**
*   **그리드 조작:** `CardSystem.js`가 비어있는 `getTargetIndices`를 통해 타겟을 찾고, `filterTargets`로 필터링한 뒤, `grid` 배열을 직접 수정(Swap/Replace)합니다.
*   **수치 조정:** `GameEngine`이 `gameState`의 HP, Shield, Enemy HP 등을 업데이트하고 React State를 갱신하여 UI에 반영합니다.

---

## **3. 요약 (Summary)**

*   **파이프라인(`generateGameData.js`)**의 역할은 **"번역(Translation)"**입니다. (CSV String -> JSON Object)
*   **구현(`KeywordSystem`, `CardSystem`)**의 역할은 **"실행(Execution)"**입니다. (JSON Object -> Game Logic)

따라서, "파이프라인에 로직 구현이 없다"는 것은 정상이며, 로직은 `src/systems` 폴더 내의 시스템 클래스들에 구현되어 있습니다.
