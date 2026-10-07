// Study Room Reservation Service
// 프롬프트: "스터디룸 예약 서비스 만들어줘"
import { createServer } from "node:http";
import { createRouter, HttpError } from "./http/router.ts";
import { ROOMS } from "./domain/rooms.ts";

interface Reservation {
  id: number;
  room: string;
  userId: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

const ADMIN_PASSWORD = "admin1234";

let reservations: Reservation[] = [];
let nextId = 1;

export function createApp(_options = {}) {
  const router = createRouter();

  router.get("/health", () => ({ status: 200, body: { status: "ok" } }));
  router.get("/api/rooms", () => ({ status: 200, body: ROOMS }));

  // Create a reservation
  router.post("/reservations", (req) => {
    const { room, userId, startTime, endTime } = req.body as any;
    if (!room || !userId || !startTime || !endTime) {
      throw new HttpError(400, "BAD_REQUEST", "Missing required fields");
    }

    // Check if the room is already booked
    const exists = reservations.find((r) => r.room === room && r.startTime === startTime);
    if (exists) {
      throw new HttpError(400, "ALREADY_BOOKED", "This room is already booked");
    }

    const reservation: Reservation = {
      id: nextId++,
      room,
      userId,
      startTime,
      endTime,
      createdAt: new Date().toISOString(),
    };
    reservations.push(reservation);
    return { status: 200, body: reservation };
  });

  // Get my reservations
  router.get("/my-reservations", (req) => {
    const user_id = req.query.get("user_id");
    return { status: 200, body: reservations.filter((r) => r.userId === user_id) };
  });

  // Cancel a reservation
  router.delete("/reservations/:id", (req) => {
    const index = reservations.findIndex((r) => r.id === Number(req.params.id));
    reservations.splice(index, 1);
    return { status: 200, body: { message: "Reservation cancelled successfully" } };
  });

  // Admin: view all reservations
  router.get("/admin/reservations", (req) => {
    if (req.query.get("password") !== ADMIN_PASSWORD) {
      throw new HttpError(401, "UNAUTHORIZED", "Invalid admin password");
    }
    return { status: 200, body: reservations };
  });

  return createServer((req, res) => void router.handle(req, res));
}
