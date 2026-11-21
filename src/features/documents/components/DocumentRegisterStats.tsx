import { useId, useMemo, type ReactNode } from 'react';
import type { DocumentArchiveRecord } from '../../../types/documentArchive';
import type { DocumentRecord } from '../../../types/documents';
import { isPendingApprovalDocument } from '../../../lib/documentStatus';
import { buildRegisterWeeklyMetrics, formatWeeklyDeltaLabel } from '../utils/registerWeeklyStats';
import './DocumentRegisterStats.css';

const SPARK_PATHS: Record<'blue' | 'green' | 'amber' | 'violet', string> = {
  blue: 'M2 34 C16 30, 24 22, 36 24 S56 14, 68 16 S78 8, 86 10',
  green: 'M2 32 C18 28, 26 20, 40 22 S58 12, 70 14 S80 6, 86 8',
  amber: 'M2 33 C18 29, 28 24, 40 26 S58 18, 70 20 S80 14, 86 16',
  violet: 'M2 35 C20 31, 32 26, 48 28 S64 20, 74 22 S82 16, 86 14',
};

const SPARK_COLORS: Record<'blue' | 'green' | 'amber' | 'violet', { stroke: string; fillTop: string }> = {
  blue: { stroke: '#3b82f6', fillTop: 'rgba(59, 130, 246, 0.32)' },
  green: { stroke: '#22c55e', fillTop: 'rgba(34, 197, 94, 0.32)' },
  amber: { stroke: '#f97316', fillTop: 'rgba(249, 115, 22, 0.32)' },
  violet: { stroke: '#a855f7', fillTop: 'rgba(168, 85, 247, 0.32)' },
};

function MiniSparkline({
  tone,
  gradientId,
}: {
  tone: 'blue' | 'green' | 'amber' | 'violet';
  gradientId: string;
}) {
  const { stroke, fillTop } = SPARK_COLORS[tone];
  const path = SPARK_PATHS[tone];
  const area = `${path} L 86 38 L 2 38 Z`;

  return (
    <svg className="doc-reg-stat-spark" viewBox="0 0 88 44" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={stroke} stopOpacity="0" />
          <stop offset="55%" stopColor={stroke} stopOpacity="0.06" />
          <stop offset="100%" stopColor={fillTop} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeltaBadge({ label, trend }: { label: string; trend: 'up' | 'down' | 'flat' }) {
  return (
    <span className={`doc-reg-stat-delta doc-reg-stat-delta-${trend}`}>
      {trend !== 'flat' ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          {trend === 'up' ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
        </svg>
      ) : null}
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
  deltaLabel,
  deltaTrend = 'up',
  onClick,
  iconVariant = 'soft',
}: {
  label: string;
  value: number;
  tone: 'blue' | 'green' | 'amber' | 'violet';
  icon: ReactNode;
  deltaLabel?: string;
  deltaTrend?: 'up' | 'down' | 'flat';
  onClick?: () => void;
  iconVariant?: 'soft' | 'solid';
}) {
  const gradientId = useId().replace(/:/g, '');
  const className = `doc-reg-stat-card doc-reg-stat-${tone}${onClick ? ' doc-reg-stat-card-interactive' : ''}`;
  const inner = (
    <div className="doc-reg-stat-body">
      <div className="doc-reg-stat-row">
        <div className="doc-reg-stat-headline">
          <span className={`doc-reg-stat-icon-halo doc-reg-stat-icon-halo-${tone}`}>
            <span
              className={`doc-reg-stat-icon doc-reg-stat-icon-${tone}${iconVariant === 'solid' ? ' doc-reg-stat-icon-solid' : ''}`}
            >
              {icon}
            </span>
          </span>
          <div className="doc-reg-stat-text">
            <p className="doc-reg-stat-value">{value.toLocaleString()}</p>
            <p className="doc-reg-stat-label">{label}</p>
          </div>
        </div>
        <div className="doc-reg-stat-spark-wrap">
          <MiniSparkline tone={tone} gradientId={gradientId} />
          {deltaLabel ? <DeltaBadge label={deltaLabel} trend={deltaTrend} /> : null}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {inner}
      </button>
    );
  }

  return <article className={className}>{inner}</article>;
}

function deltaTrendFromPercent(percent: number): 'up' | 'down' | 'flat' {
  if (percent > 0) return 'up';
  if (percent < 0) return 'down';
  return 'flat';
}

export function DocumentRegisterStats({
  documents,
  archives = [],
  onOpenArchives,
}: {
  documents: DocumentRecord[];
  archives?: DocumentArchiveRecord[];
  onOpenArchives?: () => void;
}) {
  const stats = useMemo(() => {
    let active = 0;
    let pending = 0;

    for (const doc of documents) {
      if (doc.status === 'Active') active += 1;
      else if (isPendingApprovalDocument(doc)) pending += 1;
    }

    return {
      total: documents.length,
      active,
      pending,
      archived: archives.length,
    };
  }, [documents, archives.length]);

  const weekly = useMemo(() => buildRegisterWeeklyMetrics(documents, archives), [documents, archives]);

  return (
    <div className="doc-reg-stats-grid" aria-label="Document summary">
      <StatCard
        label="Total Documents"
        value={stats.total}
        deltaLabel={formatWeeklyDeltaLabel(weekly.total.changePercent)}
        deltaTrend={deltaTrendFromPercent(weekly.total.changePercent)}
        tone="blue"
        iconVariant="soft"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
        }
      />
      <StatCard
        label="Active"
        value={stats.active}
        deltaLabel={formatWeeklyDeltaLabel(weekly.active.changePercent)}
        deltaTrend={deltaTrendFromPercent(weekly.active.changePercent)}
        tone="green"
        iconVariant="solid"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        }
      />
      <StatCard
        label="Pending"
        value={stats.pending}
        deltaLabel={formatWeeklyDeltaLabel(weekly.pending.changePercent)}
        deltaTrend={deltaTrendFromPercent(weekly.pending.changePercent)}
        tone="amber"
        iconVariant="solid"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        }
      />
      <StatCard
        label="Archived"
        value={stats.archived}
        deltaLabel={formatWeeklyDeltaLabel(weekly.archived.changePercent)}
        deltaTrend={deltaTrendFromPercent(weekly.archived.changePercent)}
        tone="violet"
        iconVariant="solid"
        onClick={onOpenArchives}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            <path d="M3 7l3-4h12l3 4M10 11h4" />
          </svg>
        }
      />
    </div>
  );
}