import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.ts";
import { start } from "./helpers.ts";

test("서버가 살아 있다", async () => {
  const app = await start(createApp());
  const res = await app.call("GET", "/health");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: "ok" });
  await app.close();
});

test("룸 목록을 조회할 수 있다", async () => {
  const app = await start(createApp());
  const res = await app.call("GET", "/api/rooms");
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 3);
  await app.close();
});
