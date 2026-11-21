import './UserAvatar.css';

type UserAvatarSize = 'header' | 'dropdown' | 'profile';

interface UserAvatarProps {
  photoUrl?: string | null;
  name?: string;
  size?: UserAvatarSize;
  className?: string;
}

function getAvatarLetter(name?: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return 'U';
  return trimmed.charAt(0).toUpperCase();
}

export function UserAvatar({
  photoUrl,
  name,
  size = 'header',
  className = '',
}: UserAvatarProps) {
  const letter = getAvatarLetter(name);
  const sizeClass = `app-user-avatar--${size}`;

  return (
    <span className={`app-user-avatar ${sizeClass} ${className}`.trim()} aria-hidden={!photoUrl}>
      {photoUrl ? (
        <img src={photoUrl} alt="" className="app-user-avatar-img" />
      ) : (
        <span className="app-user-avatar-fallback">{letter}</span>
      )}
    </span>
  );
}