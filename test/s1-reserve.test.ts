// docs/specs/S1-reserve.md 의 인수조건을 그대로 옮긴 테스트
import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.ts";
import { start, fakeClock, as } from "./helpers.ts";

const slot = (roomId: string, start: string, end: string, date = "2026-10-20") => ({ roomId, date, start, end });

describe("S1 스터디룸 예약", () => {
  let app: Awaited<ReturnType<typeof start>>;
  beforeEach(async () => {
    app = await start(createApp({ now: fakeClock().now }));
  });
  afterEach(() => app.close());

  test("정상 예약: 201과 CONFIRMED 예약을 받는다", async () => {
    const res = await app.call("POST", "/api/reservations", { body: slot("A", "14:00", "16:00"), headers: as("minsu") });
    assert.equal(res.status, 201);
    assert.equal(res.body.status, "CONFIRMED");
    assert.equal(res.body.memberId, "minsu");
    assert.deepEqual(
      { roomId: res.body.roomId, date: res.body.date, start: res.body.start, end: res.body.end },
      slot("A", "14:00", "16:00"),
    );
    assert.match(res.body.id, /^R-\d{4}$/);
  });

  test("겹치는 예약: 14:00–16:00이 있을 때 15:00–17:00은 409", async () => {
    await app.call("POST", "/api/reservations", { body: slot("A", "14:00", "16:00"), headers: as("minsu") });
    const res = await app.call("POST", "/api/reservations", { body: slot("A", "15:00", "17:00"), headers: as("jiyoung") });
    assert.equal(res.status, 409);
    assert.equal(res.body.code, "RESERVATION_CONFLICT");
  });

  test("겹치는 예약: 기존 예약을 완전히 감싸는 13:00–17:00도 409", async () => {
    await app.call("POST", "/api/reservations", { body: slot("A", "14:00", "16:00"), headers: as("minsu") });
    const res = await app.call("POST", "/api/reservations", { body: slot("A", "13:00", "17:00"), headers: as("jiyoung") });
    assert.equal(res.status, 409);
  });

  test("맞닿는 예약: 16:00–18:00은 겹침이 아니므로 201", async () => {
    await app.call("POST", "/api/reservations", { body: slot("A", "14:00", "16:00"), headers: as("minsu") });
    const res = await app.call("POST", "/api/reservations", { body: slot("A", "16:00", "18:00"), headers: as("jiyoung") });
    assert.equal(res.status, 201);
  });

  test("다른 룸은 같은 시간도 가능", async () => {
    await app.call("POST", "/api/reservations", { body: slot("A", "14:00", "16:00"), headers: as("minsu") });
    const res = await app.call("POST", "/api/reservations", { body: slot("B", "14:00", "16:00"), headers: as("jiyoung") });
    assert.equal(res.status, 201);
  });

  const invalid: Array<[string, ReturnType<typeof slot>]> = [
    ["종료가 시작보다 빠름", slot("A", "16:00", "14:00")],
    ["시작과 종료가 같음", slot("A", "14:00", "14:00")],
    ["30분 단위가 아님", slot("A", "14:10", "15:00")],
    ["운영 시작 전", slot("A", "08:30", "10:00")],
    ["운영 종료 후", slot("A", "21:00", "22:30")],
    ["4시간 초과", slot("A", "10:00", "14:30")],
    ["이미 지난 시각", slot("A", "08:00", "09:00")],
    ["날짜 형식 오류", slot("A", "14:00", "16:00", "2026/10/20")],
    ["시각 형식 오류", slot("A", "2pm", "4pm")],
  ];
  for (const [name, body] of invalid) {
    test(`잘못된 시간 → 400: ${name}`, async () => {
      const res = await app.call("POST", "/api/reservations", { body, headers: as("minsu") });
      assert.equal(res.status, 400);
      assert.equal(res.body.code, "VALIDATION_ERROR");
    });
  }

  test("없는 룸 → 404 ROOM_NOT_FOUND", async () => {
    const res = await app.call("POST", "/api/reservations", { body: slot("Z", "14:00", "16:00"), headers: as("minsu") });
    assert.equal(res.status, 404);
    assert.equal(res.body.code, "ROOM_NOT_FOUND");
  });

  test("로그인하지 않음 → 401 UNAUTHORIZED", async () => {
    const res = await app.call("POST", "/api/reservations", { body: slot("A", "14:00", "16:00") });
    assert.equal(res.status, 401);
    assert.equal(res.body.code, "UNAUTHORIZED");
  });
});
