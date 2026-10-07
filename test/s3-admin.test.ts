// docs/specs/S3-admin.md 의 인수조건을 그대로 옮긴 테스트
import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.ts";
import { start, fakeClock, as } from "./helpers.ts";

const slot = (roomId: string, start: string, end: string) => ({ roomId, date: "2026-10-20", start, end });

describe("S3 관리자 하루 현황", () => {
  let app: Awaited<ReturnType<typeof start>>;
  beforeEach(async () => {
    app = await start(createApp({ now: fakeClock().now }));
    const post = (m: string, b: ReturnType<typeof slot>) => app.call("POST", "/api/reservations", { body: b, headers: as(m) });
    await post("minsu", slot("A", "16:00", "18:00"));
    await post("jiyoung", slot("A", "10:00", "12:00"));
    await post("junho", slot("B", "10:00", "12:00"));
    const cancelled = await post("junho", slot("A", "13:00", "14:00"));
    await app.call("DELETE", `/api/reservations/${cancelled.body.id}`, { headers: as("junho") });
  });
  afterEach(() => app.close());

  test("관리자 조회: A룸 확정 예약 2개를 시작 시각 순으로", async () => {
    const res = await app.call("GET", "/api/admin/rooms/A/reservations?date=2026-10-20", { headers: as("admin1", "admin") });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.map((r: { start: string }) => r.start), ["10:00", "16:00"]);
  });

  test("관리자가 아님 → 403 FORBIDDEN", async () => {
    const res = await app.call("GET", "/api/admin/rooms/A/reservations?date=2026-10-20", { headers: as("minsu") });
    assert.equal(res.status, 403);
    assert.equal(res.body.code, "FORBIDDEN");
  });

  test("날짜 누락 → 400 VALIDATION_ERROR", async () => {
    const res = await app.call("GET", "/api/admin/rooms/A/reservations", { headers: as("admin1", "admin") });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, "VALIDATION_ERROR");
  });

  test("없는 룸 → 404 ROOM_NOT_FOUND", async () => {
    const res = await app.call("GET", "/api/admin/rooms/Z/reservations?date=2026-10-20", { headers: as("admin1", "admin") });
    assert.equal(res.status, 404);
  });
});
