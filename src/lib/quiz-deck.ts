// 🏛️ 역사팡 글로벌 No-Repeat 덱 시스템 (Global No-Repeat Deck Engine)
import type { StageId } from "./content";

export type EraDeckState = {
  drawPile: number[];    // 아직 뽑지 않은 템플릿 인덱스들 (Fisher-Yates 셔플)
  discardPile: number[]; // 이미 출제된 템플릿 인덱스들
};

const DECK_STORAGE_KEY = "luckypang-history-quiz-deck-v2";

// 🏛️ 각 시대별 총 문제 수 (구석기 10, 신석기 11, 청동기 11, 고조선 10 -> 총 42개 풀)
export const ERA_TEMPLATE_COUNTS: Record<number, number> = {
  1: 10, // 구석기
  2: 11, // 신석기
  3: 11, // 청동기
  4: 10, // 고조선
};

// Fisher-Yates 무작위 셔플
export function shuffleArray<T>(array: T[], rng = Math.random): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 특정 시대의 새 덱 생성
export function createNewEraDeck(stageId: number): EraDeckState {
  const count = ERA_TEMPLATE_COUNTS[stageId] ?? 10;
  const indices = Array.from({ length: count }, (_, i) => i);
  return {
    drawPile: shuffleArray(indices),
    discardPile: [],
  };
}

// 덱 상태 로드 (SSR 안전 및 localStorage 연동)
export function loadGlobalDeck(): Record<number, EraDeckState> {
  if (typeof window === "undefined") {
    return {
      1: createNewEraDeck(1),
      2: createNewEraDeck(2),
      3: createNewEraDeck(3),
      4: createNewEraDeck(4),
    };
  }
  try {
    const raw = localStorage.getItem(DECK_STORAGE_KEY);
    if (!raw) {
      const fresh = {
        1: createNewEraDeck(1),
        2: createNewEraDeck(2),
        3: createNewEraDeck(3),
        4: createNewEraDeck(4),
      };
      localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw);
    [1, 2, 3, 4].forEach((s) => {
      const expectedCount = ERA_TEMPLATE_COUNTS[s];
      const deck = parsed[s];
      if (
        !deck ||
        !Array.isArray(deck.drawPile) ||
        !Array.isArray(deck.discardPile) ||
        deck.drawPile.length + deck.discardPile.length !== expectedCount
      ) {
        parsed[s] = createNewEraDeck(s);
      }
    });
    return parsed;
  } catch {
    return {
      1: createNewEraDeck(1),
      2: createNewEraDeck(2),
      3: createNewEraDeck(3),
      4: createNewEraDeck(4),
    };
  }
}

// 덱 상태 저장
export function saveGlobalDeck(deckMap: Record<number, EraDeckState>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deckMap));
  } catch {}
}

// 세션/라운드 캐시 (동일 라운드 렌더링 중 중복 pop 방지)
const roundDrawnCache: Record<string, number> = {};

// 🎯 특정 시대에서 No-Repeat로 다음 템플릿 인덱스를 드로우
export function getOrDrawTemplateIndex(stageId: number, round: number, session: string): number {
  const cacheKey = `${session}-s${stageId}-r${round}`;
  if (typeof roundDrawnCache[cacheKey] === "number") {
    return roundDrawnCache[cacheKey];
  }

  const deckMap = loadGlobalDeck();
  const deck = deckMap[stageId] ?? createNewEraDeck(stageId);

  // drawPile이 비었으면(모든 문제를 다 풀었음!) discardPile을 다시 셔플하여 새 덱 보충
  if (deck.drawPile.length === 0) {
    const sourceIndices =
      deck.discardPile.length > 0
        ? deck.discardPile
        : Array.from({ length: ERA_TEMPLATE_COUNTS[stageId] ?? 10 }, (_, i) => i);
    deck.drawPile = shuffleArray(sourceIndices);
    deck.discardPile = [];
  }

  // 비복원 1장 드로우
  const drawnIndex = deck.drawPile.pop()!;
  deck.discardPile.push(drawnIndex);

  deckMap[stageId] = deck;
  saveGlobalDeck(deckMap);

  roundDrawnCache[cacheKey] = drawnIndex;
  return drawnIndex;
}

// 덱 완전 초기화 (필요 시 호출)
export function resetGlobalDeck(): void {
  if (typeof window === "undefined") return;
  try {
    const fresh = {
      1: createNewEraDeck(1),
      2: createNewEraDeck(2),
      3: createNewEraDeck(3),
      4: createNewEraDeck(4),
    };
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(fresh));
    Object.keys(roundDrawnCache).forEach((k) => delete roundDrawnCache[k]);
  } catch {}
}

