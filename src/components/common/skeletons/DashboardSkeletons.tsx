import Skeleton from 'react-loading-skeleton';
import './DashboardSkeletons.css';

export function RegisterStatsSkeleton() {
  return (
    <div className="skel-reg-stats-grid" aria-busy="true" aria-label="Loading document summary">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="skel-reg-stat-card">
          <Skeleton circle width={44} height={44} />
          <div className="skel-reg-stat-text">
            <Skeleton width={36} height={20} borderRadius={6} />
            <Skeleton width={index === 0 ? 88 : 52} height={11} borderRadius={4} />
          </div>
          <div className="skel-reg-stat-chart">
            <Skeleton height={38} borderRadius={8} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocumentTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="skel-table" aria-busy="true" aria-label="Loading table">
      <div className="skel-table-row">
        <Skeleton width="100%" height={14} borderRadius={4} />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skel-table-row">
          <Skeleton circle width={24} height={24} />
          <Skeleton width="100%" height={22} borderRadius={20} />
          <Skeleton width="100%" height={22} borderRadius={20} />
          <Skeleton circle width={32} height={32} />
          <Skeleton width="100%" height={16} borderRadius={4} />
          <Skeleton width="100%" height={24} borderRadius={999} />
          <Skeleton width="100%" height={16} borderRadius={4} />
          <Skeleton width={80} height={32} borderRadius={8} />
        </div>
      ))}
    </div>
  );
}

export function ProfileSettingsSkeleton() {
  return (
    <div className="skel-profile" aria-busy="true" aria-label="Loading profile">
      <div className="skel-profile-card">
        <Skeleton width={120} height={18} borderRadius={4} />
        <div className="skel-profile-photo-row">
          <Skeleton circle width={36} height={36} />
          <Skeleton width={140} height={34} borderRadius={8} />
          <Skeleton width={110} height={34} borderRadius={8} />
        </div>
      </div>
      <div className="skel-profile-card">
        <Skeleton width={160} height={18} borderRadius={4} />
        <div className="skel-profile-grid">
          <Skeleton height={42} borderRadius={8} />
          <Skeleton height={42} borderRadius={8} />
          <div className="skel-field-wide">
            <Skeleton height={42} borderRadius={8} />
          </div>
        </div>
      </div>
      <div className="skel-profile-card">
        <Skeleton width={140} height={18} borderRadius={4} />
        <Skeleton width="80%" height={14} borderRadius={4} />
        <Skeleton height={42} borderRadius={8} />
        <div className="skel-profile-grid">
          <Skeleton height={42} borderRadius={8} />
          <Skeleton height={42} borderRadius={8} />
        </div>
      </div>
      <div className="skel-profile-card">
        <Skeleton width={100} height={18} borderRadius={4} />
        <Skeleton height={42} borderRadius={8} />
        <Skeleton height={42} borderRadius={8} />
      </div>
    </div>
  );
}

export function NotificationListSkeleton({ items = 6 }: { items?: number }) {
  return (
    <LabelledListSkeleton
      className="skel-notifications-list"
      label="Loading notifications"
      items={items}
    />
  );
}

export function NotificationHistorySkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="skel-notifications-list" aria-busy="true" aria-label="Loading history">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="skel-profile-card">
          <Skeleton width="55%" height={20} borderRadius={4} />
          <Skeleton width="40%" height={14} borderRadius={4} />
          <Skeleton count={3} height={14} borderRadius={4} />
        </div>
      ))}
    </div>
  );
}

function LabelledListSkeleton({
  className,
  label,
  items,
}: {
  className: string;
  label: string;
  items: number;
}) {
  return (
    <div className={className} aria-busy="true" aria-label={label}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="skel-notification-item">
          <Skeleton circle width={40} height={40} />
          <div className="skel-notification-body">
            <Skeleton width="70%" height={16} borderRadius={4} />
            <Skeleton count={2} height={13} borderRadius={4} />
            <Skeleton width={80} height={11} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocumentDetailSkeleton() {
  return (
    <div className="skel-dd-page" aria-busy="true" aria-label="Loading document">
      <div className="skel-dd-head">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width="40%" height={28} borderRadius={6} />
          <Skeleton width="25%" height={16} borderRadius={4} />
        </div>
        <Skeleton width={200} height={38} borderRadius={8} />
      </div>
      <div className="skel-dd-grid">
        <Skeleton height={280} borderRadius={12} />
        <Skeleton height={280} borderRadius={12} />
      </div>
      <Skeleton height={120} borderRadius={12} />
    </div>
  );
}

export function ChartBlockSkeleton({ height = 180 }: { height?: number }) {
  return (
    <div className="skel-chart-block" style={{ minHeight: height }} aria-hidden>
      <Skeleton width="100%" height={height} borderRadius={10} />
    </div>
  );
}

export function ChatListSkeleton({ items = 7 }: { items?: number }) {
  return (
    <div className="skel-chat-list" aria-busy="true" aria-label="Loading chats">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="skel-chat-list-item">
          <Skeleton circle width={44} height={44} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton width="60%" height={16} borderRadius={4} />
            <Skeleton width="85%" height={13} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatMessagesSkeleton() {
  return (
    <div className="skel-chat-messages" aria-busy="true" aria-label="Loading messages">
      <div className="skel-chat-bubble-row">
        <Skeleton circle width={32} height={32} />
        <Skeleton width={220} height={48} borderRadius={12} />
      </div>
      <div className="skel-chat-bubble-row is-mine">
        <Skeleton width={180} height={40} borderRadius={12} />
      </div>
      <div className="skel-chat-bubble-row">
        <Skeleton circle width={32} height={32} />
        <Skeleton width={260} height={56} borderRadius={12} />
      </div>
    </div>
  );
}

export function ReviewHistorySkeleton({ steps = 4 }: { steps?: number }) {
  return (
    <div className="skel-review-timeline" aria-busy="true" aria-label="Loading review history">
      {Array.from({ length: steps }).map((_, index) => (
        <div key={index} className="skel-review-step">
          <Skeleton circle width={12} height={12} />
          <div className="skel-review-step-body">
            <Skeleton width="50%" height={16} borderRadius={4} />
            <Skeleton count={2} height={13} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationDropdownSkeleton() {
  return <NotificationListSkeleton items={3} />;
}