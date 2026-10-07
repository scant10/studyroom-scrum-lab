import { createServer } from "node:http";
import { createRouter } from "./http/router.ts";
import { requireAdmin, requireMember } from "./http/auth.ts";
import { ROOMS } from "./domain/rooms.ts";
import { createReservations, toView } from "./domain/reservations.ts";

export type AppOptions = {
  /** 현재 시각. 테스트에서 시간을 고정할 수 있도록 주입한다 (ADR-001). */
  now?: () => Date;
};

export function createApp(options: AppOptions = {}) {
  const router = createRouter();
  const reservations = createReservations(options.now ?? (() => new Date()));

  router.get("/health", () => ({ status: 200, body: { status: "ok" } }));
  router.get("/api/rooms", () => ({ status: 200, body: ROOMS }));

  // S1 예약
  router.post("/api/reservations", (req) => {
    const memberId = requireMember(req);
    const body = (req.body ?? {}) as Record<string, unknown>;
    return { status: 201, body: toView(reservations.reserve(memberId, body)) };
  });

  // S2 내 예약 조회 — /api/reservations/:id 보다 먼저 등록한다
  router.get("/api/reservations/me", (req) => {
    const memberId = requireMember(req);
    return { status: 200, body: reservations.listMine(memberId).map(toView) };
  });

  // S2 취소
  router.delete("/api/reservations/:id", (req) => {
    const memberId = requireMember(req);
    reservations.cancel(memberId, req.params.id);
    return { status: 204 };
  });

  // S3 관리자 하루 현황
  router.get("/api/admin/rooms/:roomId/reservations", (req) => {
    requireAdmin(req);
    const list = reservations.listByRoomAndDate(req.params.roomId, req.query.get("date") ?? undefined);
    return { status: 200, body: list.map(toView) };
  });

  return createServer((req, res) => void router.handle(req, res));
}
