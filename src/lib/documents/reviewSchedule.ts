/** Map review frequency labels to a month offset from the effective date. */
export function parseReviewFrequencyToMonths(frequency: string): number | null {
  const normalized = frequency.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized === 'monthly') return 1;
  if (normalized === 'quarterly') return 3;
  if (normalized === 'annually' || normalized === 'annual' || normalized === 'yearly') return 12;
  if (normalized.includes('six month')) return 6;
  if (normalized.includes('two month')) return 2;
  if (normalized.includes('three month')) return 3;
  if (normalized.includes('four month')) return 4;
  if (normalized === 'bi-annual' || normalized.includes('bi-annual') || normalized.includes('biannual')) {
    return 6;
  }

  const everyMonths = normalized.match(/every\s+(\d+)\s+months?/);
  if (everyMonths) {
    const months = Number.parseInt(everyMonths[1], 10);
    return Number.isFinite(months) && months > 0 ? months : null;
  }

  const everyYears = normalized.match(/every\s+(\d+)\s+years?/);
  if (everyYears) {
    const years = Number.parseInt(everyYears[1], 10);
    return Number.isFinite(years) && years > 0 ? years * 12 : null;
  }

  const plainYears = normalized.match(/^(\d+)\s+years?$/);
  if (plainYears) {
    const years = Number.parseInt(plainYears[1], 10);
    return Number.isFinite(years) && years > 0 ? years * 12 : null;
  }

  return null;
}

function addMonthsToIsoDate(isoDate: string, months: number): string {
  const match = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return '';

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

export function computeNextReviewDate(
  effectiveDate: string,
  reviewFrequency: string,
): string {
  const months = parseReviewFrequencyToMonths(reviewFrequency);
  if (months == null) return '';
  return addMonthsToIsoDate(effectiveDate, months);
}

export function applyReviewScheduleNextDate<
  T extends { effectiveDate: string; reviewFrequency: string; nextReviewDate: string },
>(form: T, field: 'effectiveDate' | 'reviewFrequency', value: string): T {
  const next: T = { ...form, [field]: value };
  const computed = computeNextReviewDate(
    field === 'effectiveDate' ? value : form.effectiveDate,
    field === 'reviewFrequency' ? value : form.reviewFrequency,
  );
  if (computed) {
    next.nextReviewDate = computed;
  }
  return next;
}