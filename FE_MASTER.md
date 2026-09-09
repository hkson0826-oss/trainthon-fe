# Lumina FE MASTER — 프런트엔드 원샷 구현 지시서

> 이 문서는 구현 에이전트에게 그대로 전달하는 최상위 작업 명세다. 문서 작성이 아닌 실제 FE 구현·실행·검증을 완료하는 것이 이 문서를 받은 에이전트의 임무다. 현재 산출물은 개발 지시서이며 구현이 이미 완료되었다는 뜻이 아니다.

## 0. 실행 원칙과 문서 우선순위

1. 같은 디렉터리의 `PRODUCT_CONTRACT.md`를 먼저 읽는다. 금액, 공개 범위, 상태, API 경로·타입·오류, 결제·환불·인수 인증의 유일한 계약이다. `BE_MASTER.md`는 서버 연동 맥락을 확인할 때 읽는다.
2. 이 문서가 공통 계약과 다르면 계약을 따른다. 코드와 계약이 충돌하면 임의의 호환 API나 추측한 상태를 추가하지 말고 차이를 기록하고 계약에 맞춰 구현한다.
3. 실제 작업 저장소의 `AGENTS.md`, package manager lockfile, 기존 코드와 실행 스크립트를 확인한다. 문서에 적힌 관찰과 실제 checkout이 다르면 먼저 차이를 기록한다.
4. 기존 화면·브랜드·컴포넌트는 활용하되 브라우저가 Firestore나 AI 공급자에 도메인 데이터를 직접 쓰는 흐름을 남기지 않는다. 신원 인증 외 비즈니스 상태는 서버만 결정한다.
5. 실행에 필요한 선택은 이 명세의 기본값으로 결정한다. API 키 부재 등 외부 준비만 분리하며 그 외 UI·demo adapter·접근성·테스트는 끝까지 완성한다.
6. FE 소유 범위는 루트 웹 앱, FE 테스트·정적 자산·웹 실행 문서다. BE 에이전트가 소유한 `server/` 구현을 수정하지 않는다. 공동 계약을 단독으로 바꾸지 않는다.

## 1. 제품의 핵심 의미

Lumina는 분실자가 사례금을 게시하는 장터가 아니다. 분실자가 **5,000원의 찾기 요청비를 결제하면 AI가 습득물과 대조하는 유료 매칭 중개 서비스**다. 반환이 확인되면 이 결제금에서 습득자 보상 3,500원과 Lumina 매칭·운영 수수료 1,500원을 배분한다. 1,500원을 순이익 또는 순수익이라고 표현하지 않는다.

- 습득자: 물건 사진, 발견 장소, 한 줄 설명 → AI 작성 초안 확인 → 습득물 등록 → 요청 검토 → 반환 인증 → 보상 상태 확인.
- 분실자: 선택 사진, 분실 장소, 설명 → 찾기 요청비 결제 → AI 후보 확인 → 소유권 확인 요청 → 승인 후 수령 안내 → 실제 수령 시 인증코드 제시.
- 한 사용자가 두 역할을 모두 사용한다. 계정 생성 시 영구적인 역할을 강제하지 않는다.
- 채팅형 입력은 카카오톡처럼 쉬운 상호작용을 뜻한다. MVP에 실제 카카오톡 채널·카카오 비즈메시지·카카오 SDK 연동을 만들지 않는다.
- 결제 확인 후 7일 동안 탐색한다. 미반환 만료 및 취소의 전액 환불 정책은 MVP 가정이며, 정확한 적용 조건은 공통 계약과 서버 응답을 따른다.
- AI 후보는 유사도 순위다. “일치 확률 98%”, “내 물건 확정”, “찾기 보장”으로 표현하지 않는다.

### 사용자가 화면에서 이해해야 하는 네 가지

1. 무엇에 5,000원을 지불하는가: 7일 동안의 탐색 요청이며 반환 보장이 아니다.
2. 정확한 보관 장소가 왜 잠겨 있는가: 소유권 확인 승인 전에는 물건과 습득자를 보호한다.
3. 반환을 누가 확정하는가: 분실자가 제시한 일회용 코드를 습득자가 확인한다.
4. 보상이 언제 생기는가: 결제 직후가 아닌 반환 확인 후다. 적립·지급 대기와 지급 완료를 구분한다.

## 2. 원본 저장소 관찰과 구현 제안의 구분

### 확인된 원본 기준

참조: https://github.com/Icey067/Lumina — 확인된 main tree SHA `538e9066a6079387f1ffc4bd90971b272da809b9`. 이 값은 tree SHA이며 커밋 SHA로 표현하지 않는다.

- 루트 웹 프로젝트는 React 19.2, TypeScript, Vite 6 계열이다.
- 기존 `components/`에 `Dashboard`, `ItemCard`, `MapContainer`, `Messenger`, `Navbar`, `ProfileModal`, `ReportForm`, `SherlockAgent`가 있다.
- `MapContainer`는 TomTom 기반이다.
- `services/api.ts`가 존재하지만 `App`은 `services/firebase.ts`에 직접 접근하는 구조다.
- `services/geminiService.ts`에서 브라우저 AI 키 사용 흐름이 있다.
- 화면 전환은 App 내부 state 방식이다.

이는 원본 관찰이며 아래 라이브러리·폴더·라우트·컴포넌트는 **신규 구현 제안**이다. 기존에 구현되어 있다고 가정하지 않는다.

### 기본 구현 선택

- React + TypeScript + Vite를 유지한다. Next.js나 별도 프런트엔드 저장소로 이전하지 않는다.
- React Router를 사용해 URL 진입·새로고침·뒤로 가기·결제 복귀를 지원한다.
- 기존 스타일을 확인한 뒤 Tailwind를 로컬 빌드에 포함한다. 런타임 CDN 스타일 의존을 제거한다.
- TanStack Query로 서버 상태·캐시·폴링을 관리한다. React Hook Form + Zod로 폼 상태·클라이언트 검증을 관리한다. 프로젝트 호환 버전을 선택하고 lockfile에 고정한다.
- 로그인은 Firebase Auth를 사용하되 항목·요청·매칭·결제·반환·보상은 BE API로만 처리한다.
- AI 처리는 서버 API로 요청한다. 브라우저 bundle, Vite 환경변수, 소스맵에 AI 비밀 키를 넣지 않는다.
- 지도는 기존 TomTom 컴포넌트를 감싼다. 키가 없거나 위치 권한이 거절되어도 주소/장소 문자열 및 수동 위치 입력으로 핵심 흐름이 완결된다.

## 3. 사용자 경험과 정보 구조

### 글로벌 내비게이션

모바일에는 홈 / 찾기 / 습득물 등록 / 내 활동 / 내 정보를 표시한다. 등록을 주된 행동으로 강조하되 아이콘만 쓰지 않는다. 데스크톱에는 좌측 브랜드, 주요 탐색 메뉴, “분실물 찾기”, “습득물 등록”, 프로필을 표시한다. 현재 선택된 탭과 라우트가 일치해야 한다.

- 기본 언어는 한국어, 금액은 `5,000원`, 화면 시간은 Asia/Seoul로 표시한다.
- 데이터는 UTC ISO 문자열을 받아 표시 시 변환한다. 만료 판단과 결제 상태 판단을 클라이언트 시계에 맡기지 않는다.
- 목록 필터·정렬·페이지는 URL query에 유지한다. 개인정보·소유권 답변·반환코드는 URL에 넣지 않는다.
- 모바일 360px, 390px, 태블릿 768px, 데스크톱 1440px를 확인한다.

### FE 라우트

이 라우트는 웹 화면 경로이며 API 경로가 아니다. 상세 엔드포인트는 공통 계약을 그대로 사용한다.

| 웹 경로 | 접근 | 목적 |
|---|---|---|
| `/` | 공개 | 가치 제안, 요금, 두 역할 시작 CTA, 제한된 습득물 탐색 |
| `/items` | 공개 | 공개 습득물 목록, 카테고리·검색어 필터 |
| `/items/:itemId` | 공개/로그인 | 공개 상세, 비공개 정보 잠금, 찾기 요청 유도 |
| `/login` | 공개 | Firebase 로그인과 안전한 원래 화면 복귀 |
| `/found/new` | 로그인 | 채팅형 습득물 입력과 AI 초안 확인 |
| `/found/:itemId/edit` | 소유자 | 본인 습득물 편집·공개 상태 확인 |
| `/lost/new` | 로그인 | 분실 정보 수집과 찾기 요청 작성 |
| `/searches/:searchId/checkout` | 요청 소유자 | 금액·정책 확인과 결제 시작 |
| `/payments/return` | 로그인 | 결제 복귀 처리와 서버 상태 재조회 |
| `/searches/:searchId` | 요청 소유자 | 탐색 진행·만료·후보·취소·환불 상태 |
| `/claims/:claimId` | 당사자 | 소유권 요청/승인 상태와 수령 절차 |
| `/handoffs/:handoffId` | 승인된 당사자 | 코드 제시 또는 확인을 역할별 표시 |
| `/activity` | 로그인 | 내가 찾는 물건 / 내가 주운 물건 / 반환 요청 |
| `/rewards` | 로그인 | 보상 대기·지급 완료·실패 상태 |
| `/profile` | 로그인 | 본인 프로필, 로그아웃, demo 표시 |
| `/404` 및 `*` | 공개 | 존재하지 않는 화면 안내 |

라우트 Guard는 편의를 위한 장치다. 권한 판단은 API가 최종 수행한다. 타인의 URL 직접 입력에 403/404를 올바르게 처리하고 보호 데이터가 잠깐 나타나는 현상을 없앤다. 로그인 복귀 경로는 같은 앱의 허용된 상대 경로만 인정한다.

## 4. 화면별 구현 명세

### 4.1 홈 및 공개 습득물 목록

- 제목 예시: “잃어버린 물건과, 발견한 사람을 연결해요.”
- 주 CTA “분실물 찾기 · 5,000원”, 보조 CTA “주운 물건 등록하기”.
- 3단계 설명: 정보 등록 → AI 후보 확인 → 소유권 확인 후 수령.
- 요청비와 배분 예시를 동일한 금액 상수로 표시한다. 하드코딩 복사본을 여러 화면에 흩뜨리지 않는다.
- 공개 카드: 안전하게 공개된 사진, 제목, 카테고리, 대략적인 지역, 상태. 공개 DTO에 없는 시각은 임의로 추가하지 않는다. 정확한 주소·전화번호·소유권 특징·시리얼 번호를 숨긴다.
- 검색 결과 0건은 “아직 등록된 물건이 없어요”와 필터 초기화/찾기 요청 시작을 제공한다. 오류를 0건으로 표현하지 않는다.
- 아이템 상세의 수령 장소 영역은 승인 전 “소유권 확인 후 안내”를 표시한다. 서버가 보내지 않은 장소를 지도 마커·사진 EXIF·alt·DOM data attribute로 추정하거나 노출하지 않는다.

### 4.2 채팅형 습득물 등록

단계는 사진 → 발견 장소 → 한 줄 설명 → AI 정리 중 → 초안 확인 → 게시 완료다. 채팅 버블은 폼의 시각적 표현이며 입력·수정·제출은 명확한 폼 동작으로 구현한다.

- 사진은 최소 1장 필수. 허용 형식·크기·개수는 공통 계약과 서버 한도를 UI 검증에 동일하게 반영한다.
- 장소는 발견 위치와 실제 보관 위치를 구분한다. “공개 지역”과 “승인 후 안내할 보관 장소”를 서로 다른 필드로 보여 준다.
- 한 줄 설명 입력은 빈 공백만 있는 값 거부. 상세 글을 강요하지 않는다.
- AI 초안에는 제목, 카테고리, 요약, 특징을 보여 주고 모두 수정 가능하게 한다. 비공개 소유권 확인 특징은 별도 영역에 둔다.
- AI가 생성했다는 이유만으로 게시하지 않는다. 반드시 “내용 확인 후 등록” 명시적 동작이 필요하다.
- AI 오류·타임아웃에는 “직접 작성하기”와 “다시 시도”를 제공한다. 서버 오류를 가짜 AI 완료로 바꾸지 않는다.
- 업로드 진행률을 알 수 없으면 불확정 진행 상태를 사용한다. 임의의 98% 진척도를 표시하지 않는다.
- 마지막 게시 버튼 연타를 막고 요청 중 명확한 상태를 표시한다. 실패 시 입력을 보존한다.

### 4.3 분실 정보와 결제 전 확인

단계는 선택 사진 → 마지막 위치 → 분실 설명 → 초안 확인 → 요금 확인 → 결제다.

- 사진이 없어도 진행된다. 이미지가 없는 후보 카드를 깨진 이미지로 표시하지 않는다.
- 마지막 위치와 시간은 “대략적 정보”를 허용하는 UI로 설계하되 실제 DTO 필수값과 범위는 계약에 맞춘다.
- 비공개 소유권 특징은 후보 검색에서 공개되지 않는다고 안내한다. 비밀번호·금융정보 입력을 요구하지 않는다.
- 결제 전 검토 화면에는 요청 설명, 탐색 기간, 5,000원, 반환 확인 시 3,500원/1,500원 배분, 미반환 취소·만료 환불 가정을 읽기 쉽게 표시한다.
- 결제 동의는 기본 체크하지 않는다. 최종 버튼은 “5,000원 결제하고 찾기 시작”으로 구체적으로 표기한다.
- 결제 전까지 “탐색 중”으로 표시하지 않는다. 요청 저장과 결제 검증 성공은 별개 상태다.

### 4.4 결제 복귀

- 결제 생성 API의 응답에 따라 승인된 결제 URL로 이동한다. 임의 URL을 신뢰하지 않는다.
- return query는 결제 상태의 근거가 아니다. query의 성공 문자열만으로 결제 완료/탐색 중을 표시하지 않는다.
- 복귀 후 계약상의 검증 API 또는 상태 조회를 호출하고 서버가 검증한 상태만 표시한다.
- 처리 중에는 “결제 결과를 확인하고 있어요”, 확인 지연에는 “확인이 지연되고 있어요. 내 활동에서 다시 확인할 수 있어요.”를 표시한다.
- 실패·사용자 취소·검증 대기·이미 처리됨을 구별한다. 응답 지연만으로 결제를 다시 시작하지 않는다.
- 복귀 페이지 새로고침, 뒤로 가기, 동일 URL 재진입이 중복 주문이나 중복 결제를 만들지 않아야 한다.
- 이미 결제된 요청은 checkout에서 다시 결제시키지 않고 현재 요청으로 안내한다.

### 4.5 탐색 대시보드와 후보

- 서버 요청 상태, 시작/만료 시각, 남은 기간, 후보 수, 다음 행동을 표시한다.
- 후보 카드에 “유사도 높음” 또는 계약이 제공한 유사도 값을 표시한다. 점수 scale도 계약과 일치시킨다.
- 추천 근거는 이미지/설명/위치 유사성처럼 서버가 공개 허용한 정보만 표시한다. 비공개 특징을 추천 근거로 유출하지 않는다.
- 후보 클릭으로 상세를 보고 소유권 요청을 만든다. 자기 습득물 후보 또는 서버상 불가능한 행동은 활성화하지 않는다.
- 매칭 실행 중, 아직 후보 없음, 검색 만료, 환불 처리 중, 환불 실패, 반환 완료를 서로 다른 상태로 보여 준다.
- 소유권 요청만 보냈다고 찾기 성공이나 반환 완료로 바꾸지 않는다.
- 취소 버튼은 계약상 허용된 상태에서만 표시하고 확인 모달에서 영향·환불 정책을 설명한다. 서버 거절 시 상태 재조회 후 안내한다.

### 4.6 소유권 확인 요청과 습득자의 검토

- 분실자: 비공개 특징 또는 식별 설명을 작성하고 제출한다. 제출 전에 공개 게시물이 아니라 해당 습득자 검토용임을 알려 준다.
- 습득자: 본인 물건의 요청만 열람하고 소유권 설명을 확인한 뒤 승인/거절한다.
- 거절 이유 필드는 계약에서 요구할 때 사용한다. 불필요한 공개 댓글·자유 채팅을 확장 구현하지 않는다.
- 승인 대기에는 정확한 보관 주소·개인 연락처·반환코드를 보여 주지 않는다.
- 승인 이후에만 서버가 제공한 수령 정보와 인증 안내를 표시한다.
- 다른 요청이 먼저 승인되거나 물건이 반환된 경우 상태 충돌을 안내하고 오래된 버튼을 제거한다.

### 4.7 반환 인증

**코드를 제시하는 사람은 분실자, 코드를 입력/검증하는 사람은 습득자다.** 두 역할을 뒤집지 않는다.

- 분실자 화면: “물건을 실제로 받은 뒤 습득자에게 보여 주세요”, 서버 발급 코드, 남은 유효 시간, 새 코드 발급 동작(계약 허용 시)을 표시한다.
- 습득자 화면: 코드 입력, 실제 인계 확인 문구, “코드 확인하고 반환 완료” 동작을 표시한다.
- QR 사용 시 유효한 코드 표현만 담는다. 인증 권한·개인정보를 QR에 넣지 않는다. 카메라 권한 거절/카메라 없음에도 수동 코드 입력이 가능해야 한다.
- 코드가 채팅·URL·analytics·console·localStorage에 저장되지 않게 한다. 코드 화면에서 로그아웃하면 즉시 사라진다.
- 유효기간은 서버 만료 시각을 기준으로 표시한다. UI 카운트다운 종료가 반환 실패/취소 API를 자동 호출하지 않는다.
- 틀린 코드, 만료, 재사용, 잠금/요청 제한, 다른 거래 코드, 네트워크 중단을 구분한다.
- consume 요청 후 네트워크가 끊기면 새 반환을 만들지 않고 현재 claim/handoff 상태부터 재조회한다.
- 성공 페이지에는 반환 완료와 보상 처리 상태를 별개로 표시한다. 지급이 아직 대기이면 “보상 지급 완료”로 표현하지 않는다.

### 4.8 내 활동·보상·프로필

- 내 활동은 찾기 요청·등록 습득물·소유권 확인 요청을 구분한다. 뱃지는 공통 상태 표시 컴포넌트를 사용한다.
- 보상은 반환 건, 3,500원, 생성 시각, 지급 대기/완료/실패 상태를 표시한다. 프런트에서 반환 횟수로 현금 잔액을 추정하지 않는다.
- 데모 잔액이나 demo 지급 완료에는 눈에 띄는 “모의 데이터 · 실제 지급 아님” 라벨을 유지한다.
- 지급계정 등록 CTA는 `POST /me/payout-account/onboarding`의 공급자 hosted onboarding URL로 연결한다. 원시 계좌번호·주민등록번호·providerAccountToken 수동 입력 폼을 만들지 않는다. `capabilities.payouts`가 미지원이거나 503이면 등록 불가 사유와 지급 대기를 안내한다.
- 프로필은 GET /me의 실제 정보와 닉네임을 읽기 전용으로 표시한다. 프로필 수정 API가 없으므로 편집 버튼을 만들지 않는다. 서버에 없는 평가점수·신뢰등급·누적 실적을 꾸며 넣지 않는다.
- 로그아웃 시 서버 캐시·반환코드·개인 초안을 정리하고 공개 홈으로 이동한다.

## 5. 디자인 시스템

기존 Lumina 브랜드를 우선 확인하고 아래를 기본 구현안으로 사용한다. 브랜딩이 충돌하면 하나의 토큰 집합으로 통합한다.

| 토큰 | 기본값 | 용도 |
|---|---|---|
| primary | `#4338CA` | 주요 버튼, 선택 상태 |
| primary-hover | `#3730A3` | hover/active |
| text-primary | `#111827` | 본문 제목 |
| text-secondary | `#4B5563` | 보조 본문 |
| background | `#F8FAFC` | 페이지 배경 |
| surface | `#FFFFFF` | 카드, 모달 |
| border | `#CBD5E1` | 필드와 구분선 |
| success | `#166534` | 완료 텍스트 |
| warning | `#92400E` | 대기·주의 텍스트 |
| danger | `#B91C1C` | 오류·파괴 행동 |
| radius-card | `16px` | 카드 |
| radius-control | `10px` | 버튼·입력 |
| spacing | `4/8/12/16/24/32/48px` | 일관된 레이아웃 |

- 폰트는 시스템 한글 sans-serif를 기본으로 사용한다. 유료/원격 폰트 필수 의존을 만들지 않는다.
- 본문 16px, 모바일 입력 16px 이상, 보조 14px, 주요 제목 28~36px를 기준으로 한다.
- 터치 타깃은 최소 44×44px. 카드 전체 클릭과 내부 버튼 클릭이 중복 실행되지 않게 한다.
- 단일 폼 최대 폭 640px, 콘텐츠 최대 폭 약 1200px. 모바일 하단 navigation과 sticky CTA가 콘텐츠를 가리지 않도록 safe-area 패딩을 반영한다.
- 색상만으로 상태를 구분하지 않는다. 텍스트와 아이콘을 함께 사용한다. 실제 대비는 렌더 결과에서 검증한다.
- 애니메이션은 짧고 목적 있는 전환에 한정하며 `prefers-reduced-motion`을 지원한다.

## 6. 컴포넌트와 모듈 구조

원본 파일을 무조건 삭제하지 말고 책임을 아래처럼 분리한다. 기존 폴더 관례를 유지할 수 있으나 거대 App 컴포넌트에 로직을 추가하지 않는다.

```text
src/ 또는 기존 루트 관례/
  app/                 # Router, providers, protected layout
  pages/               # Route entry components
  features/
    auth/              # Firebase identity adapter, login
    found-items/       # Chat intake, draft preview, editor
    lost-searches/     # Intake, search dashboard, cancellation
    matching/          # Candidate cards and detail
    payments/          # Checkout, return verification
    claims/            # Ownership request and approval
    handoffs/          # Claimant display and finder consume
    rewards/           # Reward history
  components/ui/       # Button, Field, Dialog, Badge, Skeleton
  components/layout/   # Navbar, BottomNav, PageShell
  services/            # API client, auth token bridge, upload
  contracts/           # Contract-aligned types/schema
  mocks/               # MSW handlers and deterministic fixtures
  lib/                 # Date/money formatting, query keys
  styles/              # Compiled Tailwind and tokens
  tests/               # Integration + E2E support
```

필수 공통 컴포넌트: `Amount`, `StatusBadge`, `AsyncBoundary`, `ErrorPanel`, `EmptyState`, `ProtectedRoute`, `PermissionDenied`, `ImageUploader`, `LocationInput`, `ChatIntake`, `DraftReview`, `SimilarityIndicator`, `LockedPickupInfo`, `PaymentSummary`, `HandoffCode`, `DemoBanner`.

기존 컴포넌트 대응:

- `Dashboard` → 공개 탐색과 내 활동을 각각 분리.
- `ItemCard` → 공개 DTO 기반 카드, 내부 비공개 필드 제거.
- `MapContainer` → 장소 입력/공개 근사 위치/승인된 수령 위치를 prop 타입으로 구분.
- `Messenger` → 채팅형 폼 경험에 재사용 가능. 실시간 P2P 채팅 백엔드가 있다고 가정하지 않는다.
- `ReportForm` → found/lost 타입을 판별 가능한 union으로 분리.
- `SherlockAgent` → 서버 매칭 상태 UI로 전환. 브라우저 AI 직접 호출 제거.
- `ProfileModal` → 접근 가능한 Dialog 또는 `/profile` 화면.

## 7. API 연동과 클라이언트 상태 규칙

### API client

- 공통 계약의 `/api/v1` 경로·메서드·요청 DTO·응답 DTO·오류 envelope를 정확히 따른다. 화면 이름으로 새 API를 추측하지 않는다.
- `VITE_API_BASE_URL`은 공개 서버 주소만 담는다. 신원 토큰은 Firebase Auth에서 필요 시 얻어 계약상의 헤더로 전달한다.
- JSON·업로드·결제 복귀 요청을 책임별로 분리하되 오류 변환은 공통화한다.
- HTTP 오류 status, 계약 error code, user-facing message, requestId를 보존한다. 서버 stack trace는 사용자에게 노출하지 않는다.
- 401은 토큰 갱신 후 허용된 방식으로 최대 한 번 재시도한다. 실패하면 재로그인 유도. mutation을 무조건 재전송하지 않는다.
- 403은 권한 없음, 404는 없음/접근 불가, 409는 상태 충돌 후 재조회, 400 VALIDATION_ERROR는 필드 오류, 422 CODE_INVALID는 반환코드 오류, 429는 재시도 가능 시각, 5xx는 일시 오류를 표시한다. 실제 status 매핑은 계약이 우선한다.
- 재시도는 조회에 제한적으로 적용한다. 결제·환불·claim 승인·반환 consume mutation을 query retry로 반복하지 않는다.
- 계약에서 요구하는 idempotency key는 논리적 시도마다 한 번 만들고 네트워크 불확실 재시도에서는 재사용한다. 새 버튼 클릭마다 무조건 새 키를 발급하지 않는다.

### 상태 소유권

- 서버 상태: 사용자 리소스, 공개 아이템, 찾기 요청, 후보, 결제, 소유권 승인, 반환, 보상은 TanStack Query.
- 클라이언트 상태: 현재 폼 단계, 모달 열림, 필터 표시, 입력 중 값은 component/form state.
- 결제 상태·보상 금액·승인 여부를 localStorage source of truth로 사용하지 않는다.
- query key에 사용자 id와 리소스 id를 포함해 계정 전환 시 교차 노출을 막는다.
- 공개 목록과 비공개 상세를 같은 cache key로 저장하지 않는다.
- mutation 성공 후 연관된 항목·찾기 요청·claim·활동·보상만 invalidation한다. 데이터가 필요한 권한 축소/로그아웃 때는 캐시를 즉시 제거한다.
- 결제 성공·승인·반환 성공에 optimistic update를 사용하지 않는다. 서버 성공 전 완료 배지를 표시하지 않는다.

### 폴링

- searches/matches/claims/handoffs/payments는 화면이 활성일 때 5초 간격으로 조회한다. analyses는 2초 간격, 최대 60초 후 처리 중 안내로 전환한다. 계약의 retry 힌트가 있으면 따른다.
- 결제 복귀 pending도 기본 5초 간격을 사용한다. 오류에는 backoff를 적용하고 장기 대기에는 확인 대기 안내와 수동 재조회를 제공한다.
- 탭이 숨겨져 있거나 offline이면 폴링 중단/완화. 화면 unmount 시 종료한다.
- terminal 상태는 폴링을 멈춘다. 재진입·window focus에서는 적절히 갱신한다.
- 클라이언트 폴링이 서버의 검색 시작·만료·환불 작업을 실행하도록 만들지 않는다.
- 오래된 응답이 최신 응답을 덮어쓰지 않도록 라이브러리 cancellation/query key를 사용한다.

## 8. 업로드·지도·폼 검증

### 업로드

- 허용 mime/확장자/용량/개수 검증은 UX 보조다. 서버 검증을 대체하지 않는다.
- object URL은 교체·삭제·unmount 시 revoke한다. 파일 선택 취소는 기존 사진을 지우지 않는다.
- 업로드 중 제출 차단, 실패 파일 재시도, 삭제를 제공한다.
- 원본 파일명이나 사용자 제공 문자열을 HTML로 삽입하지 않는다.
- 공개 이미지에서 식별 특징을 가려야 하는 정책은 공통 계약에 따라 안내하고 서버가 정제해 준 URL만 사용한다.
- 브라우저 압축/회전 처리로 검증을 우회하거나 위치 EXIF가 공개되어도 괜찮다고 가정하지 않는다.

### 위치

- 사용자가 “현재 위치 사용”을 눌렀을 때만 위치 권한 요청.
- 권한 거절, 위치 timeout, 지도 스크립트 실패, 키 없음에 각각 텍스트 fallback 제공.
- 좌표만으로 정확한 주소가 확정되었다고 표현하지 않는다. 사용자가 장소를 검토·수정한다.
- 공개 아이템 지도는 서버의 coarse location만 사용한다. 실제 보관 장소는 승인 후의 전용 응답에서만 읽는다.
- 장소 입력 fallback이 API 필수 좌표를 채울 수 없는 경우에는 수동 좌표/서버 검색 등 계약에 정의된 대안을 사용한다. 임의의 서울 좌표를 저장하지 않는다.

### 폼

- trim 이후 필수 검증, 계약의 문자열 최대 길이, 날짜 범위, 위치 필드, 사진 조건을 동일하게 적용.
- 각 필드에 영구 label, 에러 설명 id, `aria-invalid`, `aria-describedby` 제공.
- 서버 validation 오류를 해당 필드에 매핑하고 매핑 불가 오류는 폼 상단에 표시.
- 처음 실패 필드로 focus 이동. 단계 이전 이동 시 입력 보존.
- 개인정보가 포함된 초안은 기본 메모리 보관. 영속 보관이 필요하면 별도 동의·TTL·계정 scope를 설계하고 기본 구현에는 민감 필드를 저장하지 않는다.

## 9. 모든 비동기 상태의 의무 처리

| 상태 | 의무 UX |
|---|---|
| initial loading | 화면 구조 skeleton, 중복 submit 차단 |
| empty | 무엇이 없는지 + 가능한 다음 행동 |
| error | 실패 의미, 입력 보존, 안전한 retry |
| denied | 권한 설명, 이전 화면/내 활동 링크 |
| stale/conflict | 다른 기기/요청에서 변경됨 안내, 최신값 재조회 |
| success | 서버 결과 요약, 다음 행동 |
| offline | 온라인 연결 필요 안내, 완료로 가장하지 않음 |
| pending long | 처리 중과 실패 구별, 수동 확인 경로 |
| partial failure | 사진/AI/결제 등 실패한 단계만 명시 |

목록 조회 오류를 빈 배열로 catch하거나, AI 오류를 예시 텍스트 성공으로 반환하거나, 결제 timeout을 결제 실패 확정으로 바꾸지 않는다. 알 수 없는 enum은 crash 대신 “상태 확인 필요”와 재조회 동작을 표시하고 개발 로그에 안전한 식별자만 남긴다.

## 10. 접근성·보안·사용성

- 키보드만으로 등록, 결제 전 확인, claim, 코드 입력을 완료할 수 있어야 한다.
- Dialog에 title, focus trap, 닫기, 원래 trigger로 focus 복귀를 구현한다. 처리 중 닫기 제한은 명확히 안내한다.
- route 변경 시 페이지 제목과 main focus를 갱신한다. 채팅 새 메시지는 적절한 `aria-live`로 읽되 전체 대화를 매번 다시 읽지 않는다.
- toast만으로 결제/반환 결과를 전달하지 않는다. 결과는 화면에도 남긴다.
- 사용자 설명과 AI 텍스트는 일반 텍스트로 렌더링한다. `dangerouslySetInnerHTML`로 표시하지 않는다.
- 클라이언트에 공급자 secret, Firebase Admin key, webhook secret을 넣지 않는다. Firebase 공개 설정과 서버 비밀 설정을 구분한다.
- 인증 토큰·개인 장소·소유권 답변·인증코드를 console, telemetry, URL에 기록하지 않는다.
- 외부 링크에는 적절한 보안 속성을 사용하고 결제 redirect는 서버가 관리한 공급자 목적지만 허용한다.
- 개인정보 보호는 CSS 숨김으로 구현하지 않는다. 승인 전 네트워크 응답/캐시/DOM에도 해당 필드가 없어야 한다.

## 11. 데모 모드와 테스트 fixture

### 명시적 모드

- `VITE_APP_MODE=demo|live` 등 명시적 설정을 사용하며 실제 값·서버 호환은 공통 계약을 따른다.
- demo는 화면 상단에 지속적인 배너를 표시한다. 결제·환불·지급 화면에도 “실제 금전 이동 없음”을 표시한다.
- live에서 네트워크 오류나 자격 증명 오류가 나면 demo로 자동 전환하지 않는다.
- 서버 demo adapter와 통합할 때 FE는 실제 API를 호출한다. MSW는 FE 독립 개발/자동화 테스트용으로 분리한다.
- live 배포 bundle에서 MSW worker 자동 등록을 차단한다.
- 테스트 사용자 계정은 분실자 A, 습득자 B, 무관한 C로 분리한다. 비공개 데이터 검증은 C와 로그아웃 상태에서도 수행한다.

### 필수 MSW 시나리오

1. 공개 아이템 여러 건과 empty 목록.
2. 사진 없는 분실 요청, 사진 있는 습득물 초안.
3. 업로드 실패/재시도, AI 지연/실패/수동 작성.
4. 결제 대기→검증 성공, 취소, 실패, 검증 지연, 이미 처리된 결제.
5. 검색 중 후보 없음→후보 추가, 유사도가 낮은 후보.
6. 소유권 대기→승인/거절, 타인 접근 403/404.
7. 승인 전 응답에 정확한 위치·연락처 없음.
8. 올바른 반환코드, 틀린 코드, 만료, 재사용, 요청 제한.
9. 반환 완료+보상 대기, 보상 지급 실패, 환불 대기/완료/실패.
10. 로그인 만료, offline, 상태 충돌, 느린 응답.

fixture는 계약의 enum과 DTO를 타입검사한다. 존재하지 않는 상태를 FE 테스트만 통과시키려고 만들지 않는다. 시간 의존 fixture는 고정 clock으로 재현 가능하게 구성한다.

## 12. 검증 계획

### 최소 단위·통합 테스트

- 금액/일시 포맷, 역할별 다음 행동, 서버 오류 필드 매핑.
- 습득 사진 필수와 분실 사진 선택 규칙.
- AI 초안 편집 후 최종 확인을 해야 게시되는 동작.
- 승인 전 수령 정보가 렌더되지 않는 동작.
- return query만으로 성공 UI가 나타나지 않는 동작.
- 로그아웃/계정 전환 시 캐시 제거.

### Playwright E2E 필수 경로

1. B 로그인 → 습득 사진/장소/설명 → AI 초안 수정 → 등록.
2. A 로그인 → 사진 없이 분실 정보 → 요금 확인 → 모의 결제 → 서버 검증된 탐색 상태.
3. A 후보 확인 → 소유권 요청 → 승인 대기에서 주소 잠금 확인.
4. B 요청 검토 → 승인 → A에 수령 안내 표시.
5. A 코드 발급/표시 → B 코드 consume → 양측 반환 완료.
6. B 보상 3,500원과 지급 상태 확인; 1,500원은 운영 수수료로 표시.
7. 미반환 취소/만료 fixture → 환불 대기/완료 UI.
8. C가 A/B 보호 URL 접근 → 정보 노출 없이 거절.
9. 지도 권한 거절/지도 키 없음에도 등록 폼 진행.
10. 결제 복귀 새로고침/중복 반환 클릭/오래된 claim 상태 충돌에서 중복 성공을 만들지 않음.

MSW 기반 E2E는 FE 동작 증명이다. 전체 서비스 완료를 주장하려면 BE demo adapter와 연결한 위 정상 경로를 별도로 최소 한 번 실행하고 구분해 보고한다. 실제 결제 공급자 live 승인/실제 지급 검증을 demo 결과로 주장하지 않는다.

### 품질 게이트

- 패키지 설치, TypeScript 검사, lint, 단위/통합 테스트, production build 통과.
- 모바일/데스크톱 주요 화면의 screenshot을 확인하고 잘림·중첩·overflow를 수정한다.
- 가능하면 axe 등 자동 접근성 검사를 실행하고 핵심 흐름의 키보드 검증을 병행한다.
- 민감 필드와 AI secret이 production bundle에 없는지 정적으로 확인한다.
- 존재하지 않는 화면·API·환경변수에 연결된 버튼을 남기지 않는다. 준비되지 않은 외부 연동은 명시적으로 상태를 표시한다.

## 13. 구현 순서와 협업 방식

1. **저장소 감사**: 원본 버전, AGENTS, 실행 도구, 기존 서비스 직접 접근, routing, styles를 확인하고 변경 범위를 기록.
2. **공통 계약 잠금**: 금액·enum·DTO·API·오류·인증·demo/live 규칙을 읽고 FE 타입과 query key를 생성.
3. **기반**: router, providers, auth adapter, API client, local Tailwind, tokens, 공통 상태 UI.
4. **독립 개발 준비**: 계약과 동일한 MSW fixture, 역할별 테스트 로그인, demo 배너.
5. **입력**: 공개 목록/상세, found/lost 채팅형 입력, 업로드, AI 초안 확인, 위치 fallback.
6. **결제와 탐색**: checkout, return 서버 검증, 요청 대시보드, 후보, 취소/환불 UI.
7. **반환과 보상**: 소유권 검토/승인, 승인 후 장소, 코드 표시/consume, 활동/보상.
8. **실제 BE 연동**: MSW를 끄고 BE demo 모드와 계약을 대조. 차이는 문서화하고 담당 에이전트와 해결.
9. **품질 검증**: 빌드·테스트·주요 화면 렌더 확인·접근성·민감 정보 점검.
10. **인수 문서**: 실행 명령, 환경변수 예시, 실제 완료 범위, demo/live 차이, 알려진 외부 준비사항과 검증 결과.

BE 준비를 기다리며 UI 구현을 멈추지 않는다. 계약 기반 MSW로 진행하고 실제 통합을 마지막에 반드시 수행한다. 계약에 없는 엔드포인트가 필요하면 목적과 최소 DTO를 제안하며 기존 서버 파일을 무단 수정하지 않는다.

## 14. 완료 정의

다음을 모두 만족해야 “FE 완료”다.

- [ ] URL 직접 접근·새로고침·뒤로 가기가 동작한다.
- [ ] 사용자가 역할 고정 없이 습득/분실 흐름을 모두 사용할 수 있다.
- [ ] found 사진 필수, lost 사진 선택이며 AI 초안 확인 단계를 거친다.
- [ ] 5,000원 요청비와 3,500원/1,500원 배분이 일관되고 서버 값과 일치한다.
- [ ] 서버 결제 검증 전 탐색 성공 UI가 나오지 않는다.
- [ ] 승인 전 정확한 장소·연락처·비공개 특징이 응답/DOM에 노출되지 않는다.
- [ ] 분실자 코드 제시·습득자 consume 역할이 정확하다.
- [ ] 반환 완료와 보상 지급 완료를 분리한다.
- [ ] 취소/만료·환불 상태와 모든 비동기 상태를 처리한다.
- [ ] API 실패를 demo 성공으로 위장하지 않는다.
- [ ] browser AI secret 및 도메인 Firebase 직접 접근이 제거된다.
- [ ] 모바일·접근성·타인 URL 접근·중복 처리 E2E를 확인한다.
- [ ] production build와 필수 테스트가 통과하고 결과가 기록된다.
- [ ] BE demo 연동 확인 또는 구체적인 통합 차단 원인을 보고한다.

## 15. 복사하여 FE 에이전트에게 전달할 실행 프롬프트

```text
당신은 Lumina 프런트엔드 구현 담당 에이전트다. PRODUCT_CONTRACT.md와 FE_MASTER.md를 읽고, 현재 저장소를 확인한 다음 React/TypeScript/Vite 기반 웹 앱을 실제 구현·실행·검증하라. BE_MASTER.md는 연동 맥락을 확인하는 용도로 읽어라.

제품은 분실자가 5,000원 찾기 요청비를 결제하고 반환 확인 후 3,500원을 습득자 보상, 1,500원을 Lumina 매칭·운영 수수료로 배분하는 AI 매칭 중개 서비스다. 사례금 게시 서비스로 변경하지 마라. 공통 계약을 모든 API·상태·금액·권한의 단일 기준으로 사용하라.

기존 React 프로젝트와 컴포넌트를 활용하고 라우팅·API client·인증·채팅형 입력·AI 초안 확인·결제 복귀 서버 검증·탐색 후보·소유권 검토·승인 후 장소 공개·반환코드·보상/환불 상태까지 연결하라. 분실자가 코드를 보여 주고 습득자가 consume한다. 브라우저에서 AI secret 또는 도메인 Firebase 직접 접근을 사용하지 마라.

BE 구현 파일은 수정하지 말고 API 계약을 통해 연동하라. BE가 준비되기 전에는 타입이 일치하는 MSW fixture로 진행하되 demo를 명확히 표시하라. live 오류를 mock 성공으로 바꾸지 마라. UI만 완성하거나 계획만 제시하고 종료하지 말고 필수 테스트·production build·모바일 렌더 확인까지 수행하라.

최종 보고에 변경 범위, 실행 명령, 환경변수, 통과한 검증, BE demo 실제 연동 여부, 외부 자격 증명 때문에 미검증인 부분을 구분하라. 실제 공급자 결제/지급을 검증하지 않았다면 완료했다고 주장하지 마라.
```


## 16. 확정 계약의 화면별 API 연결표

아래 경로에는 `/api/v1` prefix를 붙인다. 웹 라우트와 API 라우트를 혼동하지 않는다. 타입은 BE 소유 `shared/openapi.yaml`에서 생성하고 수동 복제 타입을 계속 유지하지 않는다.

| FE 기능 | 사용 API | 중요한 제약 |
|---|---|---|
| 앱 bootstrap | GET /config, 인증 시 GET /me | mode·pricing·168시간·termsVersion·capabilities를 실제 응답으로 사용 |
| 공개 탐색 | GET /found-items?category=&query=&cursor= | cursor 기본 20/최대 50, 아직 지원되지 않은 위치·시각 서버 필터를 만들지 않음 |
| 공개/내 상세 | GET /found-items/:id | public/owner union을 판별하여 렌더; owner private payload를 public 캐시에 저장하지 않음 |
| 사진/초안 | POST /uploads → POST /analyses → GET /analyses/:id | 개별 파일 multipart, 분석 202를 완료로 취급하지 않음 |
| 습득물 게시 | POST /found-items → POST /found-items/:id/publish | 먼저 DRAFT 생성 후 version을 포함해 게시 |
| 습득물 수정/보관 종료 | PATCH /found-items/:id, POST /found-items/:id/archive | 수정 시 version, RESERVED/RETURNED에서는 허용되지 않는 버튼 숨김 |
| 분실 요청 | POST /search-requests, PATCH /search-requests/:id | 수정은 DRAFT만; 사진 0..3장 |
| 결제 | POST /search-requests/:id/checkout | 동의한 termsVersion 전달, 가격은 서버가 정함 |
| 실결제 복귀 | POST /payments/:id/confirm → GET /payments/:id | providerPaymentKey를 서버 검증에 전달; query 성공값 신뢰 금지 |
| 모의결제 | POST /demo/payments/:id/succeed | config mode=demo일 때만 명확한 모의결제 CTA; live에서는 호출·노출 금지 |
| 진행/후보 | GET /search-requests/:id, GET /search-requests/:id/matches | 결제된 활성 요청만 후보 조회 가능 |
| 취소 | POST /search-requests/:id/cancel | version, reason; 미결제 취소에는 환불액 표시 금지 |
| 소유권 | POST /claims, GET /claims/:id | evidenceText 10..1000자; 자기 found 요청 불가 |
| 습득자 결정 | POST /claims/:id/approve 또는 /reject | 거절 reason; 충돌 시 최신 상태 조회 |
| 반환 화면 복원 | GET /claims/:id → claim.handoffId → GET /handoffs/:id | 새로고침 뒤에도 handoff id를 복원; client state에만 의존하지 않음 |
| 코드 표시 | POST /handoffs/:id/code | 해당 seeker만, no-store 응답을 query cache에 영속 저장하지 않음 |
| 코드 소비 | POST /handoffs/:id/complete | 해당 finder만; token/manualCode 정확히 하나 |
| 활동/보상 | GET /me/found-items, /me/search-requests, /me/claims, /me/payouts | claims role=seeker/finder, 목록 cursor 유지 |
| 지급계정 등록 | POST /me/payout-account/onboarding | hosted URL 이동; 지원되지 않으면 안내, 수동 token 입력 금지 |
| 알림 | GET /notifications, POST /notifications/:id/read | 알림 클릭 시 해당 리소스 조회 후 권한 확인 |
| 부적절한 등록 신고 | POST /reports | 로그인 후 resourceType/resourceId/reason; 유효성 검사 및 접수 상태 |

관리자 보고서·지급/환불 retry와 공급자 webhook은 일반 사용자 FE 메뉴에 노출하지 않는다. MVP에서 운영자 웹 콘솔은 별도 확장 범위이며 서버 운영 절차를 일반 사용자 권한으로 흉내 내지 않는다.

### 정확한 필드 검증

- title 2..80자, description 5..1000자, evidenceText 10..1000자.
- privateFeatures 최대 1000자, pickupInstructions 5..500자.
- found 사진 1..3장, lost 0..3장, jpg/png/webp, 장당 최대 10MB.
- 발생 시각은 현재 기준 5분 초과 미래 금지. 최종 판단은 서버.
- 위도 -90..90, 경도 -180..180, 캠퍼스 경계 검증. demo 캠퍼스는 가상 장소로 명시한다.
- 업로드 사진은 본인이 소유하고 서버 검사가 끝난 photoId만 연결한다.
- AI에서 없는 필드는 사용자가 확인할 때까지 미확정으로 남긴다. 발생 시각/장소를 AI가 추정한 값을 묵시적으로 저장하지 않는다.

### 상태 표시 사전

| 도메인 | 서버 enum → 사용자 표시 |
|---|---|
| Found | DRAFT 초안 / AVAILABLE 습득물 등록 / RESERVED 수령 준비 / RETURNED 반환 완료 / ARCHIVED 보관 종료 |
| Search | DRAFT 초안 / AWAITING_PAYMENT 결제 대기 / SEARCHING 탐색 중 / CLAIM_PENDING 소유권 확인 중 / HANDOFF_READY 수령 준비 / RETURNED 반환 완료 / CANCELLED 취소됨 / EXPIRED 탐색 기간 종료 |
| Payment | CREATED 결제 준비 / PENDING 결제 확인 중 / PAID 결제 완료 / FAILED 결제 실패 / REFUND_PENDING 환불 처리 중 / REFUNDED 환불 완료 |
| Claim | PENDING 검토 대기 / APPROVED 승인 / REJECTED 거절 / CANCELLED 취소 / COMPLETED 반환 완료 |
| Handoff | READY 반환 준비 / COMPLETED 반환 완료 / CANCELLED 취소 |
| Payout | PENDING 지급 대기 / PROCESSING 지급 처리 중 / PAID 지급 완료 / FAILED 지급 실패 / ON_HOLD 지급 보류 |
| Analysis | QUEUED 분석 대기 / PROCESSING 분석 중 / SUCCEEDED 초안 준비 / FAILED 분석 실패 |

REFUND_FAILED라는 Payment enum을 새로 만들지 않는다. 환불 처리 실패·지연은 REFUND_PENDING을 유지하는 시나리오이며, Payment.refundErrorCode가 있으면 허용된 안전한 문구로 환불 지연/실패 상황을 설명하고 refundRetryable을 참고한다. 이 값이 없으면 단순히 “환불 처리 중”으로 표시한다. 사용자에게 관리자 전용 재시도 API를 호출시키지 않는다. 데이터 없이 실패 사유를 추정하지 않는다.

CLAIM_PENDING/HANDOFF_READY에서도 7일 만료는 연장되지 않는다. 검색이 CANCELLED/EXPIRED이면 코드 표시·발급/consume 동작을 중단하고 최신 claim/handoff를 조회한다. 승인 전 지도는 정밀 좌표를 반환받지 않으므로 공개 placeLabel을 표시하는 목록/텍스트 형태가 기본이다.

코드는 TTL 5분이고 재발급하면 이전 코드가 무효다. 실패 5회/15분 제한은 서버가 집행하며 UI는 RATE_LIMITED 상태에서 재시도를 안내한다. 실패 횟수를 브라우저 state만으로 계산해 서버 제한을 대체하지 않는다.

### 공통 fixture 이름

UI 테스트·MSW·BE 통합 보고에는 `PRODUCT_CONTRACT.md` 섹션 10과 동일한 식별자를 쓴다. BE가 생성한 `shared/fixtures/demo-manifest.json`의 사용자·아이템 UUID를 소비한다.

- F01_RETURN_SUCCESS: 전체 반환과 3,500원 보상 성공.
- F02_NO_MATCH: 관련 없는 물건 사이에 가짜 후보 없음.
- F03_NO_PHOTO: 분실 사진 없이 검색 진행.
- F04_AI_FAILURE: 수동 초안 복구.
- F05_PAYMENT_FAILURE: 탐색 활성화 금지.
- F06_DOUBLE_CLAIM: 다른 요청 승인으로 현재 UI 상태가 변경됨.
- F07_CODE_REPLAY: 반환 요청 재전송에도 추가 완료/배분 없음.
- F08_EXPIRED: 7일 만료, 코드 무효, 환불 상태.
- F09_PAYOUT_TIMEOUT: 반환은 완료, 지급은 확인 후 완료.
- F10_CANCEL_LATE_PAID: 취소 후 늦은 결제 성공이 탐색을 되살리지 않음.
- F11_PRIVATE_ACCESS: 타인 접근 404와 공개 필드 제한.
- F12_REFUND_RETRY: 환불 처리 중 상태 유지 후 완료.

### 실행 설정과 인수 산출물

- FE 개발 port 3000, BE port 3001, `/api/v1` 개발 proxy를 설정한다. production에서는 새로고침 라우팅 fallback과 API origin을 분리한다.
- `.env.example`에는 공개 FE 설정만 넣는다. `VITE_API_BASE_URL`, `VITE_APP_MODE`, Firebase 공개 설정, 지도 공개 토큰(지원될 때)을 설명한다. `GET /config.mode`와 로컬 mode가 다르면 구성 오류로 표시하고 금전 동작을 막는다.
- package scripts에 dev/build/typecheck/lint/test/test:e2e를 제공한다. 새 라이브러리 도입 전 기존 스크립트를 확인하고 정확한 실제 명령을 README에 기록한다.
- 인수 결과에는 변경 파일, 실행 명령, 성공한 테스트, 주요 화면 이미지, 접근성 확인, 공통 F01~F12 결과, 외부 연동 준비사항을 포함한다.
- root package/lock/vite 설정은 FE가 소유하고 server/package.json은 BE가 소유한다. BE의 OpenAPI 변경을 알게 되면 생성 타입과 fixture를 재생성하고 계약 검증을 다시 수행한다.

