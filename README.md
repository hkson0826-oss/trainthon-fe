# Lumina (Trainthon) Frontend

분실자와 습득자를 연결하는 모바일 우선 데모 웹 앱입니다. 시각 정체성은 [DESIGN.md](./DESIGN.md)입니다. 제품·금액·상태 계약은 [PRODUCT_CONTRACT.md](./PRODUCT_CONTRACT.md)와 [FE_MASTER.md](./FE_MASTER.md)를 따릅니다.

지금은 **데모 모드**입니다. 백엔드 API와 실제 결제·Firebase·지도 키는 연결하지 않았습니다. 데이터는 브라우저 세션에 저장되며, 화면 상단 배너와 “모의 데이터 · 실제 지급 아님” 라벨로 실제 지급과 구분합니다.

## 실행

```bash
npm ci
npm run design:lint
npm run dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000)입니다.

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## 데모 계정

로그인 화면에서 역할을 고릅니다. 계정 생성 시 역할이 고정되지 않습니다.

| 계정 | 이름 | 미리 들어 있는 데이터 |
|---|---|---|
| 분실자 A | 김서연 | 흰색 이어폰 케이스 탐색 중, 후보 1건 |
| 습득자 B | 이준호 | 이어폰 케이스·우산 등록 |
| 다른 사용자 C | 박민지 | 열쇠고리 등록, A/B 보호 화면 접근 불가 |

추천 흐름: B로 습득물 확인 → A로 후보 확인·소유권 요청 → B로 승인 → A가 코드 제시 → B가 코드 확인 → B의 보상에서 3,500원 지급 대기/완료 확인.

## 환경 변수

`.env.example`을 참고하세요. 공개 설정만 둡니다.

- `VITE_APP_MODE=demo`
- `VITE_API_BASE_URL` 비움 (데모 어댑터 사용)

AI 비밀 키, Firebase Admin, 결제 공급자 비밀은 넣지 않습니다.
