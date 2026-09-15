import Image from "next/image";
import { Arrow } from "./components/Arrow";
import { Nav } from "./components/Nav";
import { Guestbook } from "./components/Guestbook";
import {
  HOBBIES,
  INSTAGRAM_ID,
  INSTAGRAM_URL,
  INTERESTS,
  NAME,
  NAME_EN,
  PROJECTS,
} from "./site";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="sheet">
      <Nav />

      {/* ---------- S1 · Hero ------------------------------------------- */}
      <header className="hero pad">
        <p className="hero__eyebrow serif">{NAME_EN} — Portfolio</p>
        <h1 className="display hero__name">{NAME}</h1>
        <p className="hero__phrase serifKo">
          사회의 구석진 곳을 들여다보고,
          <br />
          당연한 것을 <em>의심하고</em>,
          <br />
          조금씩 바꿔보고 싶습니다.
        </p>
        <div className="hero__cta">
          <a className="btn btn--solid" href="#guestbook">
            방명록 남기기
            <Arrow />
          </a>
          <a
            className="btn"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            인스타그램 {INSTAGRAM_ID}
            <Arrow />
          </a>
        </div>
      </header>

      <div className="heroVisual aurora aurora--fade" aria-hidden="true" />

      {/* ---------- S2 · 관심사 & 취미 ----------------------------------- */}
      <section id="about" className="section pad">
        <div className="sectionHead">
          <span className="micro">01 — Interests</span>
        </div>

        <div className="split">
          <h2 className="h2">
            멀리서 보면 작은 일,
            <br />
            가까이서 보면 <span className="serifKo">누군가의 전부</span>
          </h2>
          <p className="body split__aside">
            세 가지를 오래 들여다보고 있습니다. 정치, 사회, 그리고 동물. 서로
            다른 얘기처럼 보이지만 결국 하나의 질문으로 모입니다 — 누가 빠져
            있는가.
          </p>
        </div>

        <div className="features">
          {INTERESTS.map((item) => (
            <div key={item.title} className="feature">
              <h3 className="h4">{item.title}</h3>
              <p className="small">{item.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "clamp(40px, 6vw, 72px)" }}>
          <p className="micro">Off hours</p>
          <ul className="offGrid">
            {HOBBIES.map((hobby) => (
              <li key={hobby.label}>
                <div className="off__frame">
                  <Image
                    src={hobby.image}
                    alt={hobby.alt}
                    fill
                    sizes="(max-width: 900px) 45vw, 260px"
                    className="off__img"
                  />
                </div>
                <p className="off__label">{hobby.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- 전면 그라디언트 밴드 --------------------------------- */}
      <div className="band aurora aurora--deep">
        <div className="band__inner">
          <p className="band__quote serifKo">
            당연한 것을 의심하는 일에서 시작합니다.
          </p>
          <p className="band__by micro">{NAME_EN}</p>
        </div>
      </div>

      {/* ---------- S3 · DWNC에서 만들고 싶은 것 -------------------------- */}
      <section id="build" className="section wash">
        <div className="pad">
          <div className="sectionHead">
            <span className="micro">02 — What I want to build</span>
          </div>

          <div className="split" style={{ marginBottom: "clamp(36px, 5vw, 64px)" }}>
            <h2 className="h2">
              DWNC에서
              <br />
              <span className="serifKo">만들고 싶은 것</span>
            </h2>
            <p className="body split__aside">
              말이 오래 남는 자리, 그리고 선의가 길을 잃지 않는 자리. 두 가지를
              만들어보려 합니다.
            </p>
          </div>

          <div className="cards">
            {PROJECTS.map((project) => (
              <article key={project.num} className="card glass">
                <p className="card__num micro">{project.num}</p>
                <h3 className="h3 card__title">{project.title}</h3>
                <p className="small">{project.body}</p>
                <div className="chips">
                  {project.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- S4 · 연락처 & SNS ------------------------------------ */}
      <section id="contact" className="section--tight section pad">
        <div className="sectionHead">
          <span className="micro">03 — Contact</span>
        </div>

        <div className="contact">
          <h2 className="h2">
            같이 만들어볼 게 있다면,
            <br />
            <span className="serifKo">언제든 편하게</span>
          </h2>
          <div className="split__aside">
            <div className="contactLinks">
              <a
                className="btn"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram {INSTAGRAM_ID}
                <Arrow />
              </a>
              <a className="btn" href="#guestbook">
                방명록으로
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- S5 · 방명록 ------------------------------------------ */}
      <Guestbook />

      <footer className="footer">
        <span className="micro">© 2026 {NAME}</span>
        <span className="micro">Built for DWNC</span>
      </footer>
    </main>
  );
}
