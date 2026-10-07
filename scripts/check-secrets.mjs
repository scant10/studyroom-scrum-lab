// 아주 단순한 시크릿 검사기. 실무에서는 gitleaks 같은 전용 도구를 쓰세요.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const PATTERNS = [
  { name: "하드코딩된 비밀번호", re: /(password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/i },
  { name: "하드코딩된 비밀번호 비교", re: /===?\s*["'](admin|root|test)\w*["']/i },
  { name: "API 키 형태의 문자열", re: /(api[_-]?key|secret|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{12,}["']/i },
  { name: "AWS 액세스 키", re: /AKIA[0-9A-Z]{16}/ },
];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const findings = [];
for (const file of walk("src")) {
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    for (const { name, re } of PATTERNS) {
      if (re.test(line)) findings.push(`${file}:${i + 1}  ${name}  →  ${line.trim()}`);
    }
  });
}

if (findings.length) {
  console.error("시크릿 의심 항목이 있습니다:\n" + findings.join("\n"));
  process.exit(1);
}
console.log("시크릿 검사 통과");
