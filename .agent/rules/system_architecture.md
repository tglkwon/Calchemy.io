# 시스템 아키텍처 규칙 (System Architecture)

## 1. 개요
본 프로젝트는 React 19와 Vite를 기반으로 하며, 데이터 주도형(Data-Driven) 설계를 핵심 아키텍처로 채택합니다.

## 2. 핵심 원칙
- **데이터와 로직의 분리**: 게임의 밸런스, 카드 효과, 유물 스탯 등은 코드가 아닌 `public/data/*.csv` 파일에서 정의됩니다.
- **상태 관리**: React Context API (`GameProvider`, `AssetProvider`)를 사용하여 전역 상태를 관리하며, 렌더링 최적화를 위해 성격이 다른 상태는 분리합니다.
- **느슨한 결합 (Loose Coupling)**: 모든 효과(Effect)는 `EffectRegistry`를 통해 액션 ID와 함수를 매핑하여 처리합니다.

## 3. 데이터 파이프라인
- **빌드 타임 변환**: `npm run gen-data`를 실행하여 CSV를 JSON(`src/generated/gameData.json`)으로 변환합니다.
- **런타임 로드**: 게임 시작 시 JSON 데이터를 로드하여 전역 Context에 주입합니다.

## 4. 컴포넌트 설계
- 모든 컴포넌트는 Tailwind CSS 위주로 스타일링하며, 인라인 스타일 지양합니다.
- 복잡한 로직은 `src/systems` 폴더 내의 시스템 클래스로 분리합니다.
