import { isSupabaseConfigured } from "@/lib/guestbook";
import { GuestbookForm } from "./GuestbookForm";
import { GuestbookFeed } from "./GuestbookFeed";

export function Guestbook() {
  const configured = isSupabaseConfigured();

  return (
    <section id="guestbook" className="section wash">
      <div className="pad">
        <div className="sectionHead">
          <span className="micro">04 — Guestbook</span>
        </div>

        <div className="split" style={{ marginBottom: "clamp(36px, 5vw, 64px)" }}>
          <h2 className="h2">
            다녀가신 흔적을
            <br />
            <span className="serifKo">남겨주세요</span>
          </h2>
          <p className="body split__aside">
            이름과 짧은 메시지면 충분합니다. 남겨주신 말은 이 페이지 아래에
            그대로 쌓입니다.
          </p>
        </div>

        {configured ? (
          <div className="gb">
            <GuestbookForm />
            <div>
              <GuestbookFeed />
            </div>
          </div>
        ) : (
          <div className="note note--info" role="status">
            <strong>방명록이 아직 연결되지 않았습니다.</strong>
            <br />
            <code>.env.example</code>을 <code>.env.local</code>로 복사해
            Supabase URL과 anon 키를 채우고,{" "}
            <code>supabase/migrations</code>의 SQL을 Supabase Dashboard의 SQL
            Editor에서 실행한 뒤 개발 서버를 재시작해 주세요.
          </div>
        )}
      </div>
    </section>
  );
}
