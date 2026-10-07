// ADR-002: 실습용 헤더 인증
import { HttpError, type Request } from "./router.ts";

export function requireMember(req: Request): string {
  const id = req.headers["x-member-id"];
  if (typeof id !== "string" || id.trim() === "") {
    throw new HttpError(401, "UNAUTHORIZED", "X-Member-Id 헤더가 필요합니다.");
  }
  return id.trim();
}

export function requireAdmin(req: Request): string {
  const memberId = requireMember(req);
  if (req.headers["x-role"] !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "관리자만 조회할 수 있습니다.");
  }
  return memberId;
}
