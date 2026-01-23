# 절차적 맵 생성 알고리즘 (Map Generation Logic)

## 1. 맵 구조
- Slay the Spire 스타일의 상향식 경로 생성.
- 노드 타입: BATTLE, SHOP, REST, EVENT, TREASURE, BOSS.

## 2. 생성 알고리즘 (`MapGenerator.js`)
- **노드 배치**: 층(Floor)별로 노드를 무작위 배치하고 좌표를 설정합니다.
- **경로 연결**: 각 노드에서 다음 층의 노드 중 도달 가능한 대상을 연결합니다.
- **가지치기(Pruning)**: 외톨이 노드나 도달 불가능한 경로를 정리하여 완성된 형태의 그래프를 생성합니다.

## 3. 진행 로직
- `currentNodeId`를 추적하고, 현재 노드와 연결된(`connectedTo`) 노드만 선택 가능하도록 제한합니다.
- 방문한 노드는 `visitedNodeIds`에 저장하여 시각적으로 표시합니다.
