---
description: 게임 기획 데이터(CSV)를 시스템 데이터(JSON)로 변환하고 반영하는 절차
---

# 게임 데이터 업데이트 워크플로우

1. **CSV 수정**: `public/data/` 폴더 내의 관련 CSV 파일을 수정합니다.
2. **데이터 생성 실행**:
   ```bash
   npm run gen-data
   ```
3. **결과 확인**: `src/generated/gameData.json` 파일이 정상적으로 갱신되었는지 확인합니다.
4. **로컬 테스트**: `npm run dev`를 실행하여 게임 내에서 데이터 변경 사항이 의도대로 동작하는지 검증합니다.
