-- =============================================================================
-- 20260915120000_guestbook.sql
-- 김태연 포트폴리오 · 방명록 스키마
--
-- 실행 방법: Supabase Dashboard → SQL Editor 에 이 파일 전체를 붙여넣고 Run.
-- 여러 번 실행해도 안전하도록 전부 멱등(idempotent)하게 작성했습니다.
--
-- 설계 요약
--   · 이 사이트에서 사용자가 만들어내는 데이터는 방명록 하나뿐이므로 테이블도
--     하나다. 프로필 / 관심사 / 프로젝트 문구는 app/site.ts 의 정적 상수이고,
--     PRD 의 Non-goals(CMS 연동 없음)에 따라 DB 로 옮기지 않았다. 따라서 지금
--     단계에서 외래키 관계는 존재하지 않는다.
--   · 방문자는 로그인하지 않는다. 그래서 "내가 쓴 글"을 증명할 수단으로 작성
--     시점에 1회용 편집 토큰을 발급하고, 서버에는 그 SHA-256 해시만 남긴다.
--     토큰 원본은 방문자 브라우저(localStorage)에만 있다.
--   · anon 역할에는 SELECT / INSERT 만 연다. UPDATE / DELETE 정책은 만들지
--     않으므로 직접 수정·삭제는 불가능하고, 토큰을 검증하는 security definer
--     함수를 통해서만 변경할 수 있다.
--   · 삭제는 소프트 삭제(deleted_at)다. 행이 남아 있어야 잘못된 삭제를 되돌릴
--     수 있고, 공개 조회는 RLS 가 deleted_at IS NULL 로 걸러낸다.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. 테이블
-- -----------------------------------------------------------------------------
create table if not exists public.guestbook (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  message         text        not null,
  -- 편집 토큰의 SHA-256 hex. 원본 토큰은 어디에도 저장하지 않는다.
  edit_token_hash text        not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,

  constraint guestbook_name_len
    check (char_length(btrim(name)) between 1 and 20),
  constraint guestbook_message_len
    check (char_length(btrim(message)) between 1 and 200),
  constraint guestbook_token_hash_shape
    check (edit_token_hash ~ '^[0-9a-f]{64}$')
);

comment on table  public.guestbook is '방문자가 남기는 익명 방명록.';
comment on column public.guestbook.edit_token_hash is
  '작성자만 아는 편집 토큰의 SHA-256(hex). 원본은 저장하지 않는다.';
comment on column public.guestbook.deleted_at is
  '소프트 삭제 시각. NULL 인 행만 공개된다.';

-- 공개 목록은 항상 "삭제 안 된 글을 최신순으로" 읽으므로 부분 인덱스로 충분하다.
create index if not exists guestbook_feed_idx
  on public.guestbook (created_at desc)
  where deleted_at is null;


-- -----------------------------------------------------------------------------
-- 2. updated_at 자동 갱신
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_updated_at() from public;

drop trigger if exists guestbook_touch_updated_at on public.guestbook;
create trigger guestbook_touch_updated_at
  before update on public.guestbook
  for each row execute function public.touch_updated_at();


-- -----------------------------------------------------------------------------
-- 3. RLS 정책
-- -----------------------------------------------------------------------------
alter table public.guestbook enable row level security;

-- READ — 삭제되지 않은 글은 누구나 읽을 수 있다.
drop policy if exists "guestbook read public" on public.guestbook;
create policy "guestbook read public"
  on public.guestbook
  for select
  to anon, authenticated
  using (deleted_at is null);

-- CREATE — 누구나 새 글을 남길 수 있다. 삭제된 상태로는 만들 수 없다.
drop policy if exists "guestbook insert public" on public.guestbook;
create policy "guestbook insert public"
  on public.guestbook
  for insert
  to anon, authenticated
  with check (deleted_at is null);

-- UPDATE / DELETE 정책은 일부러 만들지 않는다.
-- RLS 가 켜져 있고 해당 정책이 없으므로 anon 의 직접 수정·삭제는 모두 거부된다.
-- 변경은 아래 4번의 함수를 통해서만 가능하다.
drop policy if exists "guestbook update public" on public.guestbook;
drop policy if exists "guestbook delete public" on public.guestbook;


-- -----------------------------------------------------------------------------
-- 4. 컬럼 단위 권한
--
-- RLS 는 "어떤 행"을 볼지 정할 뿐 "어떤 컬럼"인지는 가리지 못한다. Supabase 는
-- 기본적으로 테이블 전체 SELECT 를 주므로, 그대로 두면 anon 이 edit_token_hash
-- 와 deleted_at 까지 읽을 수 있다. 해시라 되돌릴 수는 없지만 내보낼 이유도 없다.
-- 테이블 단위 권한을 회수하고 공개해도 되는 컬럼만 다시 준다.
-- (테이블 단위 권한이 남아 있으면 컬럼 단위 REVOKE 는 효과가 없다.)
-- -----------------------------------------------------------------------------
revoke select on public.guestbook from anon, authenticated;

grant select (id, name, message, created_at, updated_at)
  on public.guestbook to anon, authenticated;

-- INSERT 는 그대로 둔다. 작성 시 edit_token_hash 를 넣어야 하기 때문이다.
grant insert (name, message, edit_token_hash)
  on public.guestbook to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 5. 토큰을 검증하는 수정 / 삭제 함수
--    security definer 로 RLS 를 우회하되, 편집 토큰이 맞을 때만 동작한다.
-- -----------------------------------------------------------------------------

-- 수정
create or replace function public.guestbook_update(
  p_id      uuid,
  p_token   text,
  p_message text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message text := btrim(coalesce(p_message, ''));
  v_row     public.guestbook;
begin
  if char_length(v_message) not between 1 and 200 then
    raise exception 'MESSAGE_LENGTH' using errcode = '22023';
  end if;

  update public.guestbook
     set message = v_message
   where id = p_id
     and deleted_at is null
     and edit_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
  returning * into v_row;

  if v_row.id is null then
    raise exception 'NOT_FOUND_OR_FORBIDDEN' using errcode = '42501';
  end if;

  -- edit_token_hash 는 돌려주지 않는다.
  return json_build_object(
    'id',         v_row.id,
    'name',       v_row.name,
    'message',    v_row.message,
    'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
end;
$$;

-- 삭제(소프트)
create or replace function public.guestbook_delete(
  p_id    uuid,
  p_token text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.guestbook
     set deleted_at = now()
   where id = p_id
     and deleted_at is null
     and edit_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
  returning id into v_id;

  if v_id is null then
    raise exception 'NOT_FOUND_OR_FORBIDDEN' using errcode = '42501';
  end if;

  return true;
end;
$$;

-- 실행 권한: 기본 PUBLIC 권한을 회수하고 필요한 역할에만 준다.
revoke all on function public.guestbook_update(uuid, text, text) from public;
revoke all on function public.guestbook_delete(uuid, text)        from public;

grant execute on function public.guestbook_update(uuid, text, text) to anon, authenticated;
grant execute on function public.guestbook_delete(uuid, text)        to anon, authenticated;
