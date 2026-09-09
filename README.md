# Lumina Frontend

주차장 사고 증거 매칭 데모입니다. **화면 흐름·상태·문구는 [FE_SPEC.md](./FE_SPEC.md)가 최상위 명세**입니다. 시각 토큰은 [DESIGN.md](./DESIGN.md), API 계약은 [BE_SPEC.md](./BE_SPEC.md)입니다.

아이폰 11(375×812)을 기준으로 한 열이지만, 고정 폰 프레임이 아닙니다. 320px부터 넓은 화면까지 폭에 맞춰 줄어들고 늘어나며, 본문은 최대 640px로 가운데 정렬됩니다.

지금은 **목 API 모드**입니다. 백엔드·Supabase 키가 없어도 X→Y 발표 흐름을 로컬에서 시연할 수 있습니다.

## 실행

```bash
cp .env.example .env.local
npm install
npm run design:lint
npm run dev
```

http://localhost:3000

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## 데모 계정

| 버튼 | 역할 | 이메일 |
|---|---|---|
| X(요청자)로 시작 | REQUESTER | `x@lumina.demo` |
| Y(제보자)로 시작 | WITNESS | `y@lumina.demo` |

비밀번호는 `.env.local`의 `NEXT_PUBLIC_DEMO_ACCOUNT_PASSWORD`입니다. 앱바 **계정 전환**은 실제로 로그아웃 후 다른 데모 계정으로 로그인합니다.

추천 흐름: X로 사고 제보(A주차장, 14:00~14:10) → 계정 전환 Y → 알림 → 데모 샘플 영상 업로드 → AI 분석 시작 → `00:12 사고 후보` → 계정 전환 X → 보험사 제출·증거 채택(데모) → 계정 전환 Y → 내 보상.

## 환경 변수

`.env.example`만 공개 설정을 둡니다. `NEXT_PUBLIC_USE_MOCK_API=true`이면 BE 없이 목 저장소를 씁니다. Supabase service role, TwelveLabs 키는 넣지 않습니다.
