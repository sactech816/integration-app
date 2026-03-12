// =============================================================================
// Big Five 性格診断 — エクスポート
// =============================================================================

export { QUESTIONS_SIMPLE, QUESTIONS_FULL, QUESTIONS_EXTENDED, QUESTIONS_DETAILED } from './questions';
export type { Question, BigFiveScores } from './questions';

export { calculateBigFive, FACET_LABELS } from './calculate';
export type { BigFiveResult, TraitResult, FacetScore, MBTIType, DISCType } from './calculate';

export { TRAIT_DETAILS, getTraitDetail } from './trait-details';
export type { TraitDetail } from './trait-details';

export { ENNEAGRAM_QUESTIONS, ENNEAGRAM_TYPES, calculateEnneagram } from './enneagram';
export type { EnneagramQuestion, EnneagramResult } from './enneagram';
