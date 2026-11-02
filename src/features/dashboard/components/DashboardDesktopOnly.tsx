import type { ReactNode } from 'react';
import { isHandheldDevice } from '../../../lib/device/handheldDetection';
import { DashboardMobileGate } from './DashboardMobileGate';

/** Blocks phones/tablets on dashboard and sign-in — see `.cursor/rules/dashboard-desktop-only.mdc`. */
export function HandheldWebGate({ children }: { children: ReactNode }) {
  if (isHandheldDevice()) {
    return <DashboardMobileGate />;
  }

  return children;
}

/** @deprecated Use HandheldWebGate */
export const DashboardDesktopOnly = HandheldWebGate;
