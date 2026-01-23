# **연금술사 오토 배틀러 \- 개발 현황 및 히스토리**

**문서 버전:** v2.0

**최종 수정일:** 2025.01.23

## **1\. 기술 스택 (Tech Stack)**

*   **Core:** React 19, JavaScript (ES6+)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Data Parsing:** PapaParse (CSV 처리)
*   **Hosting:** GitHub Pages (gh-pages)
*   **Architecture:** Context API (GameProvider, AssetProvider) 기반 상태 관리

## **2\. 현재 개발 상태 (Current Status)**

### **✅ 구현 완료 (Done)**

*   **전투 엔진 (GameEngine.js):**
    *   비동기 턴 진행 로직 (카드 배포 -> 순차 발동 -> 빙고 체크 -> 적 행동).
    *   기본 AI (적 의도 생성 및 실행).
*   **UI/UX:**
    *   반응형 레이아웃 (3단 분할).
    *   애니메이션 효과 (카드 발동 시 Pulse, 빙고 달성 시 Flash).
    *   스탯 에디터 (일시정지 시 활성화).
    *   에셋 토글 시스템 (이모지 ↔ 이미지).
*   **시스템:**
    *   4x4 그리드 및 기본/조화 빙고 판정 알고리즘.
    *   CSV 로더 기초 구현.
    *   유물 데이터 구조 정의 및 UI 표시.
*   **빌드 시점 최적화 (Build-Time Optimization) 및 유물 통합:**
    *   `scripts/generateGameData.js`: 빌드 전 CSV(Cards, Artifacts, Potions)를 JSON으로 변환.
    *   **유물 시스템 통합:** CSV 기반 유물 데이터 로드 및 `GameEngine` 트리거(`TurnStart` 등) 연동 구현.
    *   런타임 파싱 제거로 초기 로딩 성능 개선.
*   **데이터 주도형 파이프라인 (Data-Driven Pipeline) (Complete):**
    *   CSV 로더 통합 및 한국어 키워드 매핑 완료.
    *   `EffectSystem` 구축: 공격, 방어, 회복 등 핵심 로직 동적 처리.

### **🚧 진행 중 / 예정 (In Progress / To-Do)**

*   **맵 상호작용 확장 (Map Interaction Expansion):**
    *   SHOP, REST, EVENT, TREASURE 노드 타입별 로직 구현.
    *   보스 노드 특수 UI 및 보상 시스템.
*   **저장/불러오기 (Save/Load):**
    *   `localStorage` 기반 진행 상황(덱, 유물, 체력, 맵 위치) 저장 구현.
*   **이벤트 시스템:**
    *   전투 외 상황(랜덤 이벤트, 상점) 처리 로직.

## **3\. 변경 내역 (Changelog)**

### **v1.3 (Current)**

*   **아키텍처 개선:** GameProvider와 AssetProvider 분리로 렌더링 최적화.
*   **UI 개선:** 전투 화면 상단에 활성 유물 아이콘 표시 기능 추가.
*   **기능 추가:** 덱 페이지에서 카드 클릭 시 제거/추가 기능 구현.
*   **데이터 파이프라인:** CSV(Cards, Artifacts, Keywords, Potions) 파일 로딩 및 로직 파싱 시스템 구현 완료.
*   **데이터 파이프라인 전체 통합 (Data Pipeline Full Integration):** `GameProvider`가 CSV 데이터를 `GameEngine`에 주입.
*   **효과 시스템 (Effect System):** `executeEffect`를 통해 공격, 치유, 방어 처리.
*   **리팩토링 (Refactor):** `CardSystem`이 동적 정의를 지원하도록 개선.
*   **그리드 조작 시스템 (Grid Manipulation):**
    *   `CardSystem` 확장: `SWAP`, `REPLACE`, `TRANSFORM` 액션 및 반사형(Reflection) 타겟팅 구현 완료.
    *   `KeywordSystem` 연동: CSV-JSON 파이프라인과 그리드 액션 실행 로직 연결.
    *   문서화: `data_driven_Pipeline_GRID.md` 및 `README.md`에 JSON 키워드 레퍼런스 추가.

### **v2.0 (2025.01.23) - 이벤트 시스템 및 2.0 업데이트**

*   **이벤트 시스템 구현 (Event System Implementation):**
    *   **데이터 파이프라인 확장:** `generateGameData.js` 업데이트로 `연금술 오토 배틀러 컨텐츠 - 이벤트.csv` 자동 파싱 및 JSON 변환 지원.
    *   **선택지 파싱 로직:** CSV의 요약 텍스트에서 `/`, `또는` 등의 구분자를 통해 다중 선택지를 자동 생성하는 로직 구현.
    *   **핵심 로직:**
        *   `MapGenerator.js`: 시드(Seed) 기반 랜덤 및 중복 방지(Unique Selection) 로직 적용.
        *   `EventLibrary.js`: 런타임 이벤트 핸들링 및 조건부 효과 처리.
        *   `EffectSystem.js`: `EVENT_GAIN_GOLD`, `EVENT_LOSE_HP` 등 이벤트 전용 효과 타입 추가.
    *   **UI/UX:**
        *   `EventPage.jsx`: 상단(비주얼/서사) - 하단(선택지) 2단 레이아웃 구현.
        *   네비게이션: 상단 메뉴바에 '이벤트' 바로가기 추가 및 맵 노드 연동.
*   **개발 환경 개선:**
    *   Node.js 16 호환성 문제 해결을 위해 Vite 및 플러그인 버전을 다운그레이드(v4)하여 안정적인 `npm run dev` 환경 구축.
    *   브라우저 기반 자동화 테스트를 통해 이벤트 진입-선택-귀환 플로우 검증 완료.
    *   `walkthrough.md`에 검증 스크린샷 및 영상 포함.
*   **UI/UX 대규모 개선 (Global Status Bar):**
    *   **전역 상태 바 도입:** `NavBar` 하단에 HP, Gold, 포션, 유물 정보를 상시 표시하는 `GlobalStatusBar` 컴포넌트 추가.
    *   **포션 시스템 (Potion System):**
        *   `GameEngine`에 포션 인벤토리(최대 3슬롯) 및 사용(`usePotion`) 로직 구현.
        *   상점 구매 시 인벤토리 추가, 전투/이동 중 클릭 시 즉시 사용 기능 연동.
    *   **안정성 강화:** `GameProvider` 리팩토링 중 발생한 메서드 유실 복구 및 렌더링 안정화.

### **v1.5 (2026.01.10)**

*   **Tailwind CSS 스타일 시스템 통합 (Styling Unification):**
    *   기존 개별 CSS 파일(`MapPage.css`, `ShopPage.css`, `App.css`)을 모두 제거하고 Tailwind CSS로 통일.
    *   `index.css`에서 Tailwind 4의 `@theme` 및 `@layer utilities`를 활용해 공통 애니메이션(빙고 플래시, 보스 펄스 등) 및 배경 테마 관리.
*   **상점 페이지 고도화 (Shop Page Redesign):**
    *   **UI 개편:** 불필요한 텍스트 헤더를 제거하고 상단(카드), 하단(서비스/잡화) 선반 구조로 레이아웃 재배치.
    *   **아이콘 표준화:** 유물은 보물상자(🎁), 포션은 실험관(🧪) 이모지로 시각적 통일성 부여.
*   **테스트 환경 개선:**
    *   초기 보유 골드를 100에서 1000으로 상향 조정하여 상점 기능 테스트 편의성 확보.

### **v1.4 (2025.12.27)**

*   **맵 시스템 구현 완료 (Map System Implementation):**
    *   `MapGenerator.js`: Unity 기반 맵 생성 로직 완전 이식 (노드 배치, 경로 연결, 가지치기).
    *   **노드 타입:** BATTLE, SHOP, REST, EVENT, TREASURE, BOSS 정의 및 아이콘 매핑.
    *   `MapPage.jsx`: 인터랙티브 맵 UI 구현 (노드 클릭, 경로 시각화).
    *   `MapPage.css`: 노드 타입별 색상 테마 및 호버 효과 적용.
*   **맵 진행 시스템 (Map Progression System):**
    *   `GameEngine.js`에 맵 상태 관리 추가:
        *   `mapData`: 현재 생성된 맵 데이터 저장.
        *   `currentNodeId`: 플레이어의 현재 위치 추적.
        *   `visitedNodeIds`: 방문한 노드 기록 (Set 자료구조).
    *   `selectMapNode()`: 노드 선택 시 도달 가능 여부 검증 및 상태 업데이트.
    *   `isNodeReachable()`: 현재 노드에서 이동 가능한 노드 판별 로직.
*   **맵-전투 연동 (Map-Battle Integration):**
    *   맵에서 BATTLE 노드 클릭 → 전투 페이지 자동 진입.
    *   전투 승리 후 "지도로 돌아가기" 버튼을 통해 맵으로 복귀.
    *   방문한 노드 시각적 표시 (visited, current, reachable 스타일 구분).
    *   경로(path) 활성화 애니메이션 및 도달 불가 노드 비활성화 처리.
*   **UI/UX 개선:**
    *   맵 페이지에 "새 지도 생성" 버튼 추가 (디버깅/테스트용).
    *   노드 상태별 시각적 피드백: 현재 노드(노란색 테두리), 방문한 노드(반투명), 도달 가능한 노드(펄스 애니메이션).

### **v1.2**

* **에디터 기능:** 게임 일시정지 시 유닛 스탯(HP, 공격력 등) 수정 input 활성화 기능 추가.  
* **로그 페이지:** 전투 로그를 별도 페이지에서 모아보는 기능 추가.

## **4\. 배포 가이드 (Deployment)**

이 프로젝트는 GitHub Pages를 통해 호스팅됩니다.

### **4.1. 사전 설정**

* package.json: "homepage": "https://\[username\].github.io/\[repo-name\]" 설정 확인.  
* vite.config.js: base: '/\[repo-name\]/' 설정 확인.

### **4.2. 배포 명령어**

터미널에서 아래 명령어를 실행하면 빌드 및 배포가 자동으로 수행됩니다.

\# 1\. 의존성 설치 (최초 1회)  
npm install

\# 2\. 빌드 및 배포 (gh-pages 브랜치로 푸시)  
npm run deploy

### **4.3. 스크립트 설명**

* npm run build: vite build를 실행하여 ./dist 폴더에 프로덕션 빌드 생성.  
* npm run deploy: gh-pages 패키지를 사용하여 ./dist 폴더를 원격 저장소의 gh-pages 브랜치에 업로드.

## **5\. 트러블슈팅 및 이슈**

* **이미지 경로 문제:** 로컬 개발 환경과 GitHub Pages의 경로 차이로 인해 이미지가 깨질 경우 AssetManager.js의 경로 처리 로직이나 vite.config.js의 base 설정을 확인하세요.  