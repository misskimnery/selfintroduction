# 김태연 — 포트폴리오 원페이지

Next.js 16 (App Router) + Supabase로 만든 1페이지 자기소개 사이트.
기획은 [docs/PRD.md](docs/PRD.md) 참고.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000

Supabase 환경변수가 없으면 방명록 자리에 설정 안내가 뜨고, 나머지 섹션은
정상적으로 보입니다.

## Supabase 연결

### 1. 프로젝트 만들기

[supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.

### 2. 스키마 적용

Dashboard → **SQL Editor** 에서
[`supabase/migrations/20260915120000_guestbook.sql`](supabase/migrations/20260915120000_guestbook.sql)
전체를 붙여넣고 Run 합니다. 테이블·인덱스·트리거·RLS 정책·RPC 함수가 한 번에
만들어지고, 여러 번 실행해도 안전합니다.

### 3. 환경변수

```bash
cp .env.example .env.local
```

[`.env.example`](.env.example)의 설명을 따라 값을 채우고 개발 서버를
재시작합니다. `.env.local`은 커밋되지 않습니다.

## 데이터 설계

이 사이트에서 방문자가 만들어내는 데이터는 **방명록 하나뿐**입니다. 이름·관심사·
프로젝트 문구는 [`app/site.ts`](app/site.ts)의 정적 상수이고, PRD의
Non-goals(CMS 연동 없음)에 따라 DB로 옮기지 않았습니다. 그래서 테이블도 하나이고
외래키 관계는 아직 없습니다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | 1–20자 (CHECK) |
| `message` | `text` | 1–200자 (CHECK) |
| `edit_token_hash` | `text` | 편집 토큰의 SHA-256 hex |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | 트리거로 자동 갱신 |
| `deleted_at` | `timestamptz` | 소프트 삭제. NULL인 행만 공개 |

### 로그인 없이 수정·삭제를 허용하는 방법

방명록은 익명입니다. 그래서 글을 남기면 서버가 1회용 **편집 토큰**을 발급하고,
DB에는 그 SHA-256 해시만 저장합니다. 토큰 원본은 방문자 브라우저의
`localStorage`에만 남아, 그 브라우저에서만 수정·삭제 버튼이 보입니다.

### RLS

| 동작 | 권한 |
|---|---|
| SELECT | `anon` 허용 — 단 `deleted_at IS NULL` 인 행만 |
| INSERT | `anon` 허용 |
| UPDATE | **정책 없음** → 직접 수정 불가 |
| DELETE | **정책 없음** → 직접 삭제 불가 |

수정·삭제는 `guestbook_update` / `guestbook_delete` RPC로만 가능합니다. 두 함수는
`security definer`라 RLS를 우회하지만, 편집 토큰 해시가 일치할 때만 동작하고
일치하지 않으면 예외를 던집니다. 그래서 남의 글은 손댈 수 없습니다.

`service_role` 키는 이 프로젝트에서 **사용하지 않습니다**. 클라이언트에 들어가는
키는 anon 키뿐이고, 그 키로 할 수 있는 일은 위 정책이 전부 결정합니다.

## 상태 처리

- **로딩** — 목록은 `<Suspense>` 경계 안에서 스트리밍되고, 그동안 스켈레톤이
  보입니다. 작성·수정·삭제 버튼은 처리 중에 비활성화되며 라벨이 바뀝니다.
- **빈 상태** — "첫 방문자가 되어주세요"
- **오류** — 조회 실패 시 사유와 함께 "다시 시도" 버튼, 작성·수정·삭제 실패 시
  해당 위치에 인라인 오류 문구
- **미설정** — 환경변수가 없으면 설정 안내로 대체

## 디자인 시스템

모든 색·타이포·간격·radius·shadow는 [`app/tokens.css`](app/tokens.css)의
CSS 변수 한 곳에 정의되어 있습니다. 컴포넌트 스타일
([`app/ui.css`](app/ui.css))은 토큰만 참조하므로, 팔레트를 바꾸려면
`tokens.css`의 값만 고치면 전체에 반영됩니다.

## 구조

```
app/
  tokens.css          디자인 토큰 (색 / 타이포 / 간격 / radius / shadow)
  globals.css         리셋 + 타이포 프리미티브
  ui.css              컴포넌트 스타일
  site.ts             페이지에 들어가는 텍스트 콘텐츠
  page.tsx            S1 Hero → S2 관심사 → S3 만들고 싶은 것 → S4 연락처
  actions.ts          방명록 Server Action (등록 / 수정 / 삭제)
  components/
    Guestbook.tsx     섹션 껍데기 + 미설정 안내
    GuestbookFeed.tsx 목록 조회 + 스켈레톤
    GuestbookList.tsx 목록 렌더 + 내 글 수정·삭제
    GuestbookForm.tsx 작성 폼
    GuestbookStates.tsx 오류 + 재시도
    ownedEntries.ts   편집 토큰 보관 (localStorage 외부 스토어)
lib/
  supabase.ts         Supabase 클라이언트 (미설정 시 null)
  guestbook.ts        서버 전용 데이터 접근
  guestbook-shared.ts 서버·클라이언트 공용 상수와 타입
  form-state.ts       폼 / 변경 결과 타입
supabase/migrations/  Dashboard SQL Editor에서 실행할 마이그레이션
```
