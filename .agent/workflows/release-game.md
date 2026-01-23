---
description: 최신 코드를 빌드하고 GitHub Pages에 배포하는 절차
---

# 게임 배포 워크플로우

1. **사전 체크**: 모든 변경 사항이 커밋되었는지 확인합니다.
2. **배포 명령어 실행**:
   ```bash
   npm run deploy
   ```
   - 이 명령어는 `scripts/generateGameData.js`를 먼저 실행한 후 빌드와 배포를 연속으로 수행합니다.
3. **Live 확인**: 약 1~2분 후 [GitHub Pages 주소](https://tglkwon.github.io/Calchemy.io/)에 접속하여 확인합니다.
