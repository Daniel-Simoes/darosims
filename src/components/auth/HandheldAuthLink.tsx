import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isHandheldDevice } from '../../lib/device/handheldDetection';

type HandheldAuthLinkProps = {
  to?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

/** Sign-in CTAs on marketing pages — handheld users see the mobile gate instead of the form. */
export function HandheldAuthLink({
  to = '/signin',
  className,
  children,
  onClick,
}: HandheldAuthLinkProps) {
  const navigate = useNavigate();

  if (isHandheldDevice()) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          onClick?.();
          navigate('/signin');
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
