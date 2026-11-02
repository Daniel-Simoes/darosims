import type { ReactNode } from 'react';
import { isHandheldDevice } from '../../../lib/device/handheldDetection';
import { DashboardMobileGate } from './DashboardMobileGate';

/** Blocks phones/tablets — see `.cursor/rules/dashboard-desktop-only.mdc`. */
export function DashboardDesktopOnly({ children }: { children: ReactNode }) {
  if (isHandheldDevice()) {
    return <DashboardMobileGate />;
  }

  return children;
}
