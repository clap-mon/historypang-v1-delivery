import React from "react";

export interface EraIconProps {
  className?: string;
  size?: number;
}

/**
 * 🪨 1단계: 구석기 시대 — 주먹도끼 (Handaxe)
 * 자루 없이 손에 쥐는 타제 뗀석기의 뾰족한 칼날과 둥근 기저부, 박리면 결을 형상화
 */
export function HandaxeIcon({ className, size = 20 }: EraIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 뗀석기 주먹도끼 외곽 실루엣 */}
      <path
        d="M 12 2.5 C 10.2 5 6.2 11 5.8 15 C 5.3 19 8.2 21.5 12 21.5 C 15.8 21.5 18.7 19 18.2 15 C 17.8 11 13.8 5 12 2.5 Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {/* 주먹도끼 중심 등대(등줄기) */}
      <path
        d="M 12 4 L 12 18.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
      {/* 뗀석기 타격 박리면 결선 */}
      <path
        d="M 12 7.5 L 8 11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
      <path
        d="M 12 10.5 L 16 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
      <path
        d="M 12 13.5 L 8.5 16.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

/**
 * 🏺 2단계: 신석기 시대 — 빗살무늬 토기 (Comb-pattern Pottery)
 * 밑이 V자로 뾰족한 첨저형 바닥과 표면 빗살무늬 (청동기 미송리식 토기의 손잡이 완전 배제)
 */
export function CombPotteryIcon({ className, size = 20 }: EraIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 토기 외곽선 (손잡이 없는 V자형 첨저 토기) */}
      <path
        d="M 4 4.5 C 4.5 10 8 16 12 21.5 C 16 16 19.5 10 20 4.5 Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {/* 입구 테두리선 */}
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
        x1="3.5"
        x2="20.5"
        y1="4.5"
        y2="4.5"
      />
      {/* 빗살무늬 사선 패턴 (V자 층차 줄무늬) */}
      <path
        d="M 6.5 7.5 L 12 11 L 17.5 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path
        d="M 8 11 L 12 14.5 L 16 11"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path
        d="M 9.5 14.5 L 12 17.5 L 14.5 14.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

/**
 * 🗡️ 3단계: 청동기 시대 — 비파형 동검 (Lute-shaped Bronze Dagger)
 * 악기 비파처럼 중앙이 유선형으로 볼록 튀어나온 칼날과 슴베 결합부 형상화
 */
export function BronzeDaggerIcon({ className, size = 20 }: EraIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 비파형 동검 고유의 볼록한 칼날과 슴베 */}
      <path
        d="M 12 2.2 L 10.5 5.5 C 9.8 7.5 7.5 10 8 12.2 C 8.4 13.8 10 14.8 10.6 15.3 L 11 19.8 C 11 20.8 13 20.8 13 19.8 L 13.4 15.3 C 14 14.8 15.6 13.8 16 12.2 C 16.5 10 14.2 7.5 13.5 5.5 Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {/* 칼날 중앙의 굵은 등대(등줄기) */}
      <path
        d="M 12 3 L 12 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      {/* 칼날과 슴베 경계선 */}
      <line
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.3"
        x1="10.8"
        x2="13.2"
        y1="15.8"
        y2="15.8"
      />
    </svg>
  );
}

/**
 * 👑 4단계: 고조선 건국 — 단군왕검 청동 관모 & 건국 심볼 (Gojoseon Crown)
 * 우리 역사 최초 국가의 제정일치 지배자(단군왕검)의 청동 관모와 천손의식 태양 거울
 */
export function GojoseonCrownIcon({ className, size = 20 }: EraIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 단군왕검 청동 관모 베이스 */}
      <path
        d="M 3.5 14 L 3 8 L 7.5 11.5 L 12 4.5 L 16.5 11.5 L 21 8 L 20.5 14 Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {/* 관모 하단 머리띠 밴드 */}
      <path
        d="M 3.5 14 L 20.5 14 L 19.5 18.5 L 4.5 18.5 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {/* 중앙 청동 다뉴세문경(태양 거울) 원형 심볼 */}
      <circle
        cx="12"
        cy="11"
        fill="currentColor"
        r="2"
      />
      {/* 하단 밴드 장식 포인트 */}
      <circle cx="8" cy="16.2" fill="currentColor" r="0.9" />
      <circle cx="12" cy="16.2" fill="currentColor" r="0.9" />
      <circle cx="16" cy="16.2" fill="currentColor" r="0.9" />
    </svg>
  );
}

/**
 * ⚔️ 5단계: 파이널 존 — 역사 카드배틀 (Battle Cards)
 * 엇갈린 마법 배틀 카드 2장과 중앙의 빛나는 결전 스파크
 */
export function BattleCardsIcon({ className, size = 20 }: EraIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 뒤 카드 */}
      <rect
        fill="currentColor"
        fillOpacity="0.15"
        height="13.5"
        rx="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
        transform="rotate(-14 8 11.5)"
        width="9.5"
        x="3.2"
        y="4.8"
      />
      {/* 앞 카드 */}
      <rect
        fill="currentColor"
        fillOpacity="0.25"
        height="13.5"
        rx="1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        transform="rotate(12 15.5 12.5)"
        width="9.5"
        x="10.8"
        y="5.8"
      />
      {/* 중앙 결전 스파크 */}
      <path
        d="M 12 7 L 12.8 10.5 L 15.5 11.5 L 12.8 12.5 L 12 16 L 11.2 12.5 L 8.5 11.5 L 11.2 10.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 🏛️ 시대 번호(1~5)에 따라 알맞은 고증 SVG 아이콘을 반환하는 통합 컴포넌트
 */
export function StageEraIcon({
  stageId,
  size = 20,
  className,
}: {
  stageId: number;
  size?: number;
  className?: string;
}) {
  switch (stageId) {
    case 1:
      return <HandaxeIcon className={className} size={size} />;
    case 2:
      return <CombPotteryIcon className={className} size={size} />;
    case 3:
      return <BronzeDaggerIcon className={className} size={size} />;
    case 4:
      return <GojoseonCrownIcon className={className} size={size} />;
    case 5:
      return <BattleCardsIcon className={className} size={size} />;
    default:
      return null;
  }
}

/**
 * 🔔 3단계 고유 유물: 청동 방울 (Bronze Ritual Bell)
 * 고대 청동기 제천 의식과 군장의 위엄을 상징하는 청동색 앤틱 청동 방울
 */
export function BronzeBellIcon({ className, size = 22 }: EraIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bronzeBellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>
      </defs>
      {/* 상단 매다는 청동 고리 */}
      <path
        d="M 12 2 C 10.3 2 9 3.2 9 4.8 L 15 4.8 C 15 3.2 13.7 2 12 2 Z"
        fill="#0f766e"
        stroke="#2dd4bf"
        strokeWidth="1.6"
      />
      {/* 청동 방울 몸체 (우아한 곡선) */}
      <path
        d="M 9 4.8 C 7 7 5.5 11 5 15 C 4.5 18 7.2 19.5 12 19.5 C 16.8 19.5 19.5 18 19 15 C 18.5 11 17 7 15 4.8 Z"
        fill="url(#bronzeBellGrad)"
        stroke="#2dd4bf"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {/* 방울 표면 고대 청동 문양 */}
      <path
        d="M 7.5 10 L 12 12.5 L 16.5 10"
        stroke="#99f6e4"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="7.8" fill="#99f6e4" r="1" />
      {/* 하단 소리 울림 슬릿 및 방울 구슬 */}
      <line
        stroke="#134e4a"
        strokeLinecap="round"
        strokeWidth="2.2"
        x1="8"
        x2="16"
        y1="16.5"
        y2="16.5"
      />
      <circle
        cx="12"
        cy="16.5"
        fill="#fde047"
        r="1.4"
        stroke="#0f766e"
        strokeWidth="0.8"
      />
    </svg>
  );
}

