import { listEntries } from "@/lib/guestbook";
import type { EntryView } from "@/lib/guestbook-shared";
import { GuestbookList } from "./GuestbookList";
import { GuestbookError } from "./GuestbookStates";

export async function GuestbookFeed() {
  // try/catch 안에서 JSX 를 만들면 렌더 중에 난 오류는 잡히지 않는다.
  // 데이터 조회만 감싸고, 그 결과로 무엇을 그릴지는 바깥에서 정한다.
  let entries: EntryView[] = [];
  let error: string | null = null;

  try {
    entries = await listEntries();
  } catch (err) {
    error = err instanceof Error ? err.message : "알 수 없는 오류입니다.";
  }

  if (error !== null) return <GuestbookError message={error} />;
  return <GuestbookList entries={entries} />;
}
