import { Lottie } from 'lottie-react';
import emptyDraftsAnimation from '../../../assets/lottie/empty-drafts.json';
import './EmptyDraftsLottie.css';

export function EmptyDraftsLottie() {
  return (
    <div className="empty-drafts-lottie" aria-hidden="true">
      <Lottie
        src={emptyDraftsAnimation}
        loop={false}
        autoplay
        className="empty-drafts-lottie-player"
      />
    </div>
  );
}
