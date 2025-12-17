# 역할(Role)
너는 상용 게임 프로젝트 경험이 풍부한 '시니어 게임 클라이언트 개발자'야. 
JavaScript(React/Vite) 환경에서 '데이터 주도형(Data-Driven) 아키텍처'를 구축하는 것이 너의 임무야.

# 목표(Objective)
하드코딩된 게임 로직을 제거하고, 기획자가 CSV 파일만 수정하면 게임의 카드, 유물, 상태이상(키워드) 로직이 자동으로 반영되는 '통합 게임플레이 데이터 파이프라인'을 구축해줘.

# 아키텍처 요구사항 (Architecture Requirements)

1. **데이터 계층 (CSV Files)**
   - `public/data/` 폴더 내의 CSV 파일들을 런타임에 로딩해야 함.
   - 대상 파일: `cards.csv`, `keywords.csv`, `artifacts.csv`
   - 라이브러리: `papaparse` 사용.

2. **데이터 처리 계층 (Data Processing Layer)**
   - **JSON Logic Mapping:** CSV의 이펙트 파라미터(JSON 형식, 예: `{"damage": 10}`)를 파싱하여 게임 로직에 직접 전달함.
   - **Keyword Linker:** 텍스트 내에 `{화상}`, `{기절}` 같은 키워드가 있으면, `keywords.csv`의 데이터와 매칭하여 툴팁이나 상세 정보를 연결해야 함.

3. **로직 계층 (Logic Layer - Registry Pattern)**
   - **Effect Registry:** 파싱된 이펙트 타입('DAMAGE', 'HEAL', 'APPLY_STATUS' 등)을 실제 게임 상태 변경 함수와 매핑하는 중앙 관리소를 구현할 것.
   - **확장성:** 추후 포션이나 유물도 동일한 Registry를 통해 효과를 발동할 수 있어야 함.

# 구현해야 할 상세 파일 구조 및 내용

1. **CSV 데이터 구조 (예시)**
   - **Cards.csv 헤더:** `ID, Name, Type, Cost, Effect_Text, Upgrade_Text`
   - **Keywords.csv 헤더:** `ID, Name, Trigger_Type, Effect_Script` (예: 화상 -> 턴 시작 시 데미지)

2. **`src/utils/csvLoader.js`**
   - 여러 CSV 파일을 병렬로 fetch하고 파싱하여 하나의 `GameData` 객체로 반환하는 로직.

3. **`src/utils/csvLoader.js` (Enhanced)**
   - CSV 로딩 시 JSON 컬럼을 자동으로 객체로 변환.
   - 파싱 오류 발생 시 기본값 처리 및 경고 로그.

4. **`src/systems/EffectSystem.js`** (핵심)
   - `executeEffect(effectCommand, gameState, target)` 함수 구현.
   - 스위치문(Switch-Case) 또는 객체 맵(Object Map)을 사용하여 이펙트 처리.

# 제약 사항
- 코드는 모듈화되어야 하며, 각 함수의 역할이 명확해야 함.
- 코드 내에 주석으로 "이 부분이 데이터를 로직으로 변환하는 곳입니다"와 같이 설명을 달아줄 것.
- React의 `Context API`나 전역 상태 관리를 가정하고, 데이터가 로드된 후 앱이 시작되도록 하는 흐름을 포함할 것.

# 출력 요청
위의 아키텍처를 구현하기 위한 폴더 구조와 핵심 파일들의 전체 코드를 작성해줘.