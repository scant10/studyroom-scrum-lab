// ADR-001: 한국 시간 고정, 30분 단위, 09:00–22:00, 최대 240분, [시작, 종료) 구간
import { HttpError } from "../http/router.ts";

export const OPEN_MINUTES = 9 * 60;
export const CLOSE_MINUTES = 22 * 60;
export const MAX_DURATION_MINUTES = 240;
export const SLOT_UNIT_MINUTES = 30;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type Slot = { date: string; start: string; end: string; startAt: Date; endAt: Date };

function invalid(message: string): never {
  throw new HttpError(400, "VALIDATION_ERROR", message);
}

export function assertDate(date: unknown): string {
  if (typeof date !== "string" || !DATE_RE.test(date) || Number.isNaN(kst(date, "00:00").getTime())) {
    invalid("date는 YYYY-MM-DD 형식이어야 합니다.");
  }
  return date;
}

function minutesOf(time: unknown, field: string): number {
  const m = typeof time === "string" ? TIME_RE.exec(time) : null;
  if (!m) invalid(`${field}는 HH:mm 형식이어야 합니다.`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** 한국 시간 날짜·시각을 Date로 바꾼다. */
export function kst(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+09:00`);
}

export function parseSlot(input: { date?: unknown; start?: unknown; end?: unknown }, now: Date): Slot {
  const date = assertDate(input.date);
  const s = minutesOf(input.start, "start");
  const e = minutesOf(input.end, "end");

  if (e <= s) invalid("종료 시각은 시작 시각보다 늦어야 합니다.");
  if (s % SLOT_UNIT_MINUTES !== 0 || e % SLOT_UNIT_MINUTES !== 0) invalid("예약은 30분 단위로만 가능합니다.");
  if (s < OPEN_MINUTES || e > CLOSE_MINUTES) invalid("운영 시간(09:00–22:00) 안에서만 예약할 수 있습니다.");
  if (e - s > MAX_DURATION_MINUTES) invalid("한 번에 최대 4시간까지 예약할 수 있습니다.");

  const start = input.start as string;
  const end = input.end as string;
  const startAt = kst(date, start);
  if (startAt.getTime() <= now.getTime()) invalid("이미 지난 시각은 예약할 수 없습니다.");

  return { date, start, end, startAt, endAt: kst(date, end) };
}

/** [a.start, a.end)와 [b.start, b.end)가 겹치는가. 맞닿는 것은 겹침이 아니다. */
export function overlaps(a: { startAt: Date; endAt: Date }, b: { startAt: Date; endAt: Date }): boolean {
  return a.startAt < b.endAt && b.startAt < a.endAt;
}
