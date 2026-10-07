# after 브랜치 — 스펙·하네스 적용 버전

백로그 S1~S3를 강의에서 배운 순서대로 만든 결과입니다.

1. AI에게 질문을 먼저 받고(템플릿 01), 팀이 답을 정했다 → 각 스펙의 "AI 질문과 팀의 답" 표
2. 답을 인수조건으로 옮겼다 → `docs/specs/`
3. 다시 묻지 않도록 결정을 남겼다 → `docs/adr/` (시간, 인증, 저장소)
4. AI가 지킬 규칙을 적었다 → `AGENTS.md`, 계약 `docs/api-spec.yaml`
5. 인수조건을 **테스트로 먼저** 쓰고(처음엔 29개 중 26개 실패), 그다음 구현했다
6. `npm run check` (테스트 29개 + 시크릿 검사) 통과

```bash
npm run check
```

before와의 비교: [docs/review/before-vs-after.md](docs/review/before-vs-after.md)
