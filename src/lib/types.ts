export type TargetKind = "cta" | "nav" | "secondary";

export interface ScreenTarget {
  id: string;
  label: string;
  /** center x as percentage 0..100 */
  x: number;
  /** center y as percentage 0..100 */
  y: number;
  /** width as percentage 0..100 */
  w: number;
  /** height as percentage 0..100 */
  h: number;
  kind: TargetKind;
}

export type ScreenKind = "landing" | "onboarding" | "pricing";

export interface ProductScreen {
  id: string;
  name: string;
  kind: ScreenKind;
  width: number;
  height: number;
  eyebrow: string;
  headline: string;
  subcopy: string;
  targets: ScreenTarget[];
}

export type FightStatus = "live" | "scored" | "rematch_shipped";
export type RematchChoice = "challenger_promoted" | "intended_defended";
export type CardResult = "CTA_DEFENDED" | "CTA_KNOCKED_OUT";

export interface Fight {
  id: string;
  screenId: string;
  intendedTargetId: string;
  /** Canonical owner identity for this fight (the builder's guest session id). */
  ownerId: string;
  ownerSessionId: string;
  status: FightStatus;
  rematchChoice: RematchChoice | null;
  challengerTargetId: string | null;
  createdAt: number;
  shippedAt: number | null;
}

export interface Click {
  id: string;
  fightId: string;
  visitorSessionId: string;
  nx: number;
  ny: number;
  matchedTargetId: string | null;
  isOfficial: boolean;
  src: string;
  createdAt: number;
}

export interface Card {
  slug: string;
  fightId: string;
  clickId: string;
  result: CardResult;
  intendedTargetId: string;
  actualTargetId: string | null;
  createdAt: number;
}

export type UsageEventName =
  | "fcf_fight_created"
  | "fcf_first_action_clicked"
  | "fcf_result_inspected"
  | "fcf_card_replayed"
  | "fcf_rematch_shipped"
  | "fcf_rematch_returned";

export interface UsageEvent {
  id: string;
  fightId: string | null;
  cardSlug: string | null;
  sessionId: string;
  eventName: UsageEventName;
  payload: Record<string, unknown> | null;
  createdAt: number;
}

export interface TargetTally {
  targetId: string | null;
  label: string;
  count: number;
  isIntended: boolean;
}

export interface UsageSummary {
  fightId: string;
  totalOfficialClicks: number;
  intendedTargetId: string;
  intendedClicks: number;
  winnerTargetId: string | null;
  winnerLabel: string;
  tallies: TargetTally[];
  events: UsageEvent[];
  eventCounts: Record<string, number>;
  recommendation: RematchChoice;
  learningLine: string;
}
