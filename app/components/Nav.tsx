import { Arrow } from "./Arrow";
import { INSTAGRAM_URL, INSTAGRAM_ID } from "../site";

export function Nav() {
  return (
    <nav className="nav">
      <div className="nav__brand">김태연</div>
      <div className="nav__links">
        <a href="#about">관심사</a>
        <a href="#build">만들고 싶은 것</a>
        <a href="#contact">연락처</a>
        <a href="#guestbook">방명록</a>
      </div>
      <div className="nav__right">
        <a
          className="btn"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {INSTAGRAM_ID}
          <Arrow />
        </a>
      </div>
    </nav>
  );
}
