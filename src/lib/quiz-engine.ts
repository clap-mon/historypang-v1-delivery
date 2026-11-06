import type { StageId, BossPhase } from "./content.ts";
import { getOrDrawTemplateIndex } from "./quiz-deck.ts";

export type Difficulty = "EASY" | "NORMAL" | "HARD";
export type QuizOption = {
  id: string;
  text: string;
  symbol?: string;
  symbols?: string[];
  equation?: { leftIcon: string; rightIcons: string[] };
  isCorrect: boolean;
  isLucky: boolean;
  isBomb: boolean;
  explanation: string;
  misconception?: string;
};

export type ReferenceNote = {
  tag?: string;
  label: string;
  desc: string;
  symbol: string;
  source?: string;
};

export type Quiz = {
  id: string;
  stageId: StageId;
  prompt: string;
  diagram?: string;
  diagramTitle?: string;
  referenceNote?: ReferenceNote;
  difficulty: Difficulty;
  options: QuizOption[];
};

export function parseEquationOption(_text: string): { leftIcon: string; rightIcons: string[] } | null {
  return null;
}
export function getSymbolsForText(_text: string): string[] {
  return [];
}
export function getSymbolForText(_text: string): string | undefined {
  return undefined;
}

export function getDiagramForStage(stageId: StageId, _prompt: string): { src: string; title: string } | undefined {
  if (stageId === 1) return { src: "/backgrounds/stage1_paleolithic_board_bg.webp", title: "구석기 시대: 뗀석기와 이동 생활" };
  if (stageId === 2) return { src: "/backgrounds/stage2_neolithic_board_bg.webp", title: "신석기 시대: 간석기, 토기, 농경의 시작" };
  if (stageId === 3) return { src: "/backgrounds/stage3_bronze_board_bg.webp", title: "청동기 시대: 비파형 동검, 벼농사, 고인돌" };
  if (stageId === 4) return { src: "/backgrounds/stage4_gojoseon_board_bg.webp", title: "고조선: 최초의 국가, 단군신화, 8조법" };
  return undefined;
}

export function makePrng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
  };
}

export function seedForQuiz(stageId: StageId | number, round: number, session = "history-v1"): number {
  let hash = 2166136261;
  for (const char of `${session}:${stageId}:${round}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function int(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function pick<T>(rng: () => number, values: T[]): T {
  return values[int(rng, 0, values.length - 1)];
}
function shuffle<T>(rng: () => number, values: T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = int(rng, 0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function finalize(
  stageId: StageId,
  round: number,
  prompt: string,
  difficulty: Difficulty,
  rows: (Omit<QuizOption, "id" | "isLucky" | "isBomb"> & { symbol?: string })[],
  rng: () => number,
  referenceNote?: ReferenceNote,
): Quiz {
  if (rows.length !== 5 || rows.filter((row) => row.isCorrect).length !== 3 || new Set(rows.map((row) => row.text)).size !== 5) {
    throw new Error("퀴즈는 서로 다른 보기 5개와 정답 3개로 구성해야 합니다.");
  }
  const correct = rows.filter((row) => row.isCorrect);
  const wrong = rows.filter((row) => !row.isCorrect);
  const luckyText = pick(rng, correct).text;
  const bombText = pick(rng, wrong).text;
  const options = rows.map((row, index) => {
    return {
      ...row,
      id: `s${stageId}-r${round}-o${index}`,
      symbol: row.symbol,
      symbols: row.symbol ? [row.symbol] : [],
      isLucky: row.text === luckyText,
      isBomb: row.text === bombText,
    };
  });
  const diagramInfo = getDiagramForStage(stageId, prompt);
  return {
    id: `stage-${stageId}-round-${round}`,
    stageId,
    prompt,
    diagram: diagramInfo?.src,
    diagramTitle: diagramInfo?.title,
    referenceNote,
    difficulty,
    options,
  };
}

// 🏛️ 역사 퀴즈 템플릿 인터페이스
type RawQuizTemplate = {
  prompt: string;
  difficulty: Difficulty;
  correctPool: { text: string; explanation: string; symbol?: string }[];
  wrongPool: { text: string; explanation: string; misconception?: string; symbol?: string }[];
  referenceNote?: ReferenceNote;
};

// ==========================================
// 1. 구석기 시대 문제 은행 (교과서 5~7쪽, 18쪽 1~3번)
// ==========================================
const paleolithicTemplates: RawQuizTemplate[] = [
  {
    // [유형 1: 사진 기반 - 주먹도끼의 이름과 만능 쓰임새]
    prompt: "사진 속 대표적인 뗀석기인 [주먹도끼]의 특징과 쓰임새로 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "돌을 깨뜨려 양쪽 면을 날카롭게 다듬은 구석기 시대의 대표적 뗀석기이다.", explanation: "주먹도끼는 좌우 대칭의 날을 정성껏 다듬은 뗀석기입니다.", symbol: "🪨" },
      { text: "짐승을 사냥하고 가죽을 벗기며 땅을 파는 등 여러 용도로 쓰인 만능 도구이다.", explanation: "사냥, 조리, 채집 등 다양한 목적으로 쓴 만능 손도구였습니다.", symbol: "✋" },
      { text: "한 손에 쥐기 편하도록 둥근 손잡이 부분과 뾰족한 날이 함께 다듬어졌다.", explanation: "손에 쥐고 강한 힘을 전달할 수 있도록 실용적으로 제작되었습니다.", symbol: "✊" },
      { text: "구석기 시대 사람들이 먹을거리를 얻고 생존하는 데 가장 중요한 기본 도구였다.", explanation: "구석기 인류의 생존과 사냥을 책임진 핵심 유물입니다.", symbol: "🍖" },
      { text: "자르기, 찍기, 긁기 등 오늘날의 만능 칼처럼 다목적으로 활용되었다.", explanation: "하나의 도구로 여러 가지 작업을 훌륭하게 수행했습니다.", symbol: "🔪" },
    ],
    wrongPool: [
      { text: "청동을 불에 녹여 정교하게 찍어낸 청동기 시대의 금속 도구였다.", explanation: "주먹도끼는 돌을 깨뜨려 만든 구석기 뗀석기입니다.", symbol: "❌" },
      { text: "벼농사를 지을 때 벼 이삭을 잘라 수확하던 농기구였다.", explanation: "벼 이삭을 자르는 도구는 청동기 시대의 반달 돌칼입니다.", symbol: "❌" },
      { text: "흙으로 빚은 뒤 가마에 구워 곡식을 담아 보관하던 그릇이었다.", explanation: "그릇은 신석기 시대의 토기입니다.", symbol: "❌" },
      { text: "동물의 뼈를 가늘게 갈아 바늘귀를 뚫어 옷을 짓던 도구였다.", explanation: "바느질 도구는 신석기 시대의 뼈바늘입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 도구", label: "주먹도끼", desc: "사냥과 가죽 손질, 땅파기 등 다양한 용도로 쓰인 대표적 뗀석기", symbol: "/relics/handaxe.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 2: 사진 기반 - 긁개와 밀개의 쓰임새]
    prompt: "사진 속 뗀석기인 [긁개와 밀개]의 올바른 쓰임새에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "사냥한 짐승의 털과 가죽을 벗겨내고 부드럽게 다듬는 데 주로 썼다.", explanation: "가죽을 손질하고 털을 긁어내는 데 최적화된 뗀석기입니다.", symbol: "🦊" },
      { text: "나무를 깎거나 짐승의 뼈를 날카롭게 다듬을 때 밀어서 깎아냈다.", explanation: "목재와 뼈를 다듬어 필요한 도구를 만들 때 활용했습니다.", symbol: "🪵" },
      { text: "돌에서 떼어낸 날카로운 돌 조각(격지)의 끝을 잔손질하여 날을 만들었다.", explanation: "날카로운 면을 살려 정교하게 손질한 손도구입니다.", symbol: "🪨" },
      { text: "가죽을 손질하여 추위를 막아줄 가죽옷을 만드는 데 큰 도움을 주었다.", explanation: "가죽 손질 기술은 방한용 가죽옷 제작에 필수적이었습니다.", symbol: "🧥" },
      { text: "돌을 깨뜨려 만든 구석기 시대의 정교한 가공 도구였다.", explanation: "용도에 따라 알맞은 형태로 세분화된 뗀석기입니다.", symbol: "✨" },
    ],
    wrongPool: [
      { text: "벼 이삭을 잘라 내기 위해 손가락에 끈을 걸고 쓰던 청동기 농기구였다.", explanation: "벼 수확 도구는 청동기 시대의 반달 돌칼입니다.", symbol: "❌" },
      { text: "실을 꼬아 뽑아내기 위해 가운데 구멍에 막대를 꽂아 돌리던 도구였다.", explanation: "실을 뽑는 도구는 신석기 시대의 가락바퀴입니다.", symbol: "❌" },
      { text: "적의 화살을 막아내기 위해 왼손에 든 둥근 구리 방패였다.", explanation: "구석기 긁개는 가죽과 목재를 다듬는 작은 손도구입니다.", symbol: "❌" },
      { text: "물고기를 잡기 위해 깊은 바다에 던지던 무거운 쇠그물이었다.", explanation: "쇠그물은 철기 시대 이후에 등장한 금속 도구입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 도구", label: "긁개와 밀개", desc: "사냥한 짐승의 가죽을 벗겨 다듬거나 나무를 깎던 뗀석기", symbol: "/relics/scraper.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 3: 사진 기반 - 슴베찌르개의 사냥 무기 역할]
    prompt: "구석기 시대 후기에 등장한 사냥 무기인 [슴베찌르개]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "돌의 아래쪽에 나무 자루에 묶기 쉽도록 잘록한 손잡이(슴베)를 만들었다.", explanation: "자루와 결합할 수 있도록 홈이나 턱(슴베)을 깎았습니다.", symbol: "🔪" },
      { text: "긴 나무 자루 끝에 연결하여 창처럼 멀리서 짐승을 찌르는 사냥 무기였다.", explanation: "창처럼 찌르는 무기로 활용하여 사냥 효율을 크게 높였습니다.", symbol: "🏹" },
      { text: "빠르고 날쌘 동물이나 사나운 짐승을 더 안전하고 효과적으로 사냥할 수 있게 되었다.", explanation: "원거리에서 찌를 수 있어 사냥 성공률과 안전성이 높아졌습니다.", symbol: "🦌" },
      { text: "구석기 시대 후기로 갈수록 돌을 다루는 기술이 정교해졌음을 보여준다.", explanation: "용도별로 맞춤형 결합 무기를 제작할 만큼 기술이 발전했습니다.", symbol: "✨" },
      { text: "나무와 돌을 결합하여 만든 구석기 시대의 발전된 사냥 무기이다.", explanation: "나무 자루와 석기를 결합한 뛰어난 사냥 도구였습니다.", symbol: "🪨" },
    ],
    wrongPool: [
      { text: "곡식의 껍질을 벗기거나 곡식을 가루로 빻기 위해 쓴 넓적한 돌판이었다.", explanation: "곡식을 가는 도구는 신석기 시대의 갈판과 갈돌입니다.", symbol: "❌" },
      { text: "청동을 부어 만든 무기로 제사장이 권력을 뽐낼 때 흔들던 방울이었다.", explanation: "청동 방울은 청동기 시대 제사장의 제사용 의기입니다.", symbol: "❌" },
      { text: "흙으로 그릇을 빚어 겉면에 빗살 무늬를 새긴 신석기 토기였다.", explanation: "토기는 신석기 시대의 빗살무늬 토기입니다.", symbol: "❌" },
      { text: "곡식과 음식을 보관하기 위해 집터 옆에 깊게 판 저장 구덩이였다.", explanation: "슴베찌르개는 뾰족한 사냥용 찌르개입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 도구", label: "슴베찌르개", desc: "돌 아래쪽에 자루를 묶는 슴베를 만들어 창처럼 찌른 사냥 도구", symbol: "/relics/tanged_point.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 4: 유물 묶기 - 구석기 시대를 대표하는 뗀석기 3가지]
    prompt: "다음 중 [구석기 시대] 사람들이 돌을 깨뜨려 만들어 사용한 뗀석기 중 옳은 것을 고르세요.",
    difficulty: "NORMAL",
    correctPool: [
      { text: "사냥과 가죽 손질, 땅파기 등에 두루 쓰인 만능 도구인 [주먹도끼]", explanation: "주먹도끼는 구석기를 대표하는 대표적인 뗀석기입니다.", symbol: "🪨" },
      { text: "사냥한 짐승의 가죽을 벗기고 나무를 다듬던 [긁개와 밀개]", explanation: "긁개와 밀개는 가죽과 목재 가공에 쓴 뗀석기입니다.", symbol: "🦊" },
      { text: "나무 자루 끝에 매달아 창처럼 짐승을 찌르던 사냥 무기인 [슴베찌르개]", explanation: "슴베찌르개는 후기 구석기의 날카로운 뗀석기 무기입니다.", symbol: "🗡️" },
      { text: "돌에서 떼어낸 날카로운 조각으로 짐승의 살점을 베던 [자르개]", explanation: "자르개는 절단용으로 쓴 뗀석기입니다.", symbol: "🔪" },
      { text: "돌의 한쪽 끝을 뾰족하게 깨뜨려 나무를 찍거나 파내던 [찍개]", explanation: "찍개는 초기 구석기부터 널리 쓰인 뗀석기입니다.", symbol: "🪵" },
    ],
    wrongPool: [
      { text: "곡식을 담아 보관하고 음식을 조리하던 [빗살무늬 토기]", explanation: "토기는 신석기 시대에 처음 만들어졌습니다.", symbol: "❌" },
      { text: "돌을 갈아서 벼 이삭을 잘라 내던 수확 도구인 [반달 돌칼]", explanation: "반달 돌칼은 청동기 시대의 농기구입니다.", symbol: "❌" },
      { text: "실을 꼬아 뽑아내던 원시 직조 도구인 [가락바퀴]", explanation: "가락바퀴는 신석기 시대의 옷 제작 도구입니다.", symbol: "❌" },
      { text: "청동을 녹여 부어 만든 지배자의 칼인 [비파형 동검]", explanation: "비파형 동검은 청동기 시대의 청동 무기입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 유물", label: "구석기 뗀석기 모음", desc: "주먹도끼, 긁개와 밀개, 슴베찌르개 등 돌을 깨뜨려 만든 도구", symbol: "/relics/handaxe.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 5: 일러스트 기반 - 불의 발견과 활용]
    prompt: "구석기 사람들의 삶을 크게 바꾸어 놓은 [불의 발견과 활용]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "사나운 맹수들의 접근을 막아내어 밤에도 안전하게 잠을 잘 수 있었다.", explanation: "불빛과 열기는 맹수들을 쫓아내는 강력한 방어 수단이었습니다.", symbol: "🔥" },
      { text: "밤의 어둠을 밝히고 혹독한 추위를 이겨내는 데 큰 도움이 되었다.", explanation: "불을 통해 어둠과 추위를 극복하고 따뜻하게 지낼 수 있었습니다.", symbol: "✨" },
      { text: "질긴 고기를 불에 익혀 먹음으로써 소화가 잘되고 위생적으로 좋아졌다.", explanation: "화식(익혀 먹기)을 통해 세균 감염을 줄이고 영양 흡수를 높였습니다.", symbol: "🍖" },
      { text: "불 주위에 가족이나 무리가 함께 모여 따뜻하게 지내며 협동심을 길렀다.", explanation: "모닥불을 중심으로 공동체 의식과 언어 소통이 발달했습니다.", symbol: "👨‍👩‍👦" },
      { text: "자연에서 얻은 불을 꺼뜨리지 않고 소중히 지키며 다양한 용도로 썼다.", explanation: "초기에는 자연에서 얻은 불씨를 보존하며 소중히 다루었습니다.", symbol: "🪵" },
    ],
    wrongPool: [
      { text: "석탄 화력 발전소를 세워 동굴마다 전기를 공급하고 조명을 켰다.", explanation: "발전소와 전기는 현대 과학 문명의 산물입니다.", symbol: "❌" },
      { text: "불을 이용해 철광석을 1500도 고온에 녹여 강철 칼을 대량 생산했다.", explanation: "철광석 제련은 철기 시대에 시작되었습니다.", symbol: "❌" },
      { text: "불을 사용하면 신의 노여움을 산다고 믿어 불 사용을 법으로 엄금했다.", explanation: "불은 구석기 사람들의 생존에 가장 필수적인 자원이었습니다.", symbol: "❌" },
      { text: "가스레인지와 전자레인지를 만들어 즉석 가공식품을 데워 먹었다.", explanation: "전자레인지는 현대 주방 가전입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 주거", label: "단양 금굴 유적 (자연 동굴)", desc: "비바람과 맹수를 피하던 대표적인 구석기 자연 동굴 유적", symbol: "/dwellings/cave.webp", source: "국가유산청 (공공누리 제1유형)" },
  },
  {
    // [유형 6: 일러스트 기반 - 동굴과 막집 주거 생활]
    prompt: "구석기 시대 사람들이 비바람을 피해 머물렀던 [동굴과 막집]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "사나운 맹수의 습격과 비바람, 혹독한 추위를 피하기 위해 자연 동굴을 거처로 삼았다.", explanation: "자연 동굴은 구석기인들에게 가장 안전한 천연 주거지였습니다.", symbol: "🏔️" },
      { text: "동굴이 없는 평지나 강가에서는 나뭇가지와 가죽으로 손쉽게 '막집'을 지어 살았다.", explanation: "이동 생활에 맞춰 손쉽게 짓고 떠날 수 있는 막집을 지었습니다.", symbol: "⛺" },
      { text: "바위가 앞으로 처마처럼 튀어나와 비를 피할 수 있는 '바위 그늘'에서도 생활했다.", explanation: "비바람을 막아주는 바위 그늘도 훌륭한 임시 보금자리였습니다.", symbol: "🪨" },
      { text: "한곳에 평생 머물러 사는 집이 아니라, 이동 생활에 알맞은 임시 보금자리였다.", explanation: "사냥감을 찾아 이동해야 했으므로 간이 거처를 활용했습니다.", symbol: "👣" },
      { text: "동굴 입구 근처에 모닥불을 피워 추위를 쫓고 체온을 유지했다.", explanation: "불을 피워 동굴 안의 어둠과 냉기를 몰아냈습니다.", symbol: "🔥" },
    ],
    wrongPool: [
      { text: "땅을 깊게 파고 기둥을 세운 뒤 지붕을 얹은 둥근 '움집' 마을을 이루어 살았다.", explanation: "정착용 원형 움집은 신석기 시대의 대표 주거 형태입니다.", symbol: "❌" },
      { text: "마을 주변에 도랑(환호)을 파고 나무 울타리를 둘러 정착 마을을 지켰다.", explanation: "마을 방어 시설은 청동기 시대 정착 사회의 특징입니다.", symbol: "❌" },
      { text: "붉은 벽돌과 콘크리트를 이용해 튼튼한 2층 단독주택을 지었다.", explanation: "벽돌과 콘크리트는 현대 건축 기술입니다.", symbol: "❌" },
      { text: "강가 모래밭에 돌로 초석을 놓고 기와지붕을 얹은 궁궐을 지었다.", explanation: "기와 궁궐은 삼국 시대 이후에 지어졌습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 주거", label: "동굴과 막집", desc: "비바람과 맹수를 피해 살았던 구석기 사람들의 임시 거처", symbol: "/dwellings/makjip.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 7: 개념 문항 - 구석기 시대 사람들의 이동 생활과 사냥]
    prompt: "[구석기 시대] 사람들의 생활 모습으로 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "사냥감과 열매를 찾아 계절마다 거처를 옮겨 다니는 '이동 생활'을 했다.", explanation: "식량을 직접 생산하지 못해 먹거리를 따라 끊임없이 이동했습니다.", symbol: "👣" },
      { text: "짐승을 효과적으로 사냥하고 위협을 피하기 위해 여러 명이 '무리'를 지어 생활했다.", explanation: "공동 사냥과 생존을 위해 평등한 무리 사회를 이루었습니다.", symbol: "🤝" },
      { text: "열매나 풀뿌리를 채집하고 물고기를 잡으며 사냥을 통해 식량을 얻었다.", explanation: "자연에서 직접 얻는 채집, 수렵, 어로가 주된 생계였습니다.", symbol: "🍎" },
      { text: "뗀석기와 나무 창을 이용해 짐승을 함께 몰아 사냥했다.", explanation: "돌과 나무로 만든 사냥 도구를 협동하여 사용했습니다.", symbol: "🏹" },
      { text: "추위를 막기 위해 사냥한 동물의 가죽을 손질하여 옷으로 입었다.", explanation: "동물 가죽은 혹독한 추위를 막아주는 훌륭한 옷이 되었습니다.", symbol: "🧥" },
    ],
    wrongPool: [
      { text: "벼농사를 짓기 시작하여 곡식을 곡식 창고에 가득 보관했다.", explanation: "벼농사와 곡식 창고는 청동기 시대의 특징입니다.", symbol: "❌" },
      { text: "농사를 지으며 한곳에 머물러 사는 '정착 생활'을 시작했다.", explanation: "정착 생활은 농경이 시작된 신석기 시대부터입니다.", symbol: "❌" },
      { text: "가락바퀴로 실을 뽑고 뼈바늘로 옷을 지어 마을을 이루고 살았다.", explanation: "원시 직조 기술은 신석기 시대의 의생활입니다.", symbol: "❌" },
      { text: "계급이 나뉘어 힘센 지배자(족장)가 백성들을 다스렸다.", explanation: "계급과 족장의 등장은 청동기 시대의 특징입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 생활", label: "이동 생활과 사냥", desc: "먹을거리를 찾아 무리를 지어 옮겨 다니던 구석기 시대 사람들의 삶", symbol: "/dwellings/makjip.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 8: 유물 연계 - 사진 속 주먹도끼와 같은 시대의 생활 모습]
    prompt: "사진 속 [주먹도끼]를 사용하던 구석기 시대의 사회 모습 중 옳은 것을 고르세요.",
    difficulty: "NORMAL",
    correctPool: [
      { text: "돌을 깨뜨려 떼어낸 '뗀석기'를 주요 생활 도구로 사용했다.", explanation: "구석기 시대를 대표하는 기술은 뗀석기입니다.", symbol: "🪨" },
      { text: "먹을거리를 찾아 동굴이나 막집으로 옮겨 다니며 살았다.", explanation: "정착하지 않고 먹거리를 찾아 이동 생활을 했습니다.", symbol: "⛺" },
      { text: "불을 발견하여 고기를 익혀 먹고 맹수와 추위로부터 몸을 보호했다.", explanation: "불의 활용으로 인류의 수명과 위생이 크게 향상되었습니다.", symbol: "🔥" },
      { text: "사냥과 채집에 유리하도록 무리를 지어 협동하며 살았다.", explanation: "서로 돕고 나누는 평등한 무리 공동체였습니다.", symbol: "🤝" },
      { text: "동물의 가죽으로 옷을 만들어 입어 몸을 보호했다.", explanation: "추운 기후를 이겨내기 위해 가죽옷을 지어 입었습니다.", symbol: "🧥" },
    ],
    wrongPool: [
      { text: "비파형 동검을 허리에 차고 부족 간의 정복 전쟁을 벌였다.", explanation: "비파형 동검과 정복 전쟁은 청동기 시대의 모습입니다.", symbol: "❌" },
      { text: "흙으로 빗살무늬 토기를 빚어 곡식을 저장하고 음식을 조리했다.", explanation: "빗살무늬 토기는 신석기 시대의 대표 유물입니다.", symbol: "❌" },
      { text: "지배자의 무덤으로 거대한 탁자식 고인돌을 세웠다.", explanation: "고인돌은 청동기 시대 지배자의 무덤입니다.", symbol: "❌" },
      { text: "단군왕검이 아사달에 우리나라 최초의 국가인 고조선을 건국했다.", explanation: "고조선 건국은 청동기 문화를 바탕으로 이루어졌습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 유물", label: "주먹도끼", desc: "구석기 시대를 대표하는 만능 사냥 및 생활 뗀석기", symbol: "/relics/handaxe.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 9: 개념 문항 - 구석기 사람들의 식생활과 옷차림]
    prompt: "구석기 시대 사람들의 [식생활과 옷차림]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "사냥한 동물의 가죽을 긁개로 손질하여 추위를 막는 가죽옷을 만들어 입었다.", explanation: "동물 털과 가죽을 다듬어 방한복으로 입었습니다.", symbol: "🧥" },
      { text: "자연에서 자라는 나무 열매, 씨앗, 풀뿌리 등을 채집하여 식량으로 삼았다.", explanation: "계절에 따라 다양한 식물 자원을 채집해 먹었습니다.", symbol: "🍒" },
      { text: "불에 고기를 구워 먹으면서 소화가 잘되고 탈이 나는 일이 줄어들었다.", explanation: "익혀 먹는 조리법이 발달하여 건강이 크게 향상되었습니다.", symbol: "🍖" },
      { text: "주먹도끼와 뗀석기, 나무 몽둥이를 들고 무리 지어 큰 짐승을 사냥했다.", explanation: "협동 사냥을 통해 매머드, 사슴, 멧돼지 등을 잡았습니다.", symbol: "🦣" },
      { text: "강가나 냇가에서 물고기를 잡고 조개를 채취해 먹었다.", explanation: "물가에서 손이나 뾰족한 도구로 물고기를 잡았습니다.", symbol: "🐟" },
    ],
    wrongPool: [
      { text: "논에 벼를 심고 가을에 쌀을 대량으로 수확해 밥을 지어 먹었다.", explanation: "벼농사와 쌀밥은 청동기 시대에 시작되었습니다.", symbol: "❌" },
      { text: "가락바퀴로 목화솜에서 실을 뽑아 비단옷과 청바지를 만들어 입었다.", explanation: "가락바퀴는 신석기 시대 유물이며, 청바지는 근현대 의류입니다.", symbol: "❌" },
      { text: "대형 마트와 편의점에서 가공된 캔 음료와 과자를 사서 먹었다.", explanation: "가공식품과 마트는 현대 사회의 모습입니다.", symbol: "❌" },
      { text: "밀과 보리를 가루로 빻아 빵과 국수를 대량 생산하는 공장을 세웠다.", explanation: "대량 식품 공장은 산업 혁명 이후의 현대 문명입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 유적", label: "단양 금굴 유적 (자연 동굴)", desc: "구석기 전기부터 후기까지 선사인들의 생활 터전이었던 자연 동굴", symbol: "/dwellings/cave.webp", source: "국가유산청 (공공누리 제1유형)" },
  },
  {
    // [유형 10: 시대 비교 - 뗀석기와 구석기 문화]
    prompt: "돌을 깨뜨려 만든 [뗀석기와 구석기 문화]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "큰 돌에 다른 돌을 부딪치거나 떼어내어 날카로운 날을 만들었다.", explanation: "돌을 직접 때리거나 떼어내는 방식으로 날을 세웠습니다.", symbol: "🪨" },
      { text: "시대가 지나면서 크고 무거운 돌에서 작고 날카로운 맞춤 도구로 발전했다.", explanation: "후기로 갈수록 쓰임새별로 세분화된 정교한 도구를 만들었습니다.", symbol: "✨" },
      { text: "주먹도끼, 긁개, 슴베찌르개 등 쓰임새에 따라 다양한 뗀석기를 만들었다.", explanation: "사냥, 가죽 가공, 찌르기 등 기능에 맞춘 도구들이 등장했습니다.", symbol: "🔪" },
      { text: "사냥감의 가죽을 벗기거나 살점을 발라낼 때 뗀석기의 날카로운 날을 썼다.", explanation: "예리한 뗀석기 파편 날은 훌륭한 절단 도구였습니다.", symbol: "🥩" },
      { text: "주변에서 쉽게 구할 수 있는 단단한 자갈돌이나 석영, 흑요석 등을 활용했다.", explanation: "깨뜨렸을 때 날카로운 날이 생기는 단단한 암석을 찾아 썼습니다.", symbol: "💎" },
    ],
    wrongPool: [
      { text: "돌 표면을 숫돌에 정성껏 갈아서 매끄럽고 반짝이게 만든 '간석기'였다.", explanation: "돌을 갈아서 만든 간석기는 신석기 시대의 도구입니다.", symbol: "❌" },
      { text: "구리와 주석을 불에 녹여 부어 만든 반짝이는 청동 도구였다.", explanation: "청동으로 만든 금속 도구는 청동기 시대의 도구입니다.", symbol: "❌" },
      { text: "철광석을 녹여 두드려 만든 쇠스랑과 쇠도끼였다.", explanation: "철제 농기구와 무기는 철기 시대의 도구입니다.", symbol: "❌" },
      { text: "전동 모터를 달아 저절로 돌이 갈라지게 만든 자동 도구였다.", explanation: "전동 공구는 현대의 기계 장치입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "구석기 문화", label: "뗀석기의 지혜", desc: "주변의 돌을 깨뜨려 날을 세우고 생활에 활용한 인류 최초의 지혜", symbol: "/relics/handaxe.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
];

const neolithicTemplates: RawQuizTemplate[] = [
  {
    // [유형 1: 사진 기반 - 빗살무늬 토기의 이름과 쓰임새]
    prompt: "사진 속 신석기 시대를 대표하는 보물 유물인 [빗살무늬 토기]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "진흙으로 빚은 뒤 불에 구워 단단하게 만든 신석기 시대의 흙 그릇이다.", explanation: "토기는 흙을 빚어 구워 만든 신석기 시대의 혁신적 발명품입니다.", symbol: "🏺" },
      { text: "농경으로 수확한 곡식을 안전하게 담아 보관하거나 음식을 끓여 먹는 데 썼다.", explanation: "식량 저장과 조리를 가능하게 하여 생활의 안정을 가져왔습니다.", symbol: "🌾" },
      { text: "토기 표면에 빗살 모양의 선과 점 무늬를 정성껏 새겨 넣었다.", explanation: "생선 뼈나 뾰족한 도구로 겉면에 독특한 빗살 무늬를 새겼습니다.", symbol: "✨" },
      { text: "바닥이 뾰족하여 강가나 바닷가의 부드러운 모래밭이나 흙에 꽂아두기 편했다.", explanation: "모래밭 바닥에 꽂아 세워두기 좋도록 뾰족한 V자형 바닥을 가졌습니다.", symbol: "🏖️" },
      { text: "자연 채집에서 벗어나 식량을 스스로 저장하게 된 신석기인의 지혜를 보여준다.", explanation: "농경의 시작과 함께 식량을 비축하는 중요한 도구였습니다.", symbol: "💡" },
    ],
    wrongPool: [
      { text: "청동을 불에 녹여 찍어낸 금속 그릇으로 귀족들만 사용했다.", explanation: "빗살무늬 토기는 청동이 아닌 흙을 빚어 구운 토기입니다.", symbol: "❌" },
      { text: "짐승의 가죽을 벗기고 나무를 깎기 위해 돌을 깨뜨려 만든 뗀석기였다.", explanation: "가죽을 다듬는 도구는 구석기 시대의 긁개와 밀개입니다.", symbol: "❌" },
      { text: "철광석을 녹여 두드려 만든 단단한 쇠 가마솥이었다.", explanation: "철제 솥은 철기 시대 이후에 등장했습니다.", symbol: "❌" },
      { text: "글자를 새겨 넣기 위해 종이 대신 붓으로 먹물을 묻혀 쓴 책이었다.", explanation: "신석기 시대에는 문자와 종이가 없었습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 토기", label: "빗살무늬 토기", desc: "곡식 저장과 조리를 위해 흙으로 빚어 빗살 무늬를 새긴 신석기 토기", symbol: "/relics/comb_pottery.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 2: 사진 기반 - 갈판과 갈돌의 쓰임새]
    prompt: "사진 속 신석기 시대의 대표 간석기인 [갈판과 갈돌]의 쓰임새로 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "넓적한 갈판 위에 곡식을 올리고, 둥근 갈돌을 손으로 굴리며 껍질을 벗겼다.", explanation: "두 돌을 마주 비벼 곡식의 껍질을 벗기고 가루를 냈습니다.", symbol: "🪨" },
      { text: "도토리나 단단한 나무 열매, 씨앗 등을 가루로 곱게 빻는 데 썼다.", explanation: "도토리의 떫은맛을 빼고 가루로 만들어 식량으로 섭취했습니다.", symbol: "🌰" },
      { text: "돌을 정성껏 갈아서 매끄럽고 평평하게 다듬은 신석기 시대의 '간석기'이다.", explanation: "숫돌에 문질러 정교하게 갈아 만든 간석기 도구입니다.", symbol: "✨" },
      { text: "곡식을 가루로 만들어 토기에 넣고 끓여 죽을 쑤어 먹을 수 있게 해 주었다.", explanation: "가루 음식을 조리하여 부드럽게 섭취할 수 있게 되었습니다.", symbol: "🥣" },
      { text: "농경이 시작되면서 수확한 곡식을 가공하기 위해 만들어진 필수 생활 도구였다.", explanation: "농경의 발달과 함께 식생활을 크게 개선한 도구입니다.", symbol: "🌾" },
    ],
    wrongPool: [
      { text: "먼 거리에서 빠른 사슴을 맞히기 위해 활에 장착하던 화살촉이었다.", explanation: "사냥 무기는 간돌화살촉입니다.", symbol: "❌" },
      { text: "사나운 짐승의 목을 베기 위해 휘두르던 날카로운 청동 칼이었다.", explanation: "청동 칼은 청동기 시대의 비파형 동검입니다.", symbol: "❌" },
      { text: "실을 꼬아 뽑아내기 위해 가운데 둥근 구멍에 막대를 꽂아 돌리던 도구였다.", explanation: "실을 뽑는 도구는 가락바퀴입니다.", symbol: "❌" },
      { text: "바다 한가운데에 던져 물고기를 잡던 무거운 쇠그물 추였다.", explanation: "쇠그물은 철기 시대 이후에 발달한 도구입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 도구", label: "갈판과 갈돌", desc: "곡식의 껍질을 벗기거나 도토리와 열매를 가루로 빻던 간석기", symbol: "/relics/saddle_quern.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 3: 사진 기반 - 가락바퀴의 이름과 원시 방직]
    prompt: "사진 속 신석기 시대 유물인 [가락바퀴]의 쓰임새와 특징으로 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "가운데 뚫린 둥근 구멍에 나무 막대를 꽂고 회전시켜 실을 꼬아 뽑아냈다.", explanation: "회전력을 이용하여 섬유에서 질긴 실을 잣아냈습니다.", symbol: "🧶" },
      { text: "동물 털이나 삼(식물 섬유)에서 실을 뽑아 옷감과 그물을 만드는 데 썼다.", explanation: "뽑아낸 실로 옷을 짓거나 물고기잡이 그물을 만들었습니다.", symbol: "🧵" },
      { text: "인류가 동물의 가죽옷을 벗어나 스스로 옷을 만들어 입기 시작했음을 보여준다.", explanation: "원시 직조 기술이 시작되어 의생활이 획기적으로 발전했습니다.", symbol: "👗" },
      { text: "흙을 빚어 구워 만들거나 둥근 돌을 갈아서 구멍을 뚫어 제작했다.", explanation: "흙이나 돌을 둥글게 다듬어 가운데 구멍을 뚫었습니다.", symbol: "🪨" },
      { text: "뼈바늘과 함께 신석기 사람들의 발달한 의생활(옷 짓기)을 증명하는 대표 유물이다.", explanation: "가락바퀴와 뼈바늘은 신석기 의생활의 쌍두마차입니다.", symbol: "💡" },
    ],
    wrongPool: [
      { text: "말을 타고 달릴 때 말의 발굽을 보호하기 위해 씌우던 쇠 편자였다.", explanation: "말 편자는 삼국 시대 이후에 본격화되었습니다.", symbol: "❌" },
      { text: "음식을 볶거나 튀길 때 손에 쥐고 프라이팬을 저어 주던 숟가락이었다.", explanation: "가락바퀴는 실을 뽑는 방직 도구입니다.", symbol: "❌" },
      { text: "적의 화살을 막아내기 위해 왼쪽 가슴에 달던 금속 방패였다.", explanation: "가락바퀴는 작은 손도구입니다.", symbol: "❌" },
      { text: "벼의 이삭을 잘라 내기 위해 손가락을 걸고 쓰던 청동기 농기구였다.", explanation: "벼 이삭 수확 도구는 청동기 시대의 반달 돌칼입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 도구", label: "가락바퀴", desc: "가운데 둥근 구멍에 막대를 꽂아 실을 꼬아 뽑아낸 원시 직조 도구", symbol: "/relics/spindle_whorl.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 4: 사진 기반 - 뼈바늘과 옷 짓기]
    prompt: "신석기 시대 사람들이 옷을 짓고 그물을 꿰맬 때 쓴 [뼈바늘]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "동물의 뼈를 숫돌에 가늘고 뾰족하게 갈아서 한쪽 끝에 실을 꿸 수 있는 바늘귀를 뚫었다.", explanation: "뼈를 정교하게 갈아 구멍을 뚫은 바느질 바늘입니다.", symbol: "🦴" },
      { text: "가락바퀴로 뽑아낸 실을 꿰어 옷을 짓거나 찢어진 물고기잡이 그물을 수리했다.", explanation: "실을 꿰어 옷을 짓고 그물을 엮는 데 썼습니다.", symbol: "🧵" },
      { text: "동물 가죽이나 식물 섬유를 꿰매어 몸에 딱 맞는 편리한 옷을 만들었다.", explanation: "정교한 바느질로 체형에 맞는 옷을 제작할 수 있었습니다.", symbol: "👕" },
      { text: "단단한 뼈를 매우 정교하게 갈아 만든 신석기 사람들의 뛰어난 가공 기술을 보여준다.", explanation: "작은 뼈에 정밀한 구멍을 뚫을 만큼 가공 기술이 발달했습니다.", symbol: "✨" },
      { text: "오늘날 우리가 사용하는 바늘의 원형이 되는 인류 최초의 바느질 도구이다.", explanation: "현대 바늘과 동일한 원리를 가진 유서 깊은 도구입니다.", symbol: "💡" },
    ],
    wrongPool: [
      { text: "환자의 체온을 측정하기 위해 귀에 꽂던 전자 체온계였다.", explanation: "전자 의료 기기는 현대의 기술입니다.", symbol: "❌" },
      { text: "거대한 통나무를 베어 넘길 때 쓰던 청동 전기톱이었다.", explanation: "뼈바늘은 작은 바느질 손도구입니다.", symbol: "❌" },
      { text: "벼 이삭을 한꺼번에 베어내던 청동기 시대 수확 농기구였다.", explanation: "벼 수확 도구는 청동기 시대의 반달 돌칼입니다.", symbol: "❌" },
      { text: "땅속에 묻힌 시신을 파내어 화장할 때 쓰던 제사용 도구였다.", explanation: "뼈바늘은 일상생활의 바느질 도구입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 의생활", label: "뼈바늘", desc: "동물 뼈를 갈아 바늘귀를 뚫어 옷과 그물을 꿰맨 바느질 도구", symbol: "/relics/bone_needle.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 5: 사진 기반 - 간돌도끼와 간석기 기술]
    prompt: "돌을 갈아서 날을 세운 신석기 시대의 대표 간석기인 [간돌도끼]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "돌 표면을 숫돌에 정성껏 갈아서 날카롭고 매끄러운 날을 세운 '간석기'이다.", explanation: "돌을 갈아서 날을 세운 정교한 간석기입니다.", symbol: "🪨" },
      { text: "나무를 베거나 다듬어 움집을 짓고 뗏목을 만드는 등 목재 가공에 널리 쓰였다.", explanation: "집짓기와 도구 제작에 필수적인 벌목·목공 도구였습니다.", symbol: "🪵" },
      { text: "숲을 개간하여 농사지을 밭을 마련하고 잡목을 정리하는 데 큰 힘을 발휘했다.", explanation: "농경지 개간과 농사 준비에 중요한 역할을 했습니다.", symbol: "🌾" },
      { text: "돌을 깨뜨려 쓰던 뗀석기에 비해 훨씬 정교하고 절단력이 뛰어났다.", explanation: "갈아서 만든 매끄러운 날 덕분에 작업 효율이 월등했습니다.", symbol: "✨" },
      { text: "단단한 나무 자루에 묶어 오늘날의 도끼처럼 손쉽게 휘둘러 사용했다.", explanation: "자루와 결합하여 강한 힘을 내는 도끼로 활용했습니다.", symbol: "🪓" },
    ],
    wrongPool: [
      { text: "자동으로 나무를 잘라 주는 인공지능 벌목 기계였다.", explanation: "사람이 손으로 쥐고 쓰던 석기 도구입니다.", symbol: "❌" },
      { text: "구리와 주석을 불에 녹여 만든 번쩍이는 청동 도끼였다.", explanation: "간돌도끼는 금속이 아닌 돌을 갈아 만든 간석기입니다.", symbol: "❌" },
      { text: "곡식의 껍질을 벗기기 위해 바닥에 깔아 두던 넓적한 돌판이었다.", explanation: "곡식을 가는 돌판은 갈판입니다.", symbol: "❌" },
      { text: "제사장이 하늘에 제사를 지낼 때 손에 들고 흔들던 청동 방울이었다.", explanation: "청동 방울은 청동기 시대의 의식용 제기입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 도구", label: "간돌도끼", desc: "돌을 갈고 다듬어 날을 세운 정교한 목재 가공 및 개간 도구", symbol: "/relics/ground_stone_axe.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 6: 사진 기반 - 간돌화살촉과 어로 도구]
    prompt: "신석기 사람들이 사냥과 물고기잡이에 사용한 [간돌화살촉과 어로 도구]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "돌을 작고 뾰족하게 갈아 화살촉을 만들어 활에 장착해 빠른 사냥감을 잡았다.", explanation: "활과 간돌화살촉으로 날쌘 동물 사냥에 성공했습니다.", symbol: "🏹" },
      { text: "뼈로 만든 작살(뼈작살)과 낚싯바늘(뼈낚시)을 이용해 큰 물고기를 잡았다.", explanation: "뼈로 만든 정교한 어로 도구로 강과 바다에서 고기를 낚았습니다.", symbol: "🐟" },
      { text: "그물이 물속으로 가라앉도록 돌 양쪽에 홈을 판 '돌그물추'를 그물에 매달았다.", explanation: "그물 아래에 돌그물추를 달아 넓게 펼쳐지게 했습니다.", symbol: "🕸️" },
      { text: "강가나 바닷가에 정착하여 살던 신석기 사람들의 풍부한 어로 생활을 잘 보여준다.", explanation: "물고기와 조개는 신석기인의 가장 중요한 단백질 공급원이었습니다.", symbol: "🌊" },
      { text: "원거리 사냥 무기인 활을 정교한 간돌화살촉과 함께 본격적으로 활용했다.", explanation: "활의 보급으로 사냥의 안전성과 성공률이 비약적으로 향상되었습니다.", symbol: "🎯" },
    ],
    wrongPool: [
      { text: "원자력 엔진을 장착한 대형 원양 어선을 타고 남극해로 출항했다.", explanation: "원양 어선은 현대의 산업 시설입니다.", symbol: "❌" },
      { text: "철광석을 녹여 두드려 만든 쇠스랑과 강철 작살을 대량으로 썼다.", explanation: "철제 도구는 철기 시대 이후에 발달했습니다.", symbol: "❌" },
      { text: "바다를 건너가 다른 나라를 정복하기 위해 만든 청동 군함이었다.", explanation: "청동 군함은 고대 문명기 이후의 이야기입니다.", symbol: "❌" },
      { text: "물고기 잡이를 법으로 엄격히 금지하고 오직 풀뿌리만 채집하게 했다.", explanation: "물고기잡이는 신석기인의 가장 중요한 생계였습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 사냥·어로", label: "간돌화살촉과 어로 도구", desc: "활에 장착한 간돌화살촉, 뼈작살, 뼈낚시, 돌그물추", symbol: "/relics/ground_arrowhead.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 7: 유물 묶기 - 신석기 시대를 대표하는 유물 3가지]
    prompt: "사진 속 [빗살무늬 토기]와 같은 신석기 시대에 사용된 대표 유물 중 옳은 것을 고르세요.",
    difficulty: "NORMAL",
    correctPool: [
      { text: "곡식과 도토리의 껍질을 벗기고 가루로 빻던 [갈판과 갈돌]", explanation: "갈판과 갈돌은 신석기 시대의 대표 곡물 가공 도구입니다.", symbol: "🪨" },
      { text: "실을 꼬아 뽑아내어 옷과 그물을 만들던 [가락바퀴]", explanation: "가락바퀴는 신석기 시대의 옷 제작 도구입니다.", symbol: "🧶" },
      { text: "동물 뼈를 갈아 바늘귀를 뚫어 바느질하던 [뼈바늘]", explanation: "뼈바늘은 신석기 시대의 바느질 도구입니다.", symbol: "🦴" },
      { text: "돌을 갈아 날카롭게 날을 세워 나무를 베던 [간돌도끼]", explanation: "간돌도끼는 신석기 시대의 대표 간석기입니다.", symbol: "🪓" },
      { text: "그물을 물속에 가라앉히기 위해 매달던 [돌그물추]", explanation: "돌그물추는 신석기 시대의 물고기잡이 도구입니다.", symbol: "🐟" },
    ],
    wrongPool: [
      { text: "청동을 불에 녹여 부어 만든 군장의 칼인 [비파형 동검]", explanation: "비파형 동검은 청동기 시대의 무기입니다.", symbol: "❌" },
      { text: "돌을 깨뜨려 양쪽 날을 거칠게 다듬은 만능 칼인 [주먹도끼]", explanation: "주먹도끼는 구석기 시대의 뗀석기입니다.", symbol: "❌" },
      { text: "청동기 시대 벼의 이삭을 잘라 내던 수확 도구인 [반달 돌칼]", explanation: "반달 돌칼은 청동기 시대의 농기구입니다.", symbol: "❌" },
      { text: "거대한 돌을 얹어 만든 지배자의 무덤인 [탁자식 고인돌]", explanation: "고인돌은 청동기 시대 족장의 무덤입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 유물", label: "빗살무늬 토기", desc: "신석기 시대를 대표하는 대표적인 흙 그릇 유물", symbol: "/relics/comb_pottery.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 8: 일러스트 기반 - 강가·바닷가 정착 마을과 움집]
    prompt: "신석기 시대 사람들이 마을을 이루고 정착해 살았던 [움집]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "물을 얻기 쉽고 물고기잡이와 농사에 유리한 강가나 바닷가에 터를 잡았다.", explanation: "생활용수를 얻고 어로와 농경에 편리한 물가에 정착했습니다.", symbol: "🌊" },
      { text: "바닥을 둥글게 파고 기둥을 세운 뒤 짚이나 갈대로 지붕을 얹은 '움집'을 지었다.", explanation: "바닥을 파서 보온성을 높인 원형 움집을 건축했습니다.", symbol: "🛖" },
      { text: "움집 중앙 바닥에 돌을 둘러 화덕(모닥불 자리)을 만들어 난방과 조리를 했다.", explanation: "집 가운데 화덕을 두어 추위를 막고 음식을 익혀 먹었습니다.", symbol: "🔥" },
      { text: "동굴이나 막집을 옮겨 다니던 이동 생활을 끝내고 한곳에 머무는 '정착 생활'을 시작했다.", explanation: "농경이 시작되면서 비로소 한곳에 정착하여 살게 되었습니다.", symbol: "🏡" },
      { text: "가족과 친족들이 모여 움집 마을을 이루고 서로 도우며 공동체 생활을 했다.", explanation: "혈연 중심의 씨족들이 모여 평등한 마을 공동체를 이루었습니다.", symbol: "🤝" },
    ],
    wrongPool: [
      { text: "사냥감을 찾아 계절마다 거처를 옮기며 가죽으로 만든 막집에 임시로 살았다.", explanation: "임시 막집과 이동 생활은 구석기 시대의 특징입니다.", symbol: "❌" },
      { text: "마을 주변에 거대한 도랑(환호)과 통나무 울타리를 둘러 정복 전쟁에 대비했다.", explanation: "도랑과 목책 방어 시설은 청동기 시대의 특징입니다.", symbol: "❌" },
      { text: "엘리베이터가 오르내리는 50층 철골 아파트를 지어 살았다.", explanation: "고층 아파트는 현대의 주거 형태입니다.", symbol: "❌" },
      { text: "적의 대포 공격을 막기 위해 두꺼운 콘크리트 성벽을 쌓았다.", explanation: "성벽과 콘크리트는 현대 군사 건축입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 주거", label: "암사동 움집 마을", desc: "땅을 파고 기둥을 세운 둥근 움집과 강가·바닷가 정착 마을", symbol: "/dwellings/neolithic_hut.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 9: 개념 문항 - 신석기 혁명과 농경의 시작]
    prompt: "인류 역사상 가장 큰 변화를 가져온 신석기 시대의 [농경의 시작]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "자연에서 열매를 따고 짐승을 쫓던 생활에서 벗어나 스스로 식량을 생산하기 시작했다.", explanation: "식량 채집 단계에서 식량 생산 단계로 발전했습니다.", symbol: "🌾" },
      { text: "조, 기장, 피 등의 잡곡을 심는 밭농사를 처음으로 시작했다.", explanation: "벼농사 이전의 원시 밭농사가 신석기에 시작되었습니다.", symbol: "🌱" },
      { text: "개, 돼지 등의 동물을 길들여 기르는 '가축 사육'이 함께 시작되었다.", explanation: "농경과 함께 가축을 길러 안정적인 식량을 확보했습니다.", symbol: "🐖" },
      { text: "농사를 짓고 곡식을 수확하기 위해 한곳에 정착하여 머물러 살게 되었다.", explanation: "농작물을 돌보고 지키기 위해 정착 생활이 필수적이었습니다.", symbol: "🏡" },
      { text: "수확한 곡식을 안전하게 보관하고 조리하기 위해 빗살무늬 토기를 빚었다.", explanation: "농경의 결실을 저장하고 요리하기 위해 토기가 탄생했습니다.", symbol: "🏺" },
    ],
    wrongPool: [
      { text: "대규모 저수지를 파고 논에 모를 심어 벼농사를 대대적으로 시작했다.", explanation: "본격적인 벼농사는 청동기 시대에 시작되었습니다.", symbol: "❌" },
      { text: "대형 트랙터와 콤바인 농기계를 도입해 무인 자동 농경을 실시했다.", explanation: "농기계는 현대 농업 기술입니다.", symbol: "❌" },
      { text: "농사를 짓는 것은 신의 섭리에 어긋난다고 여겨 농경을 전면 금지했다.", explanation: "농경은 인류 생존을 획기적으로 바꾼 위대한 발전이었습니다.", symbol: "❌" },
      { text: "농경의 시작으로 계급이 생겨 족장이 강력한 권력으로 노비를 부렸다.", explanation: "계급과 족장의 등장은 청동기 시대의 특징입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 농경", label: "농경의 시작", desc: "자연 채집에서 식량 생산으로의 전환, 조·기장 밭농사와 가축 사육", symbol: "/dwellings/river_sea_village.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 10: 개념 문항 - 신석기 사람들의 전반적 생활 모습]
    prompt: "[신석기 시대] 사람들의 생활 모습으로 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "강가나 바닷가에 둥근 움집을 짓고 한곳에 머물러 정착 생활을 했다.", explanation: "움집을 중심으로 정착 마을을 형성했습니다.", symbol: "🛖" },
      { text: "돌을 갈아서 날을 세운 정교한 '간석기'를 만들어 사용했다.", explanation: "간석기는 신석기 시대의 대표 제작 기술입니다.", symbol: "🪨" },
      { text: "빗살무늬 토기에 곡식을 저장하고 음식을 끓여 먹었다.", explanation: "토기를 통해 음식 보관과 조리가 가능해졌습니다.", symbol: "🏺" },
      { text: "가락바퀴와 뼈바늘을 이용해 실을 뽑고 옷과 그물을 지어 입었다.", explanation: "원시 직조 기술로 스스로 의류를 제작했습니다.", symbol: "🧵" },
      { text: "조와 기장을 심는 밭농사를 짓고 개나 돼지 등 가축을 길렀다.", explanation: "식량을 직접 생산하는 농경과 목축이 시작되었습니다.", symbol: "🌾" },
    ],
    wrongPool: [
      { text: "비파형 동검을 들고 부족 간의 정복 전쟁을 벌였다.", explanation: "비파형 동검과 정복 전쟁은 청동기 시대의 모습입니다.", symbol: "❌" },
      { text: "사냥감을 찾아 동굴이나 바위 그늘로 떠돌아다니는 이동 생활을 했다.", explanation: "동굴 이동 생활은 구석기 시대의 특징입니다.", symbol: "❌" },
      { text: "철광석을 녹여 만든 단단한 쇠스랑과 철제 칼을 사용했다.", explanation: "철제 도구는 철기 시대의 도구입니다.", symbol: "❌" },
      { text: "단군왕검이 아사달을 도읍으로 삼아 고조선을 건국했다.", explanation: "고조선 건국은 청동기 문화를 바탕으로 합니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 생활", label: "신석기 생활상", desc: "정착 생활, 간석기, 토기 제작, 원시 농경과 직조 생활", symbol: "/dwellings/neolithic_hut.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 11: 시대 비교 - 구석기에서 신석기로의 결정적 변화]
    prompt: "구석기 시대에서 [신석기 시대]로 넘어가면서 시작된 새로운 변화 중 옳은 것을 고르세요.",
    difficulty: "NORMAL",
    correctPool: [
      { text: "자연 채집에서 벗어나 식량을 스스로 생산하는 '농경(밭농사)'이 시작되었다.", explanation: "식량을 직접 생산하는 위대한 신석기 혁명이 일어났습니다.", symbol: "🌾" },
      { text: "동굴이나 막집을 옮겨 다니지 않고 움집을 짓고 마을을 이루는 '정착 생활'이 시작되었다.", explanation: "농경과 함께 한곳에 머무는 정착 생활이 자리 잡았습니다.", symbol: "🏡" },
      { text: "돌을 깨뜨려 쓰던 뗀석기 대신 돌을 정성껏 갈아 만든 '간석기'를 만들어 썼다.", explanation: "갈아서 날을 세운 정교한 간석기가 보급되었습니다.", symbol: "🪨" },
      { text: "음식과 곡식을 담아 보관하고 끓여 먹는 '토기(빗살무늬 토기)'가 처음 만들어졌다.", explanation: "저장과 조리를 위한 흙 그릇이 탄생했습니다.", symbol: "🏺" },
      { text: "가락바퀴와 뼈바늘을 발명하여 식물 섬유나 동물 털로 직접 옷을 지어 입기 시작했다.", explanation: "가죽옷을 벗어나 스스로 옷을 지어 입는 의생활 혁명이 일어났습니다.", symbol: "🧵" },
    ],
    wrongPool: [
      { text: "청동을 불에 녹여 무기를 만들고 부족 간의 치열한 영토 정복 전쟁을 벌였다.", explanation: "청동 무기와 정복 전쟁은 청동기 시대의 특징입니다.", symbol: "❌" },
      { text: "사유재산과 빈부 격차가 생겨 힘센 족장이 백성을 다스리는 계급 사회가 되었다.", explanation: "계급 사회의 등장은 청동기 시대의 특징입니다.", symbol: "❌" },
      { text: "단군왕검이 세운 우리나라 최초의 국가인 고조선이 건국되었다.", explanation: "고조선 건국은 청동기 시대를 배경으로 합니다.", symbol: "❌" },
      { text: "스마트폰과 인터넷을 통해 다른 대륙의 사람들과 화상 통화를 시작했다.", explanation: "스마트폰과 인터넷은 현대 IT 기술입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "신석기 변화", label: "신석기의 변화", desc: "이동에서 정착으로, 뗀석기에서 간석기로, 채집에서 농경으로", symbol: "/relics/comb_pottery.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
];

const bronzeAgeTemplates: RawQuizTemplate[] = [
  {
    // [유형 1: 사진 기반 - 비파형 동검의 이름과 의미]
    prompt: "사진 속 청동기 시대를 대표하는 보물 무기인 [비파형 동검]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "악기 '비파'의 모양을 닮아 몸체가 둥근 곡선형으로 다듬어진 청동검이다.", explanation: "중국의 직선형 동검과 달리 둥근 곡선을 가진 독창적인 검입니다.", symbol: "🗡️" },
      { text: "구리와 주석을 불에 녹여 정성껏 틀에 부어 만든 귀한 청동 무기였다.", explanation: "귀한 금속인 청동으로 제작된 최고급 무기였습니다.", symbol: "✨" },
      { text: "힘이 센 부족의 족장(지배자)이 자신의 권력과 위엄을 과시하기 위해 가졌다.", explanation: "일반인이 가질 수 없는 지배자의 상징물이었습니다.", symbol: "👑" },
      { text: "만주와 한반도 일대에서 주로 발견되어 우리 역사의 독자적인 문화 범위를 증명한다.", explanation: "고조선 문화권의 범위를 알려주는 결정적 유물입니다.", symbol: "🗺️" },
      { text: "탁자식 고인돌과 함께 청동기 시대와 고조선의 문화를 알려주는 대표 유물이다.", explanation: "고조선 성립기의 청동기 문화를 대표하는 쌍두마차입니다.", symbol: "🏛️" },
    ],
    wrongPool: [
      { text: "일반 농민들이 논에서 벼 이삭을 잘라 내기 위해 쓰던 농기구였다.", explanation: "농기구는 돌로 만든 반달 돌칼입니다.", symbol: "❌" },
      { text: "돌을 깨뜨려 떼어낸 구석기 시대의 좌우 대칭 뗀석기였다.", explanation: "구석기 뗀석기는 주먹도끼입니다.", symbol: "❌" },
      { text: "실을 꼬아 뽑아내기 위해 가운데 둥근 구멍에 막대를 꽂아 돌리던 도구였다.", explanation: "실을 뽑는 도구는 신석기 시대의 가락바퀴입니다.", symbol: "❌" },
      { text: "철광석을 녹여 두드려 만든 값싸고 흔한 철제 부엌칼이었다.", explanation: "청동기 시대의 귀한 지배자 무기입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 무기", label: "비파형 동검", desc: "구리와 주석을 합금하여 만든 곡선형 청동검으로 지배자의 권력을 상징", symbol: "/relics/mandolin_dagger.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 2: 사진 기반 - 반달 돌칼의 쓰임새]
    prompt: "사진 속 청동기 시대의 대표 농기구인 [반달 돌칼]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "청동이 귀했기 때문에 농기구는 여전히 단단한 돌을 갈아서(간석기) 만들었다.", explanation: "청동은 귀해서 지배자의 무기와 제기로만 썼습니다.", symbol: "🪨" },
      { text: "가운데 뚫린 구멍에 끈을 꿰어 손가락을 걸고 벼 이삭을 잘라 수확했다.", explanation: "이삭만 쏙쏙 잘라내는 효율적인 수확 도구였습니다.", symbol: "✋" },
      { text: "반달 모양처럼 한쪽은 둥글고 반대쪽 날은 직선으로 손에 쥐기 편하게 생겼다.", explanation: "손에 착 감기는 반달 형태로 정교하게 갈아 만들었습니다.", symbol: "🌙" },
      { text: "청동기 시대에 벼농사가 본격적으로 시작되었음을 생생하게 증명하는 유물이다.", explanation: "벼 수확을 위해 맞춤 제작된 필수 수확 농기구였습니다.", symbol: "🌾" },
      { text: "수확 효율을 크게 높여 농업 생산량을 늘리는 데 중요한 역할을 했다.", explanation: "곡식 수확량을 늘려 사유재산 형성에 기여했습니다.", symbol: "🍚" },
    ],
    wrongPool: [
      { text: "청동을 불에 녹여 대량으로 찍어낸 최초의 금속 농기구였다.", explanation: "반달 돌칼은 청동이 아니라 돌을 갈아 만든 간석기입니다.", symbol: "❌" },
      { text: "적의 목을 베기 위해 전사들이 품에 숨겨 다니던 암살용 단검이었다.", explanation: "벼 이삭을 수확하던 평화로운 농기구입니다.", symbol: "❌" },
      { text: "나무 기둥에 박아서 움집 지붕을 지탱하던 쇠못 역할을 했다.", explanation: "곡식 수확용 손도구입니다.", symbol: "❌" },
      { text: "흙을 빚어 곡식을 담아 보관하던 저장 그릇이었다.", explanation: "그릇은 토기입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 유물", label: "반달 돌칼", desc: "반달 모양의 돌에 구멍이 뚫려 있는 청동기 시대의 대표 유물", symbol: "/relics/semilunar_knife.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 3: 사진 기반 - 탁자식 고인돌과 지배자의 권력]
    prompt: "청동기 시대 지배자의 거대한 무덤인 [탁자식 고인돌]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "널찍한 굄돌(받침돌)을 세우고 그 위에 수십 톤의 거대한 덮개돌을 얹은 무덤이다.", explanation: "탁자 모양을 이루는 웅장한 지배자의 무덤입니다.", symbol: "🏛️" },
      { text: "거대한 바위를 옮기기 위해 수백 명의 사람을 동원할 수 있었던 족장의 큰 권력을 보여준다.", explanation: "막대한 노동력을 동원할 수 있는 지배자의 등장을 증명합니다.", symbol: "👑" },
      { text: "마치 네모난 책상(탁자)처럼 생겼다고 하여 '탁자식 고인돌'이라고 부른다.", explanation: "북방식 고인돌의 대표적 형태입니다.", symbol: "🪨" },
      { text: "비파형 동검과 함께 고조선의 문화 범위를 짐작하게 해 주는 대표 유물이다.", explanation: "만주와 한반도에 걸쳐 널리 분포합니다.", symbol: "🗺️" },
      { text: "무덤 방 안에는 비파형 동검, 옥 장신구 등 귀한 껴묻거리를 함께 묻었다.", explanation: "지배자의 내세를 위해 귀한 유물을 함께 매장했습니다.", symbol: "💎" },
    ],
    wrongPool: [
      { text: "바다의 쓰나미를 막기 위해 해안가에 쌓아 올린 방파제였다.", explanation: "지배자의 권력을 상징하는 무덤 유적입니다.", symbol: "❌" },
      { text: "기계 포클레인을 조종하여 10분 만에 손쉽게 조립해 만든 돌상자였다.", explanation: "수많은 사람의 인력과 굴림대로 운반했습니다.", symbol: "❌" },
      { text: "구석기 시대 사람들이 맹수를 피해 살았던 바위 그늘 거처였다.", explanation: "청동기 시대의 거대한 돌무덤입니다.", symbol: "❌" },
      { text: "평민과 노비들이 죽었을 때 누구나 평등하게 묻히던 공동묘지였다.", explanation: "힘센 족장(지배층)만이 누릴 수 있던 특권 무덤이었습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 무덤", label: "탁자식 고인돌", desc: "판석을 세우고 거대한 덮개돌을 얹은 군장의 권력 상징 무덤", symbol: "/relics/table_dolmen.webp", source: "국가유산청 (공공누리 제1유형)" },
  },
  {
    // [유형 4: 유물 묶기 - 청동기 시대를 대표하는 유물 3가지]
    prompt: "사진 속 [비파형 동검]과 같은 청동기 시대에 사용된 대표 유물 중 옳은 것을 고르세요.",
    difficulty: "NORMAL",
    correctPool: [
      { text: "지배자의 강력한 권력을 과시하는 거대한 무덤인 [탁자식 고인돌]", explanation: "고인돌은 청동기 지배자의 무덤입니다.", symbol: "🏛️" },
      { text: "벼농사 때 벼 이삭을 잘라 내던 대표 수확 도구인 [반달 돌칼]", explanation: "반달 돌칼은 청동기 시대의 대표 농기구입니다.", symbol: "🌾" },
      { text: "제사장이 하늘에 제사를 지낼 때 흔들던 제사용 의기인 [청동 방울]", explanation: "청동 방울은 제정일치 사회의 제사용 유물입니다.", symbol: "🔔" },
      { text: "무늬가 없고 평평한 바닥을 가진 곡식 저장용 [민무늬 토기]", explanation: "민무늬 토기는 청동기 시대의 대표 토기입니다.", symbol: "🏺" },
      { text: "빛을 반사하여 하늘과 소통하며 신성한 권위를 세운 [청동 거울]", explanation: "청동 거울은 제사용 의기로 사용되었습니다.", symbol: "🪞" },
    ],
    wrongPool: [
      { text: "흙에 빗살 무늬를 새겨 곡식을 담던 [빗살무늬 토기]", explanation: "빗살무늬 토기는 신석기 시대의 유물입니다.", symbol: "❌" },
      { text: "돌을 깨뜨려 떼어낸 만능 사냥 뗀석기인 [주먹도끼]", explanation: "주먹도끼는 구석기 시대의 뗀석기입니다.", symbol: "❌" },
      { text: "실을 꼬아 뽑아내던 원시 직조 도구인 [가락바퀴]", explanation: "가락바퀴는 신석기 시대의 도구입니다.", symbol: "❌" },
      { text: "곡식의 껍질을 벗기기 위해 손으로 밀던 [갈판과 갈돌]", explanation: "갈판과 갈돌은 신석기 시대의 간석기입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 유물", label: "비파형 동검", desc: "청동기 시대를 대표하는 보물 무기 유물", symbol: "/relics/mandolin_dagger.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 5: 개념 문항 - 벼농사의 시작과 사회 변화]
    prompt: "청동기 시대 식생활과 사회에 대변혁을 가져온 [벼농사의 시작]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "신석기 시대의 밭농사에 이어 논에 물을 대어 짓는 '벼농사'가 본격적으로 시작되었다.", explanation: "논농사 기술이 보급되어 쌀이 주식으로 자리 잡았습니다.", symbol: "🌾" },
      { text: "쌀이 중요한 식량으로 자리 잡으면서 식생활이 풍요로워지고 인구가 크게 늘었다.", explanation: "높은 식량 생산량 덕분에 대규모 취락이 형성되었습니다.", symbol: "🍚" },
      { text: "먹고 남는 '잉여 생산물(남은 곡식)'이 생기면서 이를 개인이 소유하는 '사유재산'이 발생했다.", explanation: "개인 재산 소유가 인정되기 시작했습니다.", symbol: "💰" },
      { text: "곡식을 많이 가진 사람과 그렇지 못한 사람 사이에 '빈부 격차'가 생겨났다.", explanation: "빈부 격차는 계급 사회 형성의 모태가 되었습니다.", symbol: "⚖️" },
      { text: "벼 이삭을 효율적으로 수확하기 위해 반달 돌칼을 널리 만들어 썼다.", explanation: "반달 돌칼은 벼 수확 전용 도구로 보급되었습니다.", symbol: "✋" },
    ],
    wrongPool: [
      { text: "사냥과 열매 채집만 하고 농사는 완전히 중단되었다.", explanation: "벼농사가 본격화되어 농경 중심 사회가 되었습니다.", symbol: "❌" },
      { text: "청동으로 트랙터와 이앙기를 만들어 전 세계에 쌀을 대량 수출했다.", explanation: "트랙터와 수출은 현대 산업 농업입니다.", symbol: "❌" },
      { text: "쌀을 먹으면 병에 걸린다고 믿어 벼농사를 법으로 금지했다.", explanation: "쌀은 가장 귀하고 영양가 높은 주식이었습니다.", symbol: "❌" },
      { text: "모든 사람이 똑같이 나누어 먹는 완전한 평등 사회가 유지되었다.", explanation: "사유재산으로 인해 계급과 빈부 격차가 생겼습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 농경", label: "벼농사의 시작", desc: "벼농사의 본격화, 식량 증대와 잉여 생산물, 빈부 격차의 발생", symbol: "/dwellings/songgukri_village.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 6: 사진 기반 - 민무늬 토기와 곡식 창고]
    prompt: "청동기 시대 사람들이 곡식을 저장하기 위해 만든 [민무늬 토기]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "신석기 빗살무늬 토기와 달리 겉면에 무늬가 없는 것이 특징이다.", explanation: "표면에 특별한 무늬를 새기지 않고 실용적으로 빚었습니다.", symbol: "🏺" },
      { text: "바닥이 평평하여 평지나 창고 바닥에 안정적으로 올려놓기 편했다.", explanation: "평평한 바닥(평저) 덕분에 세워두기 매우 편리했습니다.", symbol: "📦" },
      { text: "벼농사로 수확한 많은 양의 곡식을 오래 보관하기에 알맞았다.", explanation: "대용량 항아리로 잉여 곡식을 비축했습니다.", symbol: "🌾" },
      { text: "적갈색을 띠며 단단하게 구워져 실생활에 널리 쓰였다.", explanation: "실용성이 뛰어난 청동기 시대의 대표 생활 토기입니다.", symbol: "✨" },
      { text: "마을의 곡식 창고나 집 안에 두어 잉여 곡식을 비축하는 데 활용되었다.", explanation: "사유재산과 식량을 저장하는 필수 도구였습니다.", symbol: "🛖" },
    ],
    wrongPool: [
      { text: "바닥이 뾰족하여 모래밭에 꽂아두어야만 서 있는 토기였다.", explanation: "바닥이 뾰족한 것은 신석기 빗살무늬 토기입니다.", symbol: "❌" },
      { text: "순금을 녹여 겉면에 화려한 보석을 박아 만든 궁중 술잔이었다.", explanation: "점토를 구워 만든 소박한 생활용 토기입니다.", symbol: "❌" },
      { text: "적의 화살을 막기 위해 머리에 쓰던 방탄 철모였다.", explanation: "민무늬 토기는 저장 및 조리용 그릇입니다.", symbol: "❌" },
      { text: "돌을 깨뜨려 떼어낸 구석기 시대의 뗀석기였다.", explanation: "점토를 구워 만든 그릇입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 토기", label: "민무늬 토기와 송국리 마을", desc: "바닥이 평평한 민무늬 토기와 탄화미가 발굴된 대표적인 청동기 벼농사 취락", symbol: "/dwellings/songgukri_village.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 7: 개념 문항 - 계급 사회와 족장의 등장]
    prompt: "청동기 시대 농업 발달로 나타난 [지배자의 등장과 계급 사회]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "사유재산과 빈부 격차가 생기면서 힘과 재산을 가진 '지배자(족장)'가 등장했다.", explanation: "경제적 차이가 권력과 신분의 분화를 낳았습니다.", symbol: "👑" },
      { text: "지배하는 사람과 지배받는 사람으로 나뉘는 '계급 사회'가 시작되었다.", explanation: "평등 사회가 끝나고 불평등한 계급 질서가 형성되었습니다.", symbol: "⚖️" },
      { text: "족장은 귀한 청동 무기와 거울, 방울을 지녀 자신의 강력한 권위를 과시했다.", explanation: "청동기는 지배자의 신성성과 권력을 상징하는 보물이었습니다.", symbol: "🗡️" },
      { text: "더 많은 토지와 곡식, 노비를 차지하기 위해 부족 간의 정복 전쟁이 활발해졌다.", explanation: "잉여 자원을 빼앗기 위한 무력 충돌이 빈번해졌습니다.", symbol: "⚔️" },
      { text: "족장이 죽으면 그의 권력을 보여주기 위해 거대한 고인돌 무덤을 만들었다.", explanation: "고인돌은 족장의 막강한 권위를 보여주는 기념비였습니다.", symbol: "🏛️" },
    ],
    wrongPool: [
      { text: "모든 사람이 재산을 똑같이 나누어 갖고 평등하게 사는 평등 사회였다.", explanation: "청동기 시대는 빈부 격차와 계급이 지배하는 사회였습니다.", symbol: "❌" },
      { text: "왕이나 족장이 없이 인공지능 컴퓨터가 마을의 법을 집행했다.", explanation: "인공지능은 현대의 컴퓨터 기술입니다.", symbol: "❌" },
      { text: "무기를 모두 버리고 평화 조약을 맺어 전쟁이 역사상 완전히 사라졌다.", explanation: "오히려 정복 전쟁이 더욱 치열해졌습니다.", symbol: "❌" },
      { text: "농사를 짓지 않고 매일 맹수를 쫓아 이동 생활만 계속했다.", explanation: "정착 농경과 취락 중심의 생활이었습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 사회", label: "계급 사회의 형성", desc: "빈부 격차, 사유재산, 족장과 계급의 등장, 정복 전쟁", symbol: "/dwellings/bronze_chief_class.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 8: 일러스트 기반 - 마을 방어 시설(도랑과 나무 울타리)]
    prompt: "다른 세력의 침략에 대비한 청동기 시대 [마을 방어 시설]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "마을 주변에 깊은 도랑(환호)을 파서 적이나 사나운 짐승이 쉽게 건너오지 못하게 했다.", explanation: "마을 외곽에 거대한 도랑을 파서 1차 방어선을 구축했습니다.", symbol: "🛡️" },
      { text: "도랑 안쪽에 뾰족한 통나무 울타리(목책)를 빽빽하게 둘러 방어벽을 세웠다.", explanation: "목책은 적의 침입을 물리적으로 차단하는 방어벽이었습니다.", symbol: "🪵" },
      { text: "부족 간의 정복 전쟁이 잦아지면서 마을의 곡식과 주민을 지키기 위해 만들었다.", explanation: "잉여 자원과 주민을 보호하기 위한 필수 국방 시설이었습니다.", symbol: "🌾" },
      { text: "주변이 한눈에 잘 내려다보이는 나지막한 야산이나 구릉 지대에 마을을 지었다.", explanation: "적의 접근을 감시하기 유리한 높은 지형을 택했습니다.", symbol: "⛰️" },
      { text: "방어 시설 안쪽에는 집터와 곡식 창고, 공동 작업장을 모아 안전하게 생활했다.", explanation: "방어벽 안에서 안전하게 경제 활동을 영위했습니다.", symbol: "🛖" },
    ],
    wrongPool: [
      { text: "지하 100m 암반 속에 건설된 최첨단 핵 방공호 비밀 기지였다.", explanation: "지상에 목책과 환호로 만든 선사 시대 방어 시설입니다.", symbol: "❌" },
      { text: "레이저 감지기와 전자기 방어막을 설치하여 적의 우주선을 격추했다.", explanation: "공상 과학 기술입니다.", symbol: "❌" },
      { text: "아무런 울타리도 없이 허허벌판에 텐트만 치고 살았다.", explanation: "치밀한 방어 시설을 갖춘 정착 취락이었습니다.", symbol: "❌" },
      { text: "적들이 오면 언제든지 마을을 버리고 동굴로 도망가 숨었다.", explanation: "마을에 머무르며 목책과 도랑을 활용해 지켜냈습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 주거", label: "방어형 마을", desc: "도랑(환호)과 통나무 울타리(목책)로 마을을 지킨 방어 시설", symbol: "/dwellings/songgukri_village.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 9: 사진 기반 - 청동 방울과 청동 거울(제사장의 권위)]
    prompt: "청동기 시대 지배자와 제사장의 권위를 나타낸 [청동 방울과 청동 거울]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "햇빛을 반사하여 번쩍이는 청동 거울로 신비로운 빛을 내며 권위를 세웠다.", explanation: "빛을 반사하여 하늘의 신성함을 대변했습니다.", symbol: "🪞" },
      { text: "하늘에 제사를 지낼 때 청동 방울을 흔들어 신성한 소리를 내어 사람들을 이끌었다.", explanation: "소리와 빛을 통해 종교적 의식을 주관했습니다.", symbol: "🔔" },
      { text: "제사를 주관하는 제사장과 정치 지배자가 일치했던 '제정일치' 사회의 모습을 보여준다.", explanation: "군장이 종교와 정치를 모두 장악한 제정일치였습니다.", symbol: "👑" },
      { text: "무기가 아닌 신성한 제사용 도구(의기)로 사용되어 일반인은 가질 수 없었다.", explanation: "권력자의 신성성을 뒷받침하는 최고급 제기였습니다.", symbol: "✨" },
      { text: "청동기를 다루는 뛰어난 금속 공예 기술이 발달했음을 잘 증명한다.", explanation: "섬세한 기하학적 무늬와 소리 울림통을 정교하게 주조했습니다.", symbol: "💡" },
    ],
    wrongPool: [
      { text: "부엌에서 매일 채소를 썰고 국을 끓이던 일반 가정용 주방 도구였다.", explanation: "신성한 종교 의식에 쓰인 제사용 유물입니다.", symbol: "❌" },
      { text: "돌을 깨뜨려 거칠게 떼어낸 구석기 시대의 뗀석기였다.", explanation: "금속을 주조해 만든 청동기 유물입니다.", symbol: "❌" },
      { text: "가마에 흙을 넣고 구워 만든 신석기 시대의 토기였다.", explanation: "청동 합금으로 제작된 금속 의기입니다.", symbol: "❌" },
      { text: "시신을 감싸기 위해 짠 부드러운 삼베 천이었다.", explanation: "금속으로 제작된 방울과 거울입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 제사", label: "청동 방울과 청동 거울", desc: "빛과 소리로 하늘과 소통하며 제정일치 권위를 세운 제사용 청동기", symbol: "/relics/coarse_pattern_mirror.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 10: 초등 교과서 핵심 - 청동기 시대 도구의 구분과 쓰임새]
    prompt: "청동기 시대 사람들의 [도구 사용 모습]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "청동은 매우 귀하고 만들기 어려워 지배자의 무기나 제사용 도구로 주로 쓰였다.", explanation: "청동은 귀한 금속이라 지배층의 권력과 제사에만 집중 사용되었습니다.", symbol: "👑" },
      { text: "농사를 짓는 데 쓰는 농기구는 청동이 아니라 여전히 단단한 돌을 갈아 만들었다.", explanation: "농기구는 청동이 아닌 간석기(반달 돌칼 등)나 나무로 제작했습니다.", symbol: "🌾" },
      { text: "벼 이삭을 자를 때 쓴 '반달 돌칼'은 청동기가 아니라 돌을 갈아 만든 간석기였다.", explanation: "가장 대표적인 농기구인 반달 돌칼은 정교한 간석기입니다.", symbol: "🔪" },
      { text: "청동은 무르기 때문에 땅을 파거나 곡식을 벨 때 쉽게 부러져 농기구로 쓰기 어려웠다.", explanation: "청동은 흙이나 단단한 줄기를 다루기에는 무르고 귀했습니다.", symbol: "💡" },
      { text: "농부들은 나무를 깎아 만든 괭이나 쟁기 같은 나무 농기구도 널리 사용했다.", explanation: "나무로 만든 다양한 농기구가 밭과 논에서 사용되었습니다.", symbol: "🪵" },
    ],
    wrongPool: [
      { text: "일반 농민들도 밭을 갈 때 날카로운 청동 괭이와 청동 쟁기를 흔하게 사용했다.", explanation: "청동기 시대에는 청동 농기구가 전혀 없었으며 돌과 나무를 썼습니다.", symbol: "❌" },
      { text: "모든 가정마다 부엌에서 매일 쓰는 식기와 숟가락을 청동으로 만들어 썼다.", explanation: "청동은 일반 백성이 식기로 쓸 수 없을 만큼 귀한 금속이었습니다.", symbol: "❌" },
      { text: "곡식을 수확하기 위해 튼튼한 강철로 만든 자동 탈곡기를 사용했다.", explanation: "강철 기계는 현대의 농업 기술입니다.", symbol: "❌" },
      { text: "돌을 거칠게 깨뜨려 만든 구석기 시대의 뗀석기로 벼를 수확했다.", explanation: "벼 수확에는 돌을 갈아 만든 간석기인 반달 돌칼을 썼습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 도구", label: "청동기 도구의 비밀", desc: "무기와 제기는 귀한 청동으로, 농기구는 여전히 단단한 돌(간석기)과 나무로 제작", symbol: "/relics/semilunar_knife.webp", source: "국립중앙박물관 (공공누리 제1유형)" },
  },
  {
    // [유형 11: 일러스트 기반 - 청동기 마을과 벼농사 생활 (초등 교과서 핵심 개편)]
    prompt: "청동기 시대 사람들의 [마을 모습과 벼농사 생활]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "벼농사가 본격화되면서 물을 구하기 쉬운 나지막한 야산이나 구릉 지대에 큰 마을을 이루었다.", explanation: "청동기 시대에는 농경에 알맞은 낮은 구릉 지대에 마을을 이루고 살았습니다.", symbol: "🌾" },
      { text: "수확한 곡식을 안전하게 보관하기 위해 지상식 곡식 창고와 큰 저장 구덩이를 만들었다.", explanation: "사유재산이 생기면서 수확한 벼와 곡식을 보관하는 창고가 발달했습니다.", symbol: "🛖" },
      { text: "다른 부족의 침략과 약탈에 대비하여 마을 주변에 도랑(환호)을 파고 나무 울타리(목책)를 둘렀다.", explanation: "잉여 생산물과 마을을 지키기 위한 방어 시설이 구축되었습니다.", symbol: "🪵" },
      { text: "마을 주변의 들판에서 반달 돌칼을 이용해 잘 익은 벼 이삭을 잘라 수확했다.", explanation: "청동기 농민들은 끈을 손가락에 꿰어 쓰는 반달 돌칼로 벼를 수확했습니다.", symbol: "🌾" },
      { text: "마을 안에서 힘이 센 지배자(족장)가 등장하여 주민들을 이끌고 권력을 가졌다.", explanation: "농경 발달로 잉여 생산물이 생기면서 계급 사회가 형성되었습니다.", symbol: "👑" },
    ],
    wrongPool: [
      { text: "농사를 전혀 짓지 않고 매일 맹수와 먹을거리를 찾아 동굴로 옮겨 다니며 살았다.", explanation: "동굴 이동 생활은 구석기 시대의 특징이며, 청동기에는 벼농사를 지으며 정착했습니다.", symbol: "❌" },
      { text: "마을 주민 모두가 똑같이 일하고 똑같이 나누어 먹는 완전한 평등 사회였다.", explanation: "청동기 시대는 빈부 격차와 계급이 나타난 계급 사회였습니다.", symbol: "❌" },
      { text: "지하 100m 암반 속에 건설된 최첨단 핵 방공호 비밀 기지였다.", explanation: "구릉 지대에 조성된 지상 가옥과 방어 목책입니다.", symbol: "❌" },
      { text: "외계인이 착륙하여 세운 우주 정거장 발사대였다.", explanation: "청동기 조상들의 정착 취락 마을입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "청동기 생활", label: "청동기 마을과 벼농사", desc: "벼농사와 곡식 창고, 마을을 지키는 도랑과 나무 울타리가 발달한 청동기 마을", symbol: "/dwellings/songgukri_village.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
];

const gojoseonTemplates: RawQuizTemplate[] = [
  {
    // [유형 1: 일러스트 기반 - 단군신화와 환웅 강림]
    prompt: "우리 역사 속 최초의 국가인 [고조선의 건국 이야기]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "단군왕검이 기원전 2333년 청동기 문화를 바탕으로 아사달에 건국했다.", explanation: "우리나라 역사상 최초의 국가가 건국된 유서 깊은 순간입니다.", symbol: "👑" },
      { text: "하늘의 신 환인의 아들 환웅이 신단수 아래로 내려와 백성을 다스렸다.", explanation: "하늘의 자손이라는 자부심을 보여주는 건국 이야기입니다.", symbol: "☁️" },
      { text: "널리 인간을 이롭게 한다는 '홍익인간'의 숭고한 뜻을 건국 이념으로 삼았다.", explanation: "백성을 아끼고 세상을 이롭게 하려는 숭고한 통치 철학입니다.", symbol: "❤️" },
      { text: "우리 민족이 세운 최초의 국가로서 유구한 역사의 시작을 알린다.", explanation: "반만년 유구한 우리 역사의 뿌리가 되는 국가입니다.", symbol: "🇰🇷" },
      { text: "고려 시대 일연 스님이 쓴 역사책 '삼국유사'에 건국 이야기가 전해진다.", explanation: "삼국유사에 단군신화의 기록이 온전히 보존되어 전해집니다.", symbol: "📜" },
    ],
    wrongPool: [
      { text: "돌을 깨뜨려 만든 뗀석기 기술을 바탕으로 동굴에서 살던 수렵민들이 세웠다.", explanation: "구석기 수렵민이 아니라 청동기 문화를 바탕으로 세워진 국가입니다.", symbol: "❌" },
      { text: "철기 문화를 바탕으로 황하 강 유역에 건국된 중국 왕조였다.", explanation: "만주와 한반도에 걸쳐 세워진 우리 민족의 국가입니다.", symbol: "❌" },
      { text: "신라 시대 김유신 장군이 삼국 통일을 위해 세운 군사 기지였다.", explanation: "고조선은 기원전 2333년에 세워진 우리 민족 최초의 국가입니다.", symbol: "❌" },
      { text: "모든 사람이 똑같이 나누어 먹는 무계급 평등 공동체였다.", explanation: "왕과 신하, 신분제가 존재하는 계급 사회였습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 건국", label: "단군신화와 환웅 강림", desc: "청동기 문화를 바탕으로 세운 우리 역사 최초의 국가", symbol: "/dwellings/dangun_hwanung_descent.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 2: 일러스트 기반 - 풍백·우사·운사와 농경 사회]
    prompt: "환웅이 거느리고 내려온 [풍백, 우사, 운사]를 통해 알 수 있는 사회 모습에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "바람(풍백), 비(우사), 구름(운사)은 농사에 가장 중요한 날씨 요소였다.", explanation: "농경 사회에서 기후와 날씨는 생명과 직결된 요소였습니다.", symbol: "🌾" },
      { text: "고조선 사회가 농경을 국가의 가장 중요한 근본으로 여겼음을 보여준다.", explanation: "농경을 중시하는 사회적 배경이 신화에 잘 반영되어 있습니다.", symbol: "🌱" },
      { text: "농사뿐 아니라 곡식, 생명, 질병, 형벌 등 인간 세상의 360여 가지 일을 다스렸다.", explanation: "사회 질서를 확립하고 백성의 삶을 세심하게 보살폈습니다.", symbol: "⚖️" },
      { text: "날씨를 다스리는 세 신하와 함께 백성들의 농사 생활을 돌보았다.", explanation: "자연의 질서에 맞춰 백성들의 생업을 도왔습니다.", symbol: "🌤️" },
      { text: "자연의 순리에 맞추어 백성들이 평화롭게 농사짓도록 힘썼다.", explanation: "농업 중심의 안정된 공동체를 추구했습니다.", symbol: "🤝" },
    ],
    wrongPool: [
      { text: "농사를 짓지 않고 매일 들판에서 사냥만 하는 수렵 사회였다.", explanation: "농경을 가장 중시하던 농경 사회였습니다.", symbol: "❌" },
      { text: "바다를 건너 무역만 하고 농업은 법으로 엄격히 금지했다.", explanation: "농경이 국가의 핵심 산업이었습니다.", symbol: "❌" },
      { text: "제사와 정치가 완전히 분리되어 종교와 무관한 군사 통치만 행해졌다.", explanation: "제사와 정치가 하나로 합쳐진 제정일치 사회였습니다.", symbol: "❌" },
      { text: "사유재산이 전혀 없어 생산된 모든 곡식을 씨족 공동체가 똑같이 나누었다.", explanation: "고조선은 사유재산과 빈부 격차가 존재하는 계급 사회였습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 농경", label: "풍백·우사·운사", desc: "바람·비·구름을 주관하여 농경을 중시한 고조선 사회", symbol: "/dwellings/dangun_weather_gods.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 3: 일러스트 기반 - 곰과 호랑이의 시련과 부족 연합]
    prompt: "단군신화에 나오는 [곰과 호랑이 이야기]의 역사적 의미에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "동물을 숭배하던 부족들이 환웅 부족과 결합하는 과정을 상징적으로 나타냈다.", explanation: "부족 간의 평화로운 연합 과정을 신화적으로 비유했습니다.", symbol: "🤝" },
      { text: "곰을 숭배하던 부족(웅녀)이 환웅 세력과 연합하여 고조선의 주도 세력이 되었다.", explanation: "곰 토템 부족이 환웅 부족과 결합하여 건국 세력이 되었습니다.", symbol: "🐻" },
      { text: "어두운 동굴에서 쑥과 마늘을 먹으며 인내와 시련을 이겨낸 웅녀가 단군을 낳았다.", explanation: "인내와 정성을 증명한 부족이 역사의 주인공이 되었습니다.", symbol: "🌿" },
      { text: "호랑이를 숭배하던 부족은 시련을 견디지 못하고 연합에서 탈락했음을 비유한다.", explanation: "호랑이 토템 부족은 결합 과정에서 이탈했음을 암시합니다.", symbol: "🐯" },
      { text: "서로 다른 부족들이 평화롭게 하나로 뭉쳐 새로운 국가를 세웠음을 뜻한다.", explanation: "부족 간의 융합을 통한 국가 탄생의 상징입니다.", symbol: "🏛️" },
    ],
    wrongPool: [
      { text: "환웅 부족이 곰 부족과 호랑이 부족을 모두 무력으로 정복하여 노비로 삼았음을 의미한다.", explanation: "무력 정복이 아니라 평화로운 부족 간의 연합과 결합을 상징합니다.", symbol: "❌" },
      { text: "호랑이를 숭배하던 부족이 끝까지 시련을 견뎌내어 고조선의 왕비족이 되었다.", explanation: "인내하며 환웅 세력과 연합한 쪽은 곰을 숭배하던 부족(웅녀)이었습니다.", symbol: "❌" },
      { text: "곰과 호랑이라는 실제 맹수를 사냥하여 가죽을 교역하던 상인들의 무역 협정이었다.", explanation: "부족 간의 연합과 건국 과정을 보여주는 상징적 신화입니다.", symbol: "❌" },
      { text: "농경을 버리고 사냥만 하던 구석기 시대로 되돌아가자는 약속이었다.", explanation: "농경 문화 정착과 새로운 국가 탄생을 상징하는 이야기입니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 건국", label: "곰과 호랑이의 시련", desc: "곰 부족과 환웅 부족의 평화로운 연합과 건국 과정", symbol: "/dwellings/dangun_bear_tiger.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 4: 개념 문항 - 단군왕검의 칭호와 제정일치]
    prompt: "고조선의 최고 지배자 명칭인 [단군왕검]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "하늘에 제사를 지내는 제사장인 '단군'과 정치를 다스리는 지배자인 '왕검'이 합쳐진 말이다.", explanation: "종교적 권위와 정치적 권력을 결합한 최고 지배자의 호칭입니다.", symbol: "👑" },
      { text: "제사와 정치를 한 사람의 지배자가 모두 맡아 다스린 '제정일치' 사회였다.", explanation: "제정일치는 고대 초기 국가들의 공통적인 특징입니다.", symbol: "🏛️" },
      { text: "단군왕검은 특정 한 사람의 이름이 아니라 대대로 고조선 왕을 부르던 공식 칭호였다.", explanation: "고조선의 최고 통치자를 일컫는 대명사적 호칭이었습니다.", symbol: "📜" },
      { text: "하늘의 뜻을 받들어 백성을 다스리는 강력한 권위를 지녔다.", explanation: "신성한 종교적 정통성으로 백성을 통솔했습니다.", symbol: "✨" },
      { text: "청동기 문화를 바탕으로 여러 부족을 통합하여 국가를 이끌었다.", explanation: "청동기 생산력과 무력을 기반으로 국가 체제를 다졌습니다.", symbol: "🗡️" },
    ],
    wrongPool: [
      { text: "제사와 정치가 엄격히 분리되어 제사장은 정치에 일체 관여할 수 없었다.", explanation: "제사와 정치를 한 사람이 겸한 제정일치였습니다.", symbol: "❌" },
      { text: "신라 시대처럼 불교를 국교로 삼아 전국의 절을 짓고 승려를 우대한 불교 왕이었다.", explanation: "불교는 삼국 시대에 전래되었으며, 단군왕검은 고대 제정일치 군장이었습니다.", symbol: "❌" },
      { text: "돌을 깨뜨려 뗀석기를 만들던 구석기 시대의 족장이었다.", explanation: "청동기 문화를 바탕으로 한 고조선의 국왕이었습니다.", symbol: "❌" },
      { text: "법률이나 통치 기구 없이 오직 군사력만으로 다스리던 단순한 부족장이었다.", explanation: "8조법과 관직 체계를 갖추고 다스린 고대 국가의 왕이었습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 지배자", label: "단군왕검", desc: "제사장(단군) + 정치 지배자(왕검) = 제정일치 군장", symbol: "/relics/dangun_wanggeom.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 5: 8조법 1조 - 살인자 사형(생명 존중과 노동력 보호)]
    prompt: "고조선의 8조법 중 [사람을 죽인 자는 즉시 사형에 처한다]는 조항에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "사람의 귀중한 생명을 존중하고 보호하려 했음을 명백히 보여준다.", explanation: "인간의 존엄성과 생명권을 최우선으로 보호했습니다.", symbol: "❤️" },
      { text: "농사를 짓고 나라를 지키는 데 필요한 '노동력'을 소중히 여겼다.", explanation: "농경 사회에서 한 사람의 노동력은 국가적 자산이었습니다.", symbol: "🌾" },
      { text: "살인 행위를 가장 무거운 죄로 다스려 사회 질서와 평화를 유지했다.", explanation: "극형으로 다스려 범죄를 엄격히 예방했습니다.", symbol: "⚖️" },
      { text: "법을 통해 백성들의 안전을 국가가 강력히 지켜주었음을 알 수 있다.", explanation: "국가가 법으로 치안과 안전을 보장했습니다.", symbol: "🛡️" },
      { text: "오늘날까지 전해지는 고조선 8조법의 대표적인 3개 조항 중 하나이다.", explanation: "한서 지리지에 기록되어 오늘날까지 전해지는 소중한 법 조항입니다.", symbol: "📜" },
    ],
    wrongPool: [
      { text: "사람을 죽여도 가벼운 벌금만 내면 무죄로 방면되었다.", explanation: "살인은 즉시 사형으로 다스리는 가장 무거운 죄였습니다.", symbol: "❌" },
      { text: "사람을 죽여도 곡식이나 돈으로만 배상하면 사형을 면하고 무죄가 되었다.", explanation: "살인은 즉시 사형으로 다스리는 가장 무거운 범죄였습니다.", symbol: "❌" },
      { text: "귀족들의 목숨만 지키고 일반 백성의 생명은 법으로 보호하지 않았다.", explanation: "공동체의 필수 노동력인 인간의 생명 자체를 보호하는 법 조항이었습니다.", symbol: "❌" },
      { text: "모든 백성이 법 없이도 완전히 평화롭게 살았음을 보여준다.", explanation: "엄격한 법률을 통해 사회 질서를 다스렸습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 8조법", label: "생명 존중", desc: "인간의 생명을 존중하고 농경 노동력을 지킨 법 조항", symbol: "/dwellings/gojoseon_law_eight.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 6: 8조법 2조 - 곡식 배상(상해 처벌과 농경 사회)]
    prompt: "고조선의 8조법 중 [남을 다치게 한 자는 곡식으로 갚는다]는 조항에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "고조선 사회가 곡식을 가장 귀한 재산으로 여기던 '농경 사회'였음을 보여준다.", explanation: "곡식이 경제의 중심이자 배상의 기준이었습니다.", symbol: "🌾" },
      { text: "남을 다치게 하여 농사짓는 노동력을 손실시킨 대가를 보상하게 했다.", explanation: "신체 상해로 인한 노동력 상실을 합리적으로 보상하도록 했습니다.", symbol: "🩹" },
      { text: "개인이 곡식을 저축하고 소유할 수 있는 '사유재산'이 인정된 사회였다.", explanation: "개인 간에 곡식을 주고받아 배상할 만큼 사유재산이 있었습니다.", symbol: "💰" },
      { text: "폭력으로 남에게 피해를 입히는 행위를 법으로 엄격히 다스렸다.", explanation: "개인의 신체적 안전을 법으로 보호했습니다.", symbol: "⚖️" },
      { text: "곡식이 오늘날의 화폐처럼 가치를 측정하고 배상하는 수단으로 쓰였다.", explanation: "곡식은 당시 가장 신뢰받는 가치 척도였습니다.", symbol: "📦" },
    ],
    wrongPool: [
      { text: "다친 사람에게 청동 칼과 거울을 배상금으로 지급하도록 강제했다.", explanation: "청동기가 아닌 당시 가장 중요한 자산이었던 '곡식'으로 갚도록 했습니다.", symbol: "❌" },
      { text: "농사를 짓지 않는 순수한 유목 수렵 사회였음을 증명한다.", explanation: "농경을 기반으로 한 농경 사회였습니다.", symbol: "❌" },
      { text: "사유재산이 전혀 없고 모든 곡식을 국가가 독점했다.", explanation: "개인의 사유재산권이 명백히 인정되었습니다.", symbol: "❌" },
      { text: "구석기 시대처럼 사유재산이 전혀 없어 피해를 입혀도 배상할 재산이 없었다.", explanation: "개인이 소유한 사유재산(곡식)이 인정되었기에 곡식으로 배상할 수 있었습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 8조법", label: "농경 사회", desc: "농경 중심 사회, 사유재산 인정과 노동력 손실 보상", symbol: "/dwellings/gojoseon_law_eight.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 7: 8조법 3조 - 도둑질 처벌(사유재산 보호와 노비 신분제)]
    prompt: "고조선의 8조법 중 [도둑질한 자는 노비로 삼고, 용서받으려면 50만 전을 낸다]에 대해 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "개인의 귀한 재산을 훔치는 행위를 엄벌하여 '사유재산'을 강력히 보호했다.", explanation: "남의 재산을 훔치는 죄를 무겁게 다스려 사유재산을 지켰습니다.", symbol: "🛡️" },
      { text: "지배층과 일반 백성 외에 가장 낮은 천한 신분인 '노비'가 존재했던 신분제 사회였다.", explanation: "계급과 신분이 분화된 계급 사회였음을 증명합니다.", symbol: "⛓️" },
      { text: "50만 전이라는 많은 돈을 내고 죗값을 치를 수 있는 '화폐(돈)'가 사용되었다.", explanation: "화폐를 통해 배상할 수 있는 경제 체제가 갖추어져 있었습니다.", symbol: "🪙" },
      { text: "남의 물건을 훔친 자는 그 집의 노비가 되어 평생 죗값을 갚아야 했다.", explanation: "재산 침해에 대한 강력한 신분적 처벌이 가해졌습니다.", symbol: "⚖️" },
      { text: "질서 있는 사회를 유지하기 위해 엄격한 신분 질서와 형벌이 있었다.", explanation: "법과 형벌로 국가 사회 질서를 엄격히 다스렸습니다.", symbol: "📜" },
    ],
    wrongPool: [
      { text: "남의 물건을 훔쳐도 곡식만 돌려주면 노비가 되지 않고 자유를 유지했다.", explanation: "도둑질한 자는 피해를 준 집의 노비로 삼는 엄격한 신분적 처벌을 내렸습니다.", symbol: "❌" },
      { text: "모든 사람이 똑같이 평등하여 노비나 신분 계급이 전혀 없었다.", explanation: "노비가 존재하는 계급 사회였습니다.", symbol: "❌" },
      { text: "도둑질한 자는 사형에 처해지고 그 가족까지 모두 몰살되었다.", explanation: "도둑질은 사형이 아니라 노비를 삼거나 50만 전을 내게 하는 법이었습니다.", symbol: "❌" },
      { text: "돈이나 화폐가 전혀 없어 오직 조개껍데기만 가지고 물물교환을 했다.", explanation: "50만 전이라는 화폐 단위가 존재했습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 8조법", label: "사유재산과 노비", desc: "개인 재산 보호, 노비 신분제 존재, 화폐 사용의 증거", symbol: "/dwellings/gojoseon_law_eight.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 8: 지도 기반 - 고조선의 문화 범위를 알려주는 대표 유물]
    prompt: "지도 속 [고조선의 문화 범위]를 짐작할 수 있게 해 주는 대표 문화유산의 특징으로 옳은 것을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "만주(랴오둥 지방)와 한반도 북부 및 중부에 걸쳐 널리 분포한다.", explanation: "고조선의 강역을 입증하는 광대한 문화 분포 영역입니다.", symbol: "🗺️" },
      { text: "독창적인 청동 무기인 [비파형 동검]이 출토되는 지역과 일치한다.", explanation: "비파형 동검은 고조선 문화권의 핵심 유물입니다.", symbol: "🗡️" },
      { text: "거대한 지배자의 무덤인 [탁자식 고인돌]이 함께 발견되는 지역이다.", explanation: "탁자식 고인돌의 분포는 고조선의 세력권과 일치합니다.", symbol: "🏛️" },
      { text: "비파형 동검과 탁자식 고인돌의 분포를 통해 고조선의 광대한 세력 범위를 알 수 있다.", explanation: "두 유물의 공통 분포지가 곧 고조선의 문화 범위입니다.", symbol: "✨" },
      { text: "고조선이 중국과 구별되는 독자적인 청동기 문화를 발전시켰음을 증명한다.", explanation: "한반도와 만주를 잇는 고유한 문화적 독자성을 보여줍니다.", symbol: "🇰🇷" },
    ],
    wrongPool: [
      { text: "흙에 빗살 무늬를 새긴 신석기 시대의 빗살무늬 토기 분포와 일치한다.", explanation: "빗살무늬 토기는 신석기 시대의 유물입니다.", symbol: "❌" },
      { text: "돌을 깨뜨려 만든 구석기 시대의 주먹도끼가 나오는 지역에만 국한된다.", explanation: "주먹도끼는 구석기 시대의 유물입니다.", symbol: "❌" },
      { text: "철기 시대에 유행한 가야와 신라의 쇠도끼가 집중적으로 발견되는 지역이다.", explanation: "고조선 문화권의 표지 유물은 비파형 동검과 탁자식 고인돌입니다.", symbol: "❌" },
      { text: "한반도 남부 해안가에서 주로 발견되는 세형 동검의 분포 지역에만 한정된다.", explanation: "비파형 동검과 탁자식 고인돌은 만주(랴오둥)와 한반도 북·중부에 넓게 분포합니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 영역", label: "고조선 문화 범위 지도", desc: "비파형 동검과 탁자식 고인돌이 함께 출토된 고조선의 문화권", symbol: "/relics/gojoseon_culture_map.webp", source: "위키미디어 공용 (CC0 1.0 한국사DB 기반)" },
  },
  {
    // [유형 9: 개념 문항 - 고조선 사회의 전반적 특징]
    prompt: "우리 역사 최초의 국가인 [고조선 사회의 특징]으로 옳은 설명을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "청동기 문화를 바탕으로 만주와 한반도 북부에 세워진 최초의 국가였다.", explanation: "기원전 2333년 청동기 바탕 위에 세워진 첫 국가입니다.", symbol: "🇰🇷" },
      { text: "단군왕검이 제사와 정치를 함께 주관하는 '제정일치' 국가였다.", explanation: "제사장과 군장이 결합한 제정일치 체제였습니다.", symbol: "👑" },
      { text: "사유재산과 신분제가 존재하는 '계급 사회'였다.", explanation: "족장, 평민, 노비로 신분이 나뉜 계급 사회였습니다.", symbol: "⚖️" },
      { text: "백성들의 생명과 재산을 지키고 사회 질서를 유지하기 위해 '8조법'을 두었다.", explanation: "법률을 통해 사회 규범과 질서를 엄격히 확립했습니다.", symbol: "📜" },
      { text: "농경을 가장 소중하게 여기고 곡식을 재산의 근본으로 삼았다.", explanation: "농경 중심의 경제 체제를 유지했습니다.", symbol: "🌾" },
    ],
    wrongPool: [
      { text: "농사를 전혀 짓지 않고 매일 맹수를 쫓아 동굴을 옮겨 다녔다.", explanation: "동굴 이동 생활은 구석기 시대의 특징입니다.", symbol: "❌" },
      { text: "왕이나 지배자가 없이 모든 사람이 완전히 평등한 무계급 사회였다.", explanation: "지배층과 노비가 존재하는 계급 사회였습니다.", symbol: "❌" },
      { text: "글이나 법이 전혀 없어 힘센 사람이 약한 사람을 마음대로 빼앗았다.", explanation: "8조법이라는 엄격한 법률 질서가 있었습니다.", symbol: "❌" },
      { text: "철기 문화를 바탕으로 유럽 대륙을 정복한 로마 제국의 식민지였다.", explanation: "우리 민족이 독자적으로 세운 최초의 자주 국가였습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 사회", label: "고조선의 사회 모습", desc: "청동기 문화를 바탕으로 세워진 최초의 국가, 계급 사회와 8조법", symbol: "/dwellings/gojoseon_law_eight.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
  {
    // [유형 10: 개념 문항 - 8조법의 3대 조목 총정리]
    prompt: "오늘날까지 전해지는 [고조선 8조법의 3개 조목]을 통해 알 수 있는 사실 중 옳은 것을 고르세요.",
    difficulty: "EASY",
    correctPool: [
      { text: "'사람을 죽인 자는 사형에 처한다'를 통해 사람의 생명과 노동력을 귀중히 여겼음을 알 수 있다.", explanation: "생명 존중과 노동력 보존의 법률적 증거입니다.", symbol: "❤️" },
      { text: "'남을 다치게 한 자는 곡식으로 갚는다'를 통해 농경을 중시한 농경 사회였음을 알 수 있다.", explanation: "곡식 배상 조항은 농경 사회의 결정적 증거입니다.", symbol: "🌾" },
      { text: "'도둑질한 자는 노비로 삼는다'를 통해 사유재산과 노비 신분제가 존재했음을 알 수 있다.", explanation: "사유재산 보호와 노비 신분제를 보여줍니다.", symbol: "🛡️" },
      { text: "용서받으려면 50만 전을 내야 한다는 점에서 화폐(돈)가 통용되었음을 알 수 있다.", explanation: "화폐 경제의 일면을 증명하는 소중한 기록입니다.", symbol: "🪙" },
      { text: "엄격한 법률을 통해 사회 질서와 백성의 안전을 유지하고자 했다.", explanation: "질서 있는 국가 사회 유지를 위한 고대 법률이었습니다.", symbol: "📜" },
    ],
    wrongPool: [
      { text: "모든 범죄자는 벌금을 내지 않고 항상 사형에 처해졌다.", explanation: "죄의 경중에 따라 사형, 곡식 배상, 노비형으로 구분했습니다.", symbol: "❌" },
      { text: "고조선 사회는 신분 계급이 전혀 없는 완전한 평등 사회였다.", explanation: "노비가 존재하는 엄격한 신분제 사회였습니다.", symbol: "❌" },
      { text: "농사를 짓지 않고 사냥만 하던 원시 수렵 사회였다.", explanation: "곡식 배상 조항이 증명하듯 농경 중심 사회였습니다.", symbol: "❌" },
      { text: "법을 어겨도 아무런 처벌이 없어 사회 질서가 무너져 있었다.", explanation: "엄벌을 통해 치안을 철저히 유지했습니다.", symbol: "❌" },
    ],
    referenceNote: { tag: "고조선 8조법", label: "8조법의 3대 조목", desc: "생명 존중, 농경 사회의 노동력, 사유 재산과 계급을 보여주는 법", symbol: "/dwellings/gojoseon_law_eight.webp", source: "역사 상상 복원도 (교육용 생성형 AI 시각화)" },
  },
];

export function generateStageQuiz(stageId: StageId, round: number, session = "history-v1"): Quiz {
  const seed = seedForQuiz(stageId, round, session);
  const rng = makePrng(seed);

  let templatePool: RawQuizTemplate[] = [];
  if (stageId === 1) templatePool = paleolithicTemplates;
  else if (stageId === 2) templatePool = neolithicTemplates;
  else if (stageId === 3) templatePool = bronzeAgeTemplates;
  else if (stageId === 4) templatePool = gojoseonTemplates;
  else if (stageId === 5) templatePool = [...paleolithicTemplates, ...neolithicTemplates, ...bronzeAgeTemplates, ...gojoseonTemplates];

  // 🏛️ 글로벌 No-Repeat 덱 시스템 연동: 비복원 추출로 덱이 소진될 때까지 중복 절대 없음!
  let template: RawQuizTemplate;
  if (stageId >= 1 && stageId <= 4) {
    const drawnIndex = getOrDrawTemplateIndex(stageId, round, session);
    template = templatePool[drawnIndex % templatePool.length];
  } else {
    // 5단계(종합 모드): 통합 셔플
    const shuffledPool = shuffle(makePrng(seedForQuiz(stageId, 999, session)), templatePool);
    template = shuffledPool[(round - 1) % shuffledPool.length];
  }

  const correctOptions = shuffle(rng, template.correctPool).slice(0, 3).map((item) => ({
    text: item.text,
    isCorrect: true,
    explanation: item.explanation,
    symbol: item.symbol,
  }));
  const wrongOptions = shuffle(rng, template.wrongPool).slice(0, 2).map((item) => ({
    text: item.text,
    isCorrect: false,
    explanation: item.explanation,
    misconception: item.misconception,
    symbol: item.symbol,
  }));

  const allRows = shuffle(rng, [...correctOptions, ...wrongOptions]);
  return finalize(stageId, round, template.prompt, template.difficulty, allRows, rng, template.referenceNote);
}

// 👹 보스전 단계별 퀴즈 생성기 (Phase 1, 2, 3 글로벌 No-Repeat 덱 연동)
export function generateBossQuiz(phase: BossPhase, round: number, session = "boss-history-v1"): Quiz {
  let simulatedStageId: StageId = 1;
  if (phase === 1) {
    // 1단계: 1~2R 구석기, 3~4R 신석기
    simulatedStageId = round <= 2 ? 1 : 2;
  } else if (phase === 2) {
    // 2단계: 청동기 100%
    simulatedStageId = 3;
  } else {
    // 3단계: 고조선 100%
    simulatedStageId = 4;
  }

  // 글로벌 No-Repeat 덱에서 비복원 드로우!
  return generateStageQuiz(simulatedStageId, round, session);
}
