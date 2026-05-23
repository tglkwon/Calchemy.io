---
name: git-push-deploy
description: Stage changes, commit, push to master on GitHub, and trigger GitHub Pages deployment. Use when user requests staging, committing, pushing to GitHub, or deploying the live demo site in a single workflow.
---

# Git Push & Deployment Skill

이 스킬은 프로젝트 내의 소스코드 변경 사항을 Git 스테이징하고, 원격 GitHub 저장소의 `master` 브랜치에 푸시한 후, `npm run deploy` 명령어를 실행하여 GitHub Pages에 즉시 라이브 사이트를 빌드 및 배포하는 연속 자동화 워크플로우를 담당합니다.

## Quick start

터미널에서 `npm run release "[커밋 메시지]"` 한 줄을 실행하면 전체 배포 과정이 수행됩니다:

```bash
npm run release "feat: 1막 시작 덱 축소 시스템 안정화"
```

## Workflows

### 1. 변경 사항 검증 및 배포 준비
- [ ] 소스코드가 정상적으로 빌드되는지 먼저 검증합니다 (`npm run build`).
- [ ] 수정한 내용 및 작성한 아티팩트(`implementation_plan.md`, `task.md`, `walkthrough.md`)가 온전한 상태인지 확인합니다.

### 2. 자동 배포 파이프라인 기동
- [ ] 다음 쉘 명령어를 실행하여 커밋 메시지와 함께 릴리즈 스크립트를 기동합니다:
  ```powershell
  npm run release "커밋 메시지 내용"
  ```
  - 이 스크립트는 `git add .` ➔ 스테이징 변경사항 유무 체크 ➔ `git commit` (변경사항이 있을 때만) ➔ `git push origin master` ➔ `npm run deploy` 단계를 차례대로 동기식 실행합니다.
  - 중간 과정이 실패하면 즉시 중단되므로 파이프라인의 무결성이 보장됩니다.

### 3. 배포 성공 검증
- [ ] 스크립트 출력창에 `🎉 Push & Deployment Completed Successfully!` 라는 성공 메시지가 출력되는지 검증합니다.
- [ ] 약 1~2분 후 깃허브 Pages 라이브 데모 웹사이트에 접속하여 최신 기능이 반영되었는지 직접 점검합니다.
