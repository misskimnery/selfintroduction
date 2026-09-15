"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitGuestbook } from "../actions";
import { initialFormState } from "@/lib/form-state";
import { MAX_MESSAGE, MAX_NAME } from "@/lib/guestbook-shared";
import { rememberToken } from "./ownedEntries";
import { Arrow } from "./Arrow";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--solid" type="submit" disabled={pending}>
      {pending ? "남기는 중…" : "방명록 남기기"}
      {!pending && <Arrow />}
    </button>
  );
}

/**
 * 입력 필드는 따로 떼어 두고, 작성에 성공할 때마다 key 를 바꿔 통째로 새로
 * 마운트한다. 이렇게 하면 입력값과 글자 수가 부수효과 없이 함께 비워진다.
 */
function Fields() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="field">
        <label htmlFor="gb-name">이름</label>
        <input
          id="gb-name"
          name="name"
          className="input"
          maxLength={MAX_NAME}
          placeholder="어떻게 불러드릴까요?"
          required
        />
      </div>

      <div className="field">
        <div className="field__row">
          <label htmlFor="gb-message">메시지</label>
          <span className="micro">
            {count} / {MAX_MESSAGE}
          </span>
        </div>
        <textarea
          id="gb-message"
          name="message"
          className="textarea"
          maxLength={MAX_MESSAGE}
          placeholder="짧은 한 줄이어도 좋습니다."
          onChange={(e) => setCount(e.target.value.length)}
          required
        />
      </div>
    </>
  );
}

export function GuestbookForm() {
  const [state, formAction] = useActionState(submitGuestbook, initialFormState);
  const issued = state.status === "ok" ? state.issued : undefined;

  useEffect(() => {
    // 발급받은 편집 토큰을 이 브라우저에만 보관한다. 목록은 이 저장소를
    // 구독하고 있어서, 방금 남긴 글에 수정·삭제 버튼이 곧바로 붙는다.
    if (issued) rememberToken(issued.id, issued.token);
  }, [issued]);

  return (
    <form action={formAction} className="gbForm glass">
      <Fields key={issued?.id ?? "new"} />

      {state.status === "error" && (
        <p className="note note--err" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "ok" && (
        <p className="note note--ok" role="status">
          {state.message}
        </p>
      )}

      <div>
        <SubmitButton />
      </div>

      <p className="micro gbForm__hint">
        남긴 글은 이 브라우저에서만 수정·삭제할 수 있습니다
      </p>
    </form>
  );
}
