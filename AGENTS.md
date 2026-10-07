# 팀 AI 규칙

## 프로젝트
- 스택: Node.js 22 (TypeScript, 외부 라이브러리 없음), 테스트는 node:test
- 구조: src/http (라우터·인증), src/domain (예약 규칙·시간), test (인수조건 테스트)
- 스펙: docs/specs/ / 계약: docs/api-spec.yaml / 결정: docs/adr/

## 반드시
- 구현 전에 docs/specs/의 인수조건을 읽고, 시나리오마다 테스트를 먼저 쓴다
- API 경로·필드 이름·에러 코드는 docs/api-spec.yaml을 따른다 (필드는 camelCase, 예: memberId)
- 에러는 HttpError(status, code, message)로 던진다
- 현재 시각은 주입받은 now()만 쓴다 (ADR-001)

## 금지
- 외부 라이브러리 추가 (필요하면 ADR 먼저)
- 테스트를 고치거나 지워서 통과시키기 — 테스트 변경은 사람이 리뷰한다
- 비밀번호·키 하드코딩, 요청 본문으로 회원 ID 받기 (ADR-002)
- 모듈 전역 변수에 상태 저장 (ADR-003)

## 끝내기 전에
- npm run check 통과
- PR 설명에 DoD 체크리스트 작성
