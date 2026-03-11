// =============================================================================
// Big Five 性格診断 — エクスポート
// =============================================================================

export { QUESTIONS_SIMPLE, QUESTIONS_FULL } from './questions';
export type { Question, BigFiveScores } from './questions';

export { calculateBigFive, FACET_LABELS } from './calculate';
export type { BigFiveResult, TraitResult, FacetScore, MBTIType } from './calculate';

export { TRAIT_DETAILS, getTraitDetail } from './trait-details';
export type { TraitDetail } from './trait-details';
