# before 브랜치 — 바이브 코딩 버전

AI에게 **"스터디룸 예약 서비스 만들어줘"** 한 줄만 주었을 때 흔히 나오는 결과를 재구성한 교육용 예시입니다.
백로그의 핵심 규칙도, 팀 규칙 파일도, 인수조건도 주지 않았습니다.

데모는 잘 돌아갑니다. 예약하고, 조회하고, 취소하고, 관리자 화면도 있습니다.
**그런데 완료(Done)일까요?**

## 직접 확인해 보세요

```bash
npm start
```

```bash
# 1) 14:00–16:00 예약
curl -s -X POST localhost:3000/reservations -H 'content-type: application/json' \
  -d '{"room":"A","userId":"minsu","startTime":"2026-10-20T14:00","endTime":"2026-10-20T16:00"}'

# 2) 겹치는 15:00–17:00 예약 — 거절돼야 하는데?
curl -s -X POST localhost:3000/reservations -H 'content-type: application/json' \
  -d '{"room":"A","userId":"jiyoung","startTime":"2026-10-20T15:00","endTime":"2026-10-20T17:00"}'

# 3) 없는 예약 번호(999) 취소 — 무슨 일이 일어날까?
curl -s -X DELETE localhost:3000/reservations/999
curl -s 'localhost:3000/my-reservations?user_id=jiyoung'
```

그리고 `npm run check`를 실행해 보세요.

## 생각해 볼 질문

- 겹치는 예약을 막지 못한 이유는 AI가 멍청해서일까, 우리가 규칙을 말하지 않아서일까?
- 다른 사람의 예약을 취소할 수 있나? 시작 10분 전에도 취소되나?
- 관리자 비밀번호는 어디에 있나?
- 이 코드를 팀원에게 "왜 이렇게 짰는지" 설명할 수 있나?

답은 `after` 브랜치의 `docs/review/before-vs-after.md`에 있습니다.
