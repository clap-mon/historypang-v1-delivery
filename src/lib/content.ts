export type StageId = 1 | 2 | 3 | 4 | 5;
export type Speaker = "글별이" | "소리별" | "주인공" | "보스" | "역사별" | "역사별이";

export type DialogueChoice = {
  text: string;
  correct: boolean;
  feedback: string;
  icon?: string;
};

export type DialogueMultiOption = {
  id: string;
  text: string;
  isAnswer: boolean;
  explanation: string;
  icon?: string;
  icons?: string[];
  cardImage?: string;
  measureImage?: string;
  timeBadge?: string;
};

export type DialogueMultiCheck = {
  instruction: string;
  options: DialogueMultiOption[];
  successFeedback: string;
};

export type DialogueVisualItem = {
  src?: string;
  title: string;
  beats?: number;
  beatsLabel?: string;
  gridBlocks?: number;
  tag?: string;
  desc?: string;
  icon?: string;
  story?: string;
  meaning?: string;
};

export type GrammarConceptCard = {
  title: string;
  badge: string;
  icon: string;
  colorTheme: "rose" | "emerald" | "sky" | "amber" | "purple";
  timeKeywords?: string;
  verbEndings: string;
  goodExample?: string;
  badExample?: string;
  pairLabel1?: string;
  pairLabel2?: string;
  pairDivider?: string;
  goodBadge?: string;
  badBadge?: string;
};

export type GuideSideWings = {
  leftTitle: string;
  leftBadge: string;
  leftIcon: string;
  leftItems: { normal: string; honorific: string }[];
  rightTitle: string;
  rightBadge: string;
  rightIcon: string;
  rightItems: { normal: string; honorific: string }[];
};

export type DialogueVisual = {
  type: "symbol" | "diagram" | "compare" | "grammar-table" | "guide-wings";
  src?: string;
  title?: string;
  caption?: string;
  source?: string;
  items?: DialogueVisualItem[];
  grammarTable?: {
    title: string;
    subtitle?: string;
    cards: GrammarConceptCard[];
  };
  guideWings?: GuideSideWings;
};

export type FillBlankSlot = {
  text: string;
  isSlot?: boolean;
  icon?: string;
};

export type FillBlankOption = {
  id: string;
  text: string;
  icon?: string;
  isAnswer: boolean;
  explanation: string;
};

export type FillBlankTask = {
  type: "fill-blank";
  instruction: string;
  equation: FillBlankSlot[];
  options: FillBlankOption[];
  successFeedback: string;
};

export type MatchPairItem = {
  id: string;
  text: string;
  icon?: string;
  emoji?: string;
  matchId: string;
  image?: string;
  accent?: string;
  subText?: string;
  badge?: string;
};

export type MatchPairsTask = {
  type: "match-pairs";
  instruction: string;
  leftItems: MatchPairItem[];
  rightItems: MatchPairItem[];
  successFeedback: string;
  leftTitle?: string;
  rightTitle?: string;
  anchorSide?: "left" | "right";
};

export type OrderSequenceItem = {
  id: string;
  text: string;
  icon?: string;
  order?: number;
  correctIndex?: number;
};

export type OrderSequenceTask = {
  type: "order-sequence";
  instruction: string;
  items: OrderSequenceItem[];
  successFeedback: string;
  allowedOrders?: number[][];
};

export type InteractiveTask = FillBlankTask | MatchPairsTask | OrderSequenceTask;

export type DialogueNode = {
  speaker: Speaker;
  text: string;
  bgImage?: string;
  prompt?: string;
  sentence?: string;
  choices?: DialogueChoice[];
  multiCheck?: DialogueMultiCheck;
  task?: InteractiveTask;
  interactiveTask?: InteractiveTask;
  visual?: DialogueVisual;
};

export type Stage = {
  id: StageId;
  title: string;
  shortTitle: string;
  concept: string;
  mission: string;
  bossName: string;
  bossTitle: string;
  bossShortName: string;
  color: string;
  background: string;
  bossImage: string;
  dialogue: DialogueNode[];
};

const choice = (
  correctText: string,
  wrong: string[],
  feedback: string,
  wrongFeedback: string,
  icons?: { correctIcon?: string; wrongIcons?: string[] },
): DialogueChoice[] => {
  const choices: DialogueChoice[] = [
    { text: correctText, correct: true, feedback, icon: icons?.correctIcon },
    ...wrong.map((text, i) => ({
      text,
      correct: false,
      feedback: wrongFeedback,
      icon: icons?.wrongIcons?.[i],
    })),
  ];
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
  }
  return choices;
};

const multiCheck = (options: DialogueMultiOption[], successFeedback: string, instruction = "조건에 맞는 보기를 모두 고르세요."): DialogueMultiCheck => {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return { instruction, options: shuffled, successFeedback };
};

const matchPair = (
  pairs: { left: string; right: string; emoji?: string }[],
  successFeedback: string,
  instruction = "알맞은 짝을 찾아 연결하세요.",
  leftTitle?: string,
  rightTitle?: string,
  anchorSide: "left" | "right" = "left",
): MatchPairsTask => {
  const leftItems: MatchPairItem[] = pairs.map((p, i) => ({
    id: `pair-${i}`,
    text: p.left,
    emoji: p.emoji,
    matchId: `pair-${i}`,
  }));
  const rightItems: MatchPairItem[] = pairs.map((p, i) => ({
    id: `right-${i}`,
    text: p.right,
    matchId: `pair-${i}`,
  }));
  for (let index = rightItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [rightItems[index], rightItems[swapIndex]] = [rightItems[swapIndex], rightItems[index]];
  }
  return {
    type: "match-pairs",
    instruction,
    leftItems,
    rightItems,
    successFeedback,
    leftTitle,
    rightTitle,
    anchorSide,
  };
};

const fillBlank = (
  equation: FillBlankSlot[],
  options: FillBlankOption[],
  successFeedback: string,
  instruction = "빈칸에 들어갈 알맞은 낱말 카드를 선택하세요."
): FillBlankTask => {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return {
    type: "fill-blank",
    instruction,
    equation,
    options: shuffled,
    successFeedback,
  };
};

const orderSequence = (
  items: OrderSequenceItem[],
  successFeedback: string,
  instruction = "역사적 발전 순서에 맞게 카드를 알맞게 배열하세요."
): OrderSequenceTask => {
  return {
    type: "order-sequence",
    instruction,
    items,
    successFeedback,
  };
};

// 🏛️ 3페이즈 보스 정의 (사용자 확정: 유물·자연물 각성형)
export type BossPhase = 1 | 2 | 3;
export type HistoryBossInfo = {
  phase: BossPhase;
  name: string;
  title: string;
  shortName: string;
  themeEra: string;
  maxHp: number;
  attackPower: number;
  defense: number;
  barrier: number;
  dialogueIntro: string;
  dialogueDefeat: string;
  icon: string;
  color: string;
  image: string;
};

export const bossPhases: Record<BossPhase, HistoryBossInfo> = {
  1: {
    phase: 1,
    name: "원시 암석수호령",
    title: "구석기·신석기 원시 바위의 화신",
    shortName: "암석수호령",
    themeEra: "구석기·신석기",
    maxHp: 28,
    attackPower: 4,
    defense: 3,
    barrier: 3,
    dialogueIntro: "크아앙! 시간의 틈을 넘어온 여행자여, 집으로 돌아가고 싶으냐?\n돌을 깨뜨려 만든 거친 원시 바위의 시험을 통과하지 못하면 결코 다음 시대로 갈 수 없다!",
    dialogueDefeat: "크윽... 뗀석기와 간석기의 지혜를 증명해내다니...\n하지만 시간의 문을 지키는 거석 군주가 기다린다!",
    icon: "🪨",
    color: "#a16207",
    image: "/characters/boss-phase-1-ancient-rock.webp",
  },
  2: {
    phase: 2,
    name: "거석의 지배자",
    title: "청동기 고인돌과 권력의 군주",
    shortName: "거석의 지배자",
    themeEra: "청동기·벼농사",
    maxHp: 36,
    attackPower: 5,
    defense: 4,
    barrier: 4,
    dialogueIntro: "수십 톤의 거대한 고인돌과 청동기 족장의 권력을 보아라!\n역사의 시련을 이겨내지 못하면 영원히 과거에 갇히게 될 것이다!",
    dialogueDefeat: "말도 안 돼... 청동기 문명의 거석 방벽이 무너지다니...\n마지막 시간의 수호자, 고조선의 수호군주이시여!",
    icon: "🏛️",
    color: "#0369a1",
    image: "/characters/boss-phase-2-megalith-lord.webp",
  },
  3: {
    phase: 3,
    name: "고조선의 수호군주",
    title: "최초의 국가 고조선의 수호자",
    shortName: "고조선의 수호군주",
    themeEra: "고조선·전 범위 통합",
    maxHp: 44,
    attackPower: 6,
    defense: 4,
    barrier: 4,
    dialogueIntro: "내가 바로 시간의 문을 지키는 최종 시험관, 고조선의 수호군주다!\n고조선과 우리 역사의 뿌리를 완벽히 증명하고,\n당당히 너희의 세계로 돌아가는 시간의 문을 열어보아라!",
    dialogueDefeat: "훌륭하다! 너희의 올바른 역사 지식과 용기에 감복했다.\n약속대로 시간의 문을 열어주마. 너희가 살던 따뜻한 집으로 돌아가라!",
    icon: "⚔️",
    color: "#7e22ce",
    image: "/characters/boss-phase-3-bronze-overlord.webp",
  },
};

// 📜 4단계 역사 탐구 스테이지 정의
export const stages: Stage[] = [
  // ==========================================
  // STAGE 1: 구석기 시대
  // ==========================================
  {
    id: 1,
    title: "1단계: 구석기 시대 - 주먹도끼와 이동 생활",
    shortTitle: "구석기 시대",
    concept: "뗀석기와 이동 생활",
    mission: "시간의 틈에 휘말려 도착한 구석기 시대! 뗀석기와 이동 생활의 지혜를 배워 집으로 갈 단서를 찾으세요!",
    bossName: "원시 암석수호령",
    bossTitle: "구석기·신석기 원시 바위의 화신",
    bossShortName: "암석수호령",
    color: "#b45309",
    background: "linear-gradient(135deg, #78350f, #451a03)",
    bossImage: "/characters/boss-phase-1-ancient-rock.webp",
    dialogue: [
      // 1페이지: 스토리 인트로 1 (구석기 불시착 상황)
      {
        speaker: "역사별이",
        text: "으앗, 수호자님! 괜찮으세요?\n시간의 틈에 휘말려 약 70만 년 전 한반도 [구석기 시대]로 불시착했어요!",
      },
      // 2페이지: 스토리 인트로 2 (주변 관찰과 귀환 목표)
      {
        speaker: "역사별이",
        text: "저기 험준한 절벽 동굴과 강가에서 사냥하는 옛사람들이 보이시나요?\n원래 살던 우리 집(현대)으로 돌아가려면,\n이 시대 사람들의 생활 모습과 유물을 바르게 탐구해 시간의 문을 열어야 해요!",
      },
      // 3페이지: 개념 1 (구석기 시대의 만능 도구: 주먹도끼와 뗀석기)
      {
        speaker: "역사별이",
        text: "구석기 사람들은 돌을 깨뜨려 날카롭게 만든 [뗀석기]를 도구로 썼어요!\n그중 [주먹도끼]는 사냥, 고기 자르기, 가죽 벗기기, 땅 파기 등 온갖 일에 두루 쓰인 구석기의 만능 칼이랍니다.\n칠판의 유물 카드와 쓰임새를 잘 기억해 두세요!",
        visual: {
          type: "diagram",
          title: "구석기 시대 핵심 도구: 뗀석기",
          caption: "돌을 다른 돌로 떼어 내거나 깨뜨려 날카롭게 만든 도구입니다.",
          source: "📷 유물 사진 출처: 국립중앙박물관 (공공누리 제1유형)",
          items: [
            { title: "주먹도끼", desc: "사냥, 가죽 벗기기, 땅 파기 등 다용도 만능 칼!", icon: "🪓", src: "/relics/handaxe.webp" },
            { title: "긁개·밀개", desc: "짐승의 가죽을 벗기거나 나무·뼈를 다듬는 도구", icon: "🔪", src: "/relics/scraper.webp" },
            { title: "슴베찌르개", desc: "자루에 묶어 창처럼 짐승을 찌르는 사냥 도구", icon: "🗡️", src: "/relics/tanged_point.webp" },
          ],
        },
      },
      // 4페이지: 개념 2 (이동 생활과 3대 주거 형태)
      {
        speaker: "역사별이",
        text: "구석기 사람들은 열매 채집과 사냥을 하며 먹을 것을 찾아 [이동 생활]을 했어요.\n그래서 집도 쉽게 머물 수 있는 [자연 동굴], [바위 그늘], 또는 막 지은 [막집]에서 살았답니다.",
        visual: {
          type: "diagram",
          title: "구석기 사람들의 3대 주거 형태",
          caption: "이동 생활에 맞춰 자연 지형을 이용하거나 빠르게 지을 수 있는 주거를 선택했습니다.",
          source: "🏛️ 시각 자료: 자연 동굴(국가유산청 공공누리 제1유형) 및 바위그늘·막집 복원도(교육용 생성형 AI 시각화)",
          items: [
            {
              title: "자연 동굴 (단양 금굴 유적)",
              desc: "비바람과 추위, 맹수를 피하던 천연 보금자리 (국가유산청 공공누리 제1유형)",
              icon: "🪨",
              src: "/dwellings/cave.webp",
            },
            {
              title: "바위 그늘",
              desc: "이동 중에 잠시 비바람을 피해 머물던 절벽 바위 쉼터",
              icon: "⛰️",
              src: "/dwellings/rock_shelter.webp",
            },
            {
              title: "막집",
              desc: "강가나 들판에 나뭇가지와 풀을 둘러 '막' 지은 임시 가옥",
              icon: "🛖",
              src: "/dwellings/makjip.webp",
            },
          ],
        },
      },
      // 확인문제 1-1 (주먹도끼)
      {
        speaker: "역사별이",
        text: "★ [확인문제 1] 구석기 만능 칼로 사냥, 가죽 벗기기, 땅 파기 등에 두루 쓰인 대표 뗀석기는 무엇일까요?",
        choices: choice(
          "주먹도끼",
          ["빗살무늬 토기", "반달 돌칼", "비파형 동검"],
          "정답입니다! 주먹도끼는 손에 쥐고 다양한 용도로 쓴 구석기의 만능 도구예요.",
          "오답이에요. 빗살무늬 토기는 신석기, 반달 돌칼과 비파형 동검은 청동기 도구입니다."
        ),
      },
      // 확인문제 1-2 (주거 형태)
      {
        speaker: "역사별이",
        text: "★ [확인문제 2] 구석기 시대 사람들의 주거 및 생활 모습으로 알맞은 것을 모두 골라보세요.",
        multiCheck: multiCheck(
          [
            { id: "opt-1", text: "동굴이나 바위 그늘에서 비바람을 피했다.", isAnswer: true, explanation: "구석기 사람들의 대표적인 자연 주거지입니다." },
            { id: "opt-2", text: "먹을거리를 찾아 옮겨 다니는 이동 생활을 했다.", isAnswer: true, explanation: "사냥감과 채집물을 따라 이동했습니다." },
            { id: "opt-3", text: "들판에 풀과 나뭇가지로 막 지은 막집에 살기도 했다.", isAnswer: true, explanation: "이동 중에 빠르게 지은 막집을 이용했습니다." },
            { id: "opt-4", text: "기와집을 짓고 농사를 지으며 한곳에 정착했다.", isAnswer: false, explanation: "농사와 정착 생활은 신석기 이후, 기와집은 삼국 시대 이후입니다." },
          ],
          "완벽합니다! 구석기인들은 이동 생활을 하며 동굴, 바위 그늘, 막집에서 살았습니다."
        ),
      },
      // 확인문제 1-3 (도구 매칭)
      {
        speaker: "역사별이",
        text: "★ [확인문제 3] 구석기 뗀석기들의 쓰임새를 올바르게 짝지어 연결해 보세요!",
        task: matchPair(
          [
            { left: "주먹도끼", right: "사냥과 고기 자르기 등 만능 도구" },
            { left: "긁개", right: "짐승 가죽 벗기기 및 고기 긁기" },
            { left: "슴베찌르개", right: "나무 자루에 묶어 창처럼 쓴 사냥 도구" },
          ],
          "대단해요! 구석기 시대 뗀석기의 쓰임새를 완벽히 마스터했습니다! 역사 나침반 카드를 획득했습니다."
        ),
        interactiveTask: matchPair(
          [
            { left: "주먹도끼", right: "사냥과 고기 자르기 등 만능 도구" },
            { left: "긁개", right: "짐승 가죽 벗기기 및 고기 긁기" },
            { left: "슴베찌르개", right: "나무 자루에 묶어 창처럼 쓴 사냥 도구" },
          ],
          "대단해요! 구석기 시대 뗀석기의 쓰임새를 완벽히 마스터했습니다! 역사 나침반 카드를 획득했습니다."
        ),
      },
    ],
  },

  // ==========================================
  // STAGE 2: 신석기 시대
  // ==========================================
  {
    id: 2,
    title: "2단계: 신석기 시대 - 빗살무늬 토기와 농경의 시작",
    shortTitle: "신석기 시대",
    concept: "간석기, 토기, 정착 생활",
    mission: "시간의 나침반을 따라 도착한 신석기 시대! 간석기와 농경의 지혜를 배워 집으로 한 걸음 더 다가가세요!",
    bossName: "원시 암석수호령",
    bossTitle: "구석기·신석기 원시 바위의 화신",
    bossShortName: "암석수호령",
    color: "#059669",
    background: "linear-gradient(135deg, #065f46, #022c22)",
    bossImage: "/characters/boss-phase-1-ancient-rock.webp",
    dialogue: [
      // 1페이지: 스토리 인트로 (신석기 시대 도착 및 마을 배경 감상)
      {
        speaker: "역사별이",
        text: "시간의 나침반이 반응하며 약 1만 년 전 [신석기 시대]로 이동했어요!\n따스한 햇살 아래 강가와 바닷가에 자리 잡은 평화로운 마을이 보이시나요?\n이 시대 사람들의 새로운 도구와 정착 생활을 탐구해 보아요!",
      },
      // 2페이지: 신석기 핵심 유물: 간석기와 빗살무늬 토기 (초등 교과서 눈높이)
      {
        speaker: "역사별이",
        text: "신석기 사람들은 돌을 정교하게 갈아 만든 [간석기]를 도구로 사용했어요!\n곡식의 껍질을 벗기던 [갈판과 갈돌]과 용도에 맞게 다듬은 다양한 간석기, 음식을 조리하고 저장한 [빗살무늬 토기]를 살펴보세요!",
        visual: {
          type: "diagram",
          title: "신석기 시대 핵심 유물: 간석기와 토기",
          caption: "돌을 정교하게 갈아 만든 간석기와 진흙을 빚어 구운 빗살무늬 토기로 생활이 크게 발전했습니다.",
          source: "📷 유물 사진 출처: 국립중앙박물관 (공공누리 제1유형)",
          items: [
            {
              title: "갈판과 갈돌",
              desc: "갈판 위에 곡식·도토리를 올리고 갈돌을 밀어 가루를 내던 도구",
              icon: "🪨",
              src: "/relics/saddle_quern.webp",
            },
            {
              title: "다양한 간석기",
              desc: "돌을 정교하게 갈아 만든 맞춤형 도구! 곡식 수확과 사냥에 활용",
              icon: "🪓",
              src: "/relics/ground_stone_axe.webp",
            },
            {
              title: "빗살무늬 토기",
              desc: "진흙으로 빚어 불에 구운 토기! 뾰족한 밑과 빗살무늬로 곡식 조리·저장",
              icon: "🏺",
              src: "/relics/comb_pottery.webp",
            },
          ],
        },
      },
      // 3페이지: 의생활과 정착 생활 (움집 마을)
      {
        speaker: "역사별이",
        text: "또 [가락바퀴]와 [뼈바늘]로 옷을 직접 지어 입었고, 농사를 짓게 되면서 한곳에 머무는 [정착 생활]을 시작했어요.\n물과 식량을 구하기 쉬운 강가나 바닷가에 [움집]을 짓고 마을을 이루었지요.",
        visual: {
          type: "diagram",
          title: "신석기 정착 생활의 3대 특징",
          caption: "인류 최초로 옷을 직접 짓고, 움집 마을을 이루며 정착 생활을 시작했습니다.",
          source: "자료 출처: 가락바퀴-국립중앙박물관 (공공누리 제1유형) · 주거 복원도 (교육용 생성형 AI 시각화)",
          items: [
            { title: "가락바퀴·뼈바늘", desc: "실을 뽑아 옷과 그물을 직접 제작한 원시 수공업 도구", icon: "🪡", src: "/relics/spindle_whorl.webp" },
            { title: "움집 (정착 가옥)", desc: "바닥을 파고 화덕을 갖춘 둥근 반지하 정착 살림집", icon: "🛖", src: "/dwellings/neolithic_hut.webp" },
            { title: "농경과 목축의 시작", desc: "조·피·기장 밭농사와 가축 사육으로 식량을 직접 생산", icon: "🌾", src: "/dwellings/neolithic_farming.webp" },
          ],
        },
      },
      // 확인문제 2-1
      {
        speaker: "역사별이",
        text: "★ [확인문제 1] 신석기 사람들이 곡식을 조리하고 저장하기 위해 진흙으로 빚어 구운 대표 토기는 무엇일까요?",
        choices: choice(
          "빗살무늬 토기",
          ["민무늬 토기", "미송리식 토기", "비파형 동검"],
          "정답입니다! 표면에 빗살 같은 무늬가 새겨진 빗살무늬 토기는 신석기의 상징입니다.",
          "오답이에요. 민무늬 토기와 미송리식 토기는 청동기 시대 토기입니다."
        ),
      },
      // 확인문제 2-2 (빈칸 채우기)
      {
        speaker: "역사별이",
        text: "★ [확인문제 2] 신석기 시대 의생활 완성! 빈칸에 들어갈 알맞은 유물 카드를 골라 문장을 완성해 보세요.",
        task: fillBlank(
          [
            { text: "신석기 사람들은 [가락바퀴]로 실을 뽑고, " },
            { isSlot: true, text: "뼈바늘" },
            { text: "(으)로 꿰매어 옷과 그물을 만들었다!" },
          ],
          [
            { id: "opt-needle", text: "뼈바늘", isAnswer: true, explanation: "정답입니다! 뼈바늘로 실을 꿰매어 옷이나 그물을 지었습니다." },
            { id: "opt-axe", text: "주먹도끼", isAnswer: false, explanation: "주먹도끼는 구석기 시대의 만능 사냥·조리 석기입니다." },
            { id: "opt-knife", text: "반달 돌칼", isAnswer: false, explanation: "반달 돌칼은 청동기 시대 벼 이삭을 자르던 농기구입니다." },
            { id: "opt-dagger", text: "비파형 동검", isAnswer: false, explanation: "비파형 동검은 청동기 시대 지배자의 무기입니다." },
          ],
          "대단해요! 가락바퀴와 뼈바늘을 활용한 신석기인의 의생활을 완벽히 이해했습니다!"
        ),
        interactiveTask: fillBlank(
          [
            { text: "신석기 사람들은 [가락바퀴]로 실을 뽑고, " },
            { isSlot: true, text: "뼈바늘" },
            { text: "(으)로 꿰매어 옷과 그물을 만들었다!" },
          ],
          [
            { id: "opt-needle", text: "뼈바늘", isAnswer: true, explanation: "정답입니다! 뼈바늘로 실을 꿰매어 옷이나 그물을 지었습니다." },
            { id: "opt-axe", text: "주먹도끼", isAnswer: false, explanation: "주먹도끼는 구석기 시대의 만능 사냥·조리 석기입니다." },
            { id: "opt-knife", text: "반달 돌칼", isAnswer: false, explanation: "반달 돌칼은 청동기 시대 벼 이삭을 자르던 농기구입니다." },
            { id: "opt-dagger", text: "비파형 동검", isAnswer: false, explanation: "비파형 동검은 청동기 시대 지배자의 무기입니다." },
          ],
          "대단해요! 가락바퀴와 뼈바늘을 활용한 신석기인의 의생활을 완벽히 이해했습니다!"
        ),
      },
      // 확인문제 2-3
      {
        speaker: "역사별이",
        text: "★ [확인문제 3] 신석기 시대의 특징으로 올바른 설명을 모두 골라보세요.",
        multiCheck: multiCheck(
          [
            { id: "neo-1", text: "돌을 갈아서 만든 간석기를 사용했다.", isAnswer: true, explanation: "갈판, 갈돌, 돌괭이 등 간석기를 사용했습니다." },
            { id: "neo-2", text: "농경(조, 콩, 팥 등 밭농사)과 목축이 시작되었다.", isAnswer: true, explanation: "인류 최초로 농사를 짓기 시작했습니다." },
            { id: "neo-3", text: "강가나 바닷가에 움집을 짓고 정착 생활을 했다.", isAnswer: true, explanation: "농경으로 인해 한곳에 머무르는 정착이 이루어졌습니다." },
            { id: "neo-4", text: "청동검을 지닌 지배자가 등장하고, 최초의 국가가 탄생했다.", isAnswer: false, explanation: "청동검(비파형 동검)은 지배자의 강력한 힘과 권력을 나타내는 상징이며, 계급과 최초 국가(고조선)의 출현은 청동기 시대의 특징입니다." },
          ],
          "참 잘했습니다! 신석기의 간석기, 농경 시작, 움집 정착 생활을 완벽히 이해했습니다. 승리의 불씨 카드를 획득했습니다."
        ),
      },
    ],
  },

  // ==========================================
  // STAGE 3: 청동기 시대
  // ==========================================
  {
    id: 3,
    title: "3단계: 청동기 시대 - 비파형 동검과 고인돌",
    shortTitle: "청동기 시대",
    concept: "청동 무기, 벼농사, 계급과 고인돌",
    mission: "금속과 고인돌의 시대! 청동 무기와 벼농사의 지혜를 배워 집으로 가는 시간의 문턱에 다다르세요!",
    bossName: "원시 암석수호령",
    bossTitle: "구석기·신석기 원시 바위의 화신",
    bossShortName: "암석수호령",
    color: "#0284c7",
    background: "linear-gradient(135deg, #0369a1, #082f49)",
    bossImage: "/characters/boss-phase-2-megalith-lord.webp",
    dialogue: [
      // 1페이지: 스토리 인트로 (청동기 시대 도착)
      {
        speaker: "역사별이",
        text: "기원전 2000년 무렵, 금속의 시대인 [청동기 시대]로 시간 이동했습니다!\n청동은 매우 귀해서 지배자의 무기인 [비파형 동검]이나 제사용 도구로만 쓰였어요.",
      },
      // 2페이지: 도구의 이원화와 고인돌 (농기구와 권력의 상징)
      {
        speaker: "역사별이",
        text: "농기구는 여전히 돌을 갈아 만든 [반달 돌칼]로 벼 이삭을 잘랐답니다.\n거대한 [고인돌]은 많은 사람을 동원할 수 있었던 군장(족장)의 막강한 권력을 보여줘요!\n칠판의 유물들을 잘 기억해 두세요!",
        visual: {
          type: "diagram",
          title: "청동기 시대의 도구 이원화",
          caption: "지배자의 위세를 과시하는 청동기와 실생활 농기구(석기)가 구별되었습니다.",
          source: "📷 유물 사진 출처: 국립중앙박물관·국가유산포털 (공공누리 제1유형)",
          items: [
            { title: "비파형 동검", desc: "청동으로 제작! 족장(군장)의 강력한 권력과 무기", icon: "⚔️", src: "/relics/mandolin_dagger.webp" },
            { title: "거친무늬 거울", desc: "청동으로 제작! 태양빛을 반사해 신비감을 준 제사용 도구", icon: "🪞", src: "/relics/coarse_pattern_mirror.webp" },
            { title: "반달 돌칼", desc: "★돌로 제작! 구멍에 끈을 꿰어 벼 이삭을 자른 수확 도구", icon: "🌾", src: "/relics/semilunar_knife.webp" },
            { title: "탁자식 고인돌", desc: "많은 인력을 동원한 군장(족장)의 권력을 상징하는 거대한 돌무덤", icon: "🏛️", src: "/relics/table_dolmen.webp" },
          ],
        },
      },
      // 3페이지: 벼농사와 계급 사회 (사회 변화와 방어 시설)
      {
        speaker: "역사별이",
        text: "[벼농사]가 시작되어 식량이 풍족해지자 [개인의 재산(사유 재산)]과 [계급]이 생겨났어요!\n부족 간 전쟁에 대비해 마을 둘레에 [도랑(환호)]과 [나무 울타리(목책)]를 둘렀답니다.",
        visual: {
          type: "diagram",
          title: "청동기 시대의 사회 변화",
          caption: "벼농사로 생산량이 크게 늘어나면서 계급과 정복 전쟁, 방어 시설이 나타났습니다.",
          source: "🎨 시각 자료: 청동기 시대 생활 모습 고증 일러스트 (교육용 생성형 AI 시각화)",
          items: [
            {
              title: "벼농사의 시작",
              desc: "강가 주변 구릉지대 벼농사로 식량이 매우 풍족해짐",
              icon: "🌾",
              src: "/dwellings/bronze_rice_farming.webp",
            },
            {
              title: "개인의 재산과 빈부 격차",
              desc: "남은 곡식을 개인이 가지게 되면서 빈부 격차 발생",
              icon: "💰",
              src: "/dwellings/bronze_private_property.webp",
            },
            {
              title: "계급과 군장(족장)",
              desc: "무력과 사람을 거느린 지배자(군장)가 등장하여 부족 통솔",
              icon: "👑",
              src: "/dwellings/bronze_chief_class.webp",
            },
            {
              title: "도랑(환호)과 울타리(목책)",
              desc: "정복 전쟁에 대비해 마을 둘레에 도랑과 목책을 둘러 방어",
              icon: "🛡️",
              src: "/dwellings/bronze_hwanho_moat.webp",
            },
          ],
        },
      },
      // 확인문제 3-1
      {
        speaker: "역사별이",
        text: "★ [확인문제 1] 청동기 시대 벼 이삭을 자를 때 쓴 도구로, 청동이 아닌 '돌'을 갈아 구멍에 끈을 꿰어 쓴 농기구는?",
        choices: choice(
          "반달 돌칼",
          ["주먹도끼", "비파형 동검", "가락바퀴"],
          "정답입니다! 청동기 시대에도 농기구는 청동이 귀했기 때문에 돌(반달 돌칼)을 썼습니다.",
          "오답이에요! 비파형 동검은 지배자의 무기이며, 벼 이삭을 자른 농기구는 반달 돌칼입니다."
        ),
      },
      // 확인문제 3-2 (짝맞추기)
      {
        speaker: "역사별이",
        text: "★ [확인문제 2] 청동기 시대 유물과 그 쓰임새 및 성격을 바르게 짝지어 연결해 보세요!",
        task: matchPair(
          [
            { left: "비파형 동검", right: "지배자의 강력한 힘과 권력을 상징하는 청동 무기" },
            { left: "반달 돌칼", right: "돌을 갈아 벼 이삭을 잘라낸 농기구" },
            { left: "탁자식 고인돌", right: "군장의 막강한 권력을 상징하는 거대한 돌무덤" },
          ],
          "대단해요! 무기는 귀한 청동으로, 농기구는 여전히 돌로 만들었던 지혜와 고인돌의 권력을 완벽히 이해했습니다!"
        ),
        interactiveTask: matchPair(
          [
            { left: "비파형 동검", right: "지배자의 강력한 힘과 권력을 상징하는 청동 무기" },
            { left: "반달 돌칼", right: "돌을 갈아 벼 이삭을 잘라낸 농기구" },
            { left: "탁자식 고인돌", right: "군장의 막강한 권력을 상징하는 거대한 돌무덤" },
          ],
          "대단해요! 무기는 귀한 청동으로, 농기구는 여전히 돌로 만들었던 지혜와 고인돌의 권력을 완벽히 이해했습니다!"
        ),
      },
      // 확인문제 3-3 (다중 선택: 청동기 사회 모습 종합)
      {
        speaker: "역사별이",
        text: "★ [확인문제 3] 벼농사가 시작되고 계급이 나타난 청동기 시대의 사회 모습으로 옳은 설명을 모두 골라보세요.",
        multiCheck: multiCheck(
          [
            {
              id: "bronze-opt-1",
              text: "벼농사로 남은 곡식이 생기며 개인의 재산(사유 재산)과 빈부 격차가 나타났다.",
              isAnswer: true,
              explanation: "생산량 증가로 개인의 재산이 생기고 빈부 격차가 발생했습니다.",
            },
            {
              id: "bronze-opt-2",
              text: "많은 사람과 무기를 거느린 권력자(군장/족장)가 등장하고 계급 사회가 시작되었다.",
              isAnswer: true,
              explanation: "고인돌을 만든 막강한 권력의 지배 계급이 등장했습니다.",
            },
            {
              id: "bronze-opt-3",
              text: "부족 간의 전쟁에 대비해 마을 둘레에 도랑(환호)을 파고 나무 울타리(목책)를 둘렀다.",
              isAnswer: true,
              explanation: "정복 전쟁과 약탈에 대비한 마을 방어 시설을 구축했습니다.",
            },
            {
              id: "bronze-opt-4",
              text: "농사를 지을 때 주로 청동으로 만든 괭이나 낫을 사용해 땅을 갈았다.",
              isAnswer: false,
              explanation: "청동은 매우 귀해서 무기나 제사용 도구로만 쓰였고, 농기구는 여전히 돌(반달 돌칼 등)이나 나무를 사용했습니다.",
            },
          ],
          "완벽합니다! 청동기 시대에는 벼농사로 개인의 재산과 계급이 생겨났고 전쟁에 대비해 환호와 목책을 둘렀습니다. 농기구는 청동이 귀해 여전히 돌과 나무를 썼다는 점도 꼭 기억하세요! 청동 방울 카드를 획득했습니다."
        ),
      },
    ],
  },

  // ==========================================
  // STAGE 4: 고조선 건국과 발전
  // ==========================================
  {
    id: 4,
    title: "4단계: 고조선 건국과 사회 - 단군왕검과 8조법",
    shortTitle: "고조선과 8조법",
    concept: "최초의 국가, 단군신화, 8조법, 문화 범위",
    mission: "집으로 가는 시간의 문이 있는 고조선! 단군왕검 건국 이야기와 8조법을 배워 시간의 문을 여세요!",
    bossName: "원시 암석수호령",
    bossTitle: "구석기·신석기 원시 바위의 화신",
    bossShortName: "암석수호령",
    color: "#7e22ce",
    background: "linear-gradient(135deg, #581c87, #3b0764)",
    bossImage: "/characters/boss-phase-3-bronze-overlord.webp",
    dialogue: [
      // 1페이지: 스토리 인트로 (고조선 도읍 아사달 도착)
      {
        speaker: "역사별이",
        text: "마침내 우리 역사 최초의 국가 [고조선]의 도읍 아사달에 도착했어요!\n고조선은 청동기 문화를 바탕으로 세워진 자랑스러운 우리 첫 나라랍니다.",
      },
      // 2페이지: 고조선 건국 이야기 (단군신화와 3대 상징 - 3개 카드)
      {
        speaker: "역사별이",
        text: "하늘의 신 환웅이 내려와 널리 인간을 이롭게 한다는 [홍익인간]의 뜻을 펼쳤어요!\n바람·비·구름을 다스리며 농경을 중시했고, 곰을 숭배하는 부족과 결합해 고조선이 탄생했답니다.\n칠판의 단군신화 이야기를 살펴보세요!",
        visual: {
          type: "diagram",
          title: "고조선 건국 이야기 (단군신화)",
          caption: "『삼국유사』에 전해지는 건국 이야기를 통해 고조선의 사회상과 건국 이념을 알 수 있습니다.",
          source: "🎨 시각 자료: 단군신화 역사 고증 삽화 (교육용 생성형 AI 시각화)",
          items: [
            {
              title: "1. 환웅 강림과 홍익인간",
              src: "/dwellings/dangun_hwanung_descent.webp",
              story: "하늘의 신 환웅이 '널리 인간을 이롭게 하겠다'는 뜻(홍익인간)을 품고 태백산(백두산) 신단수 아래로 내려왔어요.",
              meaning: "고조선의 건국 이념이자 백성을 아끼는 숭고한 통치 철학",
            },
            {
              title: "2. 바람·비·구름과 농경",
              src: "/dwellings/dangun_weather_gods.webp",
              story: "환웅은 농사에 꼭 필요한 바람(풍백), 비(우사), 구름(운사)을 다스리는 세 신하와 함께 백성의 농사를 돌보았어요.",
              meaning: "날씨가 생명인 농경 사회를 가장 중요하게 여겼음을 상징",
            },
            {
              title: "3. 곰과 호랑이의 시련",
              src: "/dwellings/dangun_bear_tiger.webp",
              story: "사람이 되고 싶던 곰과 호랑이 중, 곰이 쑥과 마늘을 먹고 끈기로 버텨 '웅녀'가 되었고 환웅과 혼인해 단군왕검을 낳았어요.",
              meaning: "곰을 숭배하는 부족이 환웅 세력과 결합해 고조선 건국",
            },
          ],
        },
      },
      // 3페이지: 단군왕검과 고조선의 독자적 문화 범위 (2개 카드)
      {
        speaker: "역사별이",
        text: "고조선을 다스린 [단군왕검]은 제사와 정치를 함께 이끈 제정일치 지도자예요!\n한반도 북부와 랴오둥에서 함께 출토되는 [비파형 동검]과 [탁자식 고인돌]은 바로 고조선의 독자적인 문화 범위를 증명한답니다!",
        visual: {
          type: "diagram",
          title: "단군왕검과 고조선의 문화 범위",
          caption: "제정일치 지도자 단군왕검과 고조선의 독자적 문화 영역을 입증하는 대표 유물입니다.",
          source: "🏛️ 자료 출처: 인물-교육용 생성형 AI 고증 복원화 · 지도-위키미디어 공용 (CC0)",
          items: [
            { title: "단군왕검 (제정일치)", desc: "제사장(단군)과 정치 지도자(왕검)가\n결합된 최고 통치자", icon: "👑", src: "/relics/dangun_wanggeom.webp" },
            { title: "비파형 동검과 탁자식 고인돌의 분포", desc: "한반도 북부~랴오둥에서 함께 출토\n➔ 고조선의 문화 범위 입증", icon: "🗺️", src: "/relics/gojoseon_culture_map.webp" },
          ],
        },
      },
      // 4페이지: 8조법의 지혜 (질서와 사회상)
      {
        speaker: "역사별이",
        text: "고조선은 사회 질서를 유지하기 위해 [8조법]을 만들었어요.\n중국 『한서』에 전해지는 3개 조항을 통해 생명 존중, 개인의 재산, 신분 차이(노비)를 알 수 있답니다!\n이제 역사의 지혜로 시간의 문을 열어봐요!",
        visual: {
          type: "diagram",
          title: "고조선 8조법의 3대 전승 조항",
          caption: "중국 『한서』 지리지에 기록되어 전해지는 고조선의 기본 법률입니다.",
          source: "🎨 시각 자료: 고조선 8조법 사회상 삽화 (교육용 생성형 AI 시각화)",
          items: [
            {
              title: "사람을 죽인 죄",
              desc: "사람을 죽인 자는 사형에 처함\n➔ 생명을 매우 소중히 여김",
              icon: "⚖️",
              src: "/dwellings/gojoseon_law_life.webp",
            },
            {
              title: "남을 다치게 한 죄",
              desc: "남을 다치게 한 자는 곡식으로 배상\n➔ 농사를 중요하게 여김, 일할 사람 중시",
              icon: "🌾",
              src: "/dwellings/gojoseon_law_grain.webp",
            },
            {
              title: "도둑질을 한 죄",
              desc: "남의 물건을 훔친 자는 노비로 삼음\n➔ 개인의 재산 인정과 노비 존재",
              icon: "🪙",
              src: "/dwellings/gojoseon_law_property.webp",
            },
          ],
        },
      },
      // 확인문제 4-1
      {
        speaker: "역사별이",
        text: "★ [확인문제 1] 고조선 8조법 중 전해지는 세 가지 조항과 그를 통해 알 수 있는 사회 모습을 바르게 짝지어 보세요!",
        task: matchPair(
          [
            { left: "사람을 죽인 자는 사형에 처한다", right: "생명을 소중히 여김 (생명 존중)", emoji: "⚖️" },
            { left: "남을 다치게 한 자는 곡식으로 갚는다", right: "농경 사회와 노동력 중시 (곡식으로 배상)", emoji: "🌾" },
            { left: "남의 물건을 훔친 자는 노비로 삼는다", right: "개인 재산 인정과 노비 신분 (도둑질 처벌)", emoji: "💰" },
          ],
          "훌륭합니다! 8조법에 담긴 고조선 사람들의 생활 모습을 완벽하게 파악했습니다."
        ),
        interactiveTask: matchPair(
          [
            { left: "사람을 죽인 자는 사형에 처한다", right: "생명을 소중히 여김 (생명 존중)", emoji: "⚖️" },
            { left: "남을 다치게 한 자는 곡식으로 갚는다", right: "농경 사회와 노동력 중시 (곡식으로 배상)", emoji: "🌾" },
            { left: "남의 물건을 훔친 자는 노비로 삼는다", right: "개인 재산 인정과 노비 신분 (도둑질 처벌)", emoji: "💰" },
          ],
          "훌륭합니다! 8조법에 담긴 고조선 사람들의 생활 모습을 완벽하게 파악했습니다."
        ),
      },
      // 확인문제 4-2 (빈칸 채우기)
      {
        speaker: "역사별이",
        text: "★ [확인문제 2] 단군왕검의 지도자 성격 완성! 빈칸에 들어갈 올바른 개념 카드를 골라보세요.",
        task: fillBlank(
          [
            { text: "제사장을 뜻하는 '단군'과 정치 지배자를 뜻하는 '왕검'이 합쳐진 " },
            { isSlot: true, text: "제정일치" },
            { text: " 사회 지도자!" },
          ],
          [
            { id: "opt-theocracy", text: "제정일치", isAnswer: true, explanation: "정답입니다! 제사와 정치가 일치된 지배자를 뜻합니다." },
            { id: "opt-equality", text: "신분평등", isAnswer: false, explanation: "고조선은 8조법을 통해 노비가 존재하던 신분제 사회였습니다." },
            { id: "opt-vote", text: "직접선거", isAnswer: false, explanation: "선거 제도는 현대 민주주의의 특징입니다." },
            { id: "opt-separation", text: "제정분리", isAnswer: false, explanation: "제정분리는 삼한 시대의 소도(천군) 등에서 나타납니다." },
          ],
          "참 잘했습니다! 단군왕검의 제정일치(제사+정치) 성격을 완벽히 이해했습니다!"
        ),
        interactiveTask: fillBlank(
          [
            { text: "제사장을 뜻하는 '단군'과 정치 지배자를 뜻하는 '왕검'이 합쳐진 " },
            { isSlot: true, text: "제정일치" },
            { text: " 사회 지도자!" },
          ],
          [
            { id: "opt-theocracy", text: "제정일치", isAnswer: true, explanation: "정답입니다! 제사와 정치가 일치된 지배자를 뜻합니다." },
            { id: "opt-equality", text: "신분평등", isAnswer: false, explanation: "고조선은 8조법을 통해 노비가 존재하던 신분제 사회였습니다." },
            { id: "opt-vote", text: "직접선거", isAnswer: false, explanation: "선거 제도는 현대 민주주의의 특징입니다." },
            { id: "opt-separation", text: "제정분리", isAnswer: false, explanation: "제정분리는 삼한 시대의 소도(천군) 등에서 나타납니다." },
          ],
          "참 잘했습니다! 단군왕검의 제정일치(제사+정치) 성격을 완벽히 이해했습니다!"
        ),
      },
      // 확인문제 4-3
      {
        speaker: "역사별이",
        text: "★ [확인문제 3] 한반도 북부와 랴오둥에서 함께 출토되어 고조선의 독자적 문화 범위를 알려주는 대표 유물·유적 2가지는?",
        choices: choice(
          "비파형 동검과 탁자식 고인돌",
          [
            "주먹도끼와 막집",
            "빗살무늬 토기와 가락바퀴",
            "철제 갑옷과 삼국사기"
          ],
          "정답입니다! 비파형 동검과 탁자식 고인돌의 분포 지역이 바로 고조선의 문화 영역입니다.",
          "오답입니다. 주먹도끼는 구석기, 빗살무늬 토기는 신석기의 유물입니다."
        ),
      },
      {
        speaker: "역사별이",
        text: "축하합니다! 구석기, 신석기, 청동기, 고조선까지 4대 역사의 지혜를 모두 모았습니다! 하지만... 저길 보세요!\n현대로 통하는 시간의 문을 막아서며 고대의 수호 보스들이 깨어났습니다!\n3단계 보스를 모두 물리쳐야만 집으로 가는 시간의 문이 활짝 열립니다!",
        bgImage: "/backgrounds/stage4_bosses_awakened_bg.webp",
      },
    ],
  },
  // ==========================================
  // STAGE 5: 역사 카드배틀 (1~4단계 정복자 무제한 입장 모드)
  // ==========================================
  {
    id: 5,
    title: "5단계: 역사 카드배틀 - 시간의 수호신 총력전",
    shortTitle: "역사 카드배틀",
    concept: "구석기부터 고조선까지 전 시대 총력 배틀",
    mission: "1~4단계에서 쌓은 모든 역사 지식과 카드 전략으로 시간의 수호신과의 3단계 최종 결전을 돌파하세요!",
    bossName: "시간의 수호신",
    bossTitle: "역사의 시간을 관장하는 궁극의 수호신",
    bossShortName: "수호신",
    color: "#dc2626",
    background: "linear-gradient(135deg, #450a0a, #1c1917)",
    bossImage: "/characters/boss-phase-3-bronze-overlord.webp",
    dialogue: [
      {
        speaker: "역사별이",
        text: "수호자님, 환영합니다! 이곳은 1~4단계를 모두 정복한 진정한 역사 수호자만이 도전할 수 있는 [역사 카드배틀]의 전장입니다!\n구석기부터 고조선까지 출제되는 전 범위 역사 퀴즈를 맞히고, 강력한 스탠스 카드로 시간의 수호신을 물리쳐 보세요!",
      },
    ],
  },
];

// 캐릭터 선택지
export type CharacterId = "bau" | "ara" | "narae";
export type Character = {
  id: CharacterId;
  name: string;
  role: string;
  meaning: string;
  image: string;
  desc?: string;
  avatar?: string;
  physicalDefense: number;
  magicDefense: number;
};

export const characters: Character[] = [
  {
    id: "bau",
    name: "바우",
    role: "역사 지킴이",
    meaning: "바위처럼 단단하게 우리 역사의 뿌리를 지키는 든든한 수호자",
    image: "/characters/bau.webp",
    desc: "단단한 역사 지식으로 동료를 지키는 든든한 지킴이",
    avatar: "🛡️",
    physicalDefense: 4,
    magicDefense: 0,
  },
  {
    id: "ara",
    name: "아라",
    role: "역사 꿈나무",
    meaning: "넓은 바다처럼 깊은 지혜로 고대 유물과 유적의 진실을 찾는 모험가",
    image: "/characters/ara.webp",
    desc: "예리한 눈썰미로 고대 유적과 유물의 비밀을 파헤치는 꿈나무",
    avatar: "🔍",
    physicalDefense: 2,
    magicDefense: 2,
  },
  {
    id: "narae",
    name: "나래",
    role: "시간 길잡이",
    meaning: "역사에 날개를 달아주듯 시간의 흐름과 문명을 꿰뚫어 보는 길잡이",
    image: "/characters/narae.webp",
    desc: "역사의 흐름과 시간을 꿰뚫어 보는 지혜로운 길잡이",
    avatar: "⚡",
    physicalDefense: 0,
    magicDefense: 4,
  },
];
