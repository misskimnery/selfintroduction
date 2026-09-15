"use server";

import { revalidatePath } from "next/cache";
import { createEntry, deleteEntry, updateEntry } from "@/lib/guestbook";
import { MAX_MESSAGE, MAX_NAME } from "@/lib/guestbook-shared";
// "use server" 모듈은 async 함수만 export 할 수 있어 상태 타입은 별도 파일에 둔다.
import type { FormState, MutationResult } from "@/lib/form-state";

function validate(name: string, message: string): string | null {
  if (!name || !message) return "이름과 메시지를 모두 입력해 주세요.";
  if (name.length > MAX_NAME) return `이름은 ${MAX_NAME}자 이내로 입력해 주세요.`;
  if (message.length > MAX_MESSAGE)
    return `메시지는 ${MAX_MESSAGE}자 이내로 입력해 주세요.`;
  return null;
}

function reason(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/** 등록 — 성공하면 작성자에게만 편집 토큰을 돌려준다. */
export async function submitGuestbook(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const invalid = validate(name, message);
  if (invalid) return { status: "error", message: invalid };

  try {
    const issued = await createEntry(name, message);
    revalidatePath("/");
    return {
      status: "ok",
      message: "방명록을 남겨주셔서 고맙습니다.",
      issued,
    };
  } catch (err) {
    return { status: "error", message: reason(err, "저장에 실패했습니다.") };
  }
}

/** 수정 — 편집 토큰을 아는 사람만 통과한다. */
export async function editGuestbook(
  id: string,
  token: string,
  message: string,
): Promise<MutationResult> {
  const trimmed = message.trim();
  if (!trimmed) return { ok: false, error: "메시지를 입력해 주세요." };
  if (trimmed.length > MAX_MESSAGE)
    return { ok: false, error: `메시지는 ${MAX_MESSAGE}자 이내로 입력해 주세요.` };

  try {
    await updateEntry(id, token, trimmed);
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: reason(err, "수정에 실패했습니다.") };
  }
}

/** 삭제 — 소프트 삭제라 DB 에는 행이 남는다. */
export async function removeGuestbook(
  id: string,
  token: string,
): Promise<MutationResult> {
  try {
    await deleteEntry(id, token);
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: reason(err, "삭제에 실패했습니다.") };
  }
}
