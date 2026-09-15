import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import {
  MAX_MESSAGE,
  PAGE_SIZE,
  type Entry,
  type EntryView,
} from "./guestbook-shared";

export { isSupabaseConfigured };

/** 방명록 글을 고칠 때 쓰는 1회용 토큰. 서버에는 해시만 남는다. */
export type EditToken = { id: string; token: string };

/** DB 에 저장되는 값. 원본 토큰은 방문자 브라우저에만 남는다. */
function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function client() {
  const sb = getSupabase();
  if (!sb) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. .env.example을 참고해 .env.local을 만들어 주세요.",
    );
  }
  return sb;
}

/** 공개 목록. RLS 가 삭제된 글을 걸러낸다. */
export async function listEntries(): Promise<EntryView[]> {
  const { data, error } = await client()
    .from("guestbook")
    .select("id, name, message, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (error) throw new Error(error.message);
  return (data ?? []).map(toView);
}

/** 새 글을 남기고, 작성자에게만 돌려줄 편집 토큰을 발급한다. */
export async function createEntry(
  name: string,
  message: string,
): Promise<EditToken> {
  const token = randomUUID();

  const { data, error } = await client()
    .from("guestbook")
    .insert({ name, message, edit_token_hash: hashToken(token) })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { id: data.id, token };
}

/**
 * 토큰이 맞을 때만 메시지를 고친다. 검증은 DB 함수 안에서 이루어지고,
 * anon 역할에는 UPDATE 정책 자체가 없어 직접 수정은 불가능하다.
 */
export async function updateEntry(
  id: string,
  token: string,
  message: string,
): Promise<void> {
  const { error } = await client().rpc("guestbook_update", {
    p_id: id,
    p_token: token,
    p_message: message,
  });
  if (error) throw new Error(translateRpcError(error.message));
}

/** 토큰이 맞을 때만 소프트 삭제한다. */
export async function deleteEntry(id: string, token: string): Promise<void> {
  const { error } = await client().rpc("guestbook_delete", {
    p_id: id,
    p_token: token,
  });
  if (error) throw new Error(translateRpcError(error.message));
}

function translateRpcError(message: string): string {
  if (message.includes("NOT_FOUND_OR_FORBIDDEN")) {
    return "이 글을 수정하거나 삭제할 권한이 없습니다. 이미 삭제된 글일 수도 있어요.";
  }
  if (message.includes("MESSAGE_LENGTH")) {
    return `메시지는 1~${MAX_MESSAGE}자로 입력해 주세요.`;
  }
  return message;
}

function toView(entry: Entry): EntryView {
  return { ...entry, relative: timeAgo(entry.created_at), edited: wasEdited(entry) };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

/** 작성 후 1분 넘게 지나 고쳐진 글에만 "수정됨"을 붙인다. */
function wasEdited(entry: Entry): boolean {
  return (
    new Date(entry.updated_at).getTime() - new Date(entry.created_at).getTime() >
    60_000
  );
}
