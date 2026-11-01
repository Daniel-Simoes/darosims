import './ChatAvatarStack.css';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

type Peer = { name: string; photoUrl?: string };

interface ChatAvatarStackProps {
  peers: Peer[];
  size?: 'md' | 'lg';
}

export function ChatAvatarStack({ peers, size = 'md' }: ChatAvatarStackProps) {
  if (peers.length === 0) {
    return (
      <span className={`chat-avatar-stack chat-avatar-stack--${size} chat-avatar-stack--empty`}>?</span>
    );
  }

  if (peers.length === 1) {
    const peer = peers[0];
    return (
      <span className={`chat-avatar-stack chat-avatar-stack--${size} chat-avatar-stack--single`}>
        {peer.photoUrl ? (
          <img src={peer.photoUrl} alt="" className="chat-avatar-stack-img" />
        ) : (
          getInitials(peer.name)
        )}
      </span>
    );
  }

  const shown = peers.slice(0, 2);
  return (
    <span className={`chat-avatar-stack chat-avatar-stack--${size} chat-avatar-stack--group`}>
      {shown.map((peer, index) => (
        <span
          key={`${peer.name}-${index}`}
          className="chat-avatar-stack-member"
          style={{ zIndex: shown.length - index }}
        >
          {peer.photoUrl ? (
            <img src={peer.photoUrl} alt="" className="chat-avatar-stack-img" />
          ) : (
            getInitials(peer.name)
          )}
        </span>
      ))}
    </span>
  );
}
