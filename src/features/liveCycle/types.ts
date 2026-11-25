/** Scope boundary for Live Cycle — new capabilities live under this module only. */
export const LIVE_CYCLE_SCOPE = 'live-cycle' as const;

export type LiveCycleScope = typeof LIVE_CYCLE_SCOPE;