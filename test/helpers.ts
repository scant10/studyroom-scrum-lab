import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

/** 테스트용 서버를 임의 포트로 띄우고, 요청 함수와 종료 함수를 돌려준다. */
export async function start(server: Server) {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;

  async function call(method: string, path: string, opts: { body?: unknown; headers?: Record<string, string> } = {}) {
    const res = await fetch(base + path, {
      method,
      headers: { "content-type": "application/json", ...opts.headers },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined };
  }

  return { call, close: () => new Promise<void>((r) => server.close(() => r())) };
}
