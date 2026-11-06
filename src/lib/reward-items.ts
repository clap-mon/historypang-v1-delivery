import type { StageId } from "./content.ts";

export type RewardItemId = "gate-guardian-crystal" | "mist-guide-crystal" | "precision-gear-crystal" | "truth-mirror-crystal";
export type RewardItem = {
  id: RewardItemId;
  stageId: 1 | 2 | 3 | 4;
  name: string;
  icon: string;
  color: string;
  description: string;
  timing: string;
  howToUse: string;
};

export const rewardItems: RewardItem[] = [
  { id: "gate-guardian-crystal", stageId: 1, name: "역사 나침반", icon: "🧭", color: "#65f29a", description: "오답 선택지 1개 즉시 봉인", timing: "퀴즈 풀이 중 즉시 사용", howToUse: "보스전 퀴즈를 풀 때 화면 상단 유물 버튼을 눌러 오답 1개를 즉시 지울 수 있어요!" },
  { id: "mist-guide-crystal", stageId: 2, name: "승리의 불씨", icon: "🔥", color: "#56d9ff", description: "보스 방어·결계 해제 · 1턴 혼란", timing: "상시 즉시 사용 가능", howToUse: "보스의 방어막·결계를 즉시 깨뜨리고 1턴간 혼란 상태로 만들어 큰 피해를 줘요!" },
  { id: "precision-gear-crystal", stageId: 3, name: "청동 방울", icon: "청동방울", color: "#2dd4bf", description: "행동력 +2 즉시 충전 (한계 돌파)", timing: "상시 즉시 사용 가능", howToUse: "언제든 행동력 2를 즉시 충전하여 카드를 더 많이 쓸 수 있어요!" },
  { id: "truth-mirror-crystal", stageId: 4, name: "진실의 청동거울", icon: "🪞", color: "#ff7eb6", description: "2턴 럭키 표시 · 폭탄 봉인", timing: "상시 즉시 사용 가능", howToUse: "2턴 동안 럭키 정답을 눈앞에 환히 비추고 폭탄 카드를 완벽히 봉인해요!" },
];

export function rewardItemForStage(stageId: StageId) { return rewardItems.find((item) => item.stageId === stageId); }
export function rewardItemById(id: RewardItemId) { return rewardItems.find((item) => item.id === id); }
export function canUseRewardItem(id: RewardItemId, phase: "quiz" | "reward" | "action" | "enemy") {
  void id;
  return phase !== "enemy";
}
