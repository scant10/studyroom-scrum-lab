# 실습 가이드 — Claude Code CLI로 따라 하기

> 강의 섹션 8 「실습: 스터디룸 예약 서비스」를 Claude Code CLI로 한 줄씩 따라 하는 가이드입니다.
> 강의는 도구 중립이라 다른 AI 도구를 써도 됩니다. 이 문서는 Claude Code를 쓰는 분을 위한 버전입니다.

같은 서비스를 **두 번** 만듭니다.

| 실습 | 브랜치 | 방법 |
| --- | --- | --- |
| 실습 A | `practice-a` | Claude에게 한 줄만 주고 만든다 (바이브 코딩) |
| 실습 B | `practice-b` | 질문 → 스펙 → 규칙 파일 → 테스트 먼저 → 구현 |
| 비교 | — | 두 결과를 같은 명령으로 측정하고 DoD로 채점한다 |

## 읽는 법

이 문서에는 두 종류의 입력이 나옵니다. 헷갈리지 않게 표시를 구분했습니다.

- **터미널 명령**: 코드 블록에 `bash`라고 표시된 것. 터미널에 그대로 붙여 넣습니다.
- **Claude에게 입력**: `▶ Claude에게` 아래의 `text` 블록. Claude Code 화면(`>` 프롬프트)에 붙여 넣습니다.

터미널 창을 **두 개** 열어 두면 편합니다. 터미널 1은 Claude Code용, 터미널 2는 서버 실행과 확인용입니다.

---

## 0. 준비 (5분)

### 0-1. 도구 확인

```bash
node -v          # v22.18.0 이상이어야 합니다
git --version
claude --version # 숫자 뒤에 (Claude Code)가 나오면 설치된 것
```

Claude Code가 없다면 설치합니다 (macOS·Linux·WSL).

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell은 `irm https://claude.ai/install.ps1 | iex`, Homebrew는 `brew install --cask claude-code`입니다.
설치 후 **새 터미널 창**을 열고 `claude --version`을 다시 확인하세요. Claude Code를 쓰려면 Claude 유료 구독(Pro 이상) 또는 Claude Console 계정이 필요합니다.

### 0-2. 저장소 받기

```bash
unzip studyroom-scrum-lab.zip
cd studyroom-scrum-lab
git branch          # main, before, after 세 개가 보여야 합니다
npm test            # tests 2, pass 2 이면 준비 완료
```

### 0-3. 처음 한 번 로그인

```bash
claude
```

브라우저가 열리면 로그인합니다. 끝나면 `/exit`를 입력해 나옵니다.

### 0-4. 알아 둘 조작 세 가지

| 조작 | 하는 일 |
| --- | --- |
| `Esc` | Claude가 하던 일을 멈춘다. 엉뚱한 방향으로 가면 바로 누르세요 |
| `Shift+Tab` | 권한 모드를 바꾼다. 화면 아래 상태 표시줄에 지금 모드가 나옵니다 |
| `/exit` | Claude Code를 끝낸다 |

권한 모드는 이렇게 씁니다.

- **auto mode** (최근 버전의 기본값): Claude가 대부분의 파일 수정과 명령을 묻지 않고 실행합니다. 실습 A에서 씁니다.
- **plan mode**: 읽기만 하고 수정하지 않습니다. 실습 B의 '질문 먼저' 단계에서 씁니다.
- **manual mode** / **accept edits**: 수정 전에 확인하거나, 파일 수정만 자동으로 허용합니다.

---

## 실습 A — 한 줄 프롬프트로 만들기 (12분)

평소 바이브 코딩하던 그대로 해 봅니다. 백로그도, 규칙도 주지 않습니다.

> 이 문서는 실습 A 브랜치에서 지워집니다. 실습 A 동안에는 브라우저의 실습 가이드나 GitHub에서 이 문서를 보세요.

### A-1. 문서를 지운 브랜치 만들기 (터미널 1)

AI 코딩 도구는 작업 전에 저장소를 둘러봅니다. `docs/backlog.md`에는 "중복 예약 불가"가, 이 문서에는 확인 시나리오가 적혀 있어서, 그대로 두면 한 줄 프롬프트라도 사실상 스펙을 받고 만든 셈이 됩니다. 그래서 실습 A는 문서를 지우고 시작합니다.

```bash
git switch main
git switch -c practice-a
git rm -r -q docs AGENTS.md README.md .github
git commit -q -m "practice-a: 문서 없이 시작"
git tag a-start      # 8-5에서 '실습 A가 바꾼 것'만 재는 기준점
ls                   # package.json scripts src test tsconfig.json 만 남으면 OK
claude
```

### A-2. 한 줄만 주기

▶ Claude에게

```text
스터디룸 예약 서비스 만들어줘
```

Claude가 끝날 때까지 기다립니다. 무엇을 물어보면 "알아서 해줘"라고만 답하세요. 실습 A의 핵심은 **아무것도 정해 주지 않는 것**입니다.

> Claude가 `git log`나 다른 브랜치(`after`, `before`)를 열어 보려 하면 `Esc`로 멈추고 "지금 브랜치의 파일만 보고 만들어 줘"라고 말합니다.

### A-3. 만든 API 확인하기

▶ Claude에게

```text
방금 만든 서버를 실행하는 명령과, 예약 생성·내 예약 조회·예약 취소를 curl로 호출하는 예시를 알려줘. 코드는 고치지 마.
```

### A-4. 여섯 가지를 직접 시도하고 기록하기 (터미널 2)

서버를 띄웁니다. Claude가 알려준 명령이 다르면 그 명령을 쓰세요.

```bash
npm start
```

터미널을 하나 더 열고, A-3에서 받은 curl 예시를 고쳐 아래를 시도합니다. 요즘 AI는 ①처럼 뻔한 규칙은 잘 지킵니다. 잘 만들어졌다면 좋은 일입니다. 확인할 것은 "틀렸나"가 아니라 **"AI가 무엇을 혼자 정했나"**입니다.

| # | 시도 | 기록할 것 |
| --- | --- | --- |
| ① | A룸 14:00–16:00 예약 뒤 같은 룸 15:00–17:00 | 거절? 상태 코드와 응답 |
| ② | 14:00–16:00 뒤 16:00–18:00 (맞닿는 예약) | 허용? 거절? |
| ③ | 이미 지난 시각 예약 | 허용? 거절? |
| ④ | 다른 회원의 예약 취소 | 막히나? |
| ⑤ | 없는 예약 번호 취소 | 404? 성공? 다른 예약에 영향? |
| ⑥ | `npm test` | 테스트가 있나? 몇 개? ①~⑤를 확인하나? |

②~⑤는 아무도 정해 주지 않은 질문입니다. 지금의 답이 우연인지, 다시 만들어도 같은지 알 수 없습니다. 이 기록은 8-5에서 실습 B의 답과 나란히 놓고 봅니다.

### A-5. 저장하고 끝내기

Claude Code에서 `/exit`로 나오고 서버를 끈 뒤 (터미널 1):

```bash
git add -A
git commit -m "practice-a: 한 줄 프롬프트로 만든 버전"
```

> 결과가 어떻게 나왔든 고치지 마세요. 수업 8-5에서 채점합니다.

---

## 실습 B-1 — 질문 받고, 답하고, 스펙과 규칙 파일 쓰기 (15분)

### B-1-1. 깨끗한 브랜치에서 시작하기 (터미널 1)

실습 A의 코드 위에서 하면 비교가 안 됩니다. 반드시 `main`에서 새로 만듭니다.

```bash
git switch main
git switch -c practice-b
```

### B-1-2. Claude가 팀 규칙 파일을 읽게 하기

이 저장소의 팀 규칙은 `AGENTS.md`에 있습니다. 최신 Claude Code는 `AGENTS.md`를 바로 읽지만, 버전과 상관없이 확실하게 읽히도록 `CLAUDE.md`에서 불러옵니다.

```bash
echo "@AGENTS.md" > CLAUDE.md
cat CLAUDE.md       # @AGENTS.md 한 줄이 보이면 됩니다
```

### B-1-3. plan mode로 시작하기

새 세션으로 시작합니다. 실습 A의 대화가 섞이지 않게 하기 위해서입니다.

```bash
claude --permission-mode plan
```

화면 아래에 `⏸ plan mode on`이 보이면 됩니다. 이 모드에서 Claude는 파일을 고치지 않습니다.

### B-1-4. AI에게 질문 먼저 시키기

`docs/templates/01-ai-question-prompt.md`의 프롬프트에 S1 스토리를 넣은 것입니다.

▶ Claude에게

```text
아래 요구사항을 구현하기 전에,
모호하거나 빠진 부분을 질문 목록으로 먼저 정리해 줘.
정상 경로, 예외 경로, 보안·성능 같은 비기능 요구로 나눠서 질문해 줘.
내가 답하기 전에는 코드를 쓰지 마.

[요구사항]
회원으로서 날짜·시간을 골라 스터디룸을 예약하고 싶다.
같은 룸·같은 시간에는 중복 예약이 안 된다.

[이미 정해진 것]
- AGENTS.md 의 규칙
- docs/backlog.md 의 S1
```

### B-1-5. 질문에 답하기

질문을 하나씩 읽고 **여러분이** 답을 정합니다. 답은 한 번에 모아서 입력하면 됩니다.

▶ Claude에게 (예시 — 내 답으로 바꿔 쓰세요)

```text
답:
1. 시간은 30분 단위, 한국 시간(KST) 기준
2. 겹침은 [시작, 종료) 구간. 16:00에 끝나고 16:00에 시작하는 건 허용
3. 운영 시간 09:00–22:00, 한 번에 최대 4시간
4. 지난 시각은 예약 불가
5. 회원 식별은 X-Member-Id 헤더, 없으면 401
6. 실패 응답은 { code, message }. 겹침 409 RESERVATION_CONFLICT, 잘못된 시간 400 VALIDATION_ERROR, 없는 룸 404 ROOM_NOT_FOUND
```

> 정하기 어려운 질문이 남았다면, 그 스토리는 아직 **Ready가 아닙니다**. 강의의 핵심이 이 순간입니다.

### B-1-6. 스펙 파일로 정리시키기

이제 파일을 써야 하므로 `Shift+Tab`을 눌러 `⏵⏵ accept edits on`으로 바꿉니다.

▶ Claude에게

```text
지금까지의 질문과 내 답을 docs/templates/02-story-acceptance.md 양식에 맞춰
docs/specs/S1-reserve.md 로 정리해 줘.
인수조건은 Given/When/Then으로, 정상 경로 1개와 예외 경로를 모두 시나리오로 써 줘.
코드는 아직 쓰지 마.
```

### B-1-7. 규칙 파일 채우기

▶ Claude에게

```text
docs/specs/S1-reserve.md 와 docs/templates/03-AGENTS.template.md 를 참고해서
AGENTS.md 의 '반드시'와 '금지'를 각각 3줄 이내로 채워 줘.
'테스트를 고치거나 지워서 통과시키기 금지'는 꼭 넣어 줘.
```

### B-1-8. 내 눈으로 확인하기 (터미널 2)

AI가 쓴 문서를 그대로 믿지 않습니다. 직접 읽고 필요하면 고칩니다.

```bash
cat docs/specs/S1-reserve.md
git diff AGENTS.md
```

확인할 것:

- [ ] 15:00–17:00 겹침 시나리오가 **409**로 적혀 있는가
- [ ] 16:00–18:00 맞닿는 예약이 **허용**으로 적혀 있는가
- [ ] 내가 정하지 않은 규칙이 몰래 들어가 있지 않은가

```bash
git add -A
git commit -m "practice-b: S1 스펙과 팀 규칙"
```

---

## 실습 B-2 — 테스트 먼저, 그다음 구현 (18분)

### B-2-1. 테스트만 먼저 쓰게 하기

Claude Code 세션은 그대로 둡니다 (accept edits 모드).

▶ Claude에게

```text
docs/specs/S1-reserve.md 의 인수조건 시나리오마다 test/s1-reserve.test.ts 에 테스트를 하나씩 써 줘.
- 구현은 하지 마. 테스트 파일만 만든다.
- test/helpers.ts 의 start() 로 서버를 띄운다.
- 현재 시각은 createApp({ now }) 로 2026-10-20 09:00 (KST) 에 고정한다.
- 헤더 X-Member-Id 로 회원을 보낸다.
```

### B-2-2. 빨간불 확인하기 (터미널 2)

```bash
npm test
```

아직 구현이 없으므로 **실패가 정상**입니다 (Red). 몇 개가 실패했는지 적어 두세요.
(참고: `after` 브랜치는 29개 중 26개가 실패한 상태에서 출발했습니다.)

테스트를 먼저 커밋해 둡니다. 나중에 Claude가 테스트를 고쳤는지 확인하는 기준점이 됩니다.

```bash
git add test
git commit -m "test: S1 인수조건 테스트 (Red)"
```

### B-2-3. 테스트를 통과하도록 구현시키기

▶ Claude에게

```text
test/s1-reserve.test.ts 가 모두 통과하도록 구현해 줘.
테스트 파일은 절대 수정하지 마. AGENTS.md 의 규칙을 따라.
끝나면 npm run check 를 실행해서 결과를 보여 줘.
```

### B-2-4. 테스트를 건드리지 않았는지 확인하기 (터미널 2)

```bash
git diff HEAD -- test/
```

**아무것도 출력되지 않아야** 합니다. 무언가 나온다면 Claude가 테스트를 고친 것입니다. 되돌리고 다시 시키세요.

```bash
git checkout HEAD -- test/
```

### B-2-5. 초록불 확인하기

```bash
npm run check
```

테스트가 모두 통과하고 `시크릿 검사 통과`가 나오면 됩니다.

### B-2-6. 설명할 수 있는지 확인하기 (DoD 2번)

생성된 코드에서 겹침을 판단하는 부분을 찾아 직접 읽어 봅니다. 모르는 줄이 있으면 묻습니다.

▶ Claude에게

```text
예약이 겹치는지 판단하는 코드가 어디에 있고, 16:00–18:00 예약이 왜 허용되는지 한 줄씩 설명해 줘.
```

설명을 듣고도 이해가 안 된다면, 그 코드는 아직 **완료가 아닙니다**.

```bash
git add -A
git commit -m "practice-b: S1 구현 (Green)"
```

Claude Code는 `/exit`로 나옵니다.

---

## 8-5 — 비교하고 채점하기 (12분)

이제 실습 A, 실습 B, 그리고 참고용 `before`·`after`를 **같은 명령**으로 측정합니다. 아래 명령은 모두 터미널에서 실행합니다.

### 비교 1. 테스트가 있는가, 몇 개가 통과하는가

```bash
for b in practice-a practice-b before after; do
  git switch -q $b
  echo "== $b"; npm test 2>&1 | grep -E "^# (tests|pass|fail)"
done
git switch -q practice-b
```

> 참고 결과 — `before`: tests 2 (서버가 뜨는지만 확인), `after`: tests 29 / pass 29

볼 것: 실습 A에는 테스트가 있나요? 있다면 인수조건(겹침, 맞닿음, 마감)을 확인하는 테스트인가요, 아니면 "서버가 뜬다" 수준인가요?

### 비교 2. 비밀번호·키가 코드에 박혀 있는가

```bash
for b in practice-a practice-b before after; do
  git switch -q $b; echo "== $b"; npm run -s check:secrets 2>&1 | head -3
done
git switch -q practice-b
```

> 참고 결과 — `before`: `ADMIN_PASSWORD = "admin1234"` 검출, `after`: 통과

### 비교 3. 현재 시각을 어떻게 다루는가

```bash
for b in practice-a practice-b before after; do
  git switch -q $b; echo "== $b"; grep -rn "new Date()" src | grep -v "^src/server" || echo "(없음)"
done
git switch -q practice-b
```

볼 것: 도메인 코드 곳곳에서 `new Date()`를 직접 부르면, "시작 30분 전 취소" 같은 시간 규칙을 테스트할 수 없습니다.
`after`는 `src/app.ts`에서 **주입받은 시계가 없을 때의 기본값**으로만 한 번 씁니다 (ADR-001).

### 비교 4. 이름이 일관된가

```bash
for b in practice-a practice-b before after; do
  git switch -q $b; echo "== $b"; grep -rhoE "user_?[iI]d|memberId|member_id" src | sort | uniq -c
done
git switch -q practice-b
```

> 참고 결과 — `before`: `userId` 5번, `user_id` 3번 섞임 / `after`: `memberId` 17번으로 통일

볼 것: 한 사람이 한 번 만든 코드인데도 이름이 섞여 있다면, 네 명이 각자 AI로 만들면 어떻게 될까요? (섹션 1의 Day 3)

### 비교 5. 얼마나 바뀌었나 (리뷰할 수 있는 크기인가)

```bash
git diff --stat a-start..practice-a | tail -1   # 실습 A가 만든 것만 (지운 문서는 빼고)
git diff --stat main..practice-b | tail -1
```

볼 것: 줄 수만 보지 마세요. 실습 B의 변경에는 **스펙·규칙·테스트**가 들어 있고, 실습 A에는 대부분 코드만 있을 겁니다. 리뷰어가 무엇을 기준으로 리뷰할 수 있는지가 다릅니다.

### 비교 6. 내 스펙과 정답 스펙의 차이

```bash
git diff practice-b after -- docs/specs/S1-reserve.md | head -60
```

볼 것: `after`의 스펙에 있는데 내 스펙에 없는 시나리오는 무엇인가요? 그 빈칸을 Claude는 어떻게 채웠나요?

### 비교 7. 시나리오 직접 시도 (before 기준 예시)

`before` 브랜치로 강의에서 본 버그를 직접 재현해 봅니다.

```bash
git switch -q before
PORT=3901 node src/server.ts &
sleep 1
curl -s -X POST localhost:3901/reservations -H 'content-type: application/json' \
  -d '{"room":"A","userId":"minsu","startTime":"2026-10-20T14:00","endTime":"2026-10-20T16:00"}'; echo
curl -s -X POST localhost:3901/reservations -H 'content-type: application/json' \
  -d '{"room":"A","userId":"jiyoung","startTime":"2026-10-20T15:00","endTime":"2026-10-20T17:00"}'; echo
curl -s -X DELETE localhost:3901/reservations/999; echo
curl -s 'localhost:3901/my-reservations?user_id=jiyoung'; echo
kill $!
git switch -q practice-b
```

> 예상 결과 — 겹치는 예약이 들어가고, 없는 예약 999를 취소했는데 **jiyoung의 예약이 사라집니다** (`[]`).
> 실습 A가 이런 실수를 안 했다면, 그건 이번에 운이 좋았던 것인지 테스트가 막아 준 것인지 비교 8로 확인하세요.

### 비교 8. 누가 정했나

실습 A-4의 기록과 실습 B의 `docs/specs/S1-reserve.md`를 나란히 놓습니다.

| 질문 | 실습 A (AI가 정함) | 실습 B (내가 정함) | 테스트로 고정됐나 |
| --- | --- | --- | --- |
| 16:00 맞닿는 예약 | | | A: / B: |
| 지난 시각 예약 | | | A: / B: |
| 다른 회원 예약 취소 | | | A: / B: |
| 없는 예약 번호 취소 | | | A: / B: |
| 실패 응답 형식·상태 코드 | | | A: / B: |

볼 것: 실습 A의 답이 실습 B와 같아도 괜찮습니다. 차이는 **누가 정했고, 그 답이 테스트로 남았는가**입니다. 테스트로 남지 않은 답은 다음에 AI가 코드를 고칠 때 말없이 바뀔 수 있습니다.

### DoD 채점표

아래 표를 채웁니다. `docs/templates/04-dod.md`의 실습용 DoD 네 줄입니다.

| DoD 항목 | 실습 A | 실습 B |
| --- | --- | --- |
| 인수조건의 모든 시나리오가 자동 테스트로 통과 (비교 1) | | |
| 작성자가 코드를 설명할 수 있다 (B-2-6) | | |
| 리뷰어가 기준을 가지고 리뷰할 수 있다 (비교 5·6) | | |
| 비밀번호·키 하드코딩 없음 (비교 2) | | |
| **결과: 생성됨 / 동작함 / 완료됨** | | |

> 여기까지 마쳤다면 `after` 브랜치의 `docs/review/before-vs-after.md`를 열어 강의의 비교표와 맞춰 보세요.

---

## 실습 C — 회고하고, 개선을 파일로 남기기 (8분)

### C-1. KPT 쓰기

`docs/templates/05-retro-kpt.md`를 열어 Keep · Problem · Try를 적습니다. Try는 두 개입니다.

### C-2. Try를 규칙 파일에 반영하기

```bash
git switch practice-b
claude
```

▶ Claude에게 (예시 — 내 Try로 바꿔 쓰세요)

```text
회고 결과 다음 두 가지를 AGENTS.md 에 규칙으로 추가해 줘. 각각 한 줄로.
1. 인수조건이 확정되지 않은 스토리는 구현하지 않는다
2. 예외 경로(없는 ID, 권한 없음) 테스트를 정상 경로 테스트와 함께 쓴다
```

`/exit`로 나와서 확인하고 커밋합니다.

```bash
git diff AGENTS.md
git add AGENTS.md
git commit -m "retro: Try 2개를 팀 규칙에 반영"
```

> 회고의 결과물은 포스트잇이 아니라 **커밋**입니다. 다음 세션부터 Claude도 이 규칙을 읽습니다.

---

## 막혔을 때

| 증상 | 해결 |
| --- | --- |
| `claude: command not found` | 새 터미널을 열고 다시 확인. 그래도 안 되면 설치 경로가 PATH에 없는 것입니다 |
| `npm test`에서 `.ts` 파일 오류 | Node.js 버전 확인 (`node -v`가 22.18 이상) |
| `npm test`가 끝나지 않는다 | 테스트가 서버를 띄워 놓고 닫지 않은 것입니다. `Ctrl+C`로 멈추고 `node --test --test-force-exit --test-timeout=10000 "test/**/*.test.ts"`로 돌립니다. AI가 `package.json`의 test 명령을 바꿨어도 이 명령은 그대로 씁니다 |
| `EADDRINUSE` (포트 사용 중) | 이미 서버가 떠 있습니다. `PORT=3001 npm start`처럼 다른 포트로 |
| Claude가 계속 같은 오류에서 헛돈다 | `Esc`로 멈추고, 10분 넘게 헛돌면 인수조건이 모호하지 않은지 먼저 확인 |
| Claude가 묻지도 않고 너무 많이 고친다 | `Shift+Tab`으로 manual mode나 plan mode로 바꾸기 |
| 실습 A의 대화가 실습 B에 섞인 것 같다 | `/exit` 후 `claude`를 새로 실행 (또는 `/clear`) |
| Claude가 테스트를 고쳤다 | `git checkout HEAD -- test/` 로 되돌리고, "테스트는 수정 금지"를 다시 강조 |
