"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** 목록을 불러오지 못했을 때. 새로고침 없이 다시 시도할 수 있게 한다. */
export function GuestbookError({ message }: { message: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="gbEmpty" role="alert">
      <p className="small" style={{ marginBottom: "var(--s-2)" }}>
        방명록을 불러오지 못했습니다.
      </p>
      <p className="micro" style={{ textTransform: "none", letterSpacing: 0 }}>
        {message}
      </p>
      <button
        type="button"
        className="btn"
        style={{ marginTop: "var(--s-5)" }}
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        {pending ? "불러오는 중…" : "다시 시도"}
      </button>
    </div>
  );
}
