# **연금술사 오토 배틀러 \- 개발 현황 및 히스토리**

**문서 버전:** v1.3

**작성일:** 2025.12.08

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

*   **맵 시스템 (Map System):**
    *   Unity `MapGenerator.cs` 로직 이식 (노드 생성, 경로 연결).
    *   이벤트/상점/전투/보스 노드 타입 정의 및 UI 구현.
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