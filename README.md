# 스터디룸 예약 서비스 — AI 팀 개발 실습 템플릿

> 인프런 강의 「바이브 코딩, 팀으로 하면 왜 망할까?」 섹션 8 실습 저장소

같은 서비스를 **두 번** 만듭니다. 한 번은 스펙 없이 AI에게 맡기고(실습 A), 한 번은 인수조건·규칙 파일·DoD를 갖추고 만듭니다(실습 B). 그리고 두 결과를 DoD로 채점해 차이를 눈으로 확인합니다.

목표는 기능 개수가 아닙니다. **S1 스토리 하나를 DoD까지** 끝내는 것입니다.

## 준비물

- Node.js **22.18 이상** (TypeScript 파일을 별도 설치 없이 바로 실행합니다)
- 평소 쓰는 AI 코딩 도구 아무거나 (Claude Code, Cursor, Copilot, Codex 등)
- `npm install`은 필요 없습니다. 외부 라이브러리 없이 Node.js 기본 기능만 씁니다.
  (타입 검사 `npm run typecheck`를 쓰고 싶을 때만 `npm install`)

```bash
npm test              # 테스트 실행
npm start             # http://localhost:3000
npm run check         # 테스트 + 시크릿 검사 (DoD 확인용)
```

## 브랜치 안내

| 브랜치 | 내용 | 언제 보나 |
| --- | --- | --- |
| `main` | 뼈대 코드 + 템플릿. **여기서 시작합니다** | 처음부터 |
| `before` | "스터디룸 예약 서비스 만들어줘" 한 줄로 만든 바이브 코딩 버전 | 실습 A를 마친 뒤 비교용 |
| `after` | 스펙·ADR·규칙 파일·테스트를 적용한 버전 + Before/After 리뷰 문서 | 실습 B를 마친 뒤 비교용 |

> 정답 브랜치는 **자기 실습을 끝낸 다음에** 여세요. 먼저 보면 실습의 의미가 사라집니다.

## 저장소 구조

```text
AGENTS.md                 팀 AI 규칙 파일 (실습 B에서 채움)
docs/backlog.md           제품 백로그 S1~S4
docs/templates/           AI 질문 프롬프트, 인수조건, 규칙 파일, DoD, 회고, ADR 템플릿
src/app.ts                여기에 기능을 추가합니다
src/http/router.ts        작은 라우터 (수정할 필요 없음)
src/domain/rooms.ts       룸 A·B·C
test/                     테스트 (node:test)
.github/                  CI와 PR 템플릿 (DoD 체크리스트 포함)
```

## 실습 진행 (강의 섹션 8)

> Claude Code CLI를 쓴다면 한 줄씩 따라 하는 가이드가 있습니다: [docs/practice-guide-claude-code.md](docs/practice-guide-claude-code.md)

| 수업 | 할 일 | 시간 |
| --- | --- | --- |
| 8-1 | 이 README와 `docs/backlog.md` 읽기 | 5분 |
| 8-2 실습 A | `practice-a` 브랜치를 만들고, AI에게 **"스터디룸 예약 서비스 만들어줘"** 한 줄만 주고 S1을 만든다 | 12분 |
| 8-3 실습 B | `practice-b` 브랜치를 `main`에서 새로 만든다. `docs/templates/01`로 AI에게 질문을 받고, 답을 정해 `docs/specs/S1-reserve.md`(템플릿 02)를 쓰고, `AGENTS.md`를 채운다 | 15분 |
| 8-4 실습 B | 인수조건을 **테스트로 먼저** 쓰고, AI에게 "이 테스트를 통과하도록 구현해. 테스트는 고치지 마"라고 시킨다 | 18분 |
| 8-5 | 실습 A와 B를 `docs/templates/04-dod.md`로 채점한다. 그다음 `before`·`after` 브랜치와 비교한다 | 12분 |
| 8-6 실습 C | `docs/templates/05-retro-kpt.md`로 회고하고, Try 2개를 실제로 `AGENTS.md`나 DoD에 반영해 커밋한다 | 8분 |
| 8-7 팀에 적용 | 강의의 '스프린트 다시 보기'(가상의 4인 팀, 1주 스프린트)를 보고, 아래 **팀으로 할 때**를 내 팀 프로젝트에 맞게 정한다 | 8분 |

```bash
git switch -c practice-a          # 실습 A
git switch main && git switch -c practice-b   # 실습 B
```

### 실습 A에서 꼭 확인할 것

AI가 만든 결과에서 아래 두 가지를 직접 시도해 보세요.

1. A룸에 14:00–16:00 예약이 있을 때 15:00–17:00 예약을 넣으면? (겹치므로 거절돼야 함)
2. 시작 30분 전인 예약을 취소하면? (1시간 전까지만 취소 가능해야 함)

### 팀으로 할 때 (수업 8-7)

4~5명이 한 팀이면 역할부터 나눕니다.

| 역할 | 인원 | 하는 일 |
| --- | --- | --- |
| Product Owner | 1명 | Sprint Goal과 인수조건을 최종 결정하고, 리뷰에서 수락·거절한다. 코딩하지 않는다 |
| Scrum Master | 1명 | 시간과 보드를 관리하고, Review 칸이 3개 차면 "리뷰부터!"를 외친다 |
| 개발자 | 2~3명 | 각자 AI로 구현하고 서로의 PR을 리뷰한다. 설명 못 하는 코드는 올리지 않는다 |

보드는 다섯 칸을 씁니다: **To Do → Spec Ready → Building → Review(최대 3개) → Done**.

- Spec Ready 칸에 있는 카드만 AI 작업을 시작한다
- 모든 카드에 사람 이름을 붙인다 (AI가 만든 코드도 담당자는 사람)
- 데일리는 보드 앞에서 **Review 칸부터** 본다. "생성됨 / 동작함 / 완료됨"을 구분해 말한다
- 리뷰에서는 DoD를 통과한 것만, 예외 경로까지 시연한다
- 회고의 Try는 `AGENTS.md`·DoD·CI에 커밋으로 남긴다

강의 실습처럼 90분 미니 스프린트로 해 본다면: 계획 15분 → 빌드 45분(30분·45분에 2분 데일리) → 리뷰 15분 → 회고 15분.

## 막혔을 때

- AI가 같은 오류에서 계속 헛돌면 10분 안에 멈추고, 인수조건이 모호하지 않은지 먼저 확인하세요.
- AI가 테스트를 고쳐서 통과시키려 하면 거절하세요. `AGENTS.md` 금지 항목에 넣으면 다음부터 덜 합니다.
