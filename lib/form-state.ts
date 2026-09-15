export type FormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  /** 작성에 성공했을 때만 채워진다. 작성자 브라우저에만 보관한다. */
  issued?: { id: string; token: string };
};

export const initialFormState: FormState = { status: "idle" };

export type MutationResult = { ok: true } | { ok: false; error: string };
