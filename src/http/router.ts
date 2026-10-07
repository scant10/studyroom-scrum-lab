// 아주 작은 라우터. 외부 라이브러리 없이 Node.js 기본 http 모듈만 사용한다.
import type { IncomingMessage, ServerResponse } from "node:http";

export type Request = {
  method: string;
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  headers: IncomingMessage["headers"];
  body: unknown;
};

export type Response = { status: number; body?: unknown };

export type Handler = (req: Request) => Response | Promise<Response>;

type Route = { method: string; parts: string[]; handler: Handler };

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function createRouter() {
  const routes: Route[] = [];

  function add(method: string, pattern: string, handler: Handler) {
    routes.push({ method, parts: pattern.split("/").filter(Boolean), handler });
  }

  function match(method: string, path: string) {
    const parts = path.split("/").filter(Boolean);
    for (const route of routes) {
      if (route.method !== method || route.parts.length !== parts.length) continue;
      const params: Record<string, string> = {};
      const ok = route.parts.every((p, i) => {
        if (p.startsWith(":")) {
          params[p.slice(1)] = decodeURIComponent(parts[i]);
          return true;
        }
        return p === parts[i];
      });
      if (ok) return { handler: route.handler, params };
    }
    return undefined;
  }

  async function handle(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? "/", "http://localhost");
    const send = (status: number, body?: unknown) => {
      if (body === undefined) {
        res.writeHead(status).end();
        return;
      }
      res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(body));
    };

    try {
      const found = match(req.method ?? "GET", url.pathname);
      if (!found) throw new HttpError(404, "NOT_FOUND", "요청한 경로가 없습니다.");
      const body = await readJson(req);
      const result = await found.handler({
        method: req.method ?? "GET",
        path: url.pathname,
        params: found.params,
        query: url.searchParams,
        headers: req.headers,
        body,
      });
      send(result.status, result.body);
    } catch (err) {
      if (err instanceof HttpError) {
        send(err.status, { code: err.code, message: err.message });
      } else {
        console.error(err);
        send(500, { code: "INTERNAL_ERROR", message: "서버 오류가 발생했습니다." });
      }
    }
  }

  return {
    get: (pattern: string, h: Handler) => add("GET", pattern, h),
    post: (pattern: string, h: Handler) => add("POST", pattern, h),
    delete: (pattern: string, h: Handler) => add("DELETE", pattern, h),
    handle,
  };
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "INVALID_JSON", "요청 본문이 올바른 JSON이 아닙니다.");
  }
}
