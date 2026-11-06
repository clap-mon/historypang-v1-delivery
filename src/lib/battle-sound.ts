export type BattleSound =
  | "correct"
  | "wrong"
  | "lucky"
  | "bomb"
  | "physical"
  | "magic"
  | "guard"
  | "dodge"
  | "enemy"
  | "stance"
  | "confusion"
  | "boss_awaken"
  | "victory"
  | "phase_clear"
  | "relic_compass"
  | "relic_mirror"
  | "relic_urn"
  | "relic_key";

let sharedAudioContext: AudioContext | null = null;
const AUDIO_MUTE_KEY = "luckypang-history-audio-muted";
let cachedMuteState: boolean | null = null;

export function getAudioMuted(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedMuteState !== null) return cachedMuteState;
  try {
    const saved = localStorage.getItem(AUDIO_MUTE_KEY);
    cachedMuteState = saved === "true";
    return cachedMuteState;
  } catch {
    return false;
  }
}

export function setAudioMuted(muted: boolean): void {
  cachedMuteState = muted;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUDIO_MUTE_KEY, String(muted));
  } catch {}
}

export function toggleAudioMuted(): boolean {
  const next = !getAudioMuted();
  setAudioMuted(next);
  return next;
}

function getSafeAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = new AudioContextClass();
    }

    if (sharedAudioContext && sharedAudioContext.state === "suspended") {
      // 모바일 브라우저 터치 시 오디오 컨텍스트 안전 재개 시도
      sharedAudioContext.resume().catch(() => {});
    }

    return sharedAudioContext;
  } catch {
    return null;
  }
}

export function playBattleSound(kind: BattleSound) {
  if (getAudioMuted()) return;
  try {
    const context = getSafeAudioContext();
    if (!context) return;

    // 1. 보너스 정답 전용 화려한 4음 상승 아르페지오 사운드 (C5 ➔ E5 ➔ G5 ➔ C6)
    if (kind === "lucky") {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        try {
          const osc = context.createOscillator();
          const gain = context.createGain();
          const startTime = context.currentTime + idx * 0.06;
          const noteDuration = 0.22;

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.09, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

          osc.connect(gain).connect(context.destination);
          osc.start(startTime);
          osc.stop(startTime + noteDuration);
        } catch {
          // 개별 오실레이터 실패 시 안전 무시
        }
      });
      return;
    }

    // ⚡ 4대 고유 유물 발동 전용 SFX 사운드
    if (kind === "relic_compass") {
      // 🧭 역사 나침반: 묵직한 타격 후 청아한 나침반 챠링 공명음
      [320, 880, 1320, 1760].forEach((freq, idx) => {
        try {
          const osc = context.createOscillator();
          const gain = context.createGain();
          const st = context.currentTime + idx * 0.05;
          osc.type = idx === 0 ? "triangle" : "sine";
          osc.frequency.setValueAtTime(freq, st);
          gain.gain.setValueAtTime(idx === 0 ? 0.15 : 0.08, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.25);
          osc.connect(gain).connect(context.destination);
          osc.start(st);
          osc.stop(st + 0.25);
        } catch {}
      });
      return;
    }

    if (kind === "relic_mirror") {
      // 🪞 전설의 청동거울: 신비로운 태양광선 프리즘 반사 화음
      [659.25, 987.77, 1318.51, 1661.22].forEach((freq, idx) => {
        try {
          const osc = context.createOscillator();
          const gain = context.createGain();
          const st = context.currentTime + idx * 0.06;
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, st);
          gain.gain.setValueAtTime(0.09, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);
          osc.connect(gain).connect(context.destination);
          osc.start(st);
          osc.stop(st + 0.35);
        } catch {}
      });
      return;
    }

    if (kind === "relic_urn") {
      // 🔥 승리의 불씨: 상쾌하게 차오르는 결계 해제 화음
      [349.23, 440.0, 523.25, 698.46].forEach((freq, idx) => {
        try {
          const osc = context.createOscillator();
          const gain = context.createGain();
          const st = context.currentTime + idx * 0.04;
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, st);
          gain.gain.setValueAtTime(0.1, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.22);
          osc.connect(gain).connect(context.destination);
          osc.start(st);
          osc.stop(st + 0.22);
        } catch {}
      });
      return;
    }

    if (kind === "relic_key") {
      // 🔔 청동 방울: 청아하게 울려 퍼지는 행동력 각성 사운드
      [110, 164.81, 220, 329.63].forEach((freq, idx) => {
        try {
          const osc = context.createOscillator();
          const gain = context.createGain();
          const st = context.currentTime + idx * 0.08;
          osc.type = idx < 2 ? "sawtooth" : "triangle";
          osc.frequency.setValueAtTime(freq, st);
          gain.gain.setValueAtTime(0.12, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.4);
          osc.connect(gain).connect(context.destination);
          osc.start(st);
          osc.stop(st + 0.4);
        } catch {}
      });
      return;
    }

    // 2. 폭탄 오답 전용 묵직한 저음 폭발 충격음
    if (kind === "bomb") {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const duration = 0.32;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, context.currentTime + duration);

      gain.gain.setValueAtTime(0.12, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

      osc.connect(gain).connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + duration);
      return;
    }

    // 3. 보스 진화 각성음 (지진 저음 진동 + 긴장감 상승 글리산도)
    if (kind === "boss_awaken") {
      const osc1 = context.createOscillator();
      const osc2 = context.createOscillator();
      const gain = context.createGain();
      const duration = 0.65;

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(65, context.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(180, context.currentTime + duration);

      osc2.type = "square";
      osc2.frequency.setValueAtTime(130, context.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(360, context.currentTime + duration);

      gain.gain.setValueAtTime(0.14, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(context.destination);

      osc1.start();
      osc2.start();
      osc1.stop(context.currentTime + duration);
      osc2.stop(context.currentTime + duration);
      return;
    }

    // 4. 승리 팡파레 사운드 (도-솔-도-레-미 그랜드 팡파레)
    if (kind === "victory") {
      const victoryNotes = [523.25, 783.99, 1046.5, 1174.66, 1318.51];
      victoryNotes.forEach((freq, idx) => {
        try {
          const osc = context.createOscillator();
          const gain = context.createGain();
          const startTime = context.currentTime + idx * 0.1;
          const noteDuration = idx === victoryNotes.length - 1 ? 0.6 : 0.22;

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

          osc.connect(gain).connect(context.destination);
          osc.start(startTime);
          osc.stop(startTime + noteDuration);
        } catch {
          // 개별 오실레이터 실패 시 안전 무시
        }
      });
      return;
    }

    // ⚡ 1·2단계 보스 격파 전용: 간결하고 청아한 승리 징글 (도-미-솔-도 컴팩트 팡파레)
    if (kind === "phase_clear") {
      const clearNotes = [523.25, 659.25, 783.99, 1046.5]; // C5 -> E5 -> G5 -> C6
      clearNotes.forEach((freq, idx) => {
        try {
          const osc = context.createOscillator();
          const gain = context.createGain();
          const startTime = context.currentTime + idx * 0.07;
          const noteDuration = idx === clearNotes.length - 1 ? 0.38 : 0.14;

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.08, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

          osc.connect(gain).connect(context.destination);
          osc.start(startTime);
          osc.stop(startTime + noteDuration);
        } catch {
          // 개별 오실레이터 실패 시 안전 무시
        }
      });
      return;
    }

    // 5. 기본 전투 효과음 (타격감 및 질감 향상)
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const settings: Record<
      Exclude<BattleSound, "lucky" | "bomb" | "boss_awaken" | "victory" | "phase_clear" | "relic_compass" | "relic_mirror" | "relic_urn" | "relic_key">,
      [OscillatorType, number, number, number]
    > = {
      correct: ["triangle", 587.33, 880, 0.18],
      wrong: ["sawtooth", 190, 85, 0.24],
      physical: ["sawtooth", 220, 65, 0.14], // 뗀석기/동검의 묵직한 타격
      magic: ["sine", 380, 880, 0.2], // 번개/주술의 신비로운 파동
      guard: ["square", 240, 380, 0.16], // 고인돌/방패의 단단한 튕겨냄
      dodge: ["sine", 650, 1050, 0.14],
      enemy: ["sawtooth", 140, 60, 0.2],
      stance: ["triangle", 320, 480, 0.18],
      confusion: ["square", 520, 180, 0.26],
    };
    const [type, start, end, duration] = settings[kind];
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(start, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(end, context.currentTime + duration);
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch {
    // AudioContext 실패가 전투 로직, HP 변화, 턴 진행, 공격 연출을 막지 않도록 예외 무시
  }
}

export function playNoteRhythm(beats: number) {
  if (getAudioMuted()) return;
  try {
    const context = getSafeAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    // 1박 기준 약 0.5초 길이 (박자에 비례하여 소리가 지속됨)
    const duration = Math.min(Math.max((beats || 1) * 0.45, 0.12), 2.2);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5 (맑은 가온도)

    gain.gain.setValueAtTime(0.15, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch {
    // 안전 무시
  }
}
