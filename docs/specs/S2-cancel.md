# S2 내 예약 조회·취소 — 스펙 (Ready)

## 스토리

회원으로서, 내 예약을 보고 취소해서 일정이 바뀌어도 다른 팀이 룸을 쓸 수 있게 하고 싶다.

## AI 질문과 팀의 답

| AI의 질문 | 팀의 답 |
| --- | --- |
| "1시간 전까지"는 정확히 1시간 전도 포함인가요? | 포함. 시작 60분 전 시각까지 취소 가능 |
| 남의 예약을 취소하려 하면? | 403 FORBIDDEN |
| 없는 예약 번호면? | 404 RESERVATION_NOT_FOUND (다른 예약에 영향 없음) |
| 이미 취소한 예약을 또 취소하면? | 409 ALREADY_CANCELLED |
| 취소한 예약은 목록에 보이나요? | 내 예약 목록에는 확정(CONFIRMED)만, 시작 시각 순 |
| 취소하면 그 시간은 다시 예약 가능한가요? | 가능 |

## 인수조건

```gherkin
시나리오: 내 예약 조회
  Given minsu의 예약 2개와 jiyoung의 예약 1개가 있을 때
  When  minsu가 내 예약을 조회하면
  Then  minsu의 예약 2개만 시작 시각 순으로 받는다

시나리오: 정상 취소
  Given 14:00 시작 예약이 있고 지금이 12:00일 때
  When  예약자가 취소하면
  Then  204, 그리고 같은 시간을 다시 예약할 수 있다

시나리오: 정확히 1시간 전
  Given 14:00 시작 예약이 있고 지금이 13:00일 때
  When  예약자가 취소하면
  Then  204

시나리오: 마감 지남
  Given 14:00 시작 예약이 있고 지금이 13:30일 때
  When  예약자가 취소하면
  Then  422 CANCEL_DEADLINE_PASSED

시나리오: 남의 예약
  When  jiyoung이 minsu의 예약을 취소하면
  Then  403 FORBIDDEN, 예약은 그대로다

시나리오: 없는 예약
  When  존재하지 않는 예약 번호를 취소하면
  Then  404 RESERVATION_NOT_FOUND, 다른 예약은 그대로다

시나리오: 이미 취소됨
  When  취소한 예약을 다시 취소하면
  Then  409 ALREADY_CANCELLED
```

## 제약 · 금지

- 계약: `GET /api/reservations/me`, `DELETE /api/reservations/{id}`
- 금지: 배열 인덱스를 확인하지 않고 삭제하기, 취소 시 데이터를 지우기(상태만 CANCELLED로 바꾼다)
