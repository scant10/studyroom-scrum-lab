import { createServer } from "node:http";
import { createRouter } from "./http/router.ts";
import { ROOMS } from "./domain/rooms.ts";

export type AppOptions = {
  /** 현재 시각. 테스트에서 시간을 고정할 수 있도록 주입한다. */
  now?: () => Date;
};

export function createApp(_options: AppOptions = {}) {
  const router = createRouter();

  router.get("/health", () => ({ status: 200, body: { status: "ok" } }));
  router.get("/api/rooms", () => ({ status: 200, body: ROOMS }));

  // TODO(실습): 여기에 기능을 구현합니다.

  return createServer((req, res) => void router.handle(req, res));
}
