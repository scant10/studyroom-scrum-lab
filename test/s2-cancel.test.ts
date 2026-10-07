// docs/specs/S2-cancel.md 의 인수조건을 그대로 옮긴 테스트
import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.ts";
import { start, fakeClock, as } from "./helpers.ts";

const slot = (roomId: string, start: string, end: string) => ({ roomId, date: "2026-10-20", start, end });

describe("S2 내 예약 조회·취소", () => {
  let app: Awaited<ReturnType<typeof start>>;
  let clock: ReturnType<typeof fakeClock>;
  beforeEach(async () => {
    clock = fakeClock("2026-10-20T09:00:00+09:00");
    app = await start(createApp({ now: clock.now }));
  });
  afterEach(() => app.close());

  async function reserve(member: string, body = slot("A", "14:00", "16:00")) {
    const res = await app.call("POST", "/api/reservations", { body, headers: as(member) });
    assert.equal(res.status, 201);
    return res.body.id as string;
  }

  test("내 예약 조회: 내 것만 시작 시각 순으로", async () => {
    await reserve("minsu", slot("A", "16:00", "18:00"));
    await reserve("jiyoung", slot("B", "10:00", "11:00"));
    await reserve("minsu", slot("C", "12:00", "13:00"));
    const res = await app.call("GET", "/api/reservations/me", { headers: as("minsu") });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.map((r: { start: string }) => r.start), ["12:00", "16:00"]);
    assert.ok(res.body.every((r: { memberId: string }) => r.memberId === "minsu"));
  });

  test("정상 취소: 12:00에 14:00 예약 취소 → 204, 같은 시간을 다시 예약할 수 있다", async () => {
    const id = await reserve("minsu");
    clock.set("2026-10-20T12:00:00+09:00");
    const res = await app.call("DELETE", `/api/reservations/${id}`, { headers: as("minsu") });
    assert.equal(res.status, 204);
    const again = await app.call("POST", "/api/reservations", { body: slot("A", "14:00", "16:00"), headers: as("jiyoung") });
    assert.equal(again.status, 201);
    const mine = await app.call("GET", "/api/reservations/me", { headers: as("minsu") });
    assert.deepEqual(mine.body, []);
  });

  test("정확히 1시간 전(13:00) 취소 → 204", async () => {
    const id = await reserve("minsu");
    clock.set("2026-10-20T13:00:00+09:00");
    const res = await app.call("DELETE", `/api/reservations/${id}`, { headers: as("minsu") });
    assert.equal(res.status, 204);
  });

  test("마감 지남(13:30) → 422 CANCEL_DEADLINE_PASSED", async () => {
    const id = await reserve("minsu");
    clock.set("2026-10-20T13:30:00+09:00");
    const res = await app.call("DELETE", `/api/reservations/${id}`, { headers: as("minsu") });
    assert.equal(res.status, 422);
    assert.equal(res.body.code, "CANCEL_DEADLINE_PASSED");
  });

  test("남의 예약 → 403 FORBIDDEN, 예약은 그대로", async () => {
    const id = await reserve("minsu");
    const res = await app.call("DELETE", `/api/reservations/${id}`, { headers: as("jiyoung") });
    assert.equal(res.status, 403);
    assert.equal(res.body.code, "FORBIDDEN");
    const mine = await app.call("GET", "/api/reservations/me", { headers: as("minsu") });
    assert.equal(mine.body.length, 1);
  });

  test("없는 예약 → 404 RESERVATION_NOT_FOUND, 다른 예약은 그대로", async () => {
    await reserve("jiyoung");
    const res = await app.call("DELETE", "/api/reservations/R-9999", { headers: as("minsu") });
    assert.equal(res.status, 404);
    assert.equal(res.body.code, "RESERVATION_NOT_FOUND");
    const theirs = await app.call("GET", "/api/reservations/me", { headers: as("jiyoung") });
    assert.equal(theirs.body.length, 1);
  });

  test("이미 취소됨 → 409 ALREADY_CANCELLED", async () => {
    const id = await reserve("minsu");
    await app.call("DELETE", `/api/reservations/${id}`, { headers: as("minsu") });
    const res = await app.call("DELETE", `/api/reservations/${id}`, { headers: as("minsu") });
    assert.equal(res.status, 409);
    assert.equal(res.body.code, "ALREADY_CANCELLED");
  });
});
