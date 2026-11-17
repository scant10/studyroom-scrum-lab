#!/usr/bin/env node
// 실습 작업 폴더 도구 — 「바이브 코딩 시대의 스크럼」 90분 팀 스프린트
//
// 이 저장소(자료 저장소)에는 사람용 실습 가이드와 복습용 가이드가 들어 있습니다.
// AI 도구가 이것을 읽으면 팀이 정할 답을 미리 채워 버리므로, 실습은 저장소 바깥의
// 작업 폴더(~/scrum-labs/studyroom)에서 합니다. 작업 폴더에는 시작 코드와 양식만 들어갑니다.
//
//   node lab.mjs start           작업 폴더 만들기 (main · before · after 브랜치 포함)
//   node lab.mjs join <주소>      팀 저장소를 작업 폴더로 받기 (팀원)
//   node lab.mjs guide           실습 가이드를 브라우저로 열기
//   node lab.mjs where           작업 폴더 위치 보기
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const HOME = resolve(process.env.LAB_HOME ?? join(homedir(), "scrum-labs"));
const DIR = join(HOME, "studyroom");

// 작업 폴더에 넣지 않는 파일 (사람용 안내서와 이 도구)
const EXCLUDE = [/^guide\.html$/, /^lab\.mjs$/, /^README\.md$/, /^docs\/practice-guide-claude-code\.md$/, /^\.claude\//, /(^|\/)\.DS_Store$/];

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (color ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const c = { b: paint(1), g: paint(32), r: paint(31), d: paint(2) };
const shown = (p) => p.replace(homedir(), "~").replaceAll("\\", "/");

function die(msg) {
  console.error(c.r("✖ ") + msg);
  process.exit(1);
}
function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 }).trim();
}
function gitBuf(cwd, ...args) {
  return execFileSync("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 });
}
function gitOk(cwd, ...args) {
  return spawnSync("git", args, { cwd, stdio: "ignore" }).status === 0;
}
function hasGit() {
  return spawnSync("git", ["--version"], { stdio: "ignore" }).status === 0;
}

/** 자료 저장소에서 브랜치를 찾는다. clone 직후에는 origin/before 로만 있다. */
function findRef(name) {
  for (const ref of [name, `origin/${name}`, `upstream/${name}`]) {
    if (gitOk(ROOT, "rev-parse", "--verify", "--quiet", `${ref}^{commit}`)) return ref;
  }
  return null;
}

/** ref 의 파일을 dest 에 쓴다 (EXCLUDE 제외). 쓴 파일 수를 돌려준다. */
function writeTree(ref, dest) {
  const files = git(ROOT, "ls-tree", "-r", "-z", "--name-only", ref).split("\0").filter(Boolean);
  let n = 0;
  for (const f of files) {
    if (EXCLUDE.some((re) => re.test(f))) continue;
    const out = join(dest, ...f.split("/"));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, gitBuf(ROOT, "show", `${ref}:${f}`));
    n++;
  }
  return n;
}

function clearWorkTree(dir) {
  for (const f of git(dir, "ls-files", "-z").split("\0").filter(Boolean)) rmSync(join(dir, ...f.split("/")), { force: true });
}

function commitAll(dir, message) {
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "--no-verify", "--allow-empty", "-m", message);
}

function workspaceReadme() {
  return `# 스터디룸 예약 서비스 — 팀 작업 폴더

> 1일 과정 「바이브 코딩 시대의 스크럼」 Part 6 실습. 이 폴더가 팀의 작업 공간입니다.

- **AI 도구(Claude Code 등)는 이 폴더에서만 엽니다.** 실습 가이드는 강사가 공유한 웹 링크나, 자료 저장소에서 \`node lab.mjs guide\`로 엽니다.
- 시작 코드와 양식만 들어 있습니다. 정답 예시는 \`after\` 브랜치에 있고, **스프린트를 끝낸 뒤에** 봅니다.

\`\`\`bash
npm test        # 맨 아래 "pass 2"가 보이면 준비 완료
npm start       # http://localhost:3000
npm run check   # 테스트 + 시크릿 검사 (DoD 확인용)
\`\`\`

## 팀 저장소로 올리기 (대표 1명, 가이드 1-1)

GitHub에 빈 저장소 \`studyroom\`을 만든 뒤(Private, README·.gitignore 추가 체크 해제) 이 폴더에서:

\`\`\`bash
git remote add origin https://github.com/<내아이디>/studyroom.git
git push -u origin main before after
\`\`\`

## 브랜치

| 브랜치 | 내용 |
| --- | --- |
| \`main\` | 시작 코드 + 양식. 여기서 시작합니다 |
| \`before\` | "스터디룸 예약 서비스 만들어줘" 한 줄로 만든 바이브 코딩 버전 (디브리핑 비교용) |
| \`after\` | 스펙·규칙 파일·테스트를 적용한 버전 (디브리핑 비교, 늦어진 팀 따라잡기) |
`;
}

function printNext() {
  console.log(`\n${c.b("작업 폴더")}  ${shown(DIR)}\n`);
  console.log(c.b("다음 할 일"));
  console.log(`  cd ${shown(DIR)}`);
  console.log(`  npm test        ${c.d('# 맨 아래 "pass 2"가 보이면 OK')}`);
  console.log(c.d("\n  AI 도구는 반드시 이 작업 폴더에서 엽니다. 자료 저장소(studyroom-scrum-lab)에서는 열지 않습니다.\n"));
}

// ─────────────────────────────── 명령

function cmdStart(force) {
  if (!hasGit()) die("git이 없습니다. 가이드 0-2에서 Git을 설치하세요.");
  if (existsSync(DIR)) {
    if (!force) die(`이미 있습니다: ${shown(DIR)}\n  처음부터 다시 만들려면: node lab.mjs start --force  (그 폴더의 내용은 지워집니다)`);
    rmSync(DIR, { recursive: true, force: true });
  }
  const refs = { before: findRef("before"), after: findRef("after") };
  for (const [k, v] of Object.entries(refs)) if (!v) die(`'${k}' 브랜치를 찾을 수 없습니다. ZIP이 아니라 git clone으로 받았는지 확인하세요.`);

  mkdirSync(DIR, { recursive: true });
  git(DIR, "init", "-q", "-b", "main");
  git(DIR, "config", "core.autocrlf", "false");
  // git 사용자 설정이 없는 수강생도 바로 커밋할 수 있게, 이 작업 폴더에만 임시 이름을 둔다
  if (!gitOk(DIR, "config", "user.email")) {
    git(DIR, "config", "user.name", "student");
    git(DIR, "config", "user.email", "student@example.com");
  }
  const readme = workspaceReadme();

  const n = writeTree("HEAD", DIR);
  writeFileSync(join(DIR, "README.md"), readme);
  commitAll(DIR, "시작 코드와 양식");

  const labels = { before: "before: 한 줄 프롬프트로 만든 바이브 코딩 버전", after: "after: 스펙·규칙 파일·테스트를 적용한 버전" };
  for (const b of ["before", "after"]) {
    git(DIR, "checkout", "-q", "-b", b, "main");
    clearWorkTree(DIR);
    writeTree(refs[b], DIR);
    writeFileSync(join(DIR, "README.md"), readme);
    commitAll(DIR, labels[b]);
  }
  git(DIR, "checkout", "-q", "main");

  console.log(c.g("✔ ") + `작업 폴더를 만들었습니다 (파일 ${n + 1}개, 브랜치 main · before · after)`);
  printNext();
}

function cmdJoin(url) {
  if (!url) die("팀 저장소 주소가 필요합니다.  예) node lab.mjs join https://github.com/<대표아이디>/studyroom.git");
  if (!hasGit()) die("git이 없습니다. 가이드 0-2에서 Git을 설치하세요.");
  if (existsSync(DIR)) {
    const remote = gitOk(DIR, "remote", "get-url", "origin") ? git(DIR, "remote", "get-url", "origin") : "";
    if (remote) die(`${shown(DIR)}는 이미 팀 저장소(${remote})와 연결돼 있습니다. 그대로 쓰면 됩니다.`);
    // 0-3에서 연습으로 만든 작업 폴더는 팀 저장소로 바꾼다
    rmSync(DIR, { recursive: true, force: true });
  }
  mkdirSync(HOME, { recursive: true });
  const r = spawnSync("git", ["clone", url, DIR], { stdio: "inherit" });
  if (r.status !== 0) die("받지 못했습니다. 초대를 수락했는지, 주소가 맞는지 확인하세요 (가이드 1-2).");
  console.log(c.g("✔ ") + "팀 저장소를 작업 폴더로 받았습니다");
  printNext();
}

function cmdGuide() {
  const file = join(ROOT, "guide.html");
  if (!existsSync(file)) die("guide.html이 없습니다. 강사가 공유한 웹 링크로 여세요.");
  const url = pathToFileURL(file).href;
  const [cmd, args] =
    process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
  const r = spawnSync(cmd, args, { stdio: "ignore" });
  console.log(r.status === 0 ? c.g("✔ ") + "실습 가이드를 열었습니다" : `브라우저 주소창에 붙여 넣으세요: ${url}`);
}

const [cmd, ...rest] = process.argv.slice(2);
switch (cmd) {
  case "start": cmdStart(rest.includes("--force")); break;
  case "join": cmdJoin(rest.find((a) => !a.startsWith("-"))); break;
  case "guide": cmdGuide(); break;
  case "where": console.log(shown(DIR)); break;
  default:
    console.log(`${c.b("사용법")} (자료 저장소 studyroom-scrum-lab 폴더에서)
  node lab.mjs start           작업 폴더 만들기 → ${shown(DIR)}
  node lab.mjs join <주소>      팀 저장소를 작업 폴더로 받기 (팀원, 가이드 1-2)
  node lab.mjs guide           실습 가이드를 브라우저로 열기
  node lab.mjs where           작업 폴더 위치 보기`);
}
