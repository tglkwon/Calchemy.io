---
description: 카드, 유물 등 새로운 게임 콘텐츠를 추가하는 단계별 가이드
---

# 신규 콘텐츠 추가 워크플로우

1. **ID 정의**: 기존 카드/유물과 겹치지 않는 고유 ID를 결정합니다.
2. **CSV 행 추가**: `public/data/`의 적절한 CSV 파일 하단에 새 행을 추가합니다.
3. **로직 작성**: `data_schema_rules.md`를 참고하여 `S_Logic` 또는 `B_Logic`을 작성합니다.
   - 새로운 특수 효과가 필요한 경우 `src/systems/EffectRegistry.js`에 새 함수를 등록해야 할 수도 있습니다.
4. **이미지 리소스 추가**: `public/assets/` 폴더에 관련 이미지를 추가하고 `AssetProvider`의 매핑 리스트를 업데이트합니다.
5. **데이터 반영**: `update-game-data.md` 워크플로우를 실행합니다.
