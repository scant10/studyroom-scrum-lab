// S1~S3 예약 규칙. 저장소는 createReservations()를 부를 때마다 새로 만든다 (ADR-003).
import { HttpError } from "../http/router.ts";
import { findRoom } from "./rooms.ts";
import { assertDate, overlaps, parseSlot } from "./time.ts";

export const CANCEL_DEADLINE_MINUTES = 60;

export type Reservation = {
  id: string;
  roomId: string;
  memberId: string;
  date: string;
  start: string;
  end: string;
  status: "CONFIRMED" | "CANCELLED";
  startAt: Date;
  endAt: Date;
};

/** API로 내보낼 때는 내부 필드(startAt, endAt)를 빼고 돌려준다. */
export function toView(r: Reservation) {
  const { startAt: _s, endAt: _e, ...view } = r;
  return view;
}

const byStart = (a: Reservation, b: Reservation) => a.startAt.getTime() - b.startAt.getTime();

export function createReservations(now: () => Date) {
  const store = new Map<string, Reservation>();
  let seq = 0;

  function requireRoom(roomId: unknown) {
    const room = typeof roomId === "string" ? findRoom(roomId) : undefined;
    if (!room) throw new HttpError(404, "ROOM_NOT_FOUND", "존재하지 않는 룸입니다.");
    return room;
  }

  function confirmed() {
    return [...store.values()].filter((r) => r.status === "CONFIRMED");
  }

  /** S1 예약 */
  function reserve(memberId: string, input: { roomId?: unknown; date?: unknown; start?: unknown; end?: unknown }) {
    const room = requireRoom(input.roomId);
    const slot = parseSlot(input, now());

    const conflict = confirmed().some((r) => r.roomId === room.id && overlaps(r, slot));
    if (conflict) throw new HttpError(409, "RESERVATION_CONFLICT", "이미 예약된 시간과 겹칩니다.");

    seq += 1;
    const reservation: Reservation = {
      id: `R-${String(seq).padStart(4, "0")}`,
      roomId: room.id,
      memberId,
      date: slot.date,
      start: slot.start,
      end: slot.end,
      status: "CONFIRMED",
      startAt: slot.startAt,
      endAt: slot.endAt,
    };
    store.set(reservation.id, reservation);
    return reservation;
  }

  /** S2 내 예약 조회 */
  function listMine(memberId: string) {
    return confirmed().filter((r) => r.memberId === memberId).sort(byStart);
  }

  /** S2 취소: 예약자 본인만, 시작 60분 전까지 */
  function cancel(memberId: string, id: string) {
    const r = store.get(id);
    if (!r) throw new HttpError(404, "RESERVATION_NOT_FOUND", "존재하지 않는 예약입니다.");
    if (r.memberId !== memberId) throw new HttpError(403, "FORBIDDEN", "본인의 예약만 취소할 수 있습니다.");
    if (r.status === "CANCELLED") throw new HttpError(409, "ALREADY_CANCELLED", "이미 취소된 예약입니다.");

    const deadline = r.startAt.getTime() - CANCEL_DEADLINE_MINUTES * 60_000;
    if (now().getTime() > deadline) {
      throw new HttpError(422, "CANCEL_DEADLINE_PASSED", "시작 1시간 전까지만 취소할 수 있습니다.");
    }
    r.status = "CANCELLED";
  }

  /** S3 관리자 하루 현황 */
  function listByRoomAndDate(roomId: string, date: unknown) {
    const room = requireRoom(roomId);
    const day = assertDate(date);
    return confirmed().filter((r) => r.roomId === room.id && r.date === day).sort(byStart);
  }

  return { reserve, listMine, cancel, listByRoomAndDate };
}
