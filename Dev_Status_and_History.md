# **연금술사 오토 배틀러 \- 개발 현황 및 히스토리**

**문서 버전:** v1.3

**작성일:** 2025.02.19

## **1\. 기술 스택 (Tech Stack)**

* **Core:** React 19, JavaScript (ES6+)  
* **Build Tool:** Vite  
* **Styling:** Tailwind CSS  
* **Data Parsing:** PapaParse (CSV 처리)  
* **Hosting:** GitHub Pages (gh-pages)  
* **Architecture:** Context API (GameProvider, AssetProvider) 기반 상태 관리

## **2\. 현재 개발 상태 (Current Status)**

### **✅ 구현 완료 (Done)**

* **전투 엔진 (GameEngine.js):**  
  * 비동기 턴 진행 로직 (카드 배포 \-\> 순차 발동 \-\> 빙고 체크 \-\> 적 행동).  
  * 기본 AI (적 의도 생성 및 실행).  
* **UI/UX:**  
  * 반응형 레이아웃 (3단 분할).  
  * 애니메이션 효과 (카드 발동 시 Pulse, 빙고 달성 시 Flash).  
  * 스탯 에디터 (일시정지 시 활성화).  
  * 에셋 토글 시스템 (이모지 ↔ 이미지).  
* **시스템:**  
  * 4x4 그리드 및 기본/조화 빙고 판정 알고리즘.  
  * CSV 로더 기초 구현.  
  * 유물 데이터 구조 정의 및 UI 표시.

### **🚧 진행 중 / 예정 (In Progress / To-Do)**

* **\[최우선\] 데이터 주도형 파이프라인 구축:**  
  * CardSystem.js의 하드코딩된 switch-case 제거.  
  * cards.csv의 JSON 컬럼(S\_Logic, B\_Logic)을 파싱하여 동적으로 효과를 실행하는 EffectSystem.js 구현.  
* **유물 로직 연결:**  
  * UI 상의 유물 활성화 여부를 실제 GameEngine 계산식에 반영.  
  * (예: T-스핀 유물 활성화 시 빙고 판정 로직 변경).  
* **맵 시스템 연동:**  
  * Unity C\#으로 작성된 맵 생성 로직(MapGenerator.cs)을 JavaScript로 이식하여 스테이지 진행 기능 추가.

## **3\. 변경 내역 (Changelog)**

### **v1.3 (Current)**

* **아키텍처 개선:** GameProvider와 AssetProvider 분리로 렌더링 최적화.  
* **UI 개선:** 전투 화면 상단에 활성 유물 아이콘 표시 기능 추가.  
* **기능 추가:** 덱 페이지에서 카드 클릭 시 제거/추가 기능 구현.

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
* **CSV 파싱 오류:** 엑셀에서 CSV 저장 시 UTF-8 인코딩이 깨지는 경우, 메모장에서 'UTF-8(BOM 포함)' 또는 일반 'UTF-8'로 다시 저장해야 합니다.