# 스터디룸 예약 서비스 — 90분 팀 스프린트 실습 저장소

> 1일 과정 「바이브 코딩 시대의 스크럼」 Part 6 실습 저장소

4~5명이 한 팀이 되어 스프린트 한 번을 끝까지 돌려 봅니다. 스터디룸 예약 서비스의 첫 스토리(S1)를 AI와 함께 **계획하고 → 만들고 → 리뷰하고 → 회고합니다.**

목표는 기능 개수가 아닙니다. **S1 스토리 하나를 DoD(완료의 정의)까지** 끝내는 것입니다.

> **진행은 실습 가이드를 보면서 합니다.** 이 저장소의 **`guide.html`을 더블클릭**하면 브라우저에 열립니다(인터넷 없이도 열림). 강사가 공유한 웹 링크로 열어도 같은 내용입니다. 단계 번호(0-1, 2-3 …) 순서대로 명령을 한 줄씩 복사해 따라 하세요. 이 README는 저장소 안내입니다.

## 준비물 (수업 전날 끝내 오세요)

- Node.js **22.18 이상** (TypeScript 파일을 별도 설치 없이 바로 실행합니다)
- Git, GitHub 계정 (팀원 모두)
- AI 코딩 도구 — Claude Code는 팀에 **최소 1명** (개발자 A 역할). 다른 도구도 됩니다
- **Windows는 PowerShell이 아니라 Git Bash**에서 모든 명령을 실행합니다 (Git for Windows에 포함)
- `npm install`은 필요 없습니다. 외부 라이브러리 없이 Node.js 기본 기능만 씁니다
  (타입 검사 `npm run typecheck`를 쓰고 싶을 때만 `npm install`)

```bash
git branch            # main, before, after 세 개가 보이면 OK
npm test              # 맨 아래 "pass 2"가 보이면 준비 완료
npm start             # http://localhost:3000
npm run check         # 테스트 + 시크릿 검사 (DoD 확인용)
```

## 90분은 이렇게 흘러갑니다

| 단계 | 시간 | 하는 일 | 끝나면 남는 것 | 가이드 |
| --- | --- | --- | --- | --- |
| 팀 준비 | 쉬는 시간 | 팀 저장소 만들기, 팀원 초대, 역할·보드 정하기 | GitHub 팀 저장소, 역할 4개 | 1-1 ~ 1-3 |
| Sprint Planning | 15분 | Sprint Goal → AI에게 질문 먼저 → 팀이 답 → 스펙·규칙 파일 | `docs/specs/S1-reserve.md`, `AGENTS.md` | 2-1 ~ 2-5 |
| Build | 45분 | 개발자 A가 테스트 먼저(Red) → 개발자 B가 구현(Green) → PR → 설명·승인·머지. 30분·45분에 2분 데일리 | 통과하는 코드, 머지된 PR | 3-1 ~ 3-6 |
| Sprint Review | 15분 | 팀당 3분. DoD 통과분만, 겹침(409) 시나리오까지 시연 | PO의 수락 / 거절 | 4-1 |
| Retrospective | 15분 | KPT를 쓰고, Try 2개를 `AGENTS.md`에 커밋 | 규칙 파일 두 줄 | 5-1 ~ 5-2 |
| 디브리핑 | 5분 | `before`·`after` 브랜치와 우리 팀 결과 비교 | 비교표 | 5-3 |

## 역할

| 역할 | 인원 | 하는 일 | 하지 않는 일 |
| --- | --- | --- | --- |
| Product Owner | 1명 | Sprint Goal을 정하고, AI 질문에 팀 답이 갈리면 결정한다. 리뷰에서 수락·거절 | 코딩 |
| Scrum Master | 1명 | 시간과 보드를 관리하고 데일리를 진행한다. Review 칸이 3개 차면 "리뷰부터!" | 남 대신 결정 |
| 개발자 A | 1명 | Claude Code를 연다. 테스트를 먼저 쓰고, B의 코드를 리뷰한다 | 자기 테스트를 통과시키는 구현 |
| 개발자 B | 1~2명 | A의 테스트를 통과하도록 구현시키고, 그 코드를 설명한다 | 테스트 수정 |

보드는 다섯 칸입니다: **To Do → Spec Ready → Building → Review(최대 3개) → Done**. 모든 카드에 사람 이름을 붙입니다. AI가 만든 코드도 담당자는 사람입니다.

## 브랜치 안내

| 브랜치 | 내용 | 언제 보나 |
| --- | --- | --- |
| `main` | 뼈대 코드 + 템플릿. **여기서 시작합니다** | 처음부터 |
| `before` | "스터디룸 예약 서비스 만들어줘" 한 줄로 만든 바이브 코딩 버전 | 디브리핑 때 비교용 |
| `after` | 스펙·ADR·규칙 파일·테스트를 적용한 버전 + `docs/review/before-vs-after.md` | 디브리핑 때 비교용, 늦어진 팀 따라잡기(가이드 6-1) |

> `before`·`after`는 **우리 팀 스프린트를 끝낸 다음에** 여세요. 먼저 보면 실습의 의미가 사라집니다.

## 저장소 구조

```text
guide.html                실습 가이드 (더블클릭해서 브라우저로 연다)
AGENTS.md                 팀 AI 규칙 파일 (Planning에서 채우고, 회고에서 한 줄씩 더함)
docs/backlog.md           제품 백로그 S1~S4
docs/templates/           AI 질문 프롬프트(01), 인수조건(02), 규칙 파일(03), DoD(04), 회고 KPT(05), ADR(06)
docs/practice-guide-claude-code.md   혼자 복습용 가이드 (강의 당일에는 쓰지 않음)
src/app.ts                여기에 기능을 추가합니다
src/http/router.ts        작은 라우터 (수정할 필요 없음)
src/domain/rooms.ts       룸 A·B·C
test/                     테스트 (node:test)
.github/                  CI와 PR 템플릿 (DoD 체크리스트 포함)
```

## 우리 팀 DoD (실습용)

1. 인수조건의 모든 시나리오가 자동 테스트로 통과한다
2. 코드를 만든 사람이 그 코드를 설명할 수 있다
3. 리뷰어 1명이 승인했다
4. 비밀키·비밀번호 하드코딩이 없다 (`npm run check`)

네 가지가 모두 참이어야 **완료됨**입니다. 데모가 돌아가는 것은 아직 **동작함**입니다.

## 막혔을 때

| 증상 | 해결 |
| --- | --- |
| `npm test`에서 `.ts` 오류 | `node -v`가 22.18 이상인지 확인 |
| `npm test`가 끝나지 않는다 | `Ctrl+C` 후 다시. 서버를 띄운 터미널이 남아 있지 않은지 확인 |
| `EADDRINUSE` (포트 3000 사용 중) | 서버가 이미 떠 있다. macOS·Linux는 `lsof -i :3000`으로 PID를 보고 `kill <PID>`, 또는 `PORT=3001 npm start` |
| Windows에서 포트 3000 사용 중 | `netstat -ano`에서 `:3000` 줄 맨 끝의 PID를 보고 `taskkill //PID <PID> //F` (Git Bash) |
| Windows에서 명령이 이상하게 동작 | PowerShell이 아니라 **Git Bash**에서 실행했는지 확인 |
| push가 거절됨 (`fetch first`) | GitHub 저장소를 만들 때 README를 추가한 것. 빈 저장소로 다시 만든다 |
| AI가 같은 오류에서 헛돈다 | `Esc`로 멈추고, 10분이 넘으면 인수조건이 모호하지 않은지 PO와 먼저 확인 |
| AI가 테스트를 고쳤다 | `git checkout HEAD -- test/`로 되돌리고 "테스트 수정 금지"를 다시 말한다 |
| 30분이 지나도 거의 실패 | 가이드 6-1: `after` 브랜치에서 가져와 따라잡기 |
