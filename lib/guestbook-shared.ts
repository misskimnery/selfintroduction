/** 서버·클라이언트 양쪽에서 쓰는 방명록 상수와 타입. */

export const MAX_NAME = 20;
export const MAX_MESSAGE = 200;
export const PAGE_SIZE = 50;

export type Entry = {
  id: string;
  name: string;
  message: string;
  created_at: string;
  updated_at: string;
};

/**
 * 목록에 넘기는 형태. 상대 시간은 서버에서 한 번 계산해 문자열로 내려보낸다.
 * 클라이언트에서 다시 계산하면 하이드레이션 불일치가 생기기 때문이다.
 */
export type EntryView = Entry & { relative: string; edited: boolean };
