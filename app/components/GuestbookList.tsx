"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { editGuestbook, removeGuestbook } from "../actions";
import { MAX_MESSAGE, type EntryView } from "@/lib/guestbook-shared";
import { forgetToken, useOwnedTokens } from "./ownedEntries";

type Mode = { kind: "idle" } | { kind: "editing"; draft: string } | { kind: "confirmDelete" };

export function GuestbookList({ entries }: { entries: EntryView[] }) {
  const router = useRouter();
  const owned = useOwnedTokens();
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setOpenId(null);
    setMode({ kind: "idle" });
    setError(null);
  }

  function saveEdit(id: string) {
    if (mode.kind !== "editing") return;
    const draft = mode.draft;
    const token = owned[id];
    if (!token) return;

    startTransition(async () => {
      const result = await editGuestbook(id, token, draft);
      if (result.ok) {
        reset();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function confirmDelete(id: string) {
    const token = owned[id];
    if (!token) return;

    startTransition(async () => {
      const result = await removeGuestbook(id, token);
      if (result.ok) {
        forgetToken(id);
        reset();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (entries.length === 0) {
    return (
      <div className="gbEmpty">
        <p className="serifKo" style={{ fontSize: "1.1rem" }}>
          아직 아무도 다녀가지 않았어요.
        </p>
        <p className="small" style={{ marginTop: "var(--s-2)" }}>
          첫 방문자가 되어주세요 🙌
        </p>
      </div>
    );
  }

  return (
    <ul className="gbList">
      {entries.map((entry) => {
        const isMine = Boolean(owned[entry.id]);
        const isOpen = openId === entry.id;
        const editing = isOpen && mode.kind === "editing";
        const confirming = isOpen && mode.kind === "confirmDelete";

        return (
          <li key={entry.id} className="gbItem" aria-busy={isOpen && pending}>
            <div className="gbItem__head">
              <span className="h4">{entry.name}</span>
              <span className="micro">
                {entry.relative}
                {entry.edited && " · 수정됨"}
              </span>
            </div>

            {editing ? (
              <>
                <textarea
                  className="textarea"
                  value={mode.draft}
                  maxLength={MAX_MESSAGE}
                  autoFocus
                  disabled={pending}
                  onChange={(e) => setMode({ kind: "editing", draft: e.target.value })}
                />
                <div className="field__row" style={{ marginTop: "var(--s-2)" }}>
                  <span className="micro">
                    {mode.draft.length} / {MAX_MESSAGE}
                  </span>
                </div>
              </>
            ) : (
              <p className="gbItem__msg">{entry.message}</p>
            )}

            {isOpen && error && (
              <p className="note note--err" role="alert" style={{ marginTop: "var(--s-3)" }}>
                {error}
              </p>
            )}

            {isMine && (
              <div className="gbItem__actions">
                {editing && (
                  <>
                    <button
                      type="button"
                      className="linkBtn linkBtn--strong"
                      disabled={pending}
                      onClick={() => saveEdit(entry.id)}
                    >
                      {pending ? "저장 중…" : "저장"}
                    </button>
                    <button
                      type="button"
                      className="linkBtn"
                      disabled={pending}
                      onClick={reset}
                    >
                      취소
                    </button>
                  </>
                )}

                {confirming && (
                  <>
                    <span className="micro">정말 지울까요?</span>
                    <button
                      type="button"
                      className="linkBtn linkBtn--danger"
                      disabled={pending}
                      onClick={() => confirmDelete(entry.id)}
                    >
                      {pending ? "지우는 중…" : "삭제"}
                    </button>
                    <button
                      type="button"
                      className="linkBtn"
                      disabled={pending}
                      onClick={reset}
                    >
                      취소
                    </button>
                  </>
                )}

                {!editing && !confirming && (
                  <>
                    <button
                      type="button"
                      className="linkBtn"
                      disabled={pending}
                      onClick={() => {
                        setError(null);
                        setOpenId(entry.id);
                        setMode({ kind: "editing", draft: entry.message });
                      }}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="linkBtn"
                      disabled={pending}
                      onClick={() => {
                        setError(null);
                        setOpenId(entry.id);
                        setMode({ kind: "confirmDelete" });
                      }}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
