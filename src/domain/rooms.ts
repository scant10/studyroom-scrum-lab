export type Room = { id: string; name: string; capacity: number };

// 실습에서는 룸이 고정되어 있다고 가정한다.
export const ROOMS: readonly Room[] = [
  { id: "A", name: "A룸", capacity: 4 },
  { id: "B", name: "B룸", capacity: 6 },
  { id: "C", name: "C룸", capacity: 8 },
];

export function findRoom(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}
