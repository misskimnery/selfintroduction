"use client";

import { useSyncExternalStore } from "react";

/**
 * 방문자가 남긴 글의 편집 토큰 보관소.
 *
 * 로그인이 없는 방명록이라 "내가 쓴 글"을 증명할 수단이 필요하다. 작성 시 서버가
 * 발급한 토큰을 이 브라우저에만 저장해두고, 수정·삭제할 때 다시 서버로 보낸다.
 * 서버에는 토큰의 SHA-256 해시만 있으므로 여기서 지워지면 되돌릴 수 없다.
 *
 * localStorage 는 React 바깥의 상태라 useSyncExternalStore 로 구독한다. 덕분에
 * 글을 새로 남기면 목록이 곧바로 그 사실을 알게 된다.
 */

const KEY = "guestbook:tokens";

export type Tokens = Readonly<Record<string, string>>;

const EMPTY: Tokens = Object.freeze({});

/** getSnapshot 은 안정된 참조를 돌려줘야 해서 값을 캐시해 둔다. */
let cache: Tokens | null = null;
const listeners = new Set<() => void>();

function load(): Tokens {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY;
    return parsed as Tokens;
  } catch {
    // 사생활 보호 모드나 저장 공간 차단 — 소유한 글이 없는 것처럼 다룬다.
    return EMPTY;
  }
}

function persist(tokens: Tokens): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tokens));
  } catch {
    // 저장에 실패해도 글 자체는 이미 등록되었으므로 흐름을 막지 않는다.
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);

  // 다른 탭에서 남기거나 지운 글도 따라잡는다.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    cache = load();
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Tokens {
  cache ??= load();
  return cache;
}

/** 서버에서는 소유한 글이 없다고 본다 — 컨트롤은 하이드레이션 후에 나타난다. */
function getServerSnapshot(): Tokens {
  return EMPTY;
}

export function useOwnedTokens(): Tokens {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function rememberToken(id: string, token: string): void {
  cache = { ...getSnapshot(), [id]: token };
  persist(cache);
  emit();
}

export function forgetToken(id: string): void {
  const next = { ...getSnapshot() };
  delete next[id];
  cache = next;
  persist(cache);
  emit();
}
