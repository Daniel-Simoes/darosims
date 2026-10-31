import { Lottie } from 'lottie-react';
import emptyDraftsAnimation from '../../../assets/lottie/empty-drafts.json';
import { EmptyDraftsLottiePlayer, EmptyDraftsLottieRoot } from './EmptyDraftsLottie.styles';

export function EmptyDraftsLottie() {
  return (
    <EmptyDraftsLottieRoot aria-hidden="true">
      <EmptyDraftsLottiePlayer>
        <Lottie src={emptyDraftsAnimation} loop={false} autoplay style={{ width: '100%', height: '100%' }} />
      </EmptyDraftsLottiePlayer>
    </EmptyDraftsLottieRoot>
  );
}
