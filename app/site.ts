// 정적 import 로 불러오면 빌드 시 파일명에 내용 해시가 붙는다.
// 사진을 교체해도 URL 이 바뀌므로 이미지 캐시가 옛 버전을 물고 있을 일이 없다.
import musicCover from "../public/off-hours/music.jpg";
import walkPhoto from "../public/off-hours/walk.jpg";

export const NAME = "김태연";
export const NAME_EN = "Kim Taeyeon";
export const CATCHPHRASE =
  "사회의 구석진 곳을 들여다보고, 당연한 것을 의심하고, 조금씩 바꿔보고 싶습니다.";

export const INSTAGRAM_ID = "@tykkkim";
export const INSTAGRAM_URL = "https://instagram.com/tykkkim";

export const INTERESTS = [
  {
    title: "정치",
    body: "제도가 누구를 대변하고 누구를 빠뜨리는지 봅니다. 결정이 내려지는 자리보다, 그 결정이 닿는 자리를 먼저 보려 합니다.",
  },
  {
    title: "사회",
    body: "당연하다고 불리는 것들을 한 번 더 들여다봅니다. 익숙해서 보이지 않게 된 구석이 대체로 가장 급한 자리였습니다.",
  },
  {
    title: "동물",
    body: "말하지 못하는 쪽의 사정에 마음이 오래 머뭅니다. 구조 현장의 이야기가 더 멀리 닿을 방법을 찾고 있습니다.",
  },
];

export const HOBBIES = [
  {
    label: "노래 듣기",
    image: musicCover,
    alt: "즐겨 듣는 앨범 커버 — 밤의 거리 풍경",
  },
  {
    label: "산책하기",
    image: walkPhoto,
    alt: "산책 중인 반려견",
  },
];

export const PROJECTS = [
  {
    num: "01",
    title: "건전한 공론장을 위한 토론 플랫폼",
    body: "이기는 말이 아니라 이해하는 말이 남는 곳. 서로 다른 입장이 소리 지르지 않고도 부딪힐 수 있는 구조를 설계해보고 싶습니다.",
    tags: ["토론", "공론장", "커뮤니티"],
  },
  {
    num: "02",
    title: "구조동물을 위한 재능기부 웹사이트",
    body: "디자인, 개발, 글쓰기, 사진. 각자의 재능을 보호소와 구조 활동가에게 연결하는 자리. 선의가 길을 잃지 않게 돕는 일입니다.",
    tags: ["동물권", "재능기부", "매칭"],
  },
];
