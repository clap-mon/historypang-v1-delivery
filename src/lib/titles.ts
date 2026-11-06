import type { StageId } from "./content";
import type { AdventureDifficulty } from "./game";

export type CharacterId = "bau" | "ara" | "narae";
export type TitleTier = "explorer" | "champion" | "master" | "legend";

export type AdventureTitle = {
  id: string;
  characterId: CharacterId;
  tier: TitleTier;
  name: string;
  condition: string;
  kind: "campaign" | "score";
  badgeColor: string;
  mark: string;
  difficulty?: AdventureDifficulty;
};

export const titleTierDetails: Record<TitleTier, { label: string; mark: string; color: string }> = {
  explorer: { label: "시대 탐험", mark: "🌱", color: "#10b981" },
  champion: { label: "보스 완승", mark: "⚔️", color: "#0284c7" },
  master: { label: "역사 명인", mark: "★", color: "#7c3aed" },
  legend: { label: "전설 수호신", mark: "👑", color: "#d97706" },
};

export const titleDifficultyDetails = {
  easy: titleTierDetails.explorer,
  normal: titleTierDetails.champion,
  hard: titleTierDetails.legend,
} satisfies Record<AdventureDifficulty, { label: string; mark: string; color: string }>;

export const adventureTitles: AdventureTitle[] = [
  // 🛡️ 바우 (용기와 수호의 전사)
  {
    id: "title-bau-easy-1",
    characterId: "bau",
    tier: "explorer",
    name: "주먹도끼 수호자",
    condition: "선사 시대 탐구 및 보스전 출격",
    kind: "campaign",
    badgeColor: "#10b981",
    mark: "🌱",
    difficulty: "easy",
  },
  {
    id: "title-bau-normal-1",
    characterId: "bau",
    tier: "champion",
    name: "비파동검 기사",
    condition: "보스전 3단계(고조선의 수호군주) 완승",
    kind: "campaign",
    badgeColor: "#0284c7",
    mark: "⚔️",
    difficulty: "normal",
  },
  {
    id: "score-title-bau-normal",
    characterId: "bau",
    tier: "master",
    name: "고인돌 축조 명인",
    condition: "보스전 800점 이상 달성 승리",
    kind: "score",
    badgeColor: "#7c3aed",
    mark: "★",
    difficulty: "normal",
  },
  {
    id: "title-bau-hard-1",
    characterId: "bau",
    tier: "legend",
    name: "단군왕검의 방패",
    condition: "보스전 1,000점 이상 최고 명예 달성",
    kind: "score",
    badgeColor: "#d97706",
    mark: "👑",
    difficulty: "hard",
  },

  // 📜 아라 (지혜와 탐구의 고고학자)
  {
    id: "title-ara-easy-1",
    characterId: "ara",
    tier: "explorer",
    name: "신석기 농경 길잡이",
    condition: "선사 시대 탐구 및 보스전 출격",
    kind: "campaign",
    badgeColor: "#10b981",
    mark: "🌱",
    difficulty: "easy",
  },
  {
    id: "title-ara-normal-1",
    characterId: "ara",
    tier: "champion",
    name: "탁자식 고인돌 추적가",
    condition: "보스전 3단계(고조선의 수호군주) 완승",
    kind: "campaign",
    badgeColor: "#0284c7",
    mark: "⚔️",
    difficulty: "normal",
  },
  {
    id: "score-title-ara-normal",
    characterId: "ara",
    tier: "master",
    name: "고고학 발굴 명장",
    condition: "보스전 800점 이상 달성 승리",
    kind: "score",
    badgeColor: "#7c3aed",
    mark: "★",
    difficulty: "normal",
  },
  {
    id: "title-ara-hard-1",
    characterId: "ara",
    tier: "legend",
    name: "단군신화 해독사",
    condition: "보스전 1,000점 이상 최고 명예 달성",
    kind: "score",
    badgeColor: "#d97706",
    mark: "👑",
    difficulty: "hard",
  },

  // ✨ 나래 (조화와 기록의 대현자)
  {
    id: "title-narae-easy-1",
    characterId: "narae",
    tier: "explorer",
    name: "원시 불씨 조율사",
    condition: "선사 시대 탐구 및 보스전 출격",
    kind: "campaign",
    badgeColor: "#10b981",
    mark: "🌱",
    difficulty: "easy",
  },
  {
    id: "title-narae-normal-1",
    characterId: "narae",
    tier: "champion",
    name: "홍익인간 수호자",
    condition: "보스전 3단계(고조선의 수호군주) 완승",
    kind: "campaign",
    badgeColor: "#0284c7",
    mark: "⚔️",
    difficulty: "normal",
  },
  {
    id: "score-title-narae-normal",
    characterId: "narae",
    tier: "master",
    name: "역사 조화 대현자",
    condition: "보스전 800점 이상 달성 승리",
    kind: "score",
    badgeColor: "#7c3aed",
    mark: "★",
    difficulty: "normal",
  },
  {
    id: "title-narae-hard-1",
    characterId: "narae",
    tier: "legend",
    name: "삼국유사 대기록관",
    condition: "보스전 1,000점 이상 최고 명예 달성",
    kind: "score",
    badgeColor: "#d97706",
    mark: "👑",
    difficulty: "hard",
  },
];

export const scoreTitleThresholds = { easy: 800, normal: 800, hard: 1000 } satisfies Record<AdventureDifficulty, number>;

const titleStorageKey = "luckypang-v3-range-collected-titles";

export function getTitleDifficulty(_difficulty?: AdventureDifficulty) {
  return titleTierDetails.champion;
}

// 🏛️ 최종 보스 격파 시 점수 및 달성도에 따른 칭호 지급 평가
export function evaluateClearTitles(characterId: CharacterId, score: number): AdventureTitle[] {
  const earned: AdventureTitle[] = [];
  const charTitles = adventureTitles.filter((t) => t.characterId === characterId);

  // 1. 시대 탐험 및 보스 완승 칭호
  const explorer = charTitles.find((t) => t.tier === "explorer");
  const champion = charTitles.find((t) => t.tier === "champion");
  if (explorer) earned.push(explorer);
  if (champion) earned.push(champion);

  // 2. 800점 이상 시 명인 칭호
  if (score >= 800) {
    const master = charTitles.find((t) => t.tier === "master");
    if (master) earned.push(master);
  }

  // 3. 1,000점 이상 시 전설 칭호
  if (score >= 1000) {
    const legend = charTitles.find((t) => t.tier === "legend");
    if (legend) earned.push(legend);
  }

  return earned;
}

export function getCampaignClearTitle(characterId: CharacterId, _difficulty?: AdventureDifficulty, _excludedIds?: readonly string[]) {
  const candidates = adventureTitles.filter((title) => title.characterId === characterId && title.tier === "champion");
  return candidates[0] ?? adventureTitles[0];
}

export function getScoreTitle(characterId: CharacterId, _difficulty?: AdventureDifficulty) {
  return adventureTitles.find((title) => title.characterId === characterId && title.tier === "master");
}

export function loadCollectedTitleIds(storage: Storage): string[] {
  try {
    const saved = JSON.parse(storage.getItem(titleStorageKey) ?? "[]") as unknown;
    const validIds = new Set(adventureTitles.map((title) => title.id));
    return Array.isArray(saved) ? [...new Set(saved.filter((id): id is string => typeof id === "string" && validIds.has(id)))] : [];
  } catch {
    return [];
  }
}

export function saveCollectedTitleId(storage: Storage, titleId: string) {
  const next = [...new Set([...loadCollectedTitleIds(storage), titleId])];
  storage.setItem(titleStorageKey, JSON.stringify(next));
  return next;
}

export function clearCollectedTitles(storage: Storage) { storage.removeItem(titleStorageKey); }

const campaignProgressStorageKey = "luckypang-v3-range-title-campaign-progress";
export type CampaignProgress = Partial<Record<`${CharacterId}-${AdventureDifficulty}`, StageId[]>>;

export function loadTitleCampaignProgress(storage: Storage): CampaignProgress {
  try {
    const saved = JSON.parse(storage.getItem(campaignProgressStorageKey) ?? "{}") as unknown;
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(Object.entries(saved).map(([key, value]) => [key, Array.isArray(value) ? value.filter((id): id is StageId => Number.isInteger(id) && id >= 1 && id <= 5) : []])) as CampaignProgress;
  } catch { return {}; }
}

export function saveTitleCampaignStage(storage: Storage, progress: CampaignProgress, characterId: CharacterId, difficulty: AdventureDifficulty, stageId: StageId) {
  const key = `${characterId}-${difficulty}` as const;
  const next = { ...progress, [key]: [...new Set([...(progress[key] ?? []), stageId])].sort() };
  storage.setItem(campaignProgressStorageKey, JSON.stringify(next));
  return next;
}

export function campaignIsComplete(progress: CampaignProgress, characterId: CharacterId, difficulty: AdventureDifficulty) {
  return (progress[`${characterId}-${difficulty}`] ?? []).length >= 4;
}

export function clearTitleCampaignProgress(storage: Storage) { storage.removeItem(campaignProgressStorageKey); }
