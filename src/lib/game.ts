export type AdventureDifficulty = "easy" | "normal" | "hard";

// 🏛️ 초등 5학년을 위한 표준 단일 밸런스 (집중력 40, 표준 공격/방어)
export const standardDifficulty = {
  id: "normal" as const,
  badge: "모험",
  name: "모험",
  description: "초등 5학년 맞춤 표준 밸런스",
  playerHp: 40,
  statModifier: 0,
};

export const difficulties = [
  standardDifficulty,
  { ...standardDifficulty, id: "easy" as const },
  { ...standardDifficulty, id: "hard" as const },
] as const;

export function getDifficulty(_id?: AdventureDifficulty) {
  return standardDifficulty;
}
